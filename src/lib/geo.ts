import { NextRequest } from "next/server";

export const BAYSHORE_HQ = {
  latitude: 23.7925,
  longitude: 90.4078,
  geofenceRadiusMeters: 500,
  name: "Bayshore Tower, Gulshan-2, Dhaka",
};

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export function getDhakaDateInfo(now: Date = new Date()): {
  dateKey: string;
  dayLabel: string;
  timeLabel: string;
  isLateOfficeShift: boolean;
} {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = dateParts.find((p) => p.type === "year")?.value ?? "2026";
  const month = dateParts.find((p) => p.type === "month")?.value ?? "01";
  const day = dateParts.find((p) => p.type === "day")?.value ?? "01";
  const dateKey = `${year}-${month}-${day}`;

  const dayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  const hourMinParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = parseInt(
    hourMinParts.find((p) => p.type === "hour")?.value ?? "9",
    10
  );
  const minute = parseInt(
    hourMinParts.find((p) => p.type === "minute")?.value ?? "0",
    10
  );

  // Grace window up to 09:30 AM Dhaka time
  const isLateOfficeShift = hour > 9 || (hour === 9 && minute > 30);

  return { dateKey, dayLabel, timeLabel, isLateOfficeShift };
}

export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<{ address: string; shortLocation: string }> {
  const fallbackCoord = `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      latitude
    )}&lon=${encodeURIComponent(longitude)}&zoom=17&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "BayshoreHR-Portal/1.0 (https://bayshore.com)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) {
      return { address: `GPS (${fallbackCoord})`, shortLocation: fallbackCoord };
    }

    const data = (await res.json()) as {
      display_name?: string;
      address?: {
        road?: string;
        neighbourhood?: string;
        suburb?: string;
        city_district?: string;
        city?: string;
        town?: string;
        state?: string;
        country?: string;
      };
    };

    const addrObj = data.address;
    const shortParts = [
      addrObj?.neighbourhood || addrObj?.suburb || addrObj?.road,
      addrObj?.city || addrObj?.town || addrObj?.city_district || addrObj?.state,
    ].filter(Boolean);

    const shortLocation =
      shortParts.length > 0 ? shortParts.join(", ") : fallbackCoord;

    const address =
      data.display_name ||
      (shortParts.length > 0 ? shortParts.join(", ") : `GPS (${fallbackCoord})`);

    return { address, shortLocation };
  } catch {
    return { address: `GPS (${fallbackCoord})`, shortLocation: fallbackCoord };
  }
}
