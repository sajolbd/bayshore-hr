"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
} from "lucide-react";
import { BayshoreLogo } from "@/components/common/bayshore-logo";

interface InviteEmployeeInfo {
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { refreshSession } = useAuth();
  const { showToast } = useToast();

  const [checking, setChecking] = React.useState(true);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [employee, setEmployee] = React.useState<InviteEmployeeInfo | null>(null);

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetch(`/api/auth/accept-invite?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          valid?: boolean;
          employee?: InviteEmployeeInfo;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.valid || !data.employee) {
          setInviteError(
            data.error || "This invitation link is invalid or expired."
          );
        } else {
          setEmployee(data.employee);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInviteError("Unable to verify invitation. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to activate your account.");
        setIsSubmitting(false);
        return;
      }

      await refreshSession();
      showToast(
        "Account Activated!",
        `Welcome to Bayshore Communication, ${employee?.name || ""}!`,
        "success"
      );
      router.push("/employee/dashboard");
    } catch {
      setFormError("Network error while activating account.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-3 flex justify-center">
          <BayshoreLogo size={56} className="shadow-md" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bayshore <span className="text-orange-600">HR</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Bayshore Communication • Employee Onboarding &amp; Password Setup
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-6 sm:p-8 shadow-xl border-slate-200/90">
          {!token ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Invitation Unavailable
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Invitation token is missing from the URL.
                </p>
              </div>
              <Link href="/login" className="block">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : checking ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-orange-600" />
              <p className="text-xs font-medium text-slate-500">
                Verifying your invitation link...
              </p>
            </div>
          ) : inviteError ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Invitation Unavailable
                </h2>
                <p className="text-xs text-slate-600 mt-1">{inviteError}</p>
              </div>
              <Link href="/login" className="block">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : employee ? (
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-orange-200 bg-orange-50/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">
                      {employee.name}
                    </span>
                    <Badge variant="orange" className="text-[10px]">
                      {employee.employeeId}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    {employee.email}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {employee.designation} • {employee.department}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Accept Invitation &amp; Set Password
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create a secure password to activate your Employee Self-Service portal.
                </p>
              </div>

              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Set Password &amp; Sign In</span>
                  </>
                )}
              </Button>
            </form>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Loader2 className="h-7 w-7 animate-spin text-orange-600" />
        </div>
      }
    >
      <AcceptInviteContent />
    </React.Suspense>
  );
}
