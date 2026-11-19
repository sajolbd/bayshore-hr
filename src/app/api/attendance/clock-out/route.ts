import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { AttendanceModel } from "@/models/Attendance";
import { ActivityLogModel } from "@/models/ActivityLog";
import { BAYSHORE_HQ, getClientIp, getDhakaDateInfo } from "@/lib/geo";
import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  evaluateClockInLate,
  formatTime12h,
  normalizeTime24h,
} from "@/lib/office-time";

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

    const scheduledInTime = normalizeTime24h(
      session.officeInTime,
      DEFAULT_OFFICE_IN_TIME
    );
    const scheduledOutTime = normalizeTime24h(
      session.officeOutTime,
      DEFAULT_OFFICE_OUT_TIME
    );

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
    let isNewlyCreated = false;
    if (!record) {
      isNewlyCreated = true;
      const defaultCheckInTime = formatTime12h(scheduledInTime, "09:00 AM");
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
        scheduledInTime,
        scheduledOutTime,
        status: "Present",
        workHours: "8h 00m",
        location: "Abtab Nagar HQ",
        geo: {
          latitude: BAYSHORE_HQ.latitude,
          longitude: BAYSHORE_HQ.longitude,
          accuracy: 10,
          address: "Level 2, Road 1, Block A, Abtab Nagar, Dhaka 1212",
          geofenceStatus: "Inside Office Geofence",
          distanceFromHQ: 0,
          ipAddress: clientIp,
          selfieUrl: session.avatar || "",
          checkInType: "Time Clock",
          timestamp: `Today at ${defaultCheckInTime}`,
        },
      });
    }

    let safeRec = record;
    let workHours = record.workHours || "8h 00m";

    if (!isNewlyCreated) {
      const checkInDate = record.checkInAt
        ? new Date(record.checkInAt)
        : new Date(now.getTime() - 8 * 3600 * 1000);
      const checkInMs = Number.isFinite(checkInDate.getTime())
        ? checkInDate.getTime()
        : now.getTime();
      const elapsedSeconds = Math.max(60, Math.floor((now.getTime() - checkInMs) / 1000));
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      workHours = `${hours}h ${minutes}m`;

      const updatedRecord = await AttendanceModel.findByIdAndUpdate(
        record._id,
        {
          $set: {
            checkOut: timeLabel,
            checkOutAt: now,
            workHours,
            clockOutLocation: "Abtab Nagar HQ",
          },
        },
        { new: true }
      );
      if (updatedRecord) {
        safeRec = updatedRecord;
      }
    }

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "clocked out after shift duration of",
      target: `${workHours} (Location: ${safeRec.location || "Abtab Nagar HQ"})`,
      type: "onboarding",
      ipAddress: clientIp,
      location: safeRec.location || "Abtab Nagar HQ",
    });

    const recScheduledIn = normalizeTime24h(
      safeRec.scheduledInTime || scheduledInTime,
      DEFAULT_OFFICE_IN_TIME
    );
    const recScheduledOut = normalizeTime24h(
      safeRec.scheduledOutTime || scheduledOutTime,
      DEFAULT_OFFICE_OUT_TIME
    );
    const lateEval = evaluateClockInLate(safeRec.checkIn, recScheduledIn);
    const isLeave =
      safeRec.status === "On Leave" || safeRec.status === "Absent";
    const isLate = !isLeave && (lateEval.isLate || safeRec.status === "Late");

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
        checkInAt: safeRec.checkInAt
          ? new Date(safeRec.checkInAt).toISOString()
          : now.toISOString(),
        checkOut: safeRec.checkOut || timeLabel,
        checkOutAt: safeRec.checkOutAt
          ? new Date(safeRec.checkOutAt).toISOString()
          : now.toISOString(),
        scheduledInTime: recScheduledIn,
        scheduledOutTime: recScheduledOut,
        isLate,
        lateMinutes: isLate ? lateEval.lateMinutes : 0,
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
