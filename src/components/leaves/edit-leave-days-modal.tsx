"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useHRMS } from "@/context/hrms-context";
import { Employee } from "@/types";
import { UserCog, Check, RotateCcw, AlertCircle } from "lucide-react";

interface EditLeaveDaysModalProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}

function EditLeaveDaysForm({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { annualLeavePolicies, employeeLeaveDayEntries, leaveRequests, updateEmployeeLeaveDays } =
    useHRMS();

  const defaultQuota = annualLeavePolicies[0]?.yearlyQuota ?? 20;
  const existingEntry = employeeLeaveDayEntries.find(
    (entry) => entry.employeeId === employee.id
  );

  const baseUsed = leaveRequests
    .filter(
      (req) =>
        req.employeeId === employee.id &&
        req.leaveType === "Annual Leave" &&
        (req.status === "Approved" || req.status === "Pending")
    )
    .reduce((sum, req) => sum + req.days, 0);

  const [totalDaysInput, setTotalDaysInput] = React.useState(
    existingEntry ? String(existingEntry.totalDays) : ""
  );
  const [adjustmentInput, setAdjustmentInput] = React.useState(
    existingEntry ? String(existingEntry.usedDaysAdjustment) : "0"
  );
  const [note, setNote] = React.useState(existingEntry?.note || "");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const parsedTotal =
    totalDaysInput.trim() === "" ? defaultQuota : parseInt(totalDaysInput, 10) || 0;
  const parsedAdjustment = parseInt(adjustmentInput, 10) || 0;
  const effectiveUsed = baseUsed + parsedAdjustment;
  const previewAvailable = Math.max(0, parsedTotal - effectiveUsed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedTotal < 0 || parsedTotal > 365) {
      setError("Personal allocation must be between 0 and 365 days.");
      return;
    }
    if (parsedAdjustment < -365 || parsedAdjustment > 365) {
      setError("Manual adjustment must be between -365 and 365 days.");
      return;
    }

    setIsSubmitting(true);
    const res = await updateEmployeeLeaveDays({
      employeeId: employee.id,
      totalDays: parsedTotal,
      usedDaysAdjustment: parsedAdjustment,
      note: note.trim(),
    });
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Failed to save. Please try again.");
      return;
    }
    onClose();
  };

  const handleReset = async () => {
    setError(null);
    setIsSubmitting(true);
    const res = await updateEmployeeLeaveDays({
      employeeId: employee.id,
      totalDays: null,
      resetToDefault: true,
    });
    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || "Failed to reset. Please try again.");
      return;
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Avatar src={employee.avatar} alt={employee.name} fallback={employee.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900">{employee.name}</p>
          <p className="text-[11px] text-slate-400">
            {employee.id} • {employee.department}
          </p>
        </div>
        {existingEntry ? (
          <Badge variant="orange" className="text-[10px] font-bold shrink-0">
            Custom Quota
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] shrink-0">
            Company Default
          </Badge>
        )}
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-slate-700">
          Leave taken / pending in system:
        </span>
        <strong className="text-orange-700 font-bold">{baseUsed} day(s)</strong>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label={`Personal Yearly Allocation (company default: ${defaultQuota})`}
          type="number"
          min={0}
          max={365}
          placeholder={String(defaultQuota)}
          value={totalDaysInput}
          onChange={(e) => setTotalDaysInput(e.target.value)}
          required
        />
        <Input
          label="Manual Adjustment to Used Days (e.g. -2 adds back, 3 deducts)"
          type="number"
          min={-365}
          max={365}
          value={adjustmentInput}
          onChange={(e) => setAdjustmentInput(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Reason / Audit Note
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Extra 5 days granted as recognition reward..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div className="rounded-xl bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs">
        <span className="text-slate-300">New Preview:</span>
        <span className="font-bold">
          {previewAvailable} of {parsedTotal} days left
          {parsedAdjustment !== 0 && (
            <span className="ml-1.5 text-slate-400 font-medium">
              (incl. manual {parsedAdjustment > 0 ? "+" : ""}
              {parsedAdjustment})
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        {existingEntry ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Default</span>
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Check className="h-4 w-4" />
            <span>{isSubmitting ? "Saving..." : "Save Leave Days"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

export function EditLeaveDaysModal({ open, employee, onClose }: EditLeaveDaysModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Individual Employee Leave Days"
      description="Super Admin only. Set a personal yearly allocation or adjust used days; this overrides the company-wide quota for this employee."
      size="md"
    >
      {open && employee && (
        <EditLeaveDaysForm employee={employee} onClose={onClose} />
      )}
      {!employee && (
        <div className="flex items-center gap-2 text-xs text-slate-500 p-3">
          <UserCog className="h-4 w-4" />
          <span>Select an employee to edit their leave days.</span>
        </div>
      )}
    </Modal>
  );
}
