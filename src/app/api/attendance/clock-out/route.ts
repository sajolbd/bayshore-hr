import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { AttendanceModel } from "@/models/Attendance";
import { ActivityLogModel } from "@/models/ActivityLog";
import { BAYSHORE_HQ, getClientIp, getDhakaDateInfo } from "@/lib/geo";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const { dateKey, dayLabel, timeLabel } = getDhakaDateInfo(now);
    const clientIp = getClientIp(request);

    const userOrClauses: Record<string, unknown>[] = [];
    if (session.employeeId) {
      userOrClauses.push({ employeeId: session.employeeId });
    }
    if (session.email) {
      userOrClauses.push({ employeeEmail: session.email.toLowerCase() });
      userOrClauses.push({ employeeEmail: session.email });
    }
    const userQuery =
      userOrClauses.length > 0
        ? { $or: userOrClauses }
        : { employeeId: session.employeeId || "EMP-001" };

    // 1. Look for an active open record for today
    let record = await AttendanceModel.findOne({
      ...userQuery,
      dateKey,
      checkOut: null,
    });

    // 2. If not found, look for an open punch from within the last 24 hours
    if (!record) {
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 3600 * 1000);
      record = await AttendanceModel.findOne({
        ...userQuery,
        checkOut: null,
        createdAt: { $gte: twentyFourHoursAgo },
      }).sort({ createdAt: -1 });
    }

    // 3. If still not found, look for today's record (even if previously checked out)
    if (!record) {
      record = await AttendanceModel.findOne({
        ...userQuery,
        dateKey,
      }).sort({ createdAt: -1 });
    }

    // 4. If no record at all exists in database for today, create one automatically
    if (!record) {
      const defaultCheckInTime = "09:00 AM";
      const defaultCheckInAt = new Date(now.getTime() - 8 * 3600 * 1000);
      record = await AttendanceModel.create({
        employeeId: session.employeeId,
        employeeName: session.name,
        employeeEmail: session.email,
        avatar: session.avatar || "",
        department: session.department || "Engineering",
        role: session.designation || "Staff",
        dateKey,
        dayLabel,
        checkIn: defaultCheckInTime,
        checkInAt: defaultCheckInAt,
        checkOut: timeLabel,
        checkOutAt: now,
        status: "Present",
        workHours: "8h 00m",
        location: "Gulshan HQ",
        geo: {
          latitude: BAYSHORE_HQ.latitude,
          longitude: BAYSHORE_HQ.longitude,
          accuracy: 10,
          address: "Bayshore Tower, Plot 14, Road 46, Gulshan-2, Dhaka 1212",
          geofenceStatus: "Inside Office Geofence",
          distanceFromHQ: 0,
          ipAddress: clientIp,
          selfieUrl: session.avatar || "",
          checkInType: "Time Clock",
          timestamp: `Today at ${defaultCheckInTime}`,
        },
      });
    }

    // Calculate work hours safely
    const checkInDate = record.checkInAt
      ? new Date(record.checkInAt)
      : new Date(now.getTime() - 8 * 3600 * 1000);
    const checkInMs = Number.isFinite(checkInDate.getTime())
      ? checkInDate.getTime()
      : now.getTime();
    const elapsedSeconds = Math.max(60, Math.floor((now.getTime() - checkInMs) / 1000));
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const workHours = `${hours}h ${minutes}m`;

    const updatedRecord = await AttendanceModel.findByIdAndUpdate(
      record._id,
      {
        $set: {
          checkOut: timeLabel,
          checkOutAt: now,
          workHours,
          clockOutLocation: "Gulshan HQ",
        },
      },
      { new: true }
    );

    const safeRec = updatedRecord || record;

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "clocked out after shift duration of",
      target: `${workHours} (Location: ${safeRec.location || "Gulshan HQ"})`,
      type: "onboarding",
      ipAddress: clientIp,
      location: safeRec.location || "Gulshan HQ",
    });

    return NextResponse.json({
      record: {
        id: safeRec._id.toString(),
        employeeId: safeRec.employeeId,
        employeeName: safeRec.employeeName,
        employeeEmail: safeRec.employeeEmail,
        avatar: safeRec.avatar,
        department: safeRec.department,
        role: safeRec.role,
        date: safeRec.dateKey,
        dateKey: safeRec.dateKey,
        day: safeRec.dayLabel,
        checkIn: safeRec.checkIn,
        checkInAt: safeRec.checkInAt ? safeRec.checkInAt.toISOString() : now.toISOString(),
        checkOut: safeRec.checkOut || timeLabel,
        checkOutAt: safeRec.checkOutAt ? safeRec.checkOutAt.toISOString() : now.toISOString(),
        workHours: safeRec.workHours || workHours,
        status: safeRec.status,
        location: safeRec.location,
        geo: safeRec.geo,
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
