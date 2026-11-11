"use client";

import * as React from "react";
import {
  CheckCheck,
  CalendarCheck,
  CalendarOff,
  Megaphone,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmployeeNotificationsPage() {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useEmployee();

  const [filterType, setFilterType] = React.useState<string>("All");

  const filtered = notifications.filter((notif) => {
    if (filterType === "All") return true;
    if (filterType === "Unread") return !notif.read;
    return notif.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Notifications & Alerts Center
            </h1>
            {unreadNotificationCount > 0 && (
              <Badge variant="warning">{unreadNotificationCount} Unread</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates regarding payroll disbursements, leave approvals, and shift logs.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsAsRead}
            className="gap-2 text-xs"
          >
            <CheckCheck className="h-4 w-4 text-orange-600" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { label: "All", value: "All" },
          { label: "Unread", value: "Unread" },
          { label: "Payroll", value: "payroll" },
          { label: "Attendance", value: "attendance" },
          { label: "Leave", value: "leave" },
          { label: "Announcements", value: "announcement" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === tab.value
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No notifications matching the selected filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !item.read ? "bg-orange-50/40 hover:bg-orange-50/70" : "hover:bg-slate-50/70"
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  item.type === "payroll"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.type === "attendance"
                    ? "bg-blue-100 text-blue-700"
                    : item.type === "leave"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {item.type === "payroll" ? (
                  "৳"
                ) : item.type === "attendance" ? (
                  <CalendarCheck className="h-4 w-4" />
                ) : item.type === "leave" ? (
                  <CalendarOff className="h-4 w-4" />
                ) : (
                  <Megaphone className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                  <span className="text-[11px] text-slate-400 shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
              </div>

              {!item.read && (
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-orange-600 shrink-0 shadow-xs" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
