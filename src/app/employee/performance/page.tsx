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

  const overallProgress = goals.length
    ? Math.round(
        goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
      )
    : 0;
  const inProgressCount = goals.filter((goal) => goal.status !== "Completed").length;
  const completedCount = goals.filter((goal) => goal.status === "Completed").length;

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
              My Growth, OKRs &amp; Performance
            </h1>
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
            <span className="text-xl font-black text-orange-600">
              {goals.length > 0 ? `${overallProgress}%` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Assigned Goals</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">{goals.length}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {goals.length > 0 ? "Active cycle" : "No cycle configured"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">In Progress</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">{inProgressCount}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {goals.length > 0 ? "Awaiting completion" : "—"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Completed</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{completedCount}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {goals.length > 0 ? "Marked complete" : "—"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Average Progress</span>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {goals.length > 0 ? `${overallProgress}%` : "—"}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Across all assigned goals
          </span>
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
          {goals.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs text-slate-500">
                No OKR goals have been assigned to you yet.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Once your manager assigns goals for the current review cycle, they will appear here with self-assessment fields.
              </p>
            </div>
          ) : (
            goals.map((goal) => (
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
                      Track your deliverables for this goal
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
          ))
          )}
        </div>
      </div>

      {/* Manager Feedback & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Manager Feedback */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Latest Manager Feedback</h3>
          </div>
          <div className="py-8 text-center">
            <p className="text-xs text-slate-500">
              No manager feedback recorded yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Feedback from your appraisal reviews will appear here.
            </p>
          </div>
        </div>

        {/* Assigned Learning Materials & Training */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Assigned Training &amp; Professional Development</h3>
          </div>
          <div className="py-8 text-center">
            <p className="text-xs text-slate-500">
              No trainings or certifications assigned yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Learning programs assigned by HR will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
