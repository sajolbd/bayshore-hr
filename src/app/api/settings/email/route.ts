import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { MailSettingsModel } from "@/models/MailSettings";
import { decryptSecret, encryptSecret } from "@/lib/crypto-utils";
import { resolveSmtpConfig, verifyAndTestSmtp } from "@/lib/mailer";

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

    return NextResponse.json({
      configured: Boolean(resolved),
      source: resolved?.source || "none",
      settings: {
        smtpHost: doc?.smtpHost || resolved?.host || "smtp.gmail.com",
        smtpPort: doc?.smtpPort || resolved?.port || 587,
        smtpSecure: doc ? doc.smtpSecure : resolved?.secure ?? false,
        smtpUser: doc?.smtpUser || resolved?.user || "",
        fromName: doc?.fromName || resolved?.fromName || "Bayshore HR",
        hasPassword: Boolean(doc?.smtpPassEncrypted || process.env.SMTP_PASS),
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
      smtpPass?: string;
      fromName?: string;
      testRecipient?: string;
    };

    const smtpHost = body.smtpHost?.trim() || "smtp.gmail.com";
    const smtpPort = Number(body.smtpPort) || 587;
    const smtpSecure = Boolean(body.smtpSecure);
    const smtpUser = body.smtpUser?.trim();
    const fromName = body.fromName?.trim() || "Bayshore HR";
    const rawPassInput = body.smtpPass?.replace(/\s+/g, "").trim();

    if (!smtpUser || !smtpUser.includes("@")) {
      return NextResponse.json(
        { error: "Valid sender Gmail / SMTP email address is required." },
        { status: 400 }
      );
    }

    const existing = await MailSettingsModel.findOne({ key: "primary" })
      .select("+smtpPassEncrypted")
      .lean();

    let effectivePass = rawPassInput;
    if (!effectivePass && existing?.smtpPassEncrypted) {
      effectivePass = decryptSecret(existing.smtpPassEncrypted);
    }

    if (!effectivePass) {
      return NextResponse.json(
        {
          error:
            "Gmail App Password is required. Generate a 16-character App Password from your Google Account Security settings.",
        },
        { status: 400 }
      );
    }

    // Verify real SMTP login & optional test email BEFORE saving
    try {
      await verifyAndTestSmtp({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
        pass: effectivePass,
        fromName,
        testRecipient: body.testRecipient?.trim() || undefined,
      });
    } catch (verifyErr) {
      const msg =
        verifyErr instanceof Error ? verifyErr.message : "SMTP verification failed";
      return NextResponse.json(
        {
          error: `Gmail/SMTP authentication failed: ${msg}. Ensure 2-Step Verification is ON and use a 16-digit Google App Password (not your regular Gmail login password).`,
        },
        { status: 400 }
      );
    }

    const encrypted = encryptSecret(effectivePass);
    await MailSettingsModel.findOneAndUpdate(
      { key: "primary" },
      {
        $set: {
          smtpHost,
          smtpPort,
          smtpSecure,
          smtpUser,
          smtpPassEncrypted: encrypted,
          fromName,
          updatedBy: session.name,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      ok: true,
      message: body.testRecipient
        ? `SMTP verified and test email sent to ${body.testRecipient.trim()}!`
        : "Gmail SMTP connection verified and saved!",
    });
  } catch (err) {
    console.error("PUT /api/settings/email error:", err);
    return NextResponse.json(
      { error: "Failed to save SMTP configuration." },
      { status: 500 }
    );
  }
}

