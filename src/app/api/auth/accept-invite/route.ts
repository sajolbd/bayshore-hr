import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { UserModel } from "@/models/User";
import { ActivityLogModel } from "@/models/ActivityLog";
import {
  attachSessionCookie,
  hashInviteToken,
  signSessionToken,
} from "@/lib/auth-server";
import { getClientIp } from "@/lib/geo";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const rawToken = request.nextUrl.searchParams.get("token")?.trim();
    if (!rawToken) {
      return NextResponse.json(
        { valid: false, error: "Invitation token is missing." },
        { status: 400 }
      );
    }

    const tokenHash = hashInviteToken(rawToken);
    const user = await UserModel.findOne({
      inviteTokenHash: tokenHash,
      inviteExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "This invitation link is invalid or has expired. Ask your Super Admin to resend the invite.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      employee: {
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        designation: user.designation,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Verify invite error:", err);
    return NextResponse.json(
      { valid: false, error: "Unable to verify invitation token." },
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
      password?: string;
      confirmPassword?: string;
    };

    const rawToken = body.token?.trim();
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    if (!rawToken) {
      return NextResponse.json(
        { error: "Invitation token is missing." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password and confirm password do not match." },
        { status: 400 }
      );
    }

    const tokenHash = hashInviteToken(rawToken);
    const user = await UserModel.findOne({
      inviteTokenHash: tokenHash,
      inviteExpiresAt: { $gt: new Date() },
    }).select("+passwordHash +inviteTokenHash");

    if (!user) {
      return NextResponse.json(
        {
          error:
            "This invitation link is invalid or has expired. Request a fresh invite from Super Admin.",
        },
        { status: 400 }
      );
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.status = "Active";
    user.inviteTokenHash = null;
    user.inviteExpiresAt = null;
    user.lastLoginAt = new Date();
    await user.save();

    await ActivityLogModel.create({
      user: user.name,
      avatar: user.avatar,
      action: "accepted email invitation & activated account for",
      target: `${user.employeeId} (${user.designation})`,
      type: "onboarding",
      ipAddress: getClientIp(request),
    });

    const jwtToken = await signSessionToken({
      sub: user._id.toString(),
      employeeId: user.employeeId,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar,
        status: user.status,
      },
    });

    attachSessionCookie(response, jwtToken, request);
    return response;
  } catch (err) {
    console.error("Accept invite error:", err);
    return NextResponse.json(
      { error: "Failed to activate employee account." },
      { status: 500 }
    );
  }
}
