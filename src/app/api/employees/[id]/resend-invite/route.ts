import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import {
  generateInviteToken,
  getAppBaseUrl,
  getSessionUser,
} from "@/lib/auth-server";
import { UserModel } from "@/models/User";
import { sendEmployeeInviteEmail } from "@/lib/mailer";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "Super Admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can resend invitations." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const user = await UserModel.findOne({ employeeId: id, role: "Employee" });
    if (!user) {
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    if (user.status === "Active") {
      return NextResponse.json(
        { error: "Employee has already accepted the invitation and activated their password." },
        { status: 400 }
      );
    }

    const { rawToken, tokenHash } = generateInviteToken();
    user.inviteTokenHash = tokenHash;
    user.inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    user.inviteSentAt = new Date();
    user.status = "Invited";
    await user.save();

    const baseUrl = getAppBaseUrl(request);
    const inviteUrl = `${baseUrl}/accept-invite?token=${rawToken}`;

    const emailStatus = await sendEmployeeInviteEmail({
      to: user.email,
      employeeName: user.name,
      employeeId: user.employeeId,
      designation: user.designation,
      department: user.department,
      inviteUrl,
      expiresHours: 48,
    });

    return NextResponse.json({ ok: true, emailStatus });
  } catch (err) {
    console.error("Resend invite error:", err);
    return NextResponse.json(
      { error: "Failed to resend invitation email." },
      { status: 500 }
    );
  }
}
