"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useEmployee } from "@/context/employee-context";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AttendanceCorrectionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AttendanceCorrectionModal({
  open,
  onClose,
}: AttendanceCorrectionModalProps) {
  const { submitAttendanceCorrection } = useEmployee();

  const [formData, setFormData] = React.useState({
    date: "2026-11-04",
    punchType: "Check-in Punch",
    correctTime: "09:00 AM",
    reason: "",
  });

  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.reason.trim()) {
      setError("Please explain the reason for the missing or incorrect punch.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitAttendanceCorrection(formData);
      setIsSubmitting(false);
      setSuccessMsg(res.message);

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setFormData({
          date: "2026-11-04",
          punchType: "Check-in Punch",
          correctTime: "09:00 AM",
          reason: "",
        });
      }, 1200);
    }, 400);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attendance Correction Request"
      description="Submit a miss-punch or biometrics correction to your reporting manager."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Correction Date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
          />
          <Select
            label="Punch Type"
            value={formData.punchType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, punchType: e.target.value }))
            }
            options={[
              { label: "Check-in Punch", value: "Check-in Punch" },
              { label: "Check-out Punch", value: "Check-out Punch" },
              { label: "Both (Full Day Out-of-Office)", value: "Both" },
            ]}
          />
        </div>

        <Input
          label="Actual / Requested Punch Time"
          placeholder="e.g. 09:15 AM"
          value={formData.correctTime}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, correctTime: e.target.value }))
          }
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Justification <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Client visit at Mohakhali DOHS data center; biometric terminal was offline at Level 11..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            value={formData.reason}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reason: e.target.value }))
            }
            required
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-900">Verification Policy</div>
          <p>
            Corrections must be filed within 5 working days and require one-click approval by Marcus Vance (VP of Engineering).
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
