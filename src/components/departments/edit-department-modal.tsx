"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { Building2, User, Briefcase, Users, DollarSign, Loader2 } from "lucide-react";

export interface DepartmentItem {
  id: string;
  name: string;
  head: string;
  headRole: string;
  headAvatar?: string;
  headcount: number;
  openPositions: number;
  budget: number;
  color?: string;
}

interface EditDepartmentModalProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: DepartmentItem) => void;
}

export function EditDepartmentModal({
  department,
  isOpen,
  onClose,
  onSuccess,
}: EditDepartmentModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = React.useState({
    name: department?.name || "",
    head: department?.head || "",
    headRole: department?.headRole || "",
    headcount: department?.headcount || 0,
    openPositions: department?.openPositions || 0,
    budget: department?.budget || 0,
    color: department?.color || "orange",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!department) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.head.trim() || !formData.headRole.trim()) {
      setError("Please fill in Department Name, Lead Name, and Role.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/departments/${department.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          head: formData.head.trim(),
          headRole: formData.headRole.trim(),
          headcount: Number(formData.headcount) || 0,
          openPositions: Number(formData.openPositions) || 0,
          budget: Number(formData.budget) || 0,
          color: formData.color,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update department.");
      }

      showToast("Department Updated", `${formData.name} updated successfully.`, "success");
      onSuccess(data.department);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error updating department";
      setError(msg);
      showToast("Update Failed", msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${department.name} Department`}
      description="Update leadership, open positions, target headcount, and annual operational budget."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-orange-600" />
            <span>Department Name</span>
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Engineering"
            required
            className="h-9 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-orange-600" />
              <span>Department Head / Lead</span>
            </label>
            <Input
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              placeholder="e.g. Marcus Vance"
              required
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-orange-600" />
              <span>Lead Title</span>
            </label>
            <Input
              value={formData.headRole}
              onChange={(e) => setFormData({ ...formData, headRole: e.target.value })}
              placeholder="e.g. VP of Engineering"
              required
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span>Headcount</span>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.headcount}
              onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) || 0 })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              <span>Open Roles</span>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.openPositions}
              onChange={(e) => setFormData({ ...formData, openPositions: parseInt(e.target.value) || 0 })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-orange-600" />
              <span>Annual Budget (৳)</span>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Department</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
