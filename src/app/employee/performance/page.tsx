"use client";

import * as React from "react";
import {
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Edit2,
  Save,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmployeePerformancePage() {
  const { goals, updateGoalSelfAssessment } = useEmployee();
  const [editingGoalId, setEditingGoalId] = React.useState<string | null>(null);
  const [selfNotes, setSelfNotes] = React.useState<string>("");
  const [savedSuccess, setSavedSuccess] = React.useState<string | null>(null);

  const handleStartEdit = (goalId: string) => {
    setEditingGoalId(goalId);
    setSelfNotes("");
  };

  const handleSaveNotes = (goalId: string) => {
    if (selfNotes.trim()) {
      updateGoalSelfAssessment(goalId, selfNotes.trim());
      setSavedSuccess(goalId);
      setTimeout(() => setSavedSuccess(null), 2000);
    }
    setEditingGoalId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              My Growth, OKRs & Performance
            </h1>
            <Badge variant="warning">Q4 2026 Cycle</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track key results, self-assess milestones, review manager evaluations, and professional development.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-orange-50 px-3.5 py-2 border border-orange-200 text-right">
            <span className="text-[11px] text-orange-700 font-semibold uppercase tracking-wider block">
              Overall OKR Score
            </span>
            <span className="text-xl font-black text-orange-600">81.6%</span>
          </div>
        </div>
      </div>

      {/* KPI Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Architecture Delivery</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">94%</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Exceeds Expectations</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Cloud System Uptime</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">99.98%</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Target: 99.95%</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Code Review Turnaround</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">&lt; 2.5 hrs</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Top 5% in Engineering</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Last Review Rating</span>
          <div className="text-2xl font-bold text-orange-600 mt-2">4.8 / 5.0</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Evaluated by Marcus Vance</span>
        </div>
      </div>

      {/* Active OKR Goals List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assigned OKR Goals & Self-Assessment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Add Self-Assessment&quot; to submit your deliverables commentary before the review deadline.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-semibold text-orange-600 border-orange-200">
                    {goal.category}
                  </Badge>
                  <h4 className="text-sm font-bold text-slate-900">{goal.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px]">
                    {goal.status}
                  </Badge>
                  <span className="text-xs font-bold text-slate-700">{goal.progress}% Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-orange-600 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <strong className="text-slate-800 block text-[11px]">Key Metric & Target Outcome:</strong>
                <p>{goal.keyMetric}</p>
                <span className="text-[11px] text-slate-400 block mt-1">Target Due Date: {goal.targetDate}</span>
              </div>

              {/* Self-Assessment notes */}
              {editingGoalId === goal.id ? (
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Self-Assessment & Accomplishment Notes:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your progress, link PRs, or highlight roadblocks..."
                    value={selfNotes}
                    onChange={(e) => setSelfNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingGoalId(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveNotes(goal.id)}
                      className="text-xs bg-orange-600 hover:bg-orange-700"
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  {savedSuccess === goal.id ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Self-assessment saved!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Last updated for Q4 evaluation review
                    </span>
                  )}
                  <button
                    onClick={() => handleStartEdit(goal.id)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Add / Edit Self-Assessment</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Manager Feedback & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Manager Feedback */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Latest Manager Feedback (Q3 Review)</h3>
          </div>

          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-xs text-slate-700 leading-relaxed italic">
            &ldquo;Elena demonstrated extraordinary leadership during our multi-region Kubernetes migration. Her architectural designs for high-concurrency microservices ensured 99.98% reliability during peak load. Highly commendable mentorship of our junior cloud engineers.&rdquo;
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Reviewer: <strong>Marcus Vance (VP of Engineering)</strong></span>
            <Badge variant="success">Rating: 4.8 / 5.0 (Exceeds)</Badge>
          </div>
        </div>

        {/* Assigned Learning Materials & Training */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Assigned Training & Professional Development</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block font-semibold">
                  AWS Certified Advanced Networking – Specialty
                </strong>
                <span className="text-slate-400 text-[11px]">Bayshore Sponsored Certification Exam</span>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                In Progress (70%)
              </Badge>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block font-semibold">
                  Enterprise Leadership & People Operations 2026
                </strong>
                <span className="text-slate-400 text-[11px]">Bayshore Executive Training Track</span>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
