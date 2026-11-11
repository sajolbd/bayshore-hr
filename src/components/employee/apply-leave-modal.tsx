"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployee } from "@/context/employee-context";
import { LeaveType } from "@/types";
import { FileUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface ApplyLeaveModalProps {
  open: boolean;
  onClose: () => void;
}

function calculateInclusiveDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 1;
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
}

export function ApplyLeaveModal({ open, onClose }: ApplyLeaveModalProps) {
  const { leaveBalances, applyLeave } = useEmployee();

  const [formData, setFormData] = React.useState({
    type: "Annual Leave" as LeaveType,
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    days: 3,
    reason: "",
  });

  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedBalance = leaveBalances.find((b) => b.type === formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (formData.endDate < formData.startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please provide a brief reason for your leave request.");
      return;
    }

    if (formData.days <= 0) {
      setError("Number of leave days must be at least 1.");
      return;
    }

    setIsSubmitting(true);
    const res = await applyLeave(formData);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setFormData({
          type: "Annual Leave",
          startDate: "2026-11-20",
          endDate: "2026-11-22",
          days: 3,
          reason: "",
        });
      }, 900);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for Leave"
      description="Submit a new time-off request for manager approval."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Annual Leave Entitlement Summary */}
        {selectedBalance && (
          <div className="flex items-center justify-between text-xs text-slate-600 bg-orange-50/70 px-3.5 py-2.5 rounded-xl border border-orange-200">
            <div>
              <span className="font-bold text-slate-900 block">Annual Leave</span>
              <span className="text-[11px] text-slate-500">
                Days are automatically deducted from your yearly allowance
              </span>
            </div>
            <strong className="font-bold text-orange-600 shrink-0">
              {selectedBalance.available} of {selectedBalance.total} Days Left
            </strong>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const startDate = e.target.value;
              setFormData((prev) => ({
                ...prev,
                startDate,
                days: calculateInclusiveDays(startDate, prev.endDate),
              }));
            }}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => {
              const endDate = e.target.value;
              setFormData((prev) => ({
                ...prev,
                endDate,
                days: calculateInclusiveDays(prev.startDate, endDate),
              }));
            }}
            required
          />
        </div>

        <div>
          <Input
            label="Total Working Days"
            type="number"
            min={1}
            max={30}
            value={formData.days}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                days: parseInt(e.target.value) || 1,
              }))
            }
            required
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Leave <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Please detail reason for leave and handoff instructions..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            value={formData.reason}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reason: e.target.value }))
            }
            required
          />
        </div>

        {/* Attachment simulation */}
        <div className="rounded-xl border border-dashed border-slate-300 p-3 text-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
            <FileUp className="h-4 w-4 text-orange-600" />
            <span>Optional medical certificate or travel memo (PDF/JPG)</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Max 5MB • Encrypted document storage
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
