"use client";

import * as React from "react";
import {
  Users,
  UserCheck,
  CalendarOff,
  MailCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useHRMS } from "@/context/hrms-context";

export function KPICards() {
  const { employees, attendanceRecords, leaveRequests } = useHRMS();

  const totalEmployees = employees.length;
  const activeRoster = employees.filter((e) => e.status === "Active").length;
  const invitedPending = employees.filter((e) => e.status === "Invited").length;

  const todayKey = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka",
  });
  const presentToday = attendanceRecords.filter(
    (r) =>
      (!("dateKey" in r) ||
        (r as unknown as { dateKey?: string }).dateKey === todayKey) &&
      (r.status === "Present" || r.status === "Remote" || r.status === "Late")
  ).length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === "Pending").length;

  const attendancePct =
    activeRoster > 0
      ? `${Math.min(100, Math.round((presentToday / activeRoster) * 100))}%`
      : "0%";

  const cards = [
    {
      title: "Total Employees",
      value: totalEmployees.toString(),
      trend: `${activeRoster} active`,
      isPositive: true,
      subtext:
        invitedPending > 0
          ? `${invitedPending} pending invite activation`
          : "All invited accounts active",
      icon: Users,
      iconBg: "bg-orange-50 text-orange-600 border border-orange-200/50",
    },
    {
      title: "Clocked In Today",
      value: presentToday.toString(),
      trend: attendancePct,
      isPositive: true,
      subtext: "GPS-verified attendance logs",
      icon: UserCheck,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200/50",
    },
    {
      title: "Pending Leave Requests",
      value: pendingLeaves.toString(),
      trend: pendingLeaves > 0 ? "Needs review" : "All clear",
      isPositive: pendingLeaves === 0,
      subtext: "Annual Leave approval queue",
      icon: CalendarOff,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-200/50",
    },
    {
      title: "Pending Invitations",
      value: invitedPending.toString(),
      trend: "Email OTP link",
      isPositive: true,
      subtext: "Awaiting employee password setup",
      icon: MailCheck,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-200/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="p-5 hover:shadow-md transition-all duration-200 border-slate-200/80 group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {card.value}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                  card.iconBg
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md",
                  card.isPositive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-amber-700 bg-amber-50"
                )}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {card.trend}
              </span>
              <span className="text-slate-400 truncate">{card.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
