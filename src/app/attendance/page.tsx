"use client";

import * as React from "react";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock, UserCheck, AlertCircle, Download } from "lucide-react";
import { useHRMS } from "@/context/hrms-context";

export default function AttendancePage() {
  const { setIsExportModalOpen } = useHRMS();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Attendance &amp; Time Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric logs, clock-in compliance, remote work status, and work hour logs.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExportModalOpen(true)}
          className="gap-2 border-slate-200"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export Timesheet</span>
        </Button>
      </div>

      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">On-Time Arrival</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">94.2%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">+1.8% over monthly average</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Work Hours</span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">8h 14m</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Standard 8-hour workday basis</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Remote / WFH Ratio</span>
            <CalendarCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">18.5%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">46 employees active remotely</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AttendanceChart />
        </div>
        <div className="lg:col-span-2">
          <AttendanceTable />
        </div>
      </div>
    </div>
  );
}
