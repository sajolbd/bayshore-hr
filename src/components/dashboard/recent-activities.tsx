"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useHRMS } from "@/context/hrms-context";
import { Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentActivities() {
  const { activities } = useHRMS();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "leave":
        return "bg-amber-500";
      case "onboarding":
        return "bg-orange-600";
      case "payroll":
        return "bg-emerald-500";
      case "recruitment":
        return "bg-blue-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />
            <span>Recent Activities</span>
          </CardTitle>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock className="h-3 w-3" />
            Live Feed
          </span>
        </div>
        <CardDescription>
          Real-time organizational audit trail &amp; system transactions.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 flex-1">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No live audit events yet. Invite an employee or log GPS attendance to view real-time activity.
          </div>
        ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="relative group">
              {/* Dot on timeline */}
              <span
                className={cn(
                  "absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white transition-transform group-hover:scale-125",
                  getTypeColor(activity.type)
                )}
              />

              <div className="flex items-start gap-2.5 min-w-0">
                <Avatar
                  src={activity.avatar}
                  alt={activity.user}
                  fallback={activity.user}
                  size="sm"
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-900">
                      {activity.user}
                    </span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium text-slate-900">
                      {activity.target}
                    </span>
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
