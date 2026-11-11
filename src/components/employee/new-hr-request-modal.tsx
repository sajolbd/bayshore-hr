"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useEmployee } from "@/context/employee-context";
import { EmployeeHRRequest } from "@/types/employee-portal";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface NewHRRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewHRRequestModal({ open, onClose }: NewHRRequestModalProps) {
  const { submitHRRequest } = useEmployee();

  const [formData, setFormData] = React.useState({
    type: "Salary Certificate" as EmployeeHRRequest["type"],
    subject: "",
    details: "",
  });

  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.subject.trim()) {
      setError("Please provide a concise subject for your request.");
      return;
    }

    if (!formData.details.trim()) {
      setError("Please provide specific details or purpose of your request.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitHRRequest(formData);
      setIsSubmitting(false);
      setSuccessMsg(res.message);

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setFormData({
          type: "Salary Certificate",
          subject: "",
          details: "",
        });
      }, 1200);
    }, 400);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit HR Service Request"
      description="Create an official ticket for People Operations & Administrative Services."
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

        <Select
          label="Request Type"
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              type: e.target.value as EmployeeHRRequest["type"],
            }))
          }
          options={[
            { label: "Salary Certificate", value: "Salary Certificate" },
            { label: "Experience Letter", value: "Experience Letter" },
            { label: "Document Attestation", value: "Document Attestation" },
            { label: "General HR Inquiry", value: "General HR Inquiry" },
            { label: "Attendance Correction", value: "Attendance Correction" },
          ]}
        />

        <Input
          label="Subject Line"
          placeholder="e.g. Salary Certificate addressed to Standard Chartered Bank"
          value={formData.subject}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, subject: e.target.value }))
          }
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Explanation & Purpose <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Please specify any particular bank name, loan reference, visa consulate requirements, or custom wording required..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            value={formData.details}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, details: e.target.value }))
            }
            required
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <strong className="text-slate-700 block font-medium mb-0.5">SLA Timeline:</strong>
          Standard certificates and letters are issued electronically within 24–48 business hours with official Bayshore Communication seal and digital signature.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
