"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useHRMS } from "@/context/hrms-context";
import { FileText, FileSpreadsheet, Check, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExportModal() {
  const { isExportModalOpen, setIsExportModalOpen, exportReport } = useHRMS();

  const [format, setFormat] = React.useState<"csv" | "xlsx" | "pdf">("csv");
  const [dateRange, setDateRange] = React.useState("November 2026");
  const [isDownloading, setIsDownloading] = React.useState(false);

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
      // Trigger client-side simulated CSV download
      const headers = "ID,Name,Department,Role,Status,JoinDate\n";
      const rows =
        "EMP-1042,Elena Rostova,Engineering,Senior Cloud Architect,Active,2023-04-15\n" +
        "EMP-1089,David Chen,Product & Design,Lead Product Designer,Active,2022-11-01\n" +
        "EMP-1102,Marcus Vance,Engineering,Backend Team Lead,Active,2021-08-20\n" +
        "EMP-1115,Sophia Al-Mansoor,Sales & Marketing,Enterprise Sales Director,Active,2022-03-10\n" +
        "EMP-1120,Carlos Mendez,Operations,Operations Manager,Active,2022-07-05\n";

      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `HRMS_Report_${dateRange.replace(/\s+/g, "_")}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);
      setIsExportModalOpen(false);
      exportReport(format, dateRange);
    }, 900);
  };

  return (
    <Modal
      isOpen={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      title="Export HR Analytics & Reports"
      description="Download complete system metrics, attendance summaries, and department roster."
      size="md"
    >
      <div className="space-y-5">
        {/* Format Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Export Format
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
                  onClick={() => setFormat(item.id as "csv" | "xlsx" | "pdf")}
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
            {["November 2026", "Q3 2026", "Year to Date (2026)"].map((range) => (
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
              { key: "employees", label: "Employee Directory & Roles" },
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
                <span>Download Report</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
