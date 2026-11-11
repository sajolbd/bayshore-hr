import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { LeaveRequestModel } from "@/models/LeaveRequest";
import { ActivityLogModel } from "@/models/ActivityLog";

export async function PATCH(
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
    if (!isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can approve or reject leave requests." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      status?: "Approved" | "Rejected";
      reason?: string;
    };

    if (body.status !== "Approved" && body.status !== "Rejected") {
      return NextResponse.json(
        { error: "Status must be Approved or Rejected." },
        { status: 400 }
      );
    }

    const leave = await LeaveRequestModel.findOne({ requestCode: id });
    if (!leave) {
      return NextResponse.json(
        { error: "Leave request not found." },
        { status: 404 }
      );
    }

    leave.status = body.status;
    leave.reviewedBy = `${session.name} (${session.role})`;
    if (body.reason) {
      leave.rejectionReason = body.reason;
    }
    await leave.save();

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action:
        body.status === "Approved"
          ? "approved Annual Leave request for"
          : "rejected & refunded Annual Leave request for",
      target: `${leave.employeeName} (${leave.days} day(s))`,
      type: "leave",
    });

    return NextResponse.json({
      request: {
        id: leave.requestCode,
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        avatar: leave.avatar,
        department: leave.department,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: leave.days,
        reason: leave.reason,
        status: leave.status,
        appliedDate: leave.appliedDate,
        reviewedBy: leave.reviewedBy,
      },
    });
  } catch (err) {
    console.error("PATCH /api/leaves/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update leave request." },
      { status: 500 }
    );
  }
}
