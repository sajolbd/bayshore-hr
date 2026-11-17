import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { AttendanceModel } from "@/models/Attendance";
import { UserModel } from "@/models/User";
import { getDhakaDateInfo } from "@/lib/geo";
import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  evaluateClockInLate,
  normalizeTime24h,
} from "@/lib/office-time";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const { dateKey } = getDhakaDateInfo();
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get("date"); // e.g. "2026-11-15" or "all"

    if (isAdminRole(session.role)) {
      const query = dateFilter && dateFilter !== "all" ? { dateKey: dateFilter } : {};
      const [records, users] = await Promise.all([
        AttendanceModel.find(query)
          .sort({ dateKey: -1, checkInAt: -1 })
          .limit(300)
          .lean(),
        UserModel.find({}, "employeeId officeInTime officeOutTime").lean(),
      ]);

      const scheduleMap = new Map<
        string,
        { officeInTime: string; officeOutTime: string }
      >();
      for (const u of users) {
        scheduleMap.set(u.employeeId, {
          officeInTime: normalizeTime24h(u.officeInTime, DEFAULT_OFFICE_IN_TIME),
          officeOutTime: normalizeTime24h(
            u.officeOutTime,
            DEFAULT_OFFICE_OUT_TIME
          ),
        });
      }

      return NextResponse.json({
        dateKey,
        selectedDate: dateFilter || dateKey,
        records: records.map((r) => {
          const userSched = scheduleMap.get(r.employeeId);
          const scheduledInTime =
            userSched?.officeInTime ||
            normalizeTime24h(r.scheduledInTime, DEFAULT_OFFICE_IN_TIME);
          const scheduledOutTime =
            userSched?.officeOutTime ||
            normalizeTime24h(r.scheduledOutTime, DEFAULT_OFFICE_OUT_TIME);
          const isLeave = r.status === "On Leave" || r.status === "Absent";
          const lateEval = isLeave
            ? { isLate: false, lateMinutes: 0 }
            : evaluateClockInLate(r.checkIn, scheduledInTime);
          const effectiveStatus = isLeave
            ? r.status
            : lateEval.isLate
            ? "Late"
            : "Present";

          return {
            id: r._id.toString(),
            employeeId: r.employeeId,
            employeeName: r.employeeName,
            employeeEmail: r.employeeEmail,
            avatar: r.avatar,
            department: r.department,
            role: r.role,
            dateKey: r.dateKey,
            dayLabel: r.dayLabel,
            checkIn: r.checkIn,
            checkInAt: r.checkInAt.toISOString(),
            checkOut: r.checkOut,
            checkOutAt: r.checkOutAt ? r.checkOutAt.toISOString() : null,
            scheduledInTime,
            scheduledOutTime,
            isLate: lateEval.isLate,
            lateMinutes: lateEval.lateMinutes,
            status: effectiveStatus,
            workHours: r.workHours,
            location: r.location,
            geo: r.geo,
          };
        }),
      });
    }

    // Strict employee isolation: return ONLY own attendance records
    const empQuery: Record<string, unknown> = { employeeId: session.employeeId };
    if (dateFilter && dateFilter !== "all") {
      empQuery.dateKey = dateFilter;
    }

    const myRecords = await AttendanceModel.find(empQuery)
      .sort({ dateKey: -1, checkInAt: -1 })
      .limit(90)
      .lean();

    const myScheduledIn = normalizeTime24h(
      session.officeInTime,
      DEFAULT_OFFICE_IN_TIME
    );
    const myScheduledOut = normalizeTime24h(
      session.officeOutTime,
      DEFAULT_OFFICE_OUT_TIME
    );

    const mappedMyRecords = myRecords.map((r) => {
      const scheduledInTime = myScheduledIn || normalizeTime24h(r.scheduledInTime, DEFAULT_OFFICE_IN_TIME);
      const scheduledOutTime = myScheduledOut || normalizeTime24h(r.scheduledOutTime, DEFAULT_OFFICE_OUT_TIME);
      const isLeave = r.status === "On Leave" || r.status === "Absent";
      const lateEval = isLeave
        ? { isLate: false, lateMinutes: 0 }
        : evaluateClockInLate(r.checkIn, scheduledInTime);
      const effectiveStatus = isLeave
        ? r.status
        : lateEval.isLate
        ? "Late"
        : "Present";

      return {
        id: r._id.toString(),
        date: r.dateKey,
        day: r.dayLabel,
        checkIn: r.checkIn,
        checkInAt: r.checkInAt.toISOString(),
        checkOut: r.checkOut,
        checkOutAt: r.checkOutAt ? r.checkOutAt.toISOString() : null,
        scheduledInTime,
        scheduledOutTime,
        isLate: lateEval.isLate,
        lateMinutes: lateEval.lateMinutes,
        workHours: r.workHours,
        status: effectiveStatus,
        location: r.location,
        geo: r.geo,
      };
    });

    const todayRecord = mappedMyRecords.find((r) => r.date === dateKey) || null;

    return NextResponse.json({
      dateKey,
      todayRecord,
      records: mappedMyRecords,
    });
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json(
      { error: "Failed to load attendance logs." },
      { status: 500 }
    );
  }
}
