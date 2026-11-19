"use client";

import * as React from "react";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  Clock,
  UserCheck,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { useHRMS } from "@/context/hrms-context";

export default function AttendancePage() {
  const { setIsExportModalOpen, openMonthlyReportModal, attendanceRecords } =
    useHRMS();

  const onTimeRate = React.useMemo(() => {
    if (attendanceRecords.length === 0) return "100%";
    const onTimeCount = attendanceRecords.filter(
      (r) => !r.isLate && r.status !== "Late"
    ).length;
    return `${((onTimeCount / attendanceRecords.length) * 100).toFixed(1)}%`;
  }, [attendanceRecords]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Attendance &amp; Time Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric logs, individual shift compliance, location verification, and monthly Excel attendance reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => openMonthlyReportModal()}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Monthly Employee Report (.xlsx)</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
            className="gap-2 border-slate-200"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Summary</span>
          </Button>
        </div>
      </div>

      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              On-Time Arrival Rate
            </span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {onTimeRate}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Evaluated against each employee&apos;s office in-time
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Logged Records
            </span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {attendanceRecords.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Active database punches across team
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Onsite Compliance Ratio
            </span>
            <CalendarCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">100%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            All employees 100% onsite at Abtab Nagar HQ
          </p>
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
