"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useEmployee } from "@/context/employee-context";
import { ClaimCategory } from "@/types/employee-portal";
import {
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const claimCategories: ClaimCategory[] = [
  "Travel & Mileage",
  "Meals & Entertainment",
  "Medical & Wellness",
  "Mobile & Internet",
  "Office Supplies",
  "Training & Certification",
  "Client Hospitality",
];

export function NewClaimModal({ isOpen, onClose }: NewClaimModalProps) {
  const { submitClaim } = useEmployee();

  const [formData, setFormData] = React.useState({
    title: "",
    category: "Travel & Mileage" as ClaimCategory,
    amount: "",
    dateIncurred: "2026-11-08",
    merchantName: "",
    receiptFileName: "",
    description: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [receiptAttached, setReceiptAttached] = React.useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "Claim title is required";
    if (!formData.amount || Number(formData.amount) <= 0)
      errs.amount = "Valid claim amount in ৳ BDT is required";
    if (!formData.merchantName.trim())
      errs.merchantName = "Vendor or merchant name is required";
    if (!formData.description.trim())
      errs.description = "Business purpose or justification is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await submitClaim({
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      dateIncurred: formData.dateIncurred,
      merchantName: formData.merchantName,
      receiptFileName: formData.receiptFileName || "Attached_Receipt.pdf",
      description: formData.description,
    });

    setIsSubmitting(false);
    onClose();
    setFormData({
      title: "",
      category: "Travel & Mileage",
      amount: "",
      dateIncurred: "2026-11-08",
      merchantName: "",
      receiptFileName: "",
      description: "",
    });
    setReceiptAttached(false);
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit New Expense Claim (e-Claim)"
      description="Submit your out-of-pocket business expense or entitlement reimbursement for management approval."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Claim Title / Summary *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Client Dinner at Westin, Uber Ride to AWS Summit"
            className="text-xs"
            required
          />
          {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Category *
            </label>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as ClaimCategory })
              }
              className="text-xs"
            >
              {claimCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount in Bangladeshi Taka (৳ BDT) *
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 4500"
              className="text-xs"
              required
            />
            {errors.amount && <p className="text-[11px] text-red-600 mt-1">{errors.amount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date Incurred *
            </label>
            <Input
              type="date"
              value={formData.dateIncurred}
              onChange={(e) => setFormData({ ...formData, dateIncurred: e.target.value })}
              className="text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Merchant / Vendor Name *
            </label>
            <Input
              value={formData.merchantName}
              onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
              placeholder="e.g. Uber, Amber IT, United Hospital"
              className="text-xs"
              required
            />
            {errors.merchantName && (
              <p className="text-[11px] text-red-600 mt-1">{errors.merchantName}</p>
            )}
          </div>
        </div>

        {/* Receipt Upload / Attachment (HR.my feature) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Digital Receipt / Tax Invoice Proof
          </label>
          <div
            onClick={() => {
              setReceiptAttached(true);
              setFormData({
                ...formData,
                receiptFileName: `Receipt_${formData.merchantName || "Voucher"}_Nov2026.pdf`,
              });
            }}
            className="border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors"
          >
            {receiptAttached ? (
              <div className="flex items-center justify-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  {formData.receiptFileName} attached (Click to change)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                <UploadCloud className="h-6 w-6 text-slate-400" />
                <span className="text-xs font-semibold text-slate-800">
                  Click to attach receipt or tax voucher (PDF, PNG, JPG)
                </span>
                <span className="text-[10px] text-slate-400">Max size 10MB per claim</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Business Purpose &amp; Justification *
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Explain the business reason for this expense..."
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            required
          />
          {errors.description && (
            <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
          >
            {isSubmitting ? "Submitting..." : "Submit Claim for Approval"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
