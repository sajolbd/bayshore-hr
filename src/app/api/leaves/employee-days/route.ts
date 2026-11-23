import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { EmployeeLeaveDayModel } from "@/models/EmployeeLeaveDay";
import { UserModel } from "@/models/User";
import { ActivityLogModel } from "@/models/ActivityLog";

function serializeEntry(entry: {
  _id: { toString(): string };
  employeeId: string;
  employeeName: string;
  totalDays: number;
  usedDaysAdjustment: number;
  note?: string;
  updatedBy?: string;
  updatedAt: Date;
}) {
  return {
    id: entry._id.toString(),
    employeeId: entry.employeeId,
    employeeName: entry.employeeName,
    totalDays: entry.totalDays,
    usedDaysAdjustment: entry.usedDaysAdjustment,
    note: entry.note || "",
    updatedBy: entry.updatedBy || "",
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const entries = isAdminRole(session.role)
      ? await EmployeeLeaveDayModel.find().sort({ updatedAt: -1 }).lean()
      : await EmployeeLeaveDayModel.find({ employeeId: session.employeeId })
          .sort({ updatedAt: -1 })
          .lean();

    return NextResponse.json({ overrides: entries.map(serializeEntry) });
  } catch (err) {
    console.error("GET /api/leaves/employee-days error:", err);
    return NextResponse.json(
      { error: "Failed to load employee leave days." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "Super Admin") {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only Super Admin can edit an individual employee's leave days.",
        },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      employeeId?: string;
      totalDays?: number | null;
      usedDaysAdjustment?: number;
      note?: string;
      resetToDefault?: boolean;
    };

    const employeeId = body.employeeId?.trim();
    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required." },
        { status: 400 }
      );
    }

    const targetUser = await UserModel.findOne({ employeeId }).lean();
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target employee was not found." },
        { status: 404 }
      );
    }

    // Reset: remove the personal override so the company default applies again.
    if (body.resetToDefault === true) {
      await EmployeeLeaveDayModel.findOneAndDelete({
        employeeId,
      }).lean();

      await ActivityLogModel.create({
        user: session.name,
        avatar: session.avatar,
        action: "reset personal annual leave days to company default for",
        target: `${targetUser.name} (${employeeId})`,
        type: "leave",
      });

      return NextResponse.json({ reset: true });
    }

    if (body.totalDays === null || body.totalDays === undefined) {
      return NextResponse.json(
        {
          error:
            "totalDays is required. Send resetToDefault=true to restore the company-wide default.",
        },
        { status: 400 }
      );
    }

    const totalDays = Math.max(0, Math.min(365, Math.round(Number(body.totalDays))));
    const usedDaysAdjustment = Math.max(
      -365,
      Math.min(365, Math.round(Number(body.usedDaysAdjustment ?? 0)))
    );
    if (!Number.isFinite(totalDays) || !Number.isFinite(usedDaysAdjustment)) {
      return NextResponse.json(
        { error: "totalDays and usedDaysAdjustment must be valid numbers." },
        { status: 400 }
      );
    }

    const note = (body.note ?? "").trim().slice(0, 300);

    const updated = await EmployeeLeaveDayModel.findOneAndUpdate(
      { employeeId },
      {
        $set: {
          employeeId,
          employeeName: targetUser.name,
          avatar: targetUser.avatar,
          department: targetUser.department,
          totalDays,
          usedDaysAdjustment,
          note,
          updatedBy: `${session.name} (${session.role})`,
        },
      },
      { upsert: true, new: true }
    );

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "edited individual Annual Leave days for",
      target: `${targetUser.name}: ${totalDays} day(s)/year, manual adjustment ${usedDaysAdjustment >= 0 ? "+" : ""}${usedDaysAdjustment}`,
      type: "leave",
    });

    return NextResponse.json({ override: serializeEntry(updated) });
  } catch (err) {
    console.error("PUT /api/leaves/employee-days error:", err);
    return NextResponse.json(
      { error: "Failed to update employee leave days." },
      { status: 500 }
    );
  }
}
