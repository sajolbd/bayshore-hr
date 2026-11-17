import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { UserModel } from "@/models/User";
import { AttendanceModel } from "@/models/Attendance";
import { LeaveRequestModel } from "@/models/LeaveRequest";
import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  getDhakaCurrentMonthKey,
  isValidMonthKey,
  normalizeTime24h,
} from "@/lib/office-time";
import {
  buildMonthlyAttendanceReport,
  generateEmployeeMonthlyAttendanceXlsx,
  getDayNameFromDateKey,
  MonthlyReportAttendanceInput,
} from "@/lib/excel-attendance-report";

function expandDateRangeWithinMonth(
  startDate: string,
  endDate: string,
  monthKey: string
): string[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const dates: string[] = [];
  const cursor = new Date(start);
  let guard = 0;
  while (cursor <= end && guard < 62) {
    const key = cursor.toISOString().slice(0, 10);
    if (key.startsWith(`${monthKey}-`)) {
      dates.push(key);
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard++;
  }
  return dates;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const { searchParams } = new URL(request.url);
    const requestedEmployeeId = searchParams.get("employeeId")?.trim();
    const rawMonth = searchParams.get("month")?.trim();
    const format = searchParams.get("format")?.trim().toLowerCase() || "json";

    const monthKey = isValidMonthKey(rawMonth)
      ? rawMonth!
      : getDhakaCurrentMonthKey();

    // Strict RBAC: Employees can ONLY request their own report
    const targetEmployeeId = isAdminRole(session.role)
      ? requestedEmployeeId || session.employeeId
      : session.employeeId;

    if (!targetEmployeeId) {
      return NextResponse.json(
        { error: "Employee ID is required." },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ employeeId: targetEmployeeId }).lean();
    if (!user) {
      return NextResponse.json(
        { error: `Employee "${targetEmployeeId}" not found.` },
        { status: 404 }
      );
    }

    const [attendanceDocs, approvedLeaves] = await Promise.all([
      AttendanceModel.find({
        employeeId: targetEmployeeId,
        dateKey: { $regex: `^${monthKey}-` },
      })
        .sort({ dateKey: 1 })
        .lean(),
      LeaveRequestModel.find({
        employeeId: targetEmployeeId,
        status: "Approved",
      }).lean(),
    ]);

    const officeInTime = normalizeTime24h(
      user.officeInTime,
      DEFAULT_OFFICE_IN_TIME
    );
    const officeOutTime = normalizeTime24h(
      user.officeOutTime,
      DEFAULT_OFFICE_OUT_TIME
    );

    const punchDateSet = new Set(attendanceDocs.map((d) => d.dateKey));
    const reportInputs: MonthlyReportAttendanceInput[] = attendanceDocs.map(
      (doc) => ({
        dateKey: doc.dateKey,
        dayLabel: doc.dayLabel,
        checkIn: doc.checkIn,
        checkOut: doc.checkOut,
        workHours: doc.workHours,
        status: doc.status,
        location: doc.location,
        scheduledInTime: officeInTime,
        scheduledOutTime: officeOutTime,
      })
    );

    // Include approved leave days that fall within the selected month
    for (const lv of approvedLeaves) {
      const leaveDates = expandDateRangeWithinMonth(
        lv.startDate,
        lv.endDate,
        monthKey
      );
      for (const dk of leaveDates) {
        if (!punchDateSet.has(dk)) {
          punchDateSet.add(dk);
          reportInputs.push({
            dateKey: dk,
            dayLabel: getDayNameFromDateKey(dk),
            checkIn: null,
            checkOut: null,
            workHours: "0h 0m",
            status: "On Leave",
            location: "Approved Leave",
            scheduledInTime: officeInTime,
            scheduledOutTime: officeOutTime,
          });
        }
      }
    }

    const report = buildMonthlyAttendanceReport(
      {
        id: user.employeeId,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.designation,
        location: user.location,
        officeInTime,
        officeOutTime,
      },
      monthKey,
      reportInputs
    );

    if (format === "xlsx") {
      const xlsxBytes = generateEmployeeMonthlyAttendanceXlsx(report);
      const safeName = user.name
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_");
      const filename = `Attendance_${user.employeeId}_${safeName}_${monthKey}.xlsx`;

      return new NextResponse(Buffer.from(xlsxBytes), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("GET /api/attendance/monthly-report error:", err);
    return NextResponse.json(
      { error: "Failed to generate monthly attendance report." },
      { status: 500 }
    );
  }
}
