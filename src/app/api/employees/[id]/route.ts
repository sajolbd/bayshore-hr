import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { UserModel } from "@/models/User";
import { AttendanceModel } from "@/models/Attendance";
import { LeaveRequestModel } from "@/models/LeaveRequest";
import { ExpenseClaimModel } from "@/models/ExpenseClaim";
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
    if (
      body.status &&
      ["Invited", "Active", "On Leave", "Terminated", "Suspended"].includes(
        body.status
      )
    ) {
      user.status = body.status as typeof user.status;
    }

    await user.save();

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
