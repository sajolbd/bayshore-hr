"use client";

import * as React from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Department, Employee, InviteEmailResultDto } from "@/types";
import { getDefaultCartoonAvatar } from "@/lib/avatar";
import {
  DEFAULT_OFFICE_IN_TIME,
  DEFAULT_OFFICE_OUT_TIME,
  formatTime12h,
} from "@/lib/office-time";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Settings,
} from "lucide-react";

const FALLBACK_DEPARTMENT_NAMES = [
  "Engineering",
  "Product & Design",
  "Sales & Marketing",
  "Operations",
  "HR & People",
  "Finance & Legal",
];

export function AddEmployeeModal() {
  const { isAddEmployeeOpen, setIsAddEmployeeOpen, addEmployee, departments } =
    useHRMS();
  const { isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const departmentOptions = React.useMemo(() => {
    const names = departments.map((d) => d.name).filter(Boolean);
    return names.length > 0 ? names : FALLBACK_DEPARTMENT_NAMES;
  }, [departments]);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "Engineering" as Department,
    salary: "65000",
    location: "Gulshan HQ, Dhaka",
    joinDate: new Date().toISOString().slice(0, 10),
    officeInTime: DEFAULT_OFFICE_IN_TIME,
    officeOutTime: DEFAULT_OFFICE_OUT_TIME,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [inviteResult, setInviteResult] = React.useState<{
    employee: Employee;
    emailStatus?: InviteEmailResultDto;
  } | null>(null);

  if (!isSuperAdmin) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@"))
      errs.email = "Valid corporate email is required";
    if (!formData.role.trim()) errs.role = "Job designation is required";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    if (!formData.officeInTime) errs.officeInTime = "Office in time is required";
    if (!formData.officeOutTime)
      errs.officeOutTime = "Office out time is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetFormFields = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: departmentOptions[0] || "Engineering",
      salary: "65000",
      location: "Gulshan HQ, Dhaka",
      joinDate: new Date().toISOString().slice(0, 10),
      officeInTime: DEFAULT_OFFICE_IN_TIME,
      officeOutTime: DEFAULT_OFFICE_OUT_TIME,
    });
  };

  const resetAndClose = () => {
    setInviteResult(null);
    setSubmitError(null);
    setErrors({});
    resetFormFields();
    setIsAddEmployeeOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const res = await addEmployee({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      role: formData.role.trim(),
      department: formData.department,
      salary: Number(formData.salary) || 60000,
      location: formData.location.trim(),
      joinDate: formData.joinDate,
      officeInTime: formData.officeInTime || DEFAULT_OFFICE_IN_TIME,
      officeOutTime: formData.officeOutTime || DEFAULT_OFFICE_OUT_TIME,
      avatar: getDefaultCartoonAvatar(
        formData.name.trim() || formData.email.trim()
      ),
    });

    setIsSubmitting(false);

    if (!res.success || !res.employee) {
      setSubmitError(res.error || "Unable to add employee.");
      return;
    }

    setInviteResult({
      employee: res.employee,
      emailStatus: res.emailStatus,
    });
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast(
        "Link Copied",
        "Employee activation URL copied to clipboard.",
        "success"
      );
    } catch {
      showToast("Copy Failed", "Please copy the link manually.", "warning");
    }
  };

  return (
    <Modal
      isOpen={isAddEmployeeOpen}
      onClose={resetAndClose}
      title={
        inviteResult
          ? "Employee Added & Invitation Ready"
          : "Add & Invite New Employee"
      }
      description={
        inviteResult
          ? "Account created in MongoDB with assigned shift hours and email invitation verification."
          : "Super Admin onboarding: configure employee details, office in/out times, and send activation email."
      }
      size="lg"
    >
      {inviteResult ? (
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-xs ${
              inviteResult.emailStatus?.delivered
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                : "border-amber-200 bg-amber-50/80 text-amber-900"
            }`}
          >
            {inviteResult.emailStatus?.delivered ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">
                  {inviteResult.employee.name}
                </span>
                <Badge variant="orange" className="text-[10px]">
                  {inviteResult.employee.id}
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-white">
                  Shift:{" "}
                  {formatTime12h(inviteResult.employee.officeInTime)} –{" "}
                  {formatTime12h(
                    inviteResult.employee.officeOutTime,
                    "06:00 PM"
                  )}
                </Badge>
                <Badge
                  variant={
                    inviteResult.emailStatus?.delivered ? "success" : "warning"
                  }
                  className="text-[10px]"
                >
                  {inviteResult.emailStatus?.delivered
                    ? "Real Email Sent"
                    : "SMTP Not Configured"}
                </Badge>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {inviteResult.emailStatus?.message ||
                  `Invitation created for ${inviteResult.employee.email}.`}
              </p>
              {!inviteResult.emailStatus?.delivered && (
                <div className="pt-1">
                  <Link
                    href="/settings"
                    onClick={resetAndClose}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:underline"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Configure Gmail App Password in Settings →</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {inviteResult.emailStatus?.inviteUrl && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">
                Invitation Activation Link (48h Valid)
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteResult.emailStatus.inviteUrl}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-mono text-slate-700"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCopyLink(inviteResult.emailStatus!.inviteUrl)
                  }
                  className="gap-1.5 shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </Button>
              </div>

              {inviteResult.emailStatus.previewUrl && (
                <a
                  href={inviteResult.emailStatus.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-orange-600 font-semibold hover:underline pt-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Delivered Email Preview (Ethereal Mailbox)</span>
                </a>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInviteResult(null);
                resetFormFields();
              }}
            >
              Add Another Employee
            </Button>
            <Button
              type="button"
              onClick={resetAndClose}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                icon={<User className="h-4 w-4" />}
                placeholder="e.g. Tariq Hasan"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Email Address (Invite Recipient){" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                icon={<Mail className="h-4 w-4" />}
                placeholder="employee@gmail.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title / Designation <span className="text-red-500">*</span>
              </label>
              <Input
                icon={<Briefcase className="h-4 w-4" />}
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
              {errors.role && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.role}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <Select
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value as Department,
                  })
                }
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Compensation & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Gross Salary (BDT ৳)
              </label>
              <Input
                type="number"
                placeholder="65000"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                icon={<Phone className="h-4 w-4" />}
                placeholder="+880 17XX-XXXXXX"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Office In / Out Shift Schedule */}
          <div className="rounded-xl border border-orange-200/80 bg-orange-50/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-600" />
                <span>Office Shift Schedule (In / Out Time)</span>
              </span>
              <span className="text-[11px] text-red-600 font-semibold">
                Clock-in after In Time is marked RED in monthly reports
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Office In Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  icon={<Clock className="h-4 w-4 text-emerald-600" />}
                  value={formData.officeInTime}
                  onChange={(e) =>
                    setFormData({ ...formData, officeInTime: e.target.value })
                  }
                />
                {errors.officeInTime && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">
                    {errors.officeInTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Office Out Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  icon={<Clock className="h-4 w-4 text-orange-600" />}
                  value={formData.officeOutTime}
                  onChange={(e) =>
                    setFormData({ ...formData, officeOutTime: e.target.value })
                  }
                />
                {errors.officeOutTime && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">
                    {errors.officeOutTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location & Joining */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Office / Workplace
              </label>
              <Input
                icon={<MapPin className="h-4 w-4" />}
                placeholder="e.g. Gulshan HQ, Dhaka"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date
              </label>
              <Input
                type="date"
                icon={<Calendar className="h-4 w-4" />}
                value={formData.joinDate}
                onChange={(e) =>
                  setFormData({ ...formData, joinDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Add Employee &amp; Send Invite Email</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
