"use client";

import * as React from "react";
import {
  Clock,
  Calendar,
  Coffee,
  MapPin,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const weeklyScheduleData = [
  {
    day: "Sunday",
    date: "Nov 08, 2026",
    shiftName: "General Engineering Hybrid Shift",
    timing: "09:30 AM – 06:30 PM",
    breakTime: "01:15 PM – 02:15 PM (Lunch & Prayer)",
    location: "Gulshan HQ (Office)",
    status: "Working Day",
    isToday: true,
  },
  {
    day: "Monday",
    date: "Nov 09, 2026",
    shiftName: "General Engineering Hybrid Shift",
    timing: "09:30 AM – 06:30 PM",
    breakTime: "01:15 PM – 02:15 PM (Lunch & Prayer)",
    location: "Gulshan HQ (Office)",
    status: "Working Day",
  },
  {
    day: "Tuesday",
    date: "Nov 10, 2026",
    shiftName: "Remote Engineering Sprint Shift",
    timing: "09:30 AM – 06:30 PM",
    breakTime: "01:15 PM – 02:15 PM (Lunch & Prayer)",
    location: "Remote / Work From Home",
    status: "Remote Day",
  },
  {
    day: "Wednesday",
    date: "Nov 11, 2026",
    shiftName: "General Engineering Hybrid Shift",
    timing: "09:30 AM – 06:30 PM",
    breakTime: "01:15 PM – 02:15 PM (Lunch & Prayer)",
    location: "Gulshan HQ (Office)",
    status: "Working Day",
  },
  {
    day: "Thursday",
    date: "Nov 12, 2026",
    shiftName: "Remote Engineering Sprint Shift",
    timing: "09:30 AM – 06:30 PM",
    breakTime: "01:15 PM – 02:15 PM (Lunch & Prayer)",
    location: "Remote / Work From Home",
    status: "Remote Day",
  },
  {
    day: "Friday",
    date: "Nov 13, 2026",
    shiftName: "Weekly Weekend",
    timing: "Off Duty",
    breakTime: "--",
    location: "Off Duty",
    status: "Weekly Holiday",
  },
  {
    day: "Saturday",
    date: "Nov 14, 2026",
    shiftName: "Weekly Weekend",
    timing: "Off Duty",
    breakTime: "--",
    location: "Off Duty",
    status: "Weekly Holiday",
  },
];

export default function EmployeeSchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Work Schedule & Assigned Shifts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Weekly roster, hybrid work rotation, break allocations, and official weekly holidays.
          </p>
        </div>

        <Badge variant="warning" className="px-3 py-1 text-xs">
          Shift: General Engineering (09:30 AM – 06:30 PM)
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
            <span className="text-xl font-bold text-slate-900">40 Hours / Week</span>
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
            <span className="text-[11px] text-slate-400 block">01:15 PM – 02:15 PM (Level 11 Cafe)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Weekly Weekend</span>
            <span className="text-xl font-bold text-slate-900">Friday & Saturday</span>
            <span className="text-[11px] text-slate-400 block">Standard Bangladesh 5-Day Week</span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Days Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Weekly Schedule Roster (Nov 08 – Nov 14, 2026)
          </h3>
          <span className="text-xs font-semibold text-slate-500">Current Week</span>
        </div>

        <div className="divide-y divide-slate-100">
          {weeklyScheduleData.map((item) => (
            <div
              key={item.day}
              className={`p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                item.isToday
                  ? "bg-orange-50/40 border-l-4 border-l-orange-600"
                  : item.status === "Weekly Holiday"
                  ? "bg-slate-50/60"
                  : "hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-4 min-w-48">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.day}</span>
                    {item.isToday && (
                      <span className="rounded-full bg-orange-600 px-2 py-0.2 text-[10px] font-bold text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 block">{item.date}</span>
                </div>
              </div>

              <div className="flex-1 text-xs space-y-0.5">
                <span className="font-semibold text-slate-800 block">{item.shiftName}</span>
                <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {item.timing}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Coffee className="h-3.5 w-3.5 text-slate-400" />
                    Break: {item.breakTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-600 hidden md:inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {item.location}
                </span>

                <Badge
                  variant={
                    item.status === "Working Day"
                      ? "success"
                      : item.status === "Remote Day"
                      ? "info"
                      : "neutral"
                  }
                  className="text-[10px]"
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Schedule Changes Notice */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-xs flex items-start gap-3.5">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="text-blue-900 text-sm block">Upcoming Shift & Schedule Notice</strong>
          <p className="text-blue-800/90 leading-relaxed">
            During the upcoming <strong>Victory Day (Dec 16)</strong> week, Bayshore Communication will observe a public holiday.
            Any on-call engineer rota for cloud infrastructure will receive statutory 2.0x overtime allowance.
          </p>
        </div>
      </div>
    </div>
  );
}
