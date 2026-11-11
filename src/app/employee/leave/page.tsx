"use client";

import * as React from "react";
import {
  Calendar,
  Plus,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplyLeaveModal } from "@/components/employee/apply-leave-modal";

export default function EmployeeLeavePage() {
  const { leaveBalances, leaveRequests, officeHolidays } = useEmployee();
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Check quota balances, file time-off applications, and track manager approvals.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsApplyModalOpen(true)}
          className="gap-2 bg-orange-600 hover:bg-orange-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </Button>
      </div>

      {/* Leave Balance Quota */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Annual Leave Entitlement (2026 Cycle)
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {leaveBalances.map((item) => {
            const pct =
              item.total > 0
                ? Math.min(100, Math.round((item.available / item.total) * 100))
                : 0;
            return (
              <div
                key={item.type}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-slate-900">
                      {item.type}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-orange-600 border-orange-200"
                    >
                      {pct}% Remaining
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {item.available}
                    </span>
                    <span className="text-xs text-slate-500">
                      / {item.total} Fixed Yearly Days Remaining
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 shrink-0 text-xs text-slate-500">
                  <div>
                    Used YTD: <strong className="text-slate-900">{item.used} Days</strong>
                  </div>
                  <div>
                    Yearly Fixed: <strong className="text-slate-900">{item.total} Days</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Request History */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:px-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Leave Applications & History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All time-off requests are routed to Marcus Vance (VP of Engineering).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Request ID</th>
                <th className="px-6 py-3">Leave Type</th>
                <th className="px-6 py-3">Period & Dates</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Approver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{req.id}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-800">{req.type}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{req.startDate} to {req.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{req.days} Day(s)</td>
                  <td className="px-6 py-3.5 max-w-xs truncate text-slate-600" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-6 py-3.5">
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
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {req.reviewedBy || <span className="text-slate-400 italic">Pending Review</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Bangladesh Holiday Calendar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Gazetted & Company Holidays</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bayshore Communication holiday calendar (Government of Bangladesh Gazetted)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {officeHolidays.map((holiday) => (
            <div
              key={holiday.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">{holiday.name}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {holiday.day} • {holiday.type}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-orange-600">
                <span>Date:</span>
                <span>{holiday.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ApplyLeaveModal
        open={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
