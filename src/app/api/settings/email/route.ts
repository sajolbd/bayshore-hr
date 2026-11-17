import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { MailSettingsModel } from "@/models/MailSettings";
import { decryptSecret, encryptSecret } from "@/lib/crypto-utils";
import {
  getEnvSmtpConfig,
  resolveSmtpConfig,
  verifyAndTestSmtp,
} from "@/lib/mailer";

function isValidEmailInput(email?: string): boolean {
  if (!email) return false;
  if (/[\r\n\s]/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface RelayCandidate {
  fromSource: "env" | "db";
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "Super Admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can view SMTP settings." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const doc = await MailSettingsModel.findOne({ key: "primary" })
      .select("+smtpPassEncrypted")
      .lean();
    const resolved = await resolveSmtpConfig();
    const envCfg = getEnvSmtpConfig();
    const hasDbPass = Boolean(doc?.smtpUser && doc?.smtpPassEncrypted);
    const relayAvailable = Boolean(envCfg || hasDbPass);
    const activeSender =
      doc?.senderEmail || doc?.smtpUser || resolved?.senderEmail || envCfg?.user || "";

    return NextResponse.json({
      configured: Boolean(resolved),
      source: resolved?.source || "none",
      deliveryMode: resolved?.deliveryMode || (relayAvailable ? "relay" : "direct"),
      relayAvailable,
      relayEmail: resolved?.user || envCfg?.user || doc?.smtpUser || "",
      settings: {
        smtpHost: doc?.smtpHost || resolved?.host || envCfg?.host || "smtp.gmail.com",
        smtpPort: doc?.smtpPort || resolved?.port || envCfg?.port || 587,
        smtpSecure: doc ? doc.smtpSecure : resolved?.secure ?? envCfg?.secure ?? false,
        smtpUser: activeSender,
        senderEmail: activeSender,
        fromName: doc?.fromName || resolved?.fromName || "Bayshore HR",
        hasPassword: Boolean(hasDbPass || envCfg),
        deliveryMode: resolved?.deliveryMode || (relayAvailable ? "relay" : "direct"),
      },
    });
  } catch (err) {
    console.error("GET /api/settings/email error:", err);
    return NextResponse.json(
      { error: "Failed to load SMTP configuration." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "Super Admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can configure SMTP settings." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const body = (await request.json().catch(() => ({}))) as {
      smtpHost?: string;
      smtpPort?: number;
      smtpSecure?: boolean;
      smtpUser?: string;
      senderEmail?: string;
      smtpPass?: string;
      fromName?: string;
      testRecipient?: string;
    };

    const smtpHost = body.smtpHost?.trim() || "smtp.gmail.com";
    const smtpPort = Number(body.smtpPort) || 587;
    const smtpSecure = Boolean(body.smtpSecure);
    const senderInput = (body.senderEmail || body.smtpUser || "").trim();
    const fromName = body.fromName?.trim() || "Bayshore HR";
    const rawPassInput = body.smtpPass?.replace(/\s+/g, "").trim() || "";
    const testRecipient = body.testRecipient?.trim() || undefined;

    if (!isValidEmailInput(senderInput)) {
      return NextResponse.json(
        { error: "Valid sender email address is required." },
        { status: 400 }
      );
    }

    if (testRecipient && !isValidEmailInput(testRecipient)) {
      return NextResponse.json(
        { error: "Test recipient must be a valid email address." },
        { status: 400 }
      );
    }

    const existing = await MailSettingsModel.findOne({ key: "primary" })
      .select("+smtpPassEncrypted")
      .lean();

    // Case 1: User explicitly supplied an App Password / SMTP Password -> Direct Auth
    if (rawPassInput) {
      try {
        await verifyAndTestSmtp({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          user: senderInput,
          pass: rawPassInput,
          senderEmail: senderInput,
          fromName,
          testRecipient,
        });
      } catch (verifyErr) {
        const msg =
          verifyErr instanceof Error ? verifyErr.message : "SMTP verification failed";
        return NextResponse.json(
          {
            error: `Gmail/SMTP authentication failed for ${senderInput}: ${msg}. Ensure 2-Step Verification is ON and use a 16-digit Google App Password, OR leave the App Password empty to send via System Relay without a password.`,
          },
          { status: 400 }
        );
      }

      const encrypted = encryptSecret(rawPassInput);
      await MailSettingsModel.findOneAndUpdate(
        { key: "primary" },
        {
          $set: {
            deliveryMode: "direct",
            senderEmail: senderInput,
            smtpHost,
            smtpPort,
            smtpSecure,
            smtpUser: senderInput,
            smtpPassEncrypted: encrypted,
            fromName,
            updatedBy: session.name,
          },
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        ok: true,
        deliveryMode: "direct",
        relayEmail: senderInput,
        message: testRecipient
          ? `Direct SMTP verified and test email sent to ${testRecipient} from ${senderInput}!`
          : `Direct Gmail SMTP connected for ${senderInput}!`,
      });
    }

    // Case 2: No password typed -> Password-Free System Relay Mode!
    const candidates: RelayCandidate[] = [];
    const envCfg = getEnvSmtpConfig();

    const dbDecrypted =
      existing?.smtpUser && existing?.smtpPassEncrypted
        ? decryptSecret(existing.smtpPassEncrypted).replace(/\s+/g, "").trim()
        : "";

    // Prefer matching account or env relay cleanly
    if (envCfg) {
      candidates.push({
        fromSource: "env",
        host: envCfg.host,
        port: envCfg.port,
        secure: envCfg.secure,
        user: envCfg.user,
        pass: envCfg.pass,
      });
    }

    if (existing?.smtpUser && dbDecrypted) {
      const sameAsEnv =
        envCfg &&
        existing.smtpUser.trim().toLowerCase() === envCfg.user.toLowerCase() &&
        dbDecrypted === envCfg.pass;
      if (!sameAsEnv) {
        candidates.push({
          fromSource: "db",
          host: existing.smtpHost || smtpHost,
          port: existing.smtpPort || smtpPort,
          secure: existing.smtpHost ? Boolean(existing.smtpSecure) : smtpSecure,
          user: existing.smtpUser.trim(),
          pass: dbDecrypted,
        });
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error:
            "System Relay is not initialized on the server yet. Enter a 16-digit App Password once for your base Gmail account (or configure SMTP_USER & SMTP_PASS on Vercel), after which any sender email works without a password.",
        },
        { status: 400 }
      );
    }

    let winner: RelayCandidate | null = null;
    let lastError = "Relay verification failed";
    for (const cand of candidates) {
      try {
        await verifyAndTestSmtp({
          host: cand.host,
          port: cand.port,
          secure: cand.secure,
          user: cand.user,
          pass: cand.pass,
          senderEmail: senderInput,
          fromName,
          testRecipient,
        });
        winner = cand;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Relay verification failed";
      }
    }

    if (!winner) {
      return NextResponse.json(
        {
          error: `System Mail Relay authentication failed (${lastError}). Update SMTP_USER / SMTP_PASS on Vercel or enter a valid 16-digit App Password under Advanced SMTP Auth.`,
        },
        { status: 400 }
      );
    }

    const deliveryMode =
      senderInput.toLowerCase() === winner.user.toLowerCase() ? "direct" : "relay";

    const updateSet: Record<string, unknown> = {
      deliveryMode,
      senderEmail: senderInput,
      smtpHost: winner.host,
      smtpPort: winner.port,
      smtpSecure: winner.secure,
      fromName,
      updatedBy: session.name,
    };

    if (winner.fromSource === "env") {
      // Keep DB clean so Vercel env rotation applies automatically
      updateSet.smtpUser = "";
      updateSet.smtpPassEncrypted = "";
    }

    await MailSettingsModel.findOneAndUpdate(
      { key: "primary" },
      { $set: updateSet },
      { upsert: true, new: true }
    );

    const modeSummary =
      deliveryMode === "relay"
        ? `No 16-digit password needed! Invite emails will deliver via System Relay with Sender & Reply-To set to ${senderInput}.`
        : `Sender email saved (${senderInput}) and verified!`;

    return NextResponse.json({
      ok: true,
      deliveryMode,
      relayEmail: winner.user,
      message: testRecipient
        ? `Test email sent to ${testRecipient}! ${modeSummary}`
        : modeSummary,
    });
  } catch (err) {
    console.error("PUT /api/settings/email error:", err);
    return NextResponse.json(
      { error: "Failed to save SMTP configuration." },
      { status: 500 }
    );
  }
}
