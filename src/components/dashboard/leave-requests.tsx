"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useHRMS } from "@/context/hrms-context";
import { CalendarOff, Check, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export function LeaveRequests() {
  const { leaveRequests, approveLeave, rejectLeave } = useHRMS();

  const pendingLeaves = leaveRequests.filter((l) => l.status === "Pending");

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarOff className="h-4 w-4 text-orange-600" />
              <span>Pending Leave Requests</span>
            </CardTitle>
            <Badge variant="orange" className="ml-1">
              {pendingLeaves.length} pending
            </Badge>
          </div>
          <CardDescription>
            Requires manager authorization and attendance adjustment.
          </CardDescription>
        </div>
        <Link
          href="/leaves"
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
        >
          <span>All Requests</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 flex-1">
        {pendingLeaves.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="There are no pending leave requests awaiting approval."
          />
        ) : (
          <div className="space-y-3">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all"
              >
                {/* Employee info */}
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar
                    src={leave.avatar}
                    alt={leave.employeeName}
                    fallback={leave.employeeName}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {leave.employeeName}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {leave.leaveType}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {leave.department} • Applied {leave.appliedDate}
                    </p>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      <span className="font-semibold text-slate-900">
                        {leave.days} {leave.days === 1 ? "day" : "days"}
                      </span>{" "}
                      ({leave.startDate} — {leave.endDate})
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                      &ldquo;{leave.reason}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectLeave(leave.id)}
                    className="h-8 px-2.5 text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approveLeave(leave.id)}
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
