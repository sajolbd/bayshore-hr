"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useHRMS } from "@/context/hrms-context";
import { formatTime12h } from "@/lib/office-time";
import {
  FileText,
  FileSpreadsheet,
  Check,
  Download,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

function csvEscape(val: string | number | undefined | null): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ExportModal() {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    openMonthlyReportModal,
    employees,
    attendanceRecords,
    exportReport,
  } = useHRMS();

  const [format, setFormat] = React.useState<"csv" | "xlsx" | "pdf">("csv");
  const [dateRange, setDateRange] = React.useState(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return prev.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  });
  const [isDownloading, setIsDownloading] = React.useState(false);

  const dateRangeOptions = React.useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevLabel = prev.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const quarter = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
    const ytd = `Year to Date (${now.getFullYear()})`;
    return [prevLabel, quarter, ytd];
  }, []);

  const [modules, setModules] = React.useState({
    attendance: true,
    employees: true,
    leaves: true,
    payroll: false,
  });

  const toggleModule = (key: keyof typeof modules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () => {
    setIsDownloading(true);

    setTimeout(() => {
      let csvContent = "";
      if (modules.employees) {
        csvContent +=
          "Employee ID,Name,Email,Department,Role,Status,JoinDate,Office In Time,Office Out Time\n";
        for (const emp of employees) {
          csvContent += [
            csvEscape(emp.id),
            csvEscape(emp.name),
            csvEscape(emp.email),
            csvEscape(emp.department),
            csvEscape(emp.role),
            csvEscape(emp.status),
            csvEscape(emp.joinDate),
            csvEscape(formatTime12h(emp.officeInTime)),
            csvEscape(formatTime12h(emp.officeOutTime, "06:00 PM")),
          ].join(",") + "\n";
        }
      }

      if (modules.attendance) {
        if (csvContent) csvContent += "\n";
        csvContent +=
          "Date,Employee ID,Name,Department,Check-In,Check-Out,Assigned In,Work Hours,Status,Location\n";
        for (const rec of attendanceRecords) {
          csvContent += [
            csvEscape(rec.dateKey),
            csvEscape(rec.employeeId),
            csvEscape(rec.employeeName),
            csvEscape(rec.department),
            csvEscape(rec.checkIn),
            csvEscape(rec.checkOut || "--"),
            csvEscape(formatTime12h(rec.scheduledInTime)),
            csvEscape(rec.workHours),
            csvEscape(rec.isLate ? "Late" : rec.status),
            csvEscape(rec.location),
          ].join(",") + "\n";
        }
      }

      if (!csvContent) {
        csvContent = "ID,Name,Status\n";
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `HRMS_Report_${dateRange.replace(/\s+/g, "_")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setIsDownloading(false);
      setIsExportModalOpen(false);
      exportReport("csv", dateRange);
    }, 350);
  };

  return (
    <Modal
      isOpen={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      title="Export HR Analytics & Reports"
      description="Download system metrics, attendance summaries, or open individual monthly Excel attendance sheets."
      size="md"
    >
      <div className="space-y-5">
        {/* Direct link to Individual Monthly Excel Report */}
        <button
          type="button"
          onClick={() => {
            setIsExportModalOpen(false);
            openMonthlyReportModal();
          }}
          className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Individual Employee Monthly Excel (.xlsx)
              </p>
              <p className="text-[11px] text-emerald-700">
                Includes RED-marked late clock-in highlights per employee
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-700 shrink-0" />
        </button>

        {/* Format Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Summary Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "csv", name: "CSV (.csv)", icon: FileSpreadsheet, desc: "Raw spreadsheet" },
              { id: "xlsx", name: "Excel (.xlsx)", icon: FileSpreadsheet, desc: "Formatted sheet" },
              { id: "pdf", name: "PDF (.pdf)", icon: FileText, desc: "Executive report" },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = format === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === "xlsx") {
                      setIsExportModalOpen(false);
                      openMonthlyReportModal();
                      return;
                    }
                    setFormat(item.id as "csv" | "xlsx" | "pdf");
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer relative",
                    isSelected
                      ? "border-orange-600 bg-orange-50/50 text-orange-900 ring-2 ring-orange-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 mb-1.5",
                      isSelected ? "text-orange-600" : "text-slate-400"
                    )}
                  />
                  <span className="text-xs font-semibold">{item.name}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Timeframe Period
          </label>
          <div className="grid grid-cols-3 gap-2">
            {dateRangeOptions.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer",
                  dateRange === range
                    ? "border-orange-600 bg-orange-50 text-orange-700 font-semibold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Modules to Include */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Data Modules Included
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { key: "attendance", label: "Attendance & Work Logs" },
              { key: "employees", label: "Employee Directory & Shifts" },
              { key: "leaves", label: "Leave Requests & Balances" },
              { key: "payroll", label: "Compensation Summary" },
            ].map((item) => {
              const isChecked = modules[item.key as keyof typeof modules];
              return (
                <label
                  key={item.key}
                  onClick={() => toggleModule(item.key as keyof typeof modules)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-colors",
                    isChecked
                      ? "border-orange-200 bg-orange-50/30 text-slate-900"
                      : "border-slate-200 bg-slate-50/50 text-slate-500"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="accent-orange-600 h-3.5 w-3.5 rounded"
                  />
                  <span className="font-medium text-xs">{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExportModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isDownloading}
            onClick={handleExport}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparing File...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download Summary</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
