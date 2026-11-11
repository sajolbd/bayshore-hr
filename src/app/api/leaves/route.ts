import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { LeavePolicyModel } from "@/models/LeavePolicy";
import { LeaveRequestModel } from "@/models/LeaveRequest";
import { HolidayModel } from "@/models/Holiday";
import { UserModel } from "@/models/User";
import { ActivityLogModel } from "@/models/ActivityLog";
import { getDhakaDateInfo } from "@/lib/geo";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const [policyDoc, holidays] = await Promise.all([
      LeavePolicyModel.findOne({ key: "annual_leave" }).lean(),
      HolidayModel.find().sort({ createdAt: 1 }).lean(),
    ]);

    const policy = {
      type: "Annual Leave" as const,
      yearlyQuota: policyDoc?.yearlyQuota ?? 20,
      carryForwardMax: policyDoc?.carryForwardMax ?? 5,
      paid: policyDoc?.paid ?? true,
      description:
        policyDoc?.description ||
        "Fixed yearly paid annual leave allocation per employee.",
      color: policyDoc?.color || "#EA580C",
    };

    const mappedHolidays = holidays.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      date: h.date,
      day: h.day,
      type: h.type,
    }));

    if (isAdminRole(session.role)) {
      const requests = await LeaveRequestModel.find()
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        policies: [policy],
        holidays: mappedHolidays,
        requests: requests.map((r) => ({
          id: r.requestCode,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          avatar: r.avatar,
          department: r.department,
          leaveType: r.leaveType,
          startDate: r.startDate,
          endDate: r.endDate,
          days: r.days,
          reason: r.reason,
          status: r.status,
          appliedDate: r.appliedDate,
          reviewedBy: r.reviewedBy,
        })),
      });
    }

    const myRequests = await LeaveRequestModel.find({
      employeeId: session.employeeId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      policies: [policy],
      holidays: mappedHolidays,
      requests: myRequests.map((r) => ({
        id: r.requestCode,
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        avatar: r.avatar,
        department: r.department,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        days: r.days,
        reason: r.reason,
        status: r.status,
        appliedDate: r.appliedDate,
        reviewedBy: r.reviewedBy,
      })),
    });
  } catch (err) {
    console.error("GET /api/leaves error:", err);
    return NextResponse.json(
      { error: "Failed to load leave records." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      employeeId?: string;
      startDate?: string;
      endDate?: string;
      days?: number;
      reason?: string;
      autoApprove?: boolean;
    };

    const startDate = body.startDate?.trim();
    const endDate = body.endDate?.trim();
    const days = Number(body.days);
    const reason = body.reason?.trim();

    if (!startDate || !endDate || !reason || !Number.isFinite(days) || days < 1) {
      return NextResponse.json(
        { error: "Valid start date, end date, days, and reason are required." },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "End date cannot be earlier than start date." },
        { status: 400 }
      );
    }

    // Admin can record leave for another employee; Employees apply strictly for themselves
    const targetEmpId =
      isAdminRole(session.role) && body.employeeId
        ? body.employeeId
        : session.employeeId;

    const targetUser = await UserModel.findOne({ employeeId: targetEmpId }).lean();
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target employee was not found." },
        { status: 404 }
      );
    }

    const [policyDoc, activeLeaves] = await Promise.all([
      LeavePolicyModel.findOne({ key: "annual_leave" }).lean(),
      LeaveRequestModel.find({
        employeeId: targetEmpId,
        status: { $in: ["Pending", "Approved"] },
      }).lean(),
    ]);

    const yearlyQuota = policyDoc?.yearlyQuota ?? 20;
    const usedDays = activeLeaves.reduce((acc, item) => acc + item.days, 0);
    const remainingDays = Math.max(0, yearlyQuota - usedDays);

    if (days > remainingDays) {
      return NextResponse.json(
        {
          error: `Insufficient Annual Leave balance. Remaining: ${remainingDays} of ${yearlyQuota} days.`,
        },
        { status: 400 }
      );
    }

    const { dateKey } = getDhakaDateInfo();
    const requestCode = `LEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const isAutoApproved = isAdminRole(session.role) && body.autoApprove === true;

    const created = await LeaveRequestModel.create({
      requestCode,
      employeeId: targetUser.employeeId,
      employeeName: targetUser.name,
      avatar: targetUser.avatar,
      department: targetUser.department,
      leaveType: "Annual Leave",
      startDate,
      endDate,
      days,
      reason,
      status: isAutoApproved ? "Approved" : "Pending",
      appliedDate: dateKey,
      reviewedBy: isAutoApproved ? `${session.name} (${session.role})` : undefined,
    });

    await ActivityLogModel.create({
      user: targetUser.name,
      avatar: targetUser.avatar,
      action: isAutoApproved
        ? "had Annual Leave recorded & deducted:"
        : "submitted Annual Leave application for",
      target: `${days} day(s) (${startDate} to ${endDate})`,
      type: "leave",
    });

    return NextResponse.json(
      {
        request: {
          id: created.requestCode,
          employeeId: created.employeeId,
          employeeName: created.employeeName,
          avatar: created.avatar,
          department: created.department,
          leaveType: created.leaveType,
          startDate: created.startDate,
          endDate: created.endDate,
          days: created.days,
          reason: created.reason,
          status: created.status,
          appliedDate: created.appliedDate,
          reviewedBy: created.reviewedBy,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/leaves error:", err);
    return NextResponse.json(
      { error: "Failed to submit leave request." },
      { status: 500 }
    );
  }
}
