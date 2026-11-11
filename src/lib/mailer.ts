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
  inviteUrl: string;
  expiresHours?: number;
}

export interface InviteEmailResult {
  delivered: boolean;
  mode: "smtp" | "ethereal" | "direct-link";
  previewUrl?: string;
  inviteUrl: string;
  message: string;
}

export interface ResolvedSmtpConfig {
  source: "database" | "env";
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
}

export async function resolveSmtpConfig(): Promise<ResolvedSmtpConfig | null> {
  try {
    await connectToDatabase();
    const doc = await MailSettingsModel.findOne({ key: "primary" })
      .select("+smtpPassEncrypted")
      .lean();

    if (doc && doc.smtpUser && doc.smtpPassEncrypted) {
      const decryptedPass = decryptSecret(doc.smtpPassEncrypted).replace(/\s+/g, "");
      if (decryptedPass) {
        return {
          source: "database",
          host: doc.smtpHost || "smtp.gmail.com",
          port: doc.smtpPort || 587,
          secure: Boolean(doc.smtpSecure),
          user: doc.smtpUser.trim(),
          pass: decryptedPass,
          fromName: doc.fromName?.trim() || "Bayshore HR",
        };
      }
    }
  } catch {
    // Fallback to environment variables cleanly
  }

  const envUser = process.env.SMTP_USER?.trim();
  const envPass = process.env.SMTP_PASS?.replace(/\s+/g, "").trim();
  if (envUser && envPass) {
    return {
      source: "env",
      host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      user: envUser,
      pass: envPass,
      fromName: "Bayshore HR",
    };
  }

  return null;
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
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600;">Hello ${payload.employeeName},</p>
          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
            You have been onboarded to <strong>Bayshore HR</strong> (Bayshore Communication) by the Super Administrator. Please accept your invitation and set your login password to activate your Employee Self-Service portal.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 22px; font-size: 13px; color: #334155;">
            <div><strong>Employee ID:</strong> ${payload.employeeId}</div>
            <div style="margin-top: 4px;"><strong>Designation:</strong> ${payload.designation}</div>
            <div style="margin-top: 4px;"><strong>Department:</strong> ${payload.department}</div>
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
    `Hello ${payload.employeeName},`,
    "",
    "You have been added to Bayshore HR (Bayshore Communication).",
    `Employee ID: ${payload.employeeId}`,
    `Designation: ${payload.designation}`,
    `Department: ${payload.department}`,
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
    await transporter.sendMail({
      from: `"${params.fromName}" <${params.user.trim()}>`,
      to: params.testRecipient.trim(),
      subject: "Bayshore HR — Gmail SMTP Connection Verified",
      text: "Your Bayshore HR SMTP configuration is connected and ready to deliver employee invitation emails.",
      html: `<div style="font-family: Inter, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-top: 0;">Bayshore HR SMTP Connected</h2>
        <p style="color: #334155;">Employee invitation emails from <strong>Bayshore Communication</strong> will now be delivered directly to employee inboxes.</p>
      </div>`,
    });
  }
}

export async function sendEmployeeInviteEmail(
  payload: InviteEmailPayload
): Promise<InviteEmailResult> {
  const smtp = await resolveSmtpConfig();
  const subject = `Bayshore HR Invitation — Activate Your Employee Account (${payload.employeeId})`;
  const html = buildInviteHtml(payload);
  const text = buildInviteText(payload);

  if (smtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
      });

      await transporter.sendMail({
        from: `"${smtp.fromName}" <${smtp.user}>`,
        to: payload.to,
        subject,
        text,
        html,
      });

      return {
        delivered: true,
        mode: "smtp",
        inviteUrl: payload.inviteUrl,
        message: `Invitation email sent directly to ${payload.to}.`,
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "SMTP transport failure";
      return {
        delivered: false,
        mode: "direct-link",
        inviteUrl: payload.inviteUrl,
        message: `Employee saved, but email to ${payload.to} failed (${errorMsg}). Check Gmail App Password in Settings -> Email & Gmail SMTP, or share the activation link below.`,
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
