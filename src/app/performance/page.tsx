"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Award, Target, Send, TrendingUp, CheckCircle2 } from "lucide-react";
import { useHRMS } from "@/context/hrms-context";
import { useToast } from "@/context/toast-context";

export default function AdminPerformancePage() {
  const { employees } = useHRMS();
  const { showToast } = useToast();

  const [remindedIds, setRemindedIds] = React.useState<string[]>([]);

  const handleSendReminder = (empId: string, name: string) => {
    setRemindedIds((prev) => (prev.includes(empId) ? prev : [...prev, empId]));
    showToast("Review Reminder Sent", `Notified ${name} to finalize Q4 2026 self-assessment.`, "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Performance &amp; OKR Cycles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track Q4 2026 organizational KPIs, self-assessments, and manager appraisal completions.
          </p>
        </div>
        <Button
          onClick={() =>
            showToast(
              "Cycle Broadcast Sent",
              "Appraisal review reminders dispatched to all department heads.",
              "success"
            )
          }
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm text-xs"
        >
          <Send className="h-4 w-4" />
          <span>Remind All Pending Reviews</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Review Cycle</span>
            <Award className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">Q4 2026 Appraisal</p>
          <p className="text-[11px] text-slate-400 mt-1">Closes Dec 15, 2026</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg OKR Attainment</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2">84.2%</p>
          <p className="text-[11px] text-slate-400 mt-1">+6.4% vs Q3 benchmark</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Self-Assessments Filed</span>
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">78%</p>
          <p className="text-[11px] text-slate-400 mt-1">194 of 248 employees submitted</p>
        </Card>
      </div>

      {/* Team OKR Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Department Appraisal Queue</h2>
          <p className="text-xs text-slate-500">Monitor individual KPI progress and review status</p>
        </div>

        <div className="divide-y divide-slate-100">
          {employees.map((emp, idx) => {
            const score = 76 + ((idx * 7) % 21);
            const isCompleted = idx % 3 === 0;
            const isReminded = remindedIds.includes(emp.id);

            return (
              <div
                key={emp.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={emp.avatar} alt={emp.name} fallback={emp.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{emp.name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {emp.department}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{emp.role}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="w-36">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">KPI Progress</span>
                      <span className="font-bold text-slate-800">{score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-600"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  <Badge variant={isCompleted ? "success" : "warning"} dot>
                    {isCompleted ? "Reviewed" : "In Progress"}
                  </Badge>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Signed Off
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isReminded}
                      onClick={() => handleSendReminder(emp.id, emp.name)}
                      className="text-xs"
                    >
                      {isReminded ? "Reminder Sent" : "Nudge Employee"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

