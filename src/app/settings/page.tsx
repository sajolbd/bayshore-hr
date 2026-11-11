"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/context/toast-context";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { compressAvatarFile } from "@/lib/image-utils";
import {
  Shield,
  Building,
  Check,
  CalendarOff,
  ArrowRight,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react";

export default function SettingsPage() {
  const { showToast } = useToast();
  const { annualLeavePolicies, officeHolidays } = useHRMS();
  const { currentUser, isSuperAdmin, refreshSession } = useAuth();
  const [companyName, setCompanyName] = React.useState("Bayshore Communication");
  const [adminEmail, setAdminEmail] = React.useState(
    currentUser?.email || "shamim.bayshore@gmail.com"
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAdminAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const dataUrl = await compressAvatarFile(file);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: dataUrl }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(
          "Photo Update Failed",
          json.error || "Could not upload profile photo.",
          "error"
        );
        return;
      }
      await refreshSession();
      showToast(
        "Profile Photo Updated",
        "Your profile photo has been saved to MongoDB.",
        "success"
      );
    } catch (err) {
      showToast(
        "Photo Update Failed",
        err instanceof Error ? err.message : "Could not process image file.",
        "error"
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Gmail / SMTP Configuration state
  const [smtpConfigured, setSmtpConfigured] = React.useState(false);
  const [smtpHost, setSmtpHost] = React.useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = React.useState("587");
  const [smtpUser, setSmtpUser] = React.useState("");
  const [smtpPass, setSmtpPass] = React.useState("");
  const [hasSavedPass, setHasSavedPass] = React.useState(false);
  const [isEditingPass, setIsEditingPass] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);
  const [fromName, setFromName] = React.useState("Bayshore HR");
  const [testRecipient, setTestRecipient] = React.useState("");
  const [isSavingSmtp, setIsSavingSmtp] = React.useState(false);
  const [smtpFeedback, setSmtpFeedback] = React.useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    fetch("/api/settings/email", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            configured?: boolean;
            settings?: {
              smtpHost: string;
              smtpPort: number;
              smtpUser: string;
              fromName: string;
              hasPassword: boolean;
            };
          } | null
        ) => {
          if (!data || cancelled) return;
          setSmtpConfigured(Boolean(data.configured));
          if (data.settings) {
            setSmtpHost(data.settings.smtpHost || "smtp.gmail.com");
            setSmtpPort(String(data.settings.smtpPort || 587));
            setSmtpUser(data.settings.smtpUser || "");
            setFromName(data.settings.fromName || "Bayshore HR");
            setHasSavedPass(Boolean(data.settings.hasPassword));
          }
        }
      )
      .catch(() => {
        // ignore network load error
      });
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  const annualQuotaDays =
    annualLeavePolicies.find((p) => p.type === "Annual Leave")?.yearlyQuota ??
    20;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      "Settings Saved",
      "Organization preferences have been updated successfully.",
      "success"
    );
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpFeedback(null);
    setIsSavingSmtp(true);

    try {
      const res = await fetch("/api/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort: Number(smtpPort) || 587,
          smtpSecure: Number(smtpPort) === 465,
          smtpUser,
          smtpPass: isEditingPass || !hasSavedPass ? smtpPass : "",
          fromName,
          testRecipient: testRecipient.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setSmtpFeedback({
          ok: false,
          message: data.error || "Could not verify Gmail SMTP connection.",
        });
        setIsSavingSmtp(false);
        return;
      }

      setSmtpConfigured(true);
      setHasSavedPass(true);
      setIsEditingPass(false);
      setShowPass(false);
      setSmtpPass("");
      setSmtpFeedback({
        ok: true,
        message:
          data.message || "Gmail SMTP verified and saved! Real emails will now deliver.",
      });
      showToast(
        "Gmail SMTP Connected",
        data.message || "Employee invite emails will now deliver directly to Gmail.",
        "success"
      );
    } catch {
      setSmtpFeedback({
        ok: false,
        message: "Network error while saving SMTP settings.",
      });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System &amp; Company Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure organization identity, Gmail SMTP email delivery, and annual leave policies.
        </p>
      </div>

      {/* Gmail / SMTP Delivery Configuration (Super Admin Only) */}
      {isSuperAdmin && (
        <Card className="p-6 space-y-4 border-orange-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Gmail &amp; SMTP Email Delivery (Employee Invites)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Required so adding an employee sends a real activation link directly to their Gmail inbox.
                </p>
              </div>
            </div>
            <Badge
              variant={smtpConfigured ? "success" : "warning"}
              className="text-[11px] shrink-0"
            >
              {smtpConfigured ? "Connected (Real Inbox Ready)" : "Action Required: Not Connected"}
            </Badge>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">
              How to connect Gmail in 30 seconds:
            </p>
            <p>
              1. Open your Google Account → <strong>Security</strong> → Turn ON{" "}
              <strong>2-Step Verification</strong>.
            </p>
            <p>
              2. Search <strong>&ldquo;App passwords&rdquo;</strong> (myaccount.google.com/apppasswords) → Create app named <strong>Bayshore HR</strong> → copy the 16-character code.
            </p>
            <p>
              3. Enter your Gmail address + that 16-character App Password below and click <strong>Verify &amp; Save Gmail SMTP</strong>.
            </p>
          </div>

          {smtpFeedback && (
            <div
              className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                smtpFeedback.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {smtpFeedback.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              )}
              <span>{smtpFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveSmtp} autoComplete="off" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Sender Gmail / SMTP Email *"
                type="email"
                name="bayshore-smtp-sender"
                autoComplete="off"
                icon={<Mail className="h-4 w-4" />}
                placeholder="shamim.bayshore@gmail.com"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                required
              />
              {hasSavedPass && !isEditingPass ? (
                <div className="w-full space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-700">
                    Google 16-Digit App Password
                  </span>
                  <div className="flex h-9 items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Verified &amp; Encrypted in DB</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPass(true);
                        setSmtpPass("");
                      }}
                      className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="bayshore-gmail-app-pass"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Google 16-Digit App Password *
                    </label>
                    {hasSavedPass && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingPass(false);
                          setSmtpPass("");
                          setShowPass(false);
                        }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                      >
                        Keep saved
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      id="bayshore-gmail-app-pass"
                      name="bayshore-gmail-app-password"
                      autoComplete="new-password"
                      data-lpignore="true"
                      type={showPass ? "text" : "password"}
                      icon={<Lock className="h-4 w-4" />}
                      className="pr-9"
                      placeholder="abcd efgh ijkl mnop"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      required={!hasSavedPass || isEditingPass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((prev) => !prev)}
                      aria-label={showPass ? "Hide App Password" : "Show App Password"}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="SMTP Host"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
              <Input
                label="SMTP Port (587 TLS / 465 SSL)"
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
              />
              <Input
                label="Sender Display Name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <Input
                label="Send Test Email To (Optional)"
                type="email"
                icon={<Send className="h-4 w-4" />}
                placeholder="your-test@gmail.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingSmtp}
                  className="w-full sm:w-auto gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSavingSmtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying SMTP...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify &amp; Save Gmail SMTP</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building className="h-5 w-5 text-orange-600" />
            <h2 className="text-sm font-bold text-slate-900">Company Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Legal Name
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Contact / HR Admin Email
              </label>
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Security & Access */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Account Profile &amp; Access Control</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-3.5">
              <Avatar
                src={currentUser?.avatar}
                alt={currentUser?.name || "Admin"}
                fallback={(currentUser?.name || "AD").substring(0, 2).toUpperCase()}
                size="xl"
                className="h-14 w-14 rounded-2xl ring-2 ring-white shadow-sm"
              />
              <div className="space-y-0.5 text-xs text-slate-600">
                <p>
                  Signed in as: <strong className="text-slate-900">{currentUser?.name || "Admin"}</strong> ({currentUser?.role || "Super Admin"})
                </p>
                <p className="text-slate-500">
                  Role permissions: Full Admin (Employees, Payroll, Approvals, System Config)
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAdminAvatarUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="gap-1.5 bg-white"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
                <span>{isUploadingAvatar ? "Uploading..." : "Change Profile Photo"}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Annual Leave Quota Policy Shortcut */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <CalendarOff className="h-5 w-5 text-orange-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Yearly Leave Quotas &amp; Fixed Holidays
                </h2>
                <p className="text-[11px] text-slate-500">
                  Fixed annual employee leave allowances and automatic balance deductions are managed in Leave Management.
                </p>
              </div>
            </div>
            <Link
              href="/leaves"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline shrink-0"
            >
              <span>Configure in Leave Management</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="orange" className="font-semibold">
              Annual Leave: {annualQuotaDays} Days / Year
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              {officeHolidays.length} Fixed Office Holidays
            </Badge>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
            <Check className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
