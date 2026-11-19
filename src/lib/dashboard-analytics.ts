import { Employee, AttendanceRecord, BirthdayItem } from "@/types";

const DEPARTMENT_PALETTE = [
  "#EA580C",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
];

function parseJoinDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface HeadcountTrendRow {
  month: string;
  year: number;
  Total: number;
  [department: string]: string | number;
}

export interface HeadcountTrend {
  series: HeadcountTrendRow[];
  focusDepartment: string;
  growthPercentage: string;
}

/**
 * Builds a cumulative headcount trend over the past N months from employee
 * join dates, broken down by the largest department plus a total column.
 */
export function buildHeadcountTrend(
  employees: Employee[],
  months = 12
): HeadcountTrend {
  const active = employees.filter((e) => e.status !== "Terminated");
  const now = new Date();

  const counts = new Map<string, number>();
  for (const emp of active) {
    const dept = emp.department?.trim() || "Unassigned";
    counts.set(dept, (counts.get(dept) || 0) + 1);
  }

  const focusDepartment =
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unassigned";

  const series: HeadcountTrendRow[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const bucket = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const headcount = active.filter((emp) => {
      const joined = parseJoinDate(emp.joinDate);
      return joined !== null && joined < nextMonth;
    }).length;

    const focusCount = active.filter((emp) => {
      if ((emp.department?.trim() || "Unassigned") !== focusDepartment) {
        return false;
      }
      const joined = parseJoinDate(emp.joinDate);
      return joined !== null && joined < nextMonth;
    }).length;

    series.push({
      month: bucket.toLocaleDateString("en-US", { month: "short" }),
      year: bucket.getFullYear(),
      Total: headcount,
      [focusDepartment]: focusCount,
    });
  }

  const first = series[0]?.Total ?? 0;
  const last = series[series.length - 1]?.Total ?? 0;
  const growthPercentage =
    first > 0 ? `${(((last - first) / first) * 100).toFixed(1)}% YTD` : "—";

  return { series, focusDepartment, growthPercentage };
}

export interface DepartmentDistributionRow {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

export function buildDepartmentDistribution(
  employees: Employee[]
): DepartmentDistributionRow[] {
  const counts = new Map<string, number>();
  for (const emp of employees) {
    const dept = emp.department?.trim() || "Unassigned";
    counts.set(dept, (counts.get(dept) || 0) + 1);
  }

  const total = employees.length;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: DEPARTMENT_PALETTE[index % DEPARTMENT_PALETTE.length],
      percentage: total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%",
    }));
}

export interface AttendanceOverviewRow {
  day: string;
  dateKey: string;
  present: number;
  remote: number;
  late: number;
  leave: number;
}

function parseZonelessDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Aggregates the last N calendar days of attendance records by status.
 * Days without any records still appear with zeros for honest gaps.
 */
export function buildAttendanceOverview(
  records: AttendanceRecord[],
  days = 5
): AttendanceOverviewRow[] {
  const tz = "Asia/Dhaka";
  const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: tz });

  const byDate = new Map<string, AttendanceOverviewRow>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-CA", { timeZone: tz });
    byDate.set(key, {
      day: parseZonelessDateKey(key).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      dateKey: key,
      present: 0,
      remote: 0,
      late: 0,
      leave: 0,
    });
  }

  for (const record of records) {
    const key =
      "dateKey" in record && record.dateKey
        ? record.dateKey
        : record.checkIn?.slice(0, 10);
    if (!key) continue;
    const row = byDate.get(key);
    if (!row) continue;
    switch (record.status) {
      case "Present":
        row.present += 1;
        break;
      case "Remote":
        row.remote += 1;
        break;
      case "Late":
        row.late += 1;
        break;
      case "On Leave":
        row.leave += 1;
        break;
    }
  }

  return [...byDate.values()].sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));
}

/** Parses a stored DOB string ("YYYY-MM-DD" preferred) into a Date. */
export function parseDateOfBirth(value?: string | null): Date | null {
  if (!value || value === "Not Specified") return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Builds this month's birthday list from employee DOBs. Labels relative
 * to today ("Today!", "Tomorrow") and falls back to "MMM d" formatting.
 */
export function buildUpcomingBirthdays(
  employees: Employee[]
): BirthdayItem[] {
  const now = new Date();

  const rows: Array<{ item: BirthdayItem; day: number; isToday: boolean }> = [];
  for (const emp of employees) {
    if (emp.status === "Terminated") continue;
    const dob = parseDateOfBirth(emp.dateOfBirth);
    if (!dob) continue;
    const occurrence = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (occurrence.getMonth() !== now.getMonth()) continue;

    const day = occurrence.getDate();
    const isToday = day === now.getDate();
    rows.push({
      day,
      isToday,
      item: {
        id: emp.id,
        employeeName: emp.name,
        avatar: emp.avatar,
        department: emp.department,
        role: emp.role,
        birthday: isToday
          ? "Today! 🎉"
          : new Date(now.getFullYear(), now.getMonth(), day + 1).getTime() ===
              occurrence.getTime()
            ? "Tomorrow"
            : occurrence.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        isToday,
      },
    });
  }

  rows.sort((a, b) => a.day - b.day);
  return rows.map((row) => row.item);
}
