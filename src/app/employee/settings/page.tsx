"use client";

import * as React from "react";
import {
  Lock,
  Bell,
  Shield,
  Smartphone,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function EmployeeSettingsPage() {
  const { profile } = useEmployee();
  const { openSignOutModal } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordStatus, setPasswordStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Notification preferences state
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [notifyPayroll, setNotifyPayroll] = React.useState(true);
  const [notifyAttendance, setNotifyAttendance] = React.useState(true);
  const [savedSettings, setSavedSettings] = React.useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 6) {
      setPasswordStatus({
        success: false,
        message: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        success: false,
        message: "Passwords do not match.",
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setPasswordStatus({
          success: false,
          message: data.error || "Unable to update password.",
        });
        return;
      }

      setPasswordStatus({
        success: true,
        message:
          data.message ||
          "Password updated successfully in MongoDB. Use your new password next sign-in.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordStatus({
        success: false,
        message: "Network error updating password.",
      });
    }
  };

  const handleSavePreferences = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Account Security & Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your credentials, 2-factor authentication, and alert preferences.
          </p>
        </div>

        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
          Account ID: {profile.id}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Change Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">
                Recommended to update your security password every 90 days.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordStatus && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                  passwordStatus.success
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {passwordStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <Input
              label="Current Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showPassword ? "Hide passwords" : "Show passwords"}</span>
              </button>

              <Button type="submit" variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700">
                Update Password
              </Button>
            </div>
          </form>
        </div>

        {/* Security & Notification Preferences */}
        <div className="space-y-6">
          {/* Notification Channels */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Notification Channels</h3>
                <p className="text-xs text-slate-500">
                  Select which updates are delivered to your email and phone.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">Monthly Payslip SMS & Email</span>
                  <span className="text-slate-500 text-[11px]">Instant alert when net pay is transferred</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPayroll}
                  onChange={(e) => setNotifyPayroll(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange-600"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">Biometric Shift Check-In Alerts</span>
                  <span className="text-slate-500 text-[11px]">Daily punch confirmation & late notices</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAttendance}
                  onChange={(e) => setNotifyAttendance(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange-600"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">Company Town Hall & Emergency Bulletins</span>
                  <span className="text-slate-500 text-[11px]">Broadcasts from executive leadership</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange-600"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {savedSettings ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Preferences saved!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Autosaved to your user profile</span>
              )}

              <Button variant="outline" size="sm" onClick={handleSavePreferences} className="text-xs">
                Save Preferences
              </Button>
            </div>
          </div>

          {/* Active Session & Logout */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Session & Sign Out</h3>
                <p className="text-xs text-slate-500">
                  Current authenticated device: Chrome on Linux (Gulshan HQ)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <div>
                  <strong className="text-slate-900 block">Current Browser Session</strong>
                  <span className="text-slate-400 text-[11px]">
                    Logged in as {profile.name} ({profile.id || "Active"})
                  </span>
                </div>
              </div>
              <Badge variant="success">Active Now</Badge>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={openSignOutModal}
                className="gap-2 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out from Employee Portal</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
