import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { UserModel } from "@/models/User";
import { attachSessionCookie, signSessionToken } from "@/lib/auth-server";
import { ActivityLogModel } from "@/models/ActivityLog";
import { getClientIp } from "@/lib/geo";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email }).select("+passwordHash");
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status === "Invited" || !user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "Account pending activation. Please open your invitation email and set your password first.",
        },
        { status: 403 }
      );
    }

    if (user.status === "Suspended" || user.status === "Terminated") {
      return NextResponse.json(
        { error: `Account is currently ${user.status.toLowerCase()}. Contact Super Admin.` },
        { status: 403 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    await ActivityLogModel.create({
      user: user.name,
      avatar: user.avatar,
      action: "signed in to",
      target:
        user.role === "Employee"
          ? "Employee Self-Service Portal"
          : `${user.role} Console`,
      type: "onboarding",
      ipAddress: getClientIp(request),
    });

    const token = await signSessionToken({
      sub: user._id.toString(),
      employeeId: user.employeeId,
      role: user.role,
    });

    const response = NextResponse.json({
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
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
        salary: user.salary,
      },
    });

    attachSessionCookie(response, token, request);
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Unable to complete sign-in. Please verify database connectivity." },
      { status: 500 }
    );
  }
}
