"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useHRMS } from "@/context/hrms-context";
import { AlertTriangle, Trash2 } from "lucide-react";

export function DeleteEmployeeModal() {
  const {
    employeeToDelete,
    isDeleteEmployeeOpen,
    closeDeleteEmployee,
    deleteEmployee,
  } = useHRMS();

  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!employeeToDelete) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteEmployee(employeeToDelete.id);
    setIsDeleting(false);
    closeDeleteEmployee();
  };

  return (
    <Modal
      isOpen={isDeleteEmployeeOpen}
      onClose={closeDeleteEmployee}
      title="Delete Employee Record"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 border border-red-200/60 text-red-800">
          <div className="p-2 rounded-lg bg-red-100 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold">Are you sure you want to proceed?</p>
            <p className="mt-0.5 text-red-600">
              This action cannot be undone. This employee will be removed from Bayshore active staff and payroll.
            </p>
          </div>
        </div>

        {/* Target Employee card */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
          <Avatar
            src={employeeToDelete.avatar}
            alt={employeeToDelete.name}
            fallback={employeeToDelete.name}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {employeeToDelete.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {employeeToDelete.role} • {employeeToDelete.department}
            </p>
            <span className="text-[10px] font-mono text-slate-400">
              ID: {employeeToDelete.id}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={closeDeleteEmployee}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? "Deleting..." : "Confirm & Delete"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
