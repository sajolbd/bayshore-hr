"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  User,
  Clock,
  Eye,
} from "lucide-react";
import { useHRMS } from "@/context/hrms-context";
import { useToast } from "@/context/toast-context";
import { formatTime12h, getDhakaCurrentMonthKey } from "@/lib/office-time";
import {
  downloadMonthlyAttendanceXlsxInBrowser,
  MonthlyAttendanceReportData,
} from "@/lib/excel-attendance-report";

export default function ReportsPage() {
  const { setIsExportModalOpen, employees, openMonthlyReportModal } = useHRMS();
  const { showToast } = useToast();

  const [manualEmployeeId, setManualEmployeeId] = React.useState<string>("");
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() =>
    getDhakaCurrentMonthKey()
  );
  const [downloadingXlsx, setDownloadingXlsx] = React.useState(false);

  const selectedEmployeeId = manualEmployeeId || employees[0]?.id || "";
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const handleDirectMonthlyExcelDownload = async () => {
    if (!selectedEmployeeId) return;
    setDownloadingXlsx(true);
    try {
      const params = new URLSearchParams({
        employeeId: selectedEmployeeId,
        month: selectedMonth,
        format: "json",
      });
      const res = await fetch(
        `/api/attendance/monthly-report?${params.toString()}`,
        { cache: "no-store" }
      );
      const data = (await res.json().catch(() => ({}))) as {
        report?: MonthlyAttendanceReportData;
        error?: string;
      };
      if (!res.ok || !data.report) {
        showToast(
          "Report Error",
          data.error || "Could not generate report.",
          "error"
        );
        return;
      }
      downloadMonthlyAttendanceXlsxInBrowser(data.report);
      showToast(
        "Excel Downloaded",
        `Monthly attendance sheet saved for ${data.report.employee.name} (${data.report.monthLabel}). Late check-ins are marked RED.`,
        "success"
      );
    } catch {
      showToast("Network Error", "Failed to download Excel sheet.", "error");
    } finally {
      setDownloadingXlsx(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reports &amp; Analytics Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download individual employee monthly attendance Excel (.xlsx) reports with red-marked late check-ins and export org summaries.
          </p>
        </div>
        <Button
          onClick={() => setIsExportModalOpen(true)}
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Generate Custom Report</span>
        </Button>
      </div>

      {/* Individual Employee Monthly Attendance Excel Builder */}
      <Card className="p-5 sm:p-6 border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  Individual Employee Monthly Attendance Report (.xlsx)
                </h2>
                <Badge variant="danger" className="text-[10px]">
                  Late Clock-In = Red Mark
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select any employee and month to inspect daily clock-ins against their office shift or download their formatted Excel sheet.
              </p>
            </div>
          </div>
          {selectedEmployee && (
            <div className="text-xs bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2 shrink-0">
              <Clock className="h-3.5 w-3.5 text-orange-600" />
              <span>
                Shift:{" "}
                <strong className="text-slate-900">
                  {formatTime12h(selectedEmployee.officeInTime)} –{" "}
                  {formatTime12h(selectedEmployee.officeOutTime, "06:00 PM")}
                </strong>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 items-end">
          <div className="sm:col-span-5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
              <User className="h-3.5 w-3.5 text-orange-600" />
              <span>Select Employee</span>
            </label>
            <Select
              value={selectedEmployeeId}
              onChange={(e) => setManualEmployeeId(e.target.value)}
              className="h-9 text-xs"
            >
              {employees.length === 0 && (
                <option value="">No employees loaded</option>
              )}
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id}) — {emp.department}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-orange-600" />
              <span>Report Month</span>
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              disabled={!selectedEmployeeId}
              onClick={() => openMonthlyReportModal(selectedEmployeeId)}
              className="w-full h-9 gap-1.5 text-xs border-slate-200"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </Button>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="button"
              disabled={!selectedEmployeeId || downloadingXlsx}
              onClick={() => void handleDirectMonthlyExcelDownload()}
              className="w-full h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloadingXlsx ? "Exporting..." : "Download .xlsx"}</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-10 text-center">
        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">No saved reports yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Reports generated through &ldquo;Generate Custom Report&rdquo; and the monthly
          attendance Excel builder above are downloaded directly. A saved report archive
          will be available once report storage is enabled.
        </p>
      </Card>
    </div>
  );
}
