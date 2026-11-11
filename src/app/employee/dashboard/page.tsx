"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  CalendarOff,
  Megaphone,
  Calendar,
  MapPin,
  Eye,
  Plus,
} from "lucide-react";
import { useEmployee, useLiveShiftSeconds } from "@/context/employee-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/utils";
import { ApplyLeaveModal } from "@/components/employee/apply-leave-modal";
import { PayslipModal } from "@/components/employee/payslip-modal";
import { EmployeePayslip } from "@/types/employee-portal";

function LiveShiftTimerDisplay() {
  const todayWorkSeconds = useLiveShiftSeconds();
  const hours = Math.floor(todayWorkSeconds / 3600);
  const minutes = Math.floor((todayWorkSeconds % 3600) / 60);
  const seconds = todayWorkSeconds % 60;
  const timerDisplay = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-slate-900 mt-1">
      {timerDisplay}
    </div>
  );
}

export default function EmployeeDashboardPage() {
  const {
    profile,
    isClockedIn,
    todayCheckInTime,
    todayCheckOutTime,
    punchHistory,
    clockOut,
    setIsClockInModalOpen,
    openLocationModal,
    leaveBalances,
    leaveRequests,
    officeHolidays,
    payslips,
    goals,
  } = useEmployee();

  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = React.useState(false);
  const [selectedPayslip, setSelectedPayslip] = React.useState<EmployeePayslip | null>(null);

  const latestPayslip = payslips[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar}
            alt={profile.name}
            fallback={profile.name.substring(0, 2).toUpperCase()}
            size="xl"
            status="online"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Good morning, {profile.name} 👋
              </h1>
              <Badge variant="warning" className="hidden sm:inline-flex text-[11px]">
                {profile.role}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Sunday, November 08, 2026 • Level 11, Bay&apos;s Bellavista, Gulshan 2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsApplyLeaveOpen(true)}
            className="flex-1 sm:flex-initial gap-1.5"
          >
            <Plus className="h-4 w-4 text-orange-600" />
            <span>Apply Leave</span>
          </Button>
          <Link href="/employee/requests" className="flex-1 sm:flex-initial">
            <Button variant="secondary" size="sm" className="w-full gap-1.5">
              <span>HR Helpdesk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Today's Attendance & Shift Punch Card + Live Working Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Punch In / Out Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Biometric Shift Punch
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Today&apos;s Attendance Status
              </h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                <span className="truncate">
                  {isClockedIn && punchHistory[0]
                    ? `Clocked in from: ${punchHistory[0].geo?.address || punchHistory[0].location}`
                    : `Assigned Workplace: ${profile.location || "Gulshan HQ"}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isClockedIn
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isClockedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {isClockedIn ? "Currently Clocked In" : "Off Duty / Not Punched"}
              </span>
            </div>
          </div>

          {/* Timer Display & Punch Button */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block font-medium">
                Active Working Duration
              </span>
              <LiveShiftTimerDisplay />
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span>
                  Check-in: <strong className="text-slate-800">{todayCheckInTime || "--:--"}</strong>
                </span>
                <span>•</span>
                <span>
                  Check-out: <strong className="text-slate-800">{todayCheckOutTime || "--:--"}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-end gap-2">
              {isClockedIn ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => punchHistory[0] && openLocationModal(punchHistory[0])}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
                  >
                    <MapPin className="h-4 w-4 text-orange-600" />
                    <span>View GPS Pin</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={clockOut}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 text-white font-bold px-6 py-3"
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    Clock Out (Punch)
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsClockInModalOpen(true)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-white font-bold px-6 py-3 gap-2"
                >
                  <MapPin className="h-5 w-5" />
                  Clock In (GPS Location)
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Biometric Terminal Sync: #BIO-GLS-11 (Online)</span>
            <Link
              href="/employee/attendance"
              className="font-semibold text-orange-600 hover:underline flex items-center gap-1"
            >
              View Full Attendance History →
            </Link>
          </div>
        </div>

        {/* Latest Payslip Quick Card */}
        {latestPayslip && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Latest Payslip
                </span>
                <Badge variant="success" className="text-[10px]">
                  {latestPayslip.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {latestPayslip.monthYear}
              </h3>
              <div className="mt-4">
                <span className="text-xs text-slate-500 block">Net Disbursed Compensation</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatBDT(latestPayslip.netPayable)}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Gross Salary:</span>
                  <span className="font-medium text-slate-700">{formatBDT(latestPayslip.grossSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium text-emerald-700">Direct Bank Transfer</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPayslip(latestPayslip)}
                className="flex-1 gap-1.5 text-xs"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span>View Payslip</span>
              </Button>
              <Link href="/employee/salary" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  <span>All Payslips</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. Monthly Attendance Summary Metrics */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          November 2026 Monthly Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs text-slate-500 block">Total Working Days</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">22 Days</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Sun – Thu Workweek</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs text-emerald-600 font-semibold block">Present & On Duty</span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">18 Days</span>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">94.7% On-Time Record</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs text-amber-600 font-semibold block">Late Check-in</span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">1 Day</span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">Nov 04 (09:35 AM)</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs text-blue-600 font-semibold block">Remote / Approved Leaves</span>
            <span className="text-2xl font-bold text-blue-700 mt-1 block">3 Days</span>
            <span className="text-[11px] text-blue-600 mt-0.5 block">2 Remote • 1 Annual</span>
          </div>
        </div>
      </div>

      {/* 4. Leave Balance & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Balances */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Available Leave Balances</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Annual allocation cycle: Jan 01, 2026 – Dec 31, 2026
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApplyLeaveOpen(true)}
              className="gap-1.5 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Apply Leave</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {leaveBalances.map((item) => (
              <div
                key={item.type}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.type}</span>
                    <span className="text-slate-500">
                      {item.used} days used of {item.total} days
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          item.total > 0
                            ? Math.min(100, Math.round((item.available / item.total) * 100))
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-2xl font-black text-slate-900">
                    {item.available}
                    <span className="text-xs font-normal text-slate-400">/{item.total}d</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700">
                    Available Balance
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Leaves Preview */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Recent Leave Applications</span>
              <Link href="/employee/leave" className="text-xs text-orange-600 hover:underline">
                View all requests →
              </Link>
            </div>

            <div className="space-y-2">
              {leaveRequests.slice(0, 2).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarOff className="h-4 w-4 text-orange-600" />
                    <div>
                      <strong className="text-slate-900">{req.type}</strong>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-500">
                        {req.startDate} to {req.endDate} ({req.days} days)
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      req.status === "Approved"
                        ? "success"
                        : req.status === "Pending"
                        ? "warning"
                        : "danger"
                    }
                    className="text-[10px]"
                  >
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assigned OKR / Goals Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Assigned Goals & OKRs</h3>
              <Link href="/employee/performance" className="text-xs text-orange-600 hover:underline">
                Details →
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Q4 Performance Evaluation Target
            </p>

            <div className="mt-4 space-y-3.5">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      {goal.title}
                    </span>
                    <span className="font-bold text-orange-600 shrink-0">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Due: {goal.targetDate}</span>
                    <span className="text-emerald-600 font-medium">{goal.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Overall Progress</span>
            <span className="font-bold text-slate-900">81.6% Achieved</span>
          </div>
        </div>
      </div>

      {/* 5. Company Announcements & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Announcements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-orange-600" />
              <h3 className="text-base font-bold text-slate-900">Company Announcements</h3>
            </div>
            <Link href="/employee/announcements" className="text-xs text-orange-600 hover:underline">
              View All Bulletins →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-orange-100 bg-orange-50/40 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Q4 All-Hands Town Hall & Awards</span>
                <span className="text-[10px] text-orange-700 font-semibold">Wednesday, 4:00 PM</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Join our CEO and Executive leadership team at the Gulshan 2 Auditorium or virtual bridge for Q4 company milestones and team recognitions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Annual Retreat 2026: Cox&apos;s Bazar</span>
                <span className="text-[10px] text-slate-400">Published 2d ago</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Registration is open for our 3-day corporate offsite in December. Confirm your travel preferences in the HR portal by Nov 20.
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays Calendar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <h3 className="text-base font-bold text-slate-900">Upcoming Holidays (2026-2027)</h3>
            </div>
            <Link href="/employee/calendar" className="text-xs text-orange-600 hover:underline">
              Full Calendar →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {officeHolidays.slice(0, 4).map((holiday) => (
              <div key={holiday.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">{holiday.name}</strong>
                  <span className="text-slate-500 text-[11px]">
                    {holiday.day} • {holiday.type}
                  </span>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-200 font-semibold">
                  {holiday.date}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplyLeaveModal
        open={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
      />

      <PayslipModal
        payslip={selectedPayslip}
        open={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
      />
    </div>
  );
}
