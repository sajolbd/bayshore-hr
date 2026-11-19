"use client";

import * as React from "react";
import {
  Clock,
  Calendar,
  Coffee,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEmployee } from "@/context/employee-context";
import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  formatTime12h,
  normalizeTime24h,
} from "@/lib/office-time";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface ScheduleRow {
  day: string;
  date: string;
  dateLabel: string;
  timing: string;
  status: "Working Day" | "Weekly Holiday" | "Holiday";
  holidayName?: string;
  isToday: boolean;
}

export default function EmployeeSchedulePage() {
  const { profile, officeHolidays } = useEmployee();

  const [today] = React.useState(() => new Date());

  const officeIn = normalizeTime24h(profile.officeInTime, DEFAULT_OFFICE_IN_TIME);
  const officeOut = normalizeTime24h(profile.officeOutTime, DEFAULT_OFFICE_OUT_TIME);
  const officeInLabel = formatTime12h(officeIn, "09:00 AM");
  const officeOutLabel = formatTime12h(officeOut, "06:00 PM");
  const shiftLabel = `${officeInLabel} – ${officeOutLabel}`;

  const todayKey = today.toLocaleDateString("en-CA");

  // Start of the current week (Sunday), Asia/Dhaka style keys. Layout is
  // Sun→Sat with Friday & Saturday as the weekly weekend.
  const weekStart = React.useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [today]);

  const weeklyScheduleData = React.useMemo<ScheduleRow[]>(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      const dow = dayDate.getDay();
      const dayKey = dayDate.toLocaleDateString("en-CA");

      const holiday = officeHolidays.find((h) => {
        const parsed = new Date(h.date);
        if (Number.isNaN(parsed.getTime())) return false;
        return parsed.toLocaleDateString("en-CA") === dayKey;
      });

      const isWeekend = dow === 5 || dow === 6;

      return {
        day: DAY_NAMES[dow],
        date: dayKey,
        dateLabel: dayDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timing: holiday || isWeekend ? "Off Duty" : shiftLabel,
        status: holiday ? "Holiday" : isWeekend ? "Weekly Holiday" : "Working Day",
        holidayName: holiday?.name,
        isToday: dayKey === todayKey,
      };
    });
  }, [weekStart, officeHolidays, shiftLabel, todayKey]);

  const nextHoliday = React.useMemo(() => {
    const upcoming = officeHolidays
      .map((h) => ({ h, parsed: new Date(h.date) }))
      .filter((x) => !Number.isNaN(x.parsed.getTime()) && x.parsed.getTime() >= today.setHours(0, 0, 0, 0))
      .sort((a, b) => a.parsed.getTime() - b.parsed.getTime());
    return upcoming[0] ?? null;
  }, [officeHolidays, today]);

  const weeklyWorkingHours = `40 Hours / Week`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Work Schedule &amp; Assigned Shifts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Weekly roster, shift timings, break allocations, and official weekly holidays.
          </p>
        </div>

        <Badge variant="warning" className="px-3 py-1 text-xs">
          Shift: {officeInLabel} – {officeOutLabel}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Weekly Working Hours</span>
            <span className="text-xl font-bold text-slate-900">{weeklyWorkingHours}</span>
            <span className="text-[11px] text-slate-400 block">8 hrs/day net working time</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Designated Meal Break</span>
            <span className="text-xl font-bold text-slate-900">1 Hour Daily</span>
            <span className="text-[11px] text-slate-400 block">1:15 PM – 2:15 PM (Lunch &amp; Prayer)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Weekly Weekend</span>
            <span className="text-xl font-bold text-slate-900">Friday &amp; Saturday</span>
            <span className="text-[11px] text-slate-400 block">Standard Bangladesh 5-Day Week</span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Days Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Weekly Schedule Roster ({weeklyScheduleData[0].dateLabel} – {weeklyScheduleData[6].dateLabel})
          </h3>
          <span className="text-xs font-semibold text-slate-500">Current Week</span>
        </div>

        <div className="divide-y divide-slate-100">
          {weeklyScheduleData.map((item) => (
            <div
              key={item.date}
              className={`p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                item.isToday
                  ? "bg-orange-50/40 border-l-4 border-l-orange-600"
                  : item.status === "Working Day"
                  ? "hover:bg-slate-50/50"
                  : "bg-slate-50/60"
              }`}
            >
              <div className="flex items-center gap-4 min-w-48">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.day}</span>
                    {item.isToday && (
                      <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 block">{item.dateLabel}</span>
                </div>
              </div>

              <div className="flex-1 text-xs space-y-0.5">
                <span className="font-semibold text-slate-800 block">
                  {item.holidayName
                    ? item.holidayName
                    : item.status === "Weekly Holiday"
                    ? "Weekly Weekend"
                    : "General Office Shift"}
                </span>
                <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {item.timing}
                  </span>
                  {item.status === "Working Day" && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Coffee className="h-3.5 w-3.5 text-slate-400" />
                        Break: 01:15 PM – 02:15 PM
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {item.status === "Working Day" && (
                  <span className="text-xs text-slate-600 hidden md:inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    Office
                  </span>
                )}

                <Badge
                  variant={item.status === "Working Day" ? "success" : "neutral"}
                  className="text-[10px]"
                >
                  {item.status === "Holiday" ? "Public Holiday" : item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Holiday Notice */}
      {nextHoliday && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-xs flex items-start gap-3.5">
          <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-blue-900 text-sm block">Upcoming Holiday Notice</strong>
            <p className="text-blue-800/90 leading-relaxed">
              The office will remain closed for <strong>{nextHoliday.h.name}</strong> on{" "}
              <strong>
                {nextHoliday.h.day}, {nextHoliday.h.date}
              </strong>
              . Any on-call rota for core infrastructure will receive statutory 2.0x overtime allowance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
