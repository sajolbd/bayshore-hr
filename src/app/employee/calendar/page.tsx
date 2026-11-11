"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingEvents = [
  {
    id: "evt-1",
    title: "Q4 All-Hands Town Hall",
    date: "Wednesday, Nov 11, 2026",
    time: "04:00 PM – 05:30 PM",
    location: "Auditorium & Virtual Link",
    category: "Corporate",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "evt-2",
    title: "Architecture Guild Bi-Weekly Sync",
    date: "Thursday, Nov 12, 2026",
    time: "02:00 PM – 03:00 PM",
    location: "Meeting Room 4B, Gulshan HQ",
    category: "Technical",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "evt-3",
    title: "Farhan Sadik's Birthday Celebration",
    date: "Sunday, Nov 15, 2026",
    time: "04:30 PM",
    location: "Level 11 Cafe",
    category: "Social",
    badgeColor: "bg-pink-100 text-pink-700",
  },
  {
    id: "evt-4",
    title: "Victory Day (বিজয় দিবস) - National Holiday",
    date: "Wednesday, Dec 16, 2026",
    time: "All Day",
    location: "Public Holiday (Offices Closed)",
    category: "Holiday",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "evt-5",
    title: "Annual Corporate Retreat: Cox's Bazar",
    date: "Dec 18 – Dec 20, 2026",
    time: "3 Days Offsite",
    location: "Sayeman Beach Resort, Cox's Bazar",
    category: "Corporate",
    badgeColor: "bg-orange-100 text-orange-700",
  },
];

export default function EmployeeCalendarPage() {
  const [currentMonth] = React.useState("November 2026");

  // Generate 35 days grid for November 2026 (Nov 1 is Sunday)
  const daysInNov = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Company Calendar & Upcoming Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official holidays, corporate town halls, engineering sprints, and team celebrations.
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
              <h3 className="text-base font-bold text-slate-900">{currentMonth}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
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
            {daysInNov.map((day) => {
              // Day of week index (Nov 1 is Sunday = index 0)
              const dow = (day - 1) % 7;
              const isWeekend = dow === 5 || dow === 6; // Friday or Saturday
              const isToday = day === 8;
              const hasTownHall = day === 11;
              const hasBirthday = day === 15;

              return (
                <div
                  key={day}
                  className={`min-h-16 p-1.5 rounded-xl border flex flex-col justify-between transition-colors ${
                    isToday
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
                    {isWeekend && (
                      <span className="text-[9px] font-semibold text-slate-400">Off</span>
                    )}
                  </div>

                  <div className="space-y-0.5 mt-1">
                    {hasTownHall && (
                      <div className="rounded bg-purple-100 px-1 py-0.5 text-[9px] font-bold text-purple-700 truncate">
                        Town Hall
                      </div>
                    )}
                    {hasBirthday && (
                      <div className="rounded bg-pink-100 px-1 py-0.5 text-[9px] font-bold text-pink-700 truncate">
                        🎂 Farhan
                      </div>
                    )}
                  </div>
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
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Corporate Event
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              Birthday
            </span>
          </div>
        </div>

        {/* Right Column: Upcoming Events Schedule */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Upcoming Schedule</h3>
            <Badge variant="outline" className="text-[10px]">
              {upcomingEvents.length} Events
            </Badge>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${evt.badgeColor}`}>
                    {evt.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{evt.time}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>

                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <CalendarIcon className="h-3 w-3 text-slate-400" />
                  <span>{evt.date}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{evt.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
