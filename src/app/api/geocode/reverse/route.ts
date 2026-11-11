import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { reverseGeocodeCoordinates } from "@/lib/geo";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latRaw = request.nextUrl.searchParams.get("lat");
    const lngRaw = request.nextUrl.searchParams.get("lng");

    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        { error: "Invalid GPS latitude/longitude coordinates." },
        { status: 400 }
      );
    }

    const resolved = await reverseGeocodeCoordinates(lat, lng);
    return NextResponse.json(resolved);
  } catch (err) {
    console.error("Reverse geocode error:", err);
    return NextResponse.json(
      { error: "Reverse geocoding failed." },
      { status: 500 }
    );
  }
}
