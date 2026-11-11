"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useHRMS } from "@/context/hrms-context";
import { LeaveType } from "@/types";
import { AlertCircle, CalendarMinus } from "lucide-react";

interface RecordLeaveModalProps {
  open: boolean;
  initialEmployeeId?: string;
  onClose: () => void;
}

function calculateDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 1;
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
}

function RecordLeaveForm({
  initialEmployeeId,
  onClose,
}: {
  initialEmployeeId?: string;
  onClose: () => void;
}) {
  const { employees, getEmployeeLeaveBalances, addAdminLeaveRecord } = useHRMS();

  const defaultEmpId = initialEmployeeId || employees[0]?.id || "EMP-1042";
  const [employeeId, setEmployeeId] = React.useState(defaultEmpId);
  const leaveType: LeaveType = "Annual Leave";
  const [startDate, setStartDate] = React.useState("2026-11-15");
  const [endDate, setEndDate] = React.useState("2026-11-16");
  const [days, setDays] = React.useState(2);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const balances = getEmployeeLeaveBalances(employeeId);
  const selectedBalance = balances.find((b) => b.type === leaveType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (endDate < startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (days <= 0) {
      setError("Leave duration must be at least 1 day.");
      return;
    }

    if (!reason.trim()) {
      setError("Please enter a short note or approval reason.");
      return;
    }

    setIsSubmitting(true);
    const res = await addAdminLeaveRecord({
      employeeId,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason.trim(),
    });
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
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

      <Select
        label="Employee"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        options={employees.map((emp) => ({
          label: `${emp.name} (${emp.id} • ${emp.department})`,
          value: emp.id,
        }))}
      />

      {selectedBalance && (
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200">
          <span>
            Remaining <strong className="text-slate-900">Annual Leave</strong> Balance:
          </span>
          <strong className="text-orange-600 font-bold">
            {selectedBalance.available} of {selectedBalance.total} Days Left
          </strong>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            const val = e.target.value;
            setStartDate(val);
            setDays(calculateDays(val, endDate));
          }}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => {
            const val = e.target.value;
            setEndDate(val);
            setDays(calculateDays(startDate, val));
          }}
          required
        />
        <Input
          label="Days to Deduct"
          type="number"
          min={1}
          max={90}
          value={days}
          onChange={(e) => setDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Reason / Admin Note <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Approved personal leave or emergency absence logged by HR..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          required
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <CalendarMinus className="h-4 w-4" />
          <span>{isSubmitting ? "Saving..." : "Approve & Deduct Days"}</span>
        </Button>
      </div>
    </form>
  );
}

export function RecordLeaveModal({
  open,
  initialEmployeeId,
  onClose,
}: RecordLeaveModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record & Deduct Employee Leave"
      description="Log an approved leave entry directly for an employee. Remaining yearly balance decreases immediately."
      size="md"
    >
      {open && (
        <RecordLeaveForm
          initialEmployeeId={initialEmployeeId}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

