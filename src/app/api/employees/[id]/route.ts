import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { UserModel } from "@/models/User";
import { AttendanceModel } from "@/models/Attendance";
import { LeaveRequestModel } from "@/models/LeaveRequest";
import { ExpenseClaimModel } from "@/models/ExpenseClaim";
import { ActivityLogModel } from "@/models/ActivityLog";
import { getDhakaDateInfo } from "@/lib/geo";
import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  evaluateClockInLate,
  normalizeTime24h,
} from "@/lib/office-time";

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
    if (session.role !== "Super Admin" && session.role !== "HR Admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Partial<{
      name: string;
      email: string;
      phone: string;
      role: string;
      department: string;
      salary: number;
      location: string;
      status: string;
      joinDate: string;
      officeInTime: string;
      officeOutTime: string;
    }>;

    const user = await UserModel.findOne({ employeeId: id, role: "Employee" });
    if (!user) {
      return NextResponse.json(
        { error: "Employee record not found." },
        { status: 404 }
      );
    }

    if (body.name) user.name = body.name.trim();
    if (body.email) user.email = body.email.trim().toLowerCase();
    if (body.phone !== undefined) user.phone = body.phone.trim();
    if (body.role) user.designation = body.role.trim();
    if (body.department) user.department = body.department.trim();
    if (typeof body.salary === "number" && !Number.isNaN(body.salary)) {
      user.salary = body.salary;
    }
    if (body.location) user.location = body.location.trim();
    if (body.joinDate) user.joinDate = body.joinDate;
    if (typeof body.officeInTime === "string" && body.officeInTime.trim()) {
      user.officeInTime = normalizeTime24h(
        body.officeInTime,
        DEFAULT_OFFICE_IN_TIME
      );
    }
    if (typeof body.officeOutTime === "string" && body.officeOutTime.trim()) {
      user.officeOutTime = normalizeTime24h(
        body.officeOutTime,
        DEFAULT_OFFICE_OUT_TIME
      );
    }
    if (
      body.status &&
      ["Invited", "Active", "On Leave", "Terminated", "Suspended"].includes(
        body.status
      )
    ) {
      user.status = body.status as typeof user.status;
    }

    await user.save();

    const resolvedIn = normalizeTime24h(user.officeInTime, DEFAULT_OFFICE_IN_TIME);
    const resolvedOut = normalizeTime24h(user.officeOutTime, DEFAULT_OFFICE_OUT_TIME);

    await AttendanceModel.updateMany(
      { employeeId: id },
      {
        $set: {
          employeeName: user.name,
          employeeEmail: user.email,
          department: user.department,
          role: user.designation,
        },
      }
    );

    // Sync today's punch schedule & re-evaluate lateness if office hours were adjusted
    const { dateKey } = getDhakaDateInfo();
    const todayAtt = await AttendanceModel.findOne({ employeeId: id, dateKey });
    if (todayAtt) {
      const isLeave = todayAtt.status === "On Leave" || todayAtt.status === "Absent";
      const lateEval = evaluateClockInLate(todayAtt.checkIn, resolvedIn);
      todayAtt.scheduledInTime = resolvedIn;
      todayAtt.scheduledOutTime = resolvedOut;
      if (!isLeave) {
        todayAtt.status = lateEval.isLate ? "Late" : "Present";
      }
      await todayAtt.save();
    }

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "updated profile record for",
      target: `${user.name} (${user.employeeId})`,
      type: "onboarding",
    });

    return NextResponse.json({
      employee: {
        id: user.employeeId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.designation,
        department: user.department,
        status: user.status,
        joinDate: user.joinDate,
        phone: user.phone,
        location: user.location,
        salary: user.salary,
        officeInTime: resolvedIn,
        officeOutTime: resolvedOut,
      },
    });
  } catch (err) {
    console.error("PATCH /api/employees/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update employee." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
        { error: "Forbidden: Only Super Admin can remove employees." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const user = await UserModel.findOne({ employeeId: id, role: "Employee" });
    if (!user) {
      return NextResponse.json(
        { error: "Employee record not found." },
        { status: 404 }
      );
    }

    await Promise.all([
      UserModel.deleteOne({ _id: user._id }),
      AttendanceModel.deleteMany({ employeeId: id }),
      LeaveRequestModel.deleteMany({ employeeId: id }),
      ExpenseClaimModel.deleteMany({ employeeId: id }),
      ActivityLogModel.create({
        user: session.name,
        avatar: session.avatar,
        action: "removed employee record",
        target: `${user.name} (${user.employeeId})`,
        type: "onboarding",
      }),
    ]);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /api/employees/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete employee." },
      { status: 500 }
    );
  }
}
