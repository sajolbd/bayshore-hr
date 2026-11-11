import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { AttendanceModel } from "@/models/Attendance";
import { getDhakaDateInfo } from "@/lib/geo";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const { dateKey } = getDhakaDateInfo();

    if (isAdminRole(session.role)) {
      const records = await AttendanceModel.find()
        .sort({ dateKey: -1, checkInAt: -1 })
        .limit(200)
        .lean();

      return NextResponse.json({
        dateKey,
        records: records.map((r) => ({
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
          status: r.status,
          workHours: r.workHours,
          location: r.location,
          geo: r.geo,
        })),
      });
    }

    // Strict employee isolation: return ONLY own attendance records
    const myRecords = await AttendanceModel.find({
      employeeId: session.employeeId,
    })
      .sort({ dateKey: -1, checkInAt: -1 })
      .limit(90)
      .lean();

    const todayRecord = myRecords.find((r) => r.dateKey === dateKey) || null;

    return NextResponse.json({
      dateKey,
      todayRecord: todayRecord
        ? {
            id: todayRecord._id.toString(),
            date: todayRecord.dateKey,
            day: todayRecord.dayLabel,
            checkIn: todayRecord.checkIn,
            checkInAt: todayRecord.checkInAt.toISOString(),
            checkOut: todayRecord.checkOut,
            checkOutAt: todayRecord.checkOutAt
              ? todayRecord.checkOutAt.toISOString()
              : null,
            workHours: todayRecord.workHours,
            status: todayRecord.status,
            location: todayRecord.location,
            geo: todayRecord.geo,
          }
        : null,
      records: myRecords.map((r) => ({
        id: r._id.toString(),
        date: r.dateKey,
        day: r.dayLabel,
        checkIn: r.checkIn,
        checkInAt: r.checkInAt.toISOString(),
        checkOut: r.checkOut,
        checkOutAt: r.checkOutAt ? r.checkOutAt.toISOString() : null,
        workHours: r.workHours,
        status: r.status,
        location: r.location,
        geo: r.geo,
      })),
    });
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json(
      { error: "Failed to load attendance logs." },
      { status: 500 }
    );
  }
}
