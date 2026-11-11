import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { AttendanceModel } from "@/models/Attendance";
import { ActivityLogModel } from "@/models/ActivityLog";
import {
  BAYSHORE_HQ,
  calculateDistanceMeters,
  getClientIp,
  getDhakaDateInfo,
  reverseGeocodeCoordinates,
} from "@/lib/geo";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      address?: string;
      shortLocation?: string;
      checkInType?: "Time Clock" | "Field Check-In";
      clientName?: string;
      purposeNote?: string;
      selfieUrl?: string;
    };

    const lat = Number(body.latitude);
    const lng = Number(body.longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        { error: "Valid GPS coordinates (latitude & longitude) are required to clock in." },
        { status: 400 }
      );
    }

    const accuracy =
      Number.isFinite(Number(body.accuracy)) && Number(body.accuracy) > 0
        ? Math.round(Number(body.accuracy))
        : 15;

    const distanceFromHQ = calculateDistanceMeters(
      lat,
      lng,
      BAYSHORE_HQ.latitude,
      BAYSHORE_HQ.longitude
    );
    const inOfficeGeofence = distanceFromHQ <= BAYSHORE_HQ.geofenceRadiusMeters;
    const checkInType =
      body.checkInType === "Field Check-In" ? "Field Check-In" : "Time Clock";

    const geofenceStatus =
      checkInType === "Field Check-In"
        ? "Field Client Visit"
        : inOfficeGeofence
        ? "Inside Office Geofence"
        : "Outside Geofence (Remote)";

    let resolvedAddress = body.address?.trim();
    let shortLocation = body.shortLocation?.trim();

    if (!resolvedAddress || resolvedAddress.startsWith("GPS (")) {
      const geoLookup = await reverseGeocodeCoordinates(lat, lng);
      resolvedAddress = geoLookup.address;
      if (!shortLocation) {
        shortLocation = geoLookup.shortLocation;
      }
    }

    if (!shortLocation) {
      shortLocation =
        checkInType === "Field Check-In" && body.clientName?.trim()
          ? body.clientName.trim()
          : inOfficeGeofence
          ? "Gulshan HQ"
          : resolvedAddress.split(",")[0]?.trim() ||
            `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    const now = new Date();
    const { dateKey, dayLabel, timeLabel, isLateOfficeShift } =
      getDhakaDateInfo(now);
    const clientIp = getClientIp(request);

    const status =
      checkInType === "Field Check-In"
        ? "Present"
        : !inOfficeGeofence
        ? "Remote"
        : isLateOfficeShift
        ? "Late"
        : "Present";

    const geoPayload = {
      latitude: lat,
      longitude: lng,
      accuracy,
      address: resolvedAddress,
      geofenceStatus,
      distanceFromHQ,
      ipAddress: clientIp,
      selfieUrl: body.selfieUrl || session.avatar,
      checkInType,
      clientName: body.clientName?.trim() || undefined,
      purposeNote: body.purposeNote?.trim() || undefined,
      timestamp: `Today at ${timeLabel}`,
    };

    const record = await AttendanceModel.findOneAndUpdate(
      { employeeId: session.employeeId, dateKey },
      {
        $set: {
          employeeId: session.employeeId,
          employeeName: session.name,
          employeeEmail: session.email,
          avatar: session.avatar,
          department: session.department,
          role: session.designation,
          dateKey,
          dayLabel,
          checkIn: timeLabel,
          checkInAt: now,
          checkOut: null,
          checkOutAt: null,
          status,
          workHours: "In Progress",
          location: shortLocation,
          geo: geoPayload,
        },
      },
      { upsert: true, new: true }
    );

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action:
        checkInType === "Field Check-In"
          ? "completed field check-in at"
          : "clocked in with live GPS location at",
      target: `${shortLocation} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      type: "onboarding",
      ipAddress: clientIp,
      location: shortLocation,
    });

    return NextResponse.json(
      {
        record: {
          id: record._id.toString(),
          date: record.dateKey,
          day: record.dayLabel,
          checkIn: record.checkIn,
          checkInAt: record.checkInAt.toISOString(),
          checkOut: record.checkOut,
          checkOutAt: null,
          workHours: record.workHours,
          status: record.status,
          location: record.location,
          geo: record.geo,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/attendance/clock-in error:", err);
    return NextResponse.json(
      { error: "Failed to record GPS clock-in." },
      { status: 500 }
    );
  }
}
