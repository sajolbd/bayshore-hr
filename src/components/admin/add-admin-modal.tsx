"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAdmin } from "@/context/admin-context";
import { AdminRole } from "@/types";
import { ShieldCheck, Mail, User, Building, Lock, KeyRound, Eye, EyeOff } from "lucide-react";

export function AddAdminModal() {
  const { isAddAdminModalOpen, setIsAddAdminModalOpen, addAdminUser } = useAdmin();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "HR Admin" as AdminRole,
    department: "People Operations",
    twoFactorEnabled: true,
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Admin full name is required";
    if (!formData.email.trim() || !formData.email.includes("@"))
      errs.email = "Valid corporate email is required";
    if (!formData.password || formData.password.length < 6)
      errs.password = "Console password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addAdminUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        avatar: `https://images.unsplash.com/photo-${1507003211169 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
        status: "Active",
        twoFactorEnabled: formData.twoFactorEnabled,
        permissions:
          formData.role === "Super Admin"
            ? ["all_access"]
            : formData.role === "HR Admin"
            ? ["employee_crud", "attendance_override", "leave_approve"]
            : formData.role === "Payroll Admin"
            ? ["payroll_disburse", "tax_calculate"]
            : ["audit_logs_read"],
      });

      setIsSubmitting(false);
      setIsAddAdminModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "HR Admin",
        department: "People Operations",
        twoFactorEnabled: true,
      });
      setShowPassword(false);
      setErrors({});
    }, 450);
  };

  return (
    <Modal
      isOpen={isAddAdminModalOpen}
      onClose={() => setIsAddAdminModalOpen(false)}
      title="Create New Administrator Credentials"
      description="Assign console roles, initial password, and system privileges for Bayshore Communication."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Administrator Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            icon={<User className="h-4 w-4" />}
            placeholder="e.g. Tanvir Ahmed"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Corporate Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            icon={<Mail className="h-4 w-4" />}
            placeholder="tanvir.a@bayshore.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Role &amp; Tier
            </label>
            <Select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as AdminRole })
              }
            >
              <option value="Super Admin">Super Admin (Full Access)</option>
              <option value="HR Admin">HR Admin (Employees &amp; Leaves)</option>
              <option value="Payroll Admin">Payroll Admin (Compensation)</option>
              <option value="Compliance Auditor">Compliance Auditor (Read-Only)</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department
            </label>
            <Input
              icon={<Building className="h-4 w-4" />}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
        </div>

        {/* Password and Confirm Password Fields */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-orange-600" />
              Console Access Credentials
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] font-medium text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span>{showPassword ? "Hide" : "Show"} password</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Password <span className="text-red-500">*</span>
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                icon={<Lock className="h-4 w-4" />}
                placeholder="Min. 6 chars"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                icon={<Lock className="h-4 w-4" />}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* 2FA Checkbox */}
        <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/60 flex items-center gap-3">
          <Lock className="h-4 w-4 text-orange-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Enforce 2FA Authentication</span>
            <span className="text-slate-500">Requires OTP token verification on all console logins.</span>
          </div>
          <input
            type="checkbox"
            checked={formData.twoFactorEnabled}
            onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
            className="ml-auto h-4 w-4 accent-orange-600 rounded"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddAdminModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isSubmitting ? "Creating Admin..." : "Assign Privileges & Set Password"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
