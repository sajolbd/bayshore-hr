"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useHRMS } from "@/context/hrms-context";
import { formatCurrency } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Building2,
  Edit,
  Trash2,
  Clock,
  ShieldCheck,
} from "lucide-react";

export function EmployeeDetailModal() {
  const {
    selectedEmployee,
    isViewEmployeeOpen,
    closeViewEmployee,
    openEditEmployee,
    openDeleteEmployee,
    attendanceRecords,
  } = useHRMS();

  if (!selectedEmployee) return null;

  const attendance = attendanceRecords.find(
    (att) => att.employeeId === selectedEmployee.id
  );

  return (
    <Modal
      isOpen={isViewEmployeeOpen}
      onClose={closeViewEmployee}
      title="Employee Profile Details"
      description={`Personnel record for ${selectedEmployee.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-4">
            <Avatar
              src={selectedEmployee.avatar}
              alt={selectedEmployee.name}
              fallback={selectedEmployee.name}
              size="xl"
              status="online"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedEmployee.name}
                </h3>
                <Badge
                  variant={
                    selectedEmployee.status === "Active"
                      ? "success"
                      : selectedEmployee.status === "On Leave"
                      ? "warning"
                      : "danger"
                  }
                  dot
                >
                  {selectedEmployee.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {selectedEmployee.role}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                <span>{selectedEmployee.id}</span>
                <span>•</span>
                <span className="text-orange-600 font-semibold font-sans">
                  {selectedEmployee.department}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                closeViewEmployee();
                openEditEmployee(selectedEmployee);
              }}
              className="gap-1.5 text-xs text-slate-700 hover:text-orange-600 hover:border-orange-200"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                closeViewEmployee();
                openDeleteEmployee(selectedEmployee);
              }}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Contact Details */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Mail className="h-3.5 w-3.5 text-orange-600" />
              <span>Contact Information</span>
            </h4>
            <div className="space-y-2 text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Work Email
                </span>
                <span className="font-medium text-slate-800">
                  {selectedEmployee.email}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Phone Number
                </span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {selectedEmployee.phone}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Workplace Location
                </span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {selectedEmployee.location}
                </span>
              </div>
            </div>
          </div>

          {/* Employment & Compensation */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Briefcase className="h-3.5 w-3.5 text-orange-600" />
              <span>Employment &amp; Compensation</span>
            </h4>
            <div className="space-y-2 text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Department
                </span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  {selectedEmployee.department}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Annual Base Salary
                </span>
                <span className="font-bold text-slate-900 text-sm font-mono flex items-center gap-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  {formatCurrency(selectedEmployee.salary)} / year
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Joining Date
                </span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {selectedEmployee.joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Log Snapshot */}
        {attendance && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
              <Clock className="h-3.5 w-3.5 text-orange-600" />
              <span>Today&apos;s Time Log &amp; Attendance</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Check-in</span>
                <span className="font-mono font-bold text-slate-800">{attendance.checkIn}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                <span className="font-semibold text-slate-800">{attendance.status}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Hours Logged</span>
                <span className="font-mono font-bold text-slate-800">{attendance.workHours}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={closeViewEmployee}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
