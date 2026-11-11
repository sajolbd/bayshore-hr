import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { AttendanceModel } from "@/models/Attendance";
import { ActivityLogModel } from "@/models/ActivityLog";
import { getClientIp, getDhakaDateInfo } from "@/lib/geo";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const { dateKey, timeLabel } = getDhakaDateInfo(now);

    const record = await AttendanceModel.findOne({
      employeeId: session.employeeId,
      dateKey,
    });

    if (!record || record.checkOut) {
      return NextResponse.json(
        { error: "No active clock-in session found for today." },
        { status: 400 }
      );
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - record.checkInAt.getTime()) / 1000)
    );
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const workHours = `${hours}h ${minutes}m`;

    record.checkOut = timeLabel;
    record.checkOutAt = now;
    record.workHours = workHours;
    await record.save();

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "clocked out after shift duration of",
      target: `${workHours} (Location: ${record.location})`,
      type: "onboarding",
      ipAddress: getClientIp(request),
      location: record.location,
    });

    return NextResponse.json({
      record: {
        id: record._id.toString(),
        date: record.dateKey,
        day: record.dayLabel,
        checkIn: record.checkIn,
        checkInAt: record.checkInAt.toISOString(),
        checkOut: record.checkOut,
        checkOutAt: record.checkOutAt.toISOString(),
        workHours: record.workHours,
        status: record.status,
        location: record.location,
        geo: record.geo,
      },
    });
  } catch (err) {
    console.error("POST /api/attendance/clock-out error:", err);
    return NextResponse.json(
      { error: "Failed to record clock-out." },
      { status: 500 }
    );
  }
}
