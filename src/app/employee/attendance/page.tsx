"use client";

import * as React from "react";
import {
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { useEmployee, useLiveShiftSeconds } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceCorrectionModal } from "@/components/employee/attendance-correction-modal";
import { MonthlyAttendanceReportModal } from "@/components/attendance/monthly-attendance-report-modal";
import {
  evaluateClockInLate,
  formatTime12h,
} from "@/lib/office-time";

function PunchOutDurationLabel() {
  const todayWorkSeconds = useLiveShiftSeconds();
  const hours = Math.floor(todayWorkSeconds / 3600);
  const minutes = Math.floor((todayWorkSeconds % 3600) / 60);
  return <>Punch Out ({hours}h {minutes}m)</>;
}

export default function EmployeeAttendancePage() {
  const {
    profile,
    punchHistory,
    isClockedIn,
    todayCheckInTime,
    todayCheckOutTime,
    setIsClockInModalOpen,
    openLocationModal,
    clockOut,
  } = useEmployee();

  const [isCorrectionOpen, setIsCorrectionOpen] = React.useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("All");

  const todayKey = React.useMemo(() => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Dhaka",
    });
  }, []);

  const [dateFilterMode, setDateFilterMode] = React.useState<
    "today" | "custom" | "all"
  >("today");
  const [customDate, setCustomDate] = React.useState<string>(todayKey);

  const officeIn12h = formatTime12h(profile.officeInTime, "09:00 AM");
  const officeOut12h = formatTime12h(profile.officeOutTime, "06:00 PM");

  const lateCount = React.useMemo(() => {
    return punchHistory.filter((item) => {
      const evalRes = evaluateClockInLate(item.checkIn, profile.officeInTime);
      return Boolean(item.isLate) || evalRes.isLate || item.status === "Late";
    }).length;
  }, [punchHistory, profile.officeInTime]);

  const filteredPunches = punchHistory.filter((item) => {
    // 1. Date filter (defaults to today's punches)
    if (dateFilterMode === "today") {
      const itemDateStr = item.date;
      if (
        itemDateStr &&
        !itemDateStr.includes(todayKey) &&
        itemDateStr !== punchHistory[0]?.date
      ) {
        return false;
      }
    } else if (dateFilterMode === "custom") {
      if (item.date && !item.date.includes(customDate)) {
        return false;
      }
    }

    if (filterStatus === "All") return true;
    const isItemLate =
      Boolean(item.isLate) ||
      evaluateClockInLate(item.checkIn, profile.officeInTime).isLate ||
      item.status === "Late";
    if (filterStatus === "Late") return isItemLate;
    return !isItemLate && item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Attendance &amp; Timesheet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assigned Shift: <strong className="text-slate-800">{officeIn12h} – {officeOut12h}</strong> • Clock-ins after {officeIn12h} are marked in red.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonthlyReportOpen(true)}
            className="flex-1 sm:flex-initial gap-1.5 border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Monthly Excel (.xlsx)</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCorrectionOpen(true)}
            className="flex-1 sm:flex-initial gap-1.5 bg-orange-600 hover:bg-orange-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Attendance Correction</span>
          </Button>
        </div>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Present Logs</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {punchHistory.length} Days
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Recorded punches
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Late Arrivals</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className={`text-2xl font-bold mt-2 ${lateCount > 0 ? "text-red-600" : "text-slate-900"}`}>
            {lateCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            After {officeIn12h}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Office Shift Time</span>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-2 font-mono">
            {officeIn12h}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Out: {officeOut12h}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Work Location</span>
            <MapPin className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-2 truncate">
            Gulshan HQ
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Terminal #BIO-GLS-11
          </div>
        </div>
      </div>

      {/* Today's Punch Widget */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 border border-orange-200">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Today&apos;s Live Punch Record
              </h3>
              <Badge
                variant={isClockedIn ? "success" : "neutral"}
                className="text-[10px]"
              >
                {isClockedIn ? "In Shift" : "Logged Out"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Check-in recorded at {todayCheckInTime || "Not logged"} •
              Location: {punchHistory[0]?.location || "Pending Punch"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isClockedIn ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  punchHistory[0] && openLocationModal(punchHistory[0])
                }
                className="gap-1.5 text-xs text-slate-700 border-slate-200"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
                <span>View Location Map</span>
              </Button>
              <Button
                variant="primary"
                onClick={clockOut}
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 font-bold"
              >
                <PunchOutDurationLabel />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {todayCheckOutTime && (
                <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-center">
                  Checked out at {todayCheckOutTime}. Accident? Re-punch in anytime.
                </span>
              )}
              <Button
                variant="primary"
                onClick={() => setIsClockInModalOpen(true)}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 shadow-sm"
              >
                <Clock className="h-4 w-4" />
                <span>{todayCheckOutTime ? "Re-Punch In (Resume Shift)" : "Punch In (Office Location)"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {dateFilterMode === "today"
                ? "Today's Attendance Punch Log"
                : dateFilterMode === "custom"
                ? `Attendance Punch Log (${customDate})`
                : "Attendance Punch History"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned shift schedule: {officeIn12h} to {officeOut12h} (Sunday to Thursday)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDateFilterMode("today")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilterMode === "today"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Today Only
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilterMode === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Dates
              </button>
            </div>

            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilterMode("custom");
              }}
              className="h-7 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late Check-in</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredPunches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No attendance logs found for this date. Click &ldquo;Punch In
              (Office Location)&rdquo; to log your check-in.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Date &amp; Day</th>
                  <th className="px-6 py-3">Check-In</th>
                  <th className="px-6 py-3">Check-Out</th>
                  <th className="px-6 py-3">Logged Hours</th>
                  <th className="px-6 py-3">Overtime</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Punch Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPunches.map((item, index) => {
                  const lateEval = evaluateClockInLate(
                    item.checkIn,
                    item.scheduledInTime || profile.officeInTime
                  );
                  const isLate =
                    Boolean(item.isLate) ||
                    lateEval.isLate ||
                    item.status === "Late";

                  return (
                    <tr
                      key={index}
                      className={
                        isLate
                          ? "bg-red-50/35 hover:bg-red-50/70 transition-colors"
                          : "hover:bg-slate-50/70 transition-colors"
                      }
                    >
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {item.date} ({item.day})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-medium">
                        {item.checkIn ? (
                          isLate ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 border border-red-300 px-2.5 py-1 font-mono font-bold text-red-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                              <span>{item.checkIn}</span>
                              {lateEval.lateMinutes > 0 && (
                                <span className="text-[10px] font-semibold">
                                  ({lateEval.lateLabel})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="font-mono text-emerald-700 font-semibold">
                              {item.checkIn}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">--:--</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-medium">
                        {item.checkOut || (
                          <span className="text-emerald-600 font-semibold">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        {item.workHours}
                      </td>
                      <td className="px-6 py-3.5 text-purple-700 font-medium">
                        {item.overtimeHours || "--"}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={
                            isLate
                              ? "danger"
                              : item.status === "Present"
                              ? "success"
                              : "neutral"
                          }
                          className="text-[10px]"
                        >
                          {isLate ? "Late" : item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        <button
                          type="button"
                          onClick={() => openLocationModal(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 transition-colors text-xs font-medium cursor-pointer"
                        >
                          <MapPin className="h-3.5 w-3.5 text-orange-600" />
                          <span className="truncate max-w-[160px]">
                            {item.location}
                          </span>
                          <span className="text-[10px] text-orange-600 font-bold ml-0.5">
                            Map &gt;
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AttendanceCorrectionModal
        open={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
      />

      <MonthlyAttendanceReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        lockedEmployeeId={profile.id}
      />
    </div>
  );
}
