"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useHRMS } from "@/context/hrms-context";
import { DepartmentItem } from "./edit-department-modal";
import { Users, Mail, MapPin } from "lucide-react";

interface DepartmentRosterModalProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DepartmentRosterModal({
  department,
  isOpen,
  onClose,
}: DepartmentRosterModalProps) {
  const { employees } = useHRMS();

  if (!department) return null;

  const rosterEmployees = employees.filter(
    (emp) =>
      emp.department?.toLowerCase() === department.name.toLowerCase() ||
      department.name.toLowerCase().includes(emp.department?.toLowerCase() || "")
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${department.name} Department Roster`}
      description={`Active staff members and organizational structure for ${department.name}.`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Department Overview Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-orange-50 border border-orange-200/60">
          <div className="flex items-center gap-3">
            <Avatar
              src={department.headAvatar}
              alt={department.head}
              fallback={department.head}
              size="md"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-600 block">
                Department Lead
              </span>
              <p className="text-sm font-bold text-slate-900">{department.head}</p>
              <p className="text-xs text-slate-600">{department.headRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Headcount</span>
              <span className="font-bold text-slate-900">{department.headcount} Total</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Open Roles</span>
              <span className="font-bold text-emerald-600">{department.openPositions} Hiring</span>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Assigned Team Members ({rosterEmployees.length})</span>
          </h4>

          {rosterEmployees.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No staff members explicitly mapped to {department.name} yet. New employees added to this department will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              {rosterEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={emp.avatar} alt={emp.name} fallback={emp.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                        <Badge variant={emp.status === "Active" ? "success" : "neutral"} className="text-[9px] px-1 py-0">
                          {emp.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{emp.role}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span>{emp.email}</span>
                    </span>
                    <span className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{emp.location || "Gulshan HQ"}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close Roster
          </Button>
        </div>
      </div>
    </Modal>
  );
}
