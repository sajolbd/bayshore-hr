"use client";

import * as React from "react";
import { Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";

export function PageHeader() {
  const { setIsAddEmployeeOpen, setIsExportModalOpen } = useHRMS();
  const { currentUser, isSuperAdmin } = useAuth();

  const firstName = currentUser?.name?.split(" ")[0] || "Admin";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Good morning, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Bayshore Communication • Real-time workforce &amp; attendance telemetry.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="outline"
          onClick={() => setIsExportModalOpen(true)}
          className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export Report</span>
        </Button>

        {isSuperAdmin && (
          <Button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm shadow-orange-600/25"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </Button>
        )}
      </div>
    </div>
  );
}
