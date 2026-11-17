export const DEFAULT_OFFICE_IN_TIME = "09:00";
export const DEFAULT_OFFICE_OUT_TIME = "18:00";

/**
 * Normalizes invisible/unicode whitespace characters (such as U+202F produced by Node Intl)
 * before parsing time strings.
 */
function sanitizeTimeString(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[\u00A0\u202F\s]+/g, " ").trim();
}

/**
 * Parses either 24-hour ("09:00", "18:30") or 12-hour ("09:15 AM", "06:00 PM")
 * time strings into total minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr?: string | null): number | null {
  const cleaned = sanitizeTimeString(timeStr);
  if (!cleaned || cleaned === "--:--" || cleaned === "-") return null;

  // Match 12-hour format e.g. "09:15 AM", "9:05 pm"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (hours < 0 || hours > 12 || minutes < 0 || minutes > 59) return null;
    if (period === "AM") {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12 && hours < 12) hours += 12;
    }
    return hours * 60 + minutes;
  }

  // Match 24-hour format e.g. "09:00", "18:00", "9:30"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Normalizes a time string into 24-hour "HH:mm" format (used by <input type="time" /> and DB).
 */
export function normalizeTime24h(
  timeStr?: string | null,
  fallback: string = DEFAULT_OFFICE_IN_TIME
): string {
  const totalMinutes = parseTimeToMinutes(timeStr);
  if (totalMinutes === null) {
    const fbMinutes = parseTimeToMinutes(fallback) ?? 540;
    const h = Math.floor(fbMinutes / 60);
    const m = fbMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Formats any time string ("09:00" or "09:00 AM") into readable 12-hour "09:00 AM" format.
 */
export function formatTime12h(
  timeStr?: string | null,
  fallback: string = "09:00 AM"
): string {
  const totalMinutes = parseTimeToMinutes(timeStr);
  if (totalMinutes === null) return fallback;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Formats total minutes into human-readable "Xh Ym" string.
 */
export function formatMinutesAsDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Parses "8h 15m" or "08h 00m" workHours strings into total minutes.
 */
export function parseDurationToMinutes(workHours?: string | null): number {
  if (!workHours || typeof workHours !== "string") return 0;
  const hMatch = workHours.match(/(\d+)\s*h/i);
  const mMatch = workHours.match(/(\d+)\s*m/i);
  const hrs = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
  if (!Number.isFinite(hrs) || !Number.isFinite(mins)) return 0;
  return hrs * 60 + mins;
}

export function isValidMonthKey(monthKey?: string | null): boolean {
  if (!monthKey || typeof monthKey !== "string") return false;
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey.trim());
}

export function getDhakaCurrentMonthKey(now: Date = new Date()): string {
  const dateStr = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka",
  });
  return dateStr.slice(0, 7);
}

export interface LateEvaluationResult {
  isLate: boolean;
  lateMinutes: number;
  lateLabel: string;
  officeIn24h: string;
  officeIn12h: string;
  checkIn12h: string;
}

/**
 * Evaluates whether an employee's actual check-in time is after their assigned officeInTime.
 * Even 1 minute after the configured officeInTime is flagged as Late so it gets red-marked.
 */
export function evaluateClockInLate(
  checkInTimeStr?: string | null,
  officeInTimeStr?: string | null
): LateEvaluationResult {
  const officeIn24h = normalizeTime24h(officeInTimeStr, DEFAULT_OFFICE_IN_TIME);
  const officeIn12h = formatTime12h(officeIn24h, "09:00 AM");
  const officeInMinutes = parseTimeToMinutes(officeIn24h) ?? 540;

  const checkInMinutes = parseTimeToMinutes(checkInTimeStr);
  if (checkInMinutes === null) {
    return {
      isLate: false,
      lateMinutes: 0,
      lateLabel: "Not Logged",
      officeIn24h,
      officeIn12h,
      checkIn12h: checkInTimeStr || "--:--",
    };
  }

  const checkIn12h = formatTime12h(checkInTimeStr, checkInTimeStr || "--:--");
  const diff = checkInMinutes - officeInMinutes;

  if (diff > 0) {
    return {
      isLate: true,
      lateMinutes: diff,
      lateLabel: `${formatMinutesAsDuration(diff)} late`,
      officeIn24h,
      officeIn12h,
      checkIn12h,
    };
  }

  return {
    isLate: false,
    lateMinutes: 0,
    lateLabel: "On Time",
    officeIn24h,
    officeIn12h,
    checkIn12h,
  };
}
