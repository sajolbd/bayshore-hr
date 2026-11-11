"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useHRMS } from "@/context/hrms-context";
import { AnnualLeavePolicyItem } from "@/types";
import { SlidersHorizontal, Check, RotateCcw } from "lucide-react";
import { initialAnnualLeavePolicies } from "@/data/mock-data";

interface LeavePolicyModalProps {
  open: boolean;
  onClose: () => void;
}

function LeavePolicyForm({ onClose }: { onClose: () => void }) {
  const { annualLeavePolicies, updateAnnualLeavePolicies } = useHRMS();
  const [draftPolicies, setDraftPolicies] = React.useState<AnnualLeavePolicyItem[]>(
    annualLeavePolicies
  );

  const handleQuotaChange = (index: number, value: string) => {
    const parsed = Math.max(0, Math.min(365, parseInt(value, 10) || 0));
    setDraftPolicies((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, yearlyQuota: parsed } : item
      )
    );
  };

  const handleCarryForwardChange = (index: number, value: string) => {
    const parsed = Math.max(0, Math.min(60, parseInt(value, 10) || 0));
    setDraftPolicies((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, carryForwardMax: parsed } : item
      )
    );
  };

  const standardPaidTotal = draftPolicies.reduce(
    (acc, p) => acc + p.yearlyQuota,
    0
  );

  const handleResetDefaults = () => {
    setDraftPolicies(initialAnnualLeavePolicies);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnualLeavePolicies(draftPolicies);
    onClose();
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-orange-600" />
          <span className="font-semibold text-slate-900">
            Fixed Annual Paid Leave per Employee:
          </span>
        </div>
        <Badge variant="orange" className="text-xs font-bold px-2.5 py-0.5">
          {standardPaidTotal} Days / Year
        </Badge>
      </div>

      <div className="space-y-3">
        {draftPolicies.map((policy, idx) => (
          <div
            key={policy.type}
            className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: policy.color }}
                />
                <span className="text-xs font-bold text-slate-900">
                  {policy.type}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {policy.paid ? "Paid" : "Unpaid"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {policy.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-28">
                <Input
                  label="Days / Year"
                  type="number"
                  min={0}
                  max={365}
                  value={policy.yearlyQuota}
                  onChange={(e) => handleQuotaChange(idx, e.target.value)}
                  required
                />
              </div>
              <div className="w-28">
                <Input
                  label="Carry Forward"
                  type="number"
                  min={0}
                  max={60}
                  value={policy.carryForwardMax}
                  onChange={(e) =>
                    handleCarryForwardChange(idx, e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResetDefaults}
          className="gap-1.5 text-xs text-slate-500"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Default (20 Days/Yr)</span>
        </Button>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Check className="h-4 w-4" />
            <span>Save Yearly Quotas</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

export function LeavePolicyModal({ open, onClose }: LeavePolicyModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yearly Leave Quota Policy"
      description="Configure fixed yearly leave days per employee. Updating quotas recalculates all remaining balances across both Admin and Employee portals."
      size="lg"
    >
      {open && <LeavePolicyForm onClose={onClose} />}
    </Modal>
  );
}

