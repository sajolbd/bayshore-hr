"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEmployee } from "@/context/employee-context";

function parseHolidayDate(date: string): Date | null {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function EmployeeCalendarPage() {
  const { officeHolidays } = useEmployee();

  const [today] = React.useState(() => new Date());
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  const handlePrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const handleNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const todayKey = today.toLocaleDateString("en-CA");

  // Holidays falling inside the viewed month, keyed by day-of-month.
  const holidaysInMonth = React.useMemo(() => {
    const map = new Map<number, { name: string; type: string }>();
    officeHolidays.forEach((holiday) => {
      const parsed = parseHolidayDate(holiday.date);
      if (!parsed) return;
      if (
        parsed.getFullYear() === viewYear &&
        parsed.getMonth() === viewMonth
      ) {
        map.set(parsed.getDate(), { name: holiday.name, type: holiday.type });
      }
    });
    return map;
  }, [officeHolidays, viewYear, viewMonth]);

  // Upcoming holidays from today onwards (for the schedule panel).
  const upcomingHolidays = React.useMemo(() => {
    return officeHolidays
      .map((holiday) => ({ ...holiday, parsed: parseHolidayDate(holiday.date) }))
      .filter(
        (h): h is typeof h & { parsed: Date } =>
          h.parsed !== null && h.parsed.getTime() >= today.setHours(0, 0, 0, 0)
      )
      .sort((a, b) => a.parsed.getTime() - b.parsed.getTime())
      .slice(0, 6);
  }, [officeHolidays, today]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const gridDays: Array<number | null> = [
    ...Array.from({ length: firstDayOfMonth }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Company Calendar &amp; Upcoming Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official holidays and company-wide calendar events in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 font-semibold px-3 py-1">
            Workweek: Sunday – Thursday
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Interactive Month Calendar */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-orange-600" />
              <h3 className="text-base font-bold text-slate-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setViewYear(today.getFullYear());
                  setViewMonth(today.getMonth());
                }}
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div className="text-orange-600">Fri</div>
            <div className="text-orange-600">Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {gridDays.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className="min-h-16 rounded-xl border border-dashed border-slate-100 bg-slate-50/30"
                  />
                );
              }

              const dayDate = new Date(viewYear, viewMonth, day);
              const dayKey = dayDate.toLocaleDateString("en-CA");
              const isToday = dayKey === todayKey;
              const dow = dayDate.getDay();
              const isWeekend = dow === 5 || dow === 6; // Friday or Saturday
              const holiday = holidaysInMonth.get(day);

              return (
                <div
                  key={dayKey}
                  className={`min-h-16 p-1.5 rounded-xl border flex flex-col justify-between transition-colors ${
                    holiday
                      ? "border-emerald-200 bg-emerald-50/60"
                      : isToday
                      ? "border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-400/50"
                      : isWeekend
                      ? "border-slate-100 bg-slate-50/70 text-slate-400"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-5 w-5 flex items-center justify-center rounded-full text-[11px] font-bold ${
                        isToday ? "bg-orange-600 text-white" : "text-slate-700"
                      }`}
                    >
                      {day}
                    </span>
                    {holiday ? (
                      <span className="text-[9px] font-semibold text-emerald-600">
                        Holiday
                      </span>
                    ) : isWeekend && !isToday ? (
                      <span className="text-[9px] font-semibold text-slate-400">Off</span>
                    ) : null}
                  </div>

                  {holiday && (
                    <div className="space-y-0.5 mt-1">
                      <div
                        className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-700 truncate"
                        title={holiday.name}
                      >
                        {holiday.name}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-600" />
              Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-200" />
              Weekend (Fri-Sat)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Holiday
            </span>
          </div>
        </div>

        {/* Right Column: Upcoming Holidays Schedule */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Upcoming Holidays</h3>
            <Badge variant="outline" className="text-[10px]">
              {upcomingHolidays.length}
            </Badge>
          </div>

          {upcomingHolidays.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs text-slate-500">
                No upcoming holidays announced yet.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Holidays added by HR will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {holiday.type}
                    </span>
                    <span className="text-[11px] text-slate-400">{holiday.day}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{holiday.name}</h4>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <CalendarIcon className="h-3 w-3 text-slate-400" />
                    <span>{holiday.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
