"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading, isAuthenticated, isHydrated, isEmployeeView } =
    useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

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
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30 mb-3">
          <Sparkles className="h-6 w-6" />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
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

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-700">New Employee?</p>
            <p>
              Employees are onboarded exclusively by the Super Admin. Check your
              work email for the invitation link to set your password and activate
              your Employee Self-Service portal.
            </p>
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
    </div>
  );
}
