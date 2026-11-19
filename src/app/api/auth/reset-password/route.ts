import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { UserModel } from "@/models/User";
import { ActivityLogModel } from "@/models/ActivityLog";
import { hashInviteToken } from "@/lib/auth-server";
import { getClientIp } from "@/lib/geo";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const token = request.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Reset token is missing." },
        { status: 400 }
      );
    }

    const tokenHash = hashInviteToken(token);
    const user = await UserModel.findOne({
      resetTokenHash: tokenHash,
      resetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "This password reset link is invalid or has expired. Please request a new link.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("GET /api/auth/reset-password error:", err);
    return NextResponse.json(
      { valid: false, error: "Server error verifying reset token." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const body = (await request.json().catch(() => ({}))) as {
      token?: string;
      newPassword?: string;
    };

    const token = body.token?.trim();
    const newPassword = body.newPassword?.trim();

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const tokenHash = hashInviteToken(token);
    const user = await UserModel.findOne({
      resetTokenHash: tokenHash,
      resetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "This reset link is invalid or has already expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetTokenHash = null;
    user.resetExpiresAt = null;
    if (user.status === "Invited") {
      user.status = "Active";
    }
    await user.save();

    await ActivityLogModel.create({
      user: user.name,
      avatar: user.avatar,
      action: "successfully reset account password",
      target: user.email,
      type: "policy",
      ipAddress: getClientIp(request),
      location: "Abtab Nagar HQ",
    });

    return NextResponse.json({
      ok: true,
      message:
        "Your password has been successfully reset. Please sign in with your new password.",
    });
  } catch (err) {
    console.error("POST /api/auth/reset-password error:", err);
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
