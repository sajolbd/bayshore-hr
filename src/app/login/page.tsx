"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2,
  Download,
  Apple,
  KeyRound,
  CheckCircle2,
  X,
} from "lucide-react";
import { BayshoreLogo } from "@/components/common/bayshore-logo";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading, isAuthenticated, isHydrated, isEmployeeView } =
    useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  const [isForgotOpen, setIsForgotOpen] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [forgotMessage, setForgotMessage] = React.useState("");
  const [forgotError, setForgotError] = React.useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setForgotError("Please enter a valid corporate email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Failed to process password reset.");
      } else {
        setForgotMessage(
          data.message ||
            "If an active account exists, a reset link has been sent to your email inbox."
        );
      }
    } catch {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(isEmployeeView ? "/employee/dashboard" : "/");
    }
  }, [isHydrated, isAuthenticated, isEmployeeView, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your corporate email and password.");
      return;
    }

    const res = await signIn(email, password);
    if (!res.success && res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-orange-100 selection:text-orange-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-3 flex justify-center">
          <BayshoreLogo size={56} className="shadow-md" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bayshore <span className="text-orange-600">HR</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Bayshore Communication • Unified HR &amp; Employee Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-6 sm:p-8 shadow-xl border-slate-200/90">
          <div className="pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-sm font-bold text-slate-900">
              Corporate Account Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign in with your verified Bayshore HR email and password.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <Input
                type="email"
                icon={<Mail className="h-4 w-4" />}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError("");
                    setForgotMessage("");
                    setIsForgotOpen(true);
                  }}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="••••••••"
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 shadow-sm shadow-orange-600/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In to Bayshore HR</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed space-y-3">
            <div className="space-y-1">
              <p className="font-semibold text-slate-700">New Employee?</p>
              <p>
                Employees are onboarded exclusively by the Super Admin. Check your
                work email for the invitation link to set your password and activate
                your Employee Self-Service portal.
              </p>
            </div>
            <a
              href="/downloads/Bayshore-HR.apk?v=1.0.6"
              download="Bayshore-HR.apk"
              className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/80 px-3.5 py-2.5 text-orange-800 hover:bg-orange-100/80 transition-colors"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <BayshoreLogo size={28} />
                <span className="min-w-0">
                  <span className="block font-bold text-xs text-slate-900 truncate">
                    Download Bayshore HR Android App
                  </span>
                  <span className="block text-[10px] text-orange-700 font-medium">
                    Bayshore-HR.apk • v1.0.6 (HR &amp; Attendance Portal)
                  </span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1.5 text-[11px] font-bold text-white shrink-0 shadow-2xs">
                <Download className="h-3.5 w-3.5" />
                <span>APK</span>
              </span>
            </a>

            <a
              href="/downloads/Bayshore-HR-iOS.zip"
              download="Bayshore-HR-iOS.zip"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5 text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Apple className="h-4 w-4" />
                </div>
                <span className="min-w-0">
                  <span className="block font-bold text-xs text-slate-900 truncate">
                    Download Bayshore HR iOS App
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium">
                    Bayshore-HR-iOS.zip • Swift &amp; SwiftUI (iOS 17+)
                  </span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white shrink-0 shadow-2xs">
                <Download className="h-3.5 w-3.5" />
                <span>iOS</span>
              </span>
            </a>
          </div>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-slate-400" />
            HttpOnly JWT Auth
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3 text-slate-400" />
            Bayshore Communication
          </span>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setIsForgotOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Forgot Your Password?
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your registered email to reset your credentials.
                </p>
              </div>
            </div>

            {forgotMessage ? (
              <div className="space-y-4 py-2">
                <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block font-bold">Email Sent</strong>
                    <p>{forgotMessage}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsForgotOpen(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Email Address
                  </label>
                  <Input
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    A secure password reset link valid for 1 hour will be sent.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsForgotOpen(false)}
                    disabled={forgotLoading}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-3.5 w-3.5" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
