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
} from "lucide-react";
import { useEmployee, useLiveShiftSeconds } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceCorrectionModal } from "@/components/employee/attendance-correction-modal";

function PunchOutDurationLabel() {
  const todayWorkSeconds = useLiveShiftSeconds();
  const hours = Math.floor(todayWorkSeconds / 3600);
  const minutes = Math.floor((todayWorkSeconds % 3600) / 60);
  return <>Punch Out ({hours}h {minutes}m)</>;
}

export default function EmployeeAttendancePage() {
  const {
    punchHistory,
    isClockedIn,
    todayCheckInTime,
    setIsClockInModalOpen,
    openLocationModal,
    clockOut,
  } = useEmployee();

  const [isCorrectionOpen, setIsCorrectionOpen] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("All");

  const filteredPunches = punchHistory.filter((item) => {
    if (filterStatus === "All") return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Attendance & Timesheet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Biometric logs, daily shift punches, late arrival tracking, and correction requests.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            <span>Present Days</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">18 Days</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">94.7% On-Time Regularity</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Late Arrivals</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">1 Occurrence</div>
          <div className="text-[11px] text-slate-400 mt-1">Nov 04 (35 mins late)</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Logged Overtime</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">3h 40m</div>
          <div className="text-[11px] text-slate-400 mt-1">Approved for compensation</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Work Location</span>
            <MapPin className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-2 truncate">Gulshan HQ</div>
          <div className="text-[11px] text-slate-400 mt-1">Terminal #BIO-GLS-11</div>
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
              <h3 className="text-base font-bold text-slate-900">Today&apos;s Live Punch Record</h3>
              <Badge variant={isClockedIn ? "success" : "neutral"} className="text-[10px]">
                {isClockedIn ? "In Shift" : "Logged Out"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Check-in recorded at {todayCheckInTime || "Not logged"} • Location:{" "}
              {punchHistory[0]?.location || "Pending GPS Punch"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isClockedIn ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => punchHistory[0] && openLocationModal(punchHistory[0])}
                className="gap-1.5 text-xs text-slate-700 border-slate-200"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
                <span>View My GPS Map</span>
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
            <Button
              variant="primary"
              onClick={() => setIsClockInModalOpen(true)}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 shadow-sm"
            >
              <Clock className="h-4 w-4" />
              <span>Punch In (GPS Location &amp; Geofence)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Attendance Log (Last 7 Working Days)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard shift schedule: 09:30 AM to 06:30 PM (Sunday to Thursday)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredPunches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No attendance logs yet. Click &ldquo;Punch In (GPS Location &amp; Geofence)&rdquo; to log your first GPS check-in.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Date & Day</th>
                <th className="px-6 py-3">Check-In</th>
                <th className="px-6 py-3">Check-Out</th>
                <th className="px-6 py-3">Logged Hours</th>
                <th className="px-6 py-3">Overtime</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Punch Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPunches.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.date} ({item.day})</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-medium">
                    {item.checkIn || <span className="text-slate-400">--:--</span>}
                  </td>
                  <td className="px-6 py-3.5 font-medium">
                    {item.checkOut || (
                      <span className="text-emerald-600 font-semibold">In Progress</span>
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
                        item.status === "Present"
                          ? "success"
                          : item.status === "Late"
                          ? "warning"
                          : item.status === "Remote"
                          ? "info"
                          : "neutral"
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    <button
                      type="button"
                      onClick={() => openLocationModal(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 transition-colors text-xs font-medium cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-orange-600" />
                      <span className="truncate max-w-[160px]">{item.location}</span>
                      <span className="text-[10px] text-orange-600 font-bold ml-0.5">Map &gt;</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <AttendanceCorrectionModal
        open={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
      />
    </div>
  );
}
