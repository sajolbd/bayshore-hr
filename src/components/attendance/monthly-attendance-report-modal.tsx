"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import {
  formatTime12h,
  getDhakaCurrentMonthKey,
} from "@/lib/office-time";
import {
  downloadMonthlyAttendanceXlsxInBrowser,
  MonthlyAttendanceReportData,
} from "@/lib/excel-attendance-report";
import {
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyAttendanceReportModalProps {
  /** Optional controlled open state for standalone usage (e.g. Employee Self-Service) */
  isOpen?: boolean;
  onClose?: () => void;
  lockedEmployeeId?: string | null;
}

export function MonthlyAttendanceReportModal({
  isOpen: controlledOpen,
  onClose: controlledClose,
  lockedEmployeeId,
}: MonthlyAttendanceReportModalProps = {}) {
  const {
    employees,
    isMonthlyReportModalOpen,
    monthlyReportEmployeeId,
    closeMonthlyReportModal,
  } = useHRMS();
  const { currentUser, isEmployeeView } = useAuth();
  const { showToast } = useToast();

  const open = controlledOpen ?? isMonthlyReportModalOpen;
  const externalClose = controlledClose ?? closeMonthlyReportModal;

  const isLockedToSelf = Boolean(lockedEmployeeId) || isEmployeeView;
  const effectiveSelfId =
    lockedEmployeeId || currentUser?.employeeId || currentUser?.id || "";

  const [manualEmployeeId, setManualEmployeeId] = React.useState<string>("");
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() =>
    getDhakaCurrentMonthKey()
  );
  const [report, setReport] =
    React.useState<MonthlyAttendanceReportData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedEmployeeId = isLockedToSelf
    ? effectiveSelfId
    : manualEmployeeId || monthlyReportEmployeeId || employees[0]?.id || "";

  const handleClose = () => {
    setManualEmployeeId("");
    setError(null);
    externalClose();
  };

  React.useEffect(() => {
    if (!open || !selectedEmployeeId || !selectedMonth) return;

    let cancelled = false;
    const params = new URLSearchParams({
      employeeId: selectedEmployeeId,
      month: selectedMonth,
      format: "json",
    });

    const timer = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      fetch(`/api/attendance/monthly-report?${params.toString()}`, {
        cache: "no-store",
      })
        .then(async (res) => {
          const data = (await res.json().catch(() => ({}))) as {
            report?: MonthlyAttendanceReportData;
            error?: string;
          };
          if (cancelled) return;
          if (!res.ok || !data.report) {
            setReport(null);
            setError(
              data.error || "Unable to load monthly attendance report."
            );
          } else {
            setReport(data.report);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setReport(null);
            setError("Network error while loading monthly attendance report.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, selectedEmployeeId, selectedMonth]);

  const handleDownloadExcel = () => {
    if (!report) return;
    downloadMonthlyAttendanceXlsxInBrowser(report);
    showToast(
      "Excel Sheet Downloaded",
      `Saved ${report.employee.name}'s ${report.monthLabel} attendance report (.xlsx) with red-marked late check-ins.`,
      "success"
    );
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Individual Monthly Attendance Report (Excel)"
      description="Inspect daily punches against the employee's assigned office shift and download a formatted .xlsx sheet."
      size="xl"
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
        {/* Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="sm:col-span-6">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
              <User className="h-3.5 w-3.5 text-orange-600" />
              <span>Employee</span>
            </label>
            {isLockedToSelf ? (
              <div className="h-9 px-3 rounded-lg border border-slate-200 bg-white flex items-center text-xs font-semibold text-slate-800">
                {currentUser?.name} ({effectiveSelfId})
              </div>
            ) : (
              <Select
                value={selectedEmployeeId}
                onChange={(e) => setManualEmployeeId(e.target.value)}
                className="h-9 text-xs bg-white"
              >
                {employees.length === 0 && (
                  <option value="">No employees found</option>
                )}
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) — Shift:{" "}
                    {formatTime12h(emp.officeInTime)} to{" "}
                    {formatTime12h(emp.officeOutTime, "06:00 PM")}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="sm:col-span-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-orange-600" />
              <span>Select Month</span>
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <Button
              type="button"
              disabled={!report || loading}
              onClick={handleDownloadExcel}
              className="w-full h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Download Excel (.xlsx)</span>
            </Button>
          </div>
        </div>

        {/* Assigned Office Time & Red-Mark Policy Banner */}
        {report && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white border border-orange-200 text-orange-600 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {report.employee.name} ({report.employee.id}) •{" "}
                  <span className="text-orange-700">{report.employee.department}</span>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Assigned Office Time:{" "}
                  <strong className="text-slate-900">
                    {report.officeIn12h} – {report.officeOut12h}
                  </strong>
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-100 border border-red-300 text-red-700 font-bold text-[11px] shrink-0">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              <span>
                Clock-In after {report.officeIn12h} is RED-MARKED
              </span>
            </div>
          </div>
        )}

        {/* Summary KPI Strip */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Present Days
              </span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">
                {report.summary.presentDays} Days
              </span>
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                On-Time Arrivals
              </span>
              <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block">
                {report.summary.onTimeDays} Days
              </span>
            </div>
            <div
              className={cn(
                "p-3 rounded-xl border",
                report.summary.lateDays > 0
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-bold uppercase block",
                  report.summary.lateDays > 0 ? "text-red-700" : "text-slate-400"
                )}
              >
                Late Clock-Ins (Red)
              </span>
              <span
                className={cn(
                  "text-lg font-extrabold mt-0.5 block",
                  report.summary.lateDays > 0 ? "text-red-700" : "text-slate-800"
                )}
              >
                {report.summary.lateDays} Day(s)
                {report.summary.totalLateMinutes > 0 && (
                  <span className="text-[11px] font-semibold ml-1.5">
                    ({report.summary.totalLateFormatted})
                  </span>
                )}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Total Work Hours
              </span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block font-mono">
                {report.summary.totalWorkFormatted}
              </span>
            </div>
          </div>
        )}

        {/* Loading / Error / Table */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
            <span>Building {selectedMonth} attendance report...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : report ? (
          <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white">
            {report.rows.length === 0 ? (
              <div className="py-10 px-4 text-center text-xs text-slate-500">
                No attendance logs recorded for{" "}
                <strong>{report.employee.name}</strong> in{" "}
                <strong>{report.monthLabel}</strong>. You can still download the
                Excel sheet header template.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Date &amp; Day</th>
                    <th className="px-4 py-2.5">Office Shift</th>
                    <th className="px-4 py-2.5">Clock-In Time</th>
                    <th className="px-4 py-2.5">Clock-Out Time</th>
                    <th className="px-4 py-2.5">Punctuality</th>
                    <th className="px-4 py-2.5">Work Hours</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.rows.map((row) => {
                    const isLeave =
                      row.effectiveStatus === "On Leave" ||
                      row.effectiveStatus === "Absent";
                    return (
                      <tr
                        key={row.dateKey}
                        className={cn(
                          "transition-colors",
                          row.isLate
                            ? "bg-red-50/40 hover:bg-red-50/70"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                          {row.dateKey}{" "}
                          <span className="text-slate-400 font-normal">
                            ({row.dayLabel})
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 font-mono whitespace-nowrap">
                          {row.scheduledIn12h} – {row.scheduledOut12h}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {isLeave ? (
                            <span className="text-amber-700 font-semibold">
                              On Leave
                            </span>
                          ) : row.isLate ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 border border-red-300 px-2.5 py-1 font-mono font-bold text-red-700">
                              <span className="h-2 w-2 rounded-full bg-red-600 shrink-0" />
                              <span>{row.checkInDisplay}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-mono font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              <span>{row.checkInDisplay}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                          {row.checkOutDisplay}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {isLeave ? (
                            <span className="text-amber-700 font-medium">
                              Approved Leave
                            </span>
                          ) : row.isLate ? (
                            <span className="font-bold text-red-600">
                              {row.lateLabel}
                            </span>
                          ) : (
                            <span className="font-medium text-emerald-600">
                              On Time
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-semibold text-slate-800 whitespace-nowrap">
                          {row.workHours}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <Badge
                            variant={
                              isLeave
                                ? "warning"
                                : row.isLate
                                ? "danger"
                                : "success"
                            }
                            dot
                            className="text-[10px]"
                          >
                            {row.isLate ? "Late" : row.effectiveStatus}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            Excel export highlights late clock-ins in red cell fill so HR can review monthly punctuality at a glance.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              type="button"
              disabled={!report || loading}
              onClick={handleDownloadExcel}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel (.xlsx)</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
