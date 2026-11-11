"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";
import { useHRMS } from "@/context/hrms-context";

export default function ReportsPage() {
  const { setIsExportModalOpen } = useHRMS();

  const savedReports = [
    {
      title: "Monthly Workforce & Payroll Summary",
      period: "October 2026",
      generatedOn: "Nov 01, 2026",
      size: "2.4 MB",
      format: "PDF",
    },
    {
      title: "Quarterly Department Headcount Audit",
      period: "Q3 2026",
      generatedOn: "Oct 05, 2026",
      size: "1.1 MB",
      format: "XLSX",
    },
    {
      title: "Employee Leave & Absenteeism Analysis",
      period: "Jan - Sep 2026",
      generatedOn: "Sep 30, 2026",
      size: "840 KB",
      format: "CSV",
    },
    {
      title: "Diversity & Inclusion Representation Metrics",
      period: "Annual 2026",
      generatedOn: "Aug 15, 2026",
      size: "3.2 MB",
      format: "PDF",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reports &amp; Analytics Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate customized audit reports, payroll sheets, and retention metrics.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedReports.map((report) => (
          <Card
            key={report.title}
            className="p-5 flex flex-col justify-between hover:border-orange-200 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {report.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Period: <strong>{report.period}</strong>
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {report.format}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Generated {report.generatedOn}
                </span>
                <span>File size: {report.size}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="mt-4 w-full gap-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Copy</span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
