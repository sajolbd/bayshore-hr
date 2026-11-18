import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { UserModel } from "@/models/User";
import { ActivityLogModel } from "@/models/ActivityLog";
import { getAppBaseUrl, hashInviteToken } from "@/lib/auth-server";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { getClientIp } from "@/lib/geo";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid corporate email address." },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      email,
      status: { $ne: "Terminated" },
    });

    if (!user) {
      // Return neutral success for privacy protection against user enumeration
      return NextResponse.json({
        ok: true,
        message:
          "If an active account exists with this email, a password reset link has been sent to your inbox.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashInviteToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetTokenHash = tokenHash;
    user.resetExpiresAt = expiresAt;
    await user.save();

    const baseUrl = getAppBaseUrl(request);
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    const sendRes = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    await ActivityLogModel.create({
      user: user.name,
      avatar: user.avatar,
      action: "requested password reset via email",
      target: user.email,
      type: "policy",
      ipAddress: getClientIp(request),
      location: "Gulshan HQ",
    });

    return NextResponse.json({
      ok: true,
      delivered: sendRes.delivered,
      previewUrl: sendRes.previewUrl,
      resetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
      message: sendRes.delivered
        ? `A password reset link has been delivered to ${user.email}. Please check your inbox.`
        : sendRes.message ||
          `Password reset link generated. Please check your email inbox.`,
    });
  } catch (err) {
    console.error("POST /api/auth/forgot-password error:", err);
    return NextResponse.json(
      { error: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
