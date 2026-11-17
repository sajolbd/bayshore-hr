import nodemailer from "nodemailer";
import { connectToDatabase } from "./mongodb";
import { MailSettingsModel } from "@/models/MailSettings";
import { decryptSecret } from "./crypto-utils";

export interface InviteEmailPayload {
  to: string;
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  officeHours?: string;
  inviteUrl: string;
  expiresHours?: number;
  adminName?: string;
  adminEmail?: string;
}

export interface InviteEmailResult {
  delivered: boolean;
  mode: "smtp" | "ethereal" | "direct-link";
  previewUrl?: string;
  inviteUrl: string;
  message: string;
}

export type MailDeliveryMode = "relay" | "direct";

export interface ResolvedSmtpConfig {
  source: "database" | "env";
  deliveryMode: MailDeliveryMode;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  senderEmail: string;
  fromName: string;
}

export interface EnvSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

function sanitizeHeaderValue(input?: string | null): string {
  return (input || "").replace(/[\r\n"<>]+/g, " ").trim();
}

function sanitizeEmailAddress(input?: string | null): string {
  const cleaned = (input || "").replace(/[\r\n\s<>]+/g, "").trim();
  return cleaned.includes("@") ? cleaned : "";
}

/**
 * Builds RFC-compliant `from` and `replyTo` headers so SMTP authentication stays intact
 * while custom sender addresses work seamlessly in System Relay mode without an App Password.
 */
export function buildSenderHeaders(params: {
  authUser: string;
  senderEmail?: string | null;
  fromName?: string | null;
}) {
  const cleanAuth = sanitizeEmailAddress(params.authUser) || params.authUser.trim();
  const effectiveSender = sanitizeEmailAddress(params.senderEmail) || cleanAuth;
  const cleanName = sanitizeHeaderValue(params.fromName) || "Bayshore HR";
  const isRelay = effectiveSender.toLowerCase() !== cleanAuth.toLowerCase();

  return {
    isRelay,
    effectiveSender,
    from: isRelay
      ? `"${cleanName} (${effectiveSender})" <${cleanAuth}>`
      : `"${cleanName}" <${cleanAuth}>`,
    replyTo: effectiveSender,
  };
}

export function getEnvSmtpConfig(): EnvSmtpConfig | null {
  const envUser = sanitizeEmailAddress(process.env.SMTP_USER);
  const envPass = process.env.SMTP_PASS?.replace(/\s+/g, "").trim();
  if (!envUser || !envPass) return null;
  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: envUser,
    pass: envPass,
  };
}

export async function resolveSmtpConfig(): Promise<ResolvedSmtpConfig | null> {
  const envCfg = getEnvSmtpConfig();

  try {
    await connectToDatabase();
    const doc = await MailSettingsModel.findOne({ key: "primary" })
      .select("+smtpPassEncrypted")
      .lean();

    if (doc) {
      const desiredSender =
        sanitizeEmailAddress(doc.senderEmail) ||
        sanitizeEmailAddress(doc.smtpUser) ||
        envCfg?.user ||
        "";

      if (doc.smtpUser && doc.smtpPassEncrypted) {
        const decryptedPass = decryptSecret(doc.smtpPassEncrypted).replace(/\s+/g, "");
        if (decryptedPass) {
          const authUser = sanitizeEmailAddress(doc.smtpUser) || doc.smtpUser.trim();
          const senderEmail = desiredSender || authUser;
          const isRelay =
            doc.deliveryMode === "relay" ||
            senderEmail.toLowerCase() !== authUser.toLowerCase();
          return {
            source: "database",
            deliveryMode: isRelay ? "relay" : "direct",
            host: doc.smtpHost || "smtp.gmail.com",
            port: doc.smtpPort || 587,
            secure: Boolean(doc.smtpSecure),
            user: authUser,
            pass: decryptedPass,
            senderEmail,
            fromName: doc.fromName?.trim() || "Bayshore HR",
          };
        }
      }

      if (envCfg) {
        const senderEmail = desiredSender || envCfg.user;
        return {
          source: "database",
          deliveryMode:
            senderEmail.toLowerCase() === envCfg.user.toLowerCase() ? "direct" : "relay",
          host: doc.smtpHost || envCfg.host,
          port: doc.smtpPort || envCfg.port,
          secure: doc.smtpHost ? Boolean(doc.smtpSecure) : envCfg.secure,
          user: envCfg.user,
          pass: envCfg.pass,
          senderEmail,
          fromName: doc.fromName?.trim() || "Bayshore HR",
        };
      }
    }
  } catch {
    // Fallback to environment variables cleanly
  }

  if (envCfg) {
    return {
      source: "env",
      deliveryMode: "relay",
      host: envCfg.host,
      port: envCfg.port,
      secure: envCfg.secure,
      user: envCfg.user,
      pass: envCfg.pass,
      senderEmail: envCfg.user,
      fromName: "Bayshore HR",
    };
  }

  return null;
}


function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildInviteHtml(payload: InviteEmailPayload): string {
  const expiresHours = payload.expiresHours ?? 48;
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 32px 16px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #ea580c; padding: 24px 28px; color: #ffffff;">
          <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Bayshore HR</div>
          <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">Bayshore Communication • Employee Onboarding Invitation</div>
        </div>
        <div style="padding: 28px; color: #0f172a;">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600;">Hello ${escapeHtml(payload.employeeName)},</p>
          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
            You have been onboarded to <strong>Bayshore HR</strong> (Bayshore Communication) by Super Administrator <strong>${escapeHtml(payload.adminName || "Super Admin")}</strong>${payload.adminEmail ? ` (<a href="mailto:${payload.adminEmail}" style="color: #ea580c; text-decoration: none;">${payload.adminEmail}</a>)` : ""}. Please accept your invitation and set your login password to activate your Employee Self-Service portal.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 22px; font-size: 13px; color: #334155;">
            <div><strong>Employee ID:</strong> ${escapeHtml(payload.employeeId)}</div>
            <div style="margin-top: 4px;"><strong>Designation:</strong> ${escapeHtml(payload.designation)}</div>
            <div style="margin-top: 4px;"><strong>Department:</strong> ${escapeHtml(payload.department)}</div>
            ${payload.officeHours ? `<div style="margin-top: 4px;"><strong>Office Hours:</strong> ${escapeHtml(payload.officeHours)}</div>` : ""}
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${payload.inviteUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
              Accept Invitation &amp; Set Password
            </a>
          </div>
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
            Or copy and paste this link into your browser (valid for ${expiresHours} hours):
          </p>
          <p style="margin: 0; font-size: 11px; color: #ea580c; word-break: break-all;">${payload.inviteUrl}</p>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; font-size: 11px; color: #94a3b8;">
          Bayshore Communication • Automated HRMS Mailer
        </div>
      </div>
    </div>
  `;
}

function buildInviteText(payload: InviteEmailPayload): string {
  const expiresHours = payload.expiresHours ?? 48;
  return [
    `Hello ${escapeHtml(payload.employeeName)},`,
    "",
    "You have been added to Bayshore HR (Bayshore Communication).",
    `Employee ID: ${payload.employeeId}`,
    `Designation: ${payload.designation}`,
    `Department: ${payload.department}`,
    ...(payload.officeHours ? [`Office Hours: ${payload.officeHours}`] : []),
    "",
    "Accept your invitation and set your login password using the link below:",
    payload.inviteUrl,
    "",
    `This link expires in ${expiresHours} hours.`,
  ].join("\n");
}

export async function verifyAndTestSmtp(params: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  senderEmail?: string;
  testRecipient?: string;
}): Promise<void> {
  const cleanPass = params.pass.replace(/\s+/g, "").trim();
  const transporter = nodemailer.createTransport({
    host: params.host,
    port: params.port,
    secure: params.secure,
    auth: { user: params.user.trim(), pass: cleanPass },
  });

  await transporter.verify();

  if (params.testRecipient) {
    const headers = buildSenderHeaders({
      authUser: params.user,
      senderEmail: params.senderEmail || params.user,
      fromName: params.fromName,
    });
    await transporter.sendMail({
      from: headers.from,
      replyTo: headers.replyTo,
      to: params.testRecipient.trim(),
      subject: "Bayshore HR — Email Delivery Connected",
      text: `Your Bayshore HR mailer is connected. Active Sender / Reply-To: ${headers.effectiveSender} (Mode: ${headers.isRelay ? "System Relay" : "Direct SMTP"}).`,
      html: `<div style="font-family: Inter, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-top: 0;">Bayshore HR Email Delivery Connected</h2>
        <p style="color: #334155;">Employee invitation emails from <strong>Bayshore Communication</strong> are ready to deliver directly to employee inboxes.</p>
        <p style="color: #475569; font-size: 13px;"><strong>Active Sender / Reply-To:</strong> ${escapeHtml(headers.effectiveSender)}</p>
      </div>`,
    });
  }
}

export async function sendEmployeeInviteEmail(
  payload: InviteEmailPayload
): Promise<InviteEmailResult> {
  const smtp = await resolveSmtpConfig();
  const effectiveSenderEmail =
    smtp?.senderEmail || payload.adminEmail || smtp?.user || "";
  const effectivePayload: InviteEmailPayload = {
    ...payload,
    adminEmail: effectiveSenderEmail,
  };
  const subject = `Bayshore HR Invitation — Activate Your Employee Account (${payload.employeeId})`;
  const html = buildInviteHtml(effectivePayload);
  const text = buildInviteText(effectivePayload);

  if (smtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
      });

      const headers = buildSenderHeaders({
        authUser: smtp.user,
        senderEmail: effectiveSenderEmail,
        fromName: smtp.fromName || payload.adminName || "Bayshore HR",
      });

      await transporter.sendMail({
        from: headers.from,
        replyTo: headers.replyTo,
        to: payload.to,
        subject,
        text,
        html,
      });

      return {
        delivered: true,
        mode: "smtp",
        inviteUrl: payload.inviteUrl,
        message: `Invitation email sent to ${payload.to} (Sender / Reply-To: ${headers.effectiveSender}).`,
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "SMTP transport failure";
      return {
        delivered: false,
        mode: "direct-link",
        inviteUrl: payload.inviteUrl,
        message: `Employee saved, but email to ${payload.to} failed (${errorMsg}). Check Email Delivery in Settings, or share the activation link below.`,
      };
    }
  }

  // No real SMTP credentials configured yet — create Ethereal sandbox preview only (delivered: false for real inbox)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const ethTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await ethTransporter.sendMail({
      from: `"Bayshore HR" <no-reply@bayshore.com>`,
      to: payload.to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    return {
      delivered: false,
      mode: "ethereal",
      previewUrl,
      inviteUrl: payload.inviteUrl,
      message: `Real Gmail inbox delivery is not configured yet (no email sent to ${payload.to}). Add your Gmail & 16-digit App Password in Settings -> Gmail SMTP, or use the activation link / Ethereal preview below.`,
    };
  } catch {
    return {
      delivered: false,
      mode: "direct-link",
      inviteUrl: payload.inviteUrl,
      message: `Gmail SMTP is not configured yet, so no email was sent to ${payload.to}. Set up Gmail App Password in Settings or share the activation link below.`,
    };
  }
}
