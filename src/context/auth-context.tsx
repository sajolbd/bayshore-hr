"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminUser } from "@/types";
import { useToast } from "./toast-context";

export type UserRole =
  | "Super Admin"
  | "HR Admin"
  | "Payroll Admin"
  | "Compliance Auditor"
  | "Employee";

export interface SystemUser extends Omit<AdminUser, "role"> {
  employeeId?: string;
  role: UserRole;
  designation?: string;
  isEmployee?: boolean;
}

interface AuthContextValue {
  currentUser: SystemUser | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  isEmployeeView: boolean;
  isSuperAdmin: boolean;
  refreshSession: () => Promise<SystemUser | null>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isSignOutModalOpen: boolean;
  setIsSignOutModalOpen: (open: boolean) => void;
  openSignOutModal: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function mapApiUser(apiUser: {
  id?: string;
  employeeId?: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department: string;
  designation?: string;
  status?: string;
}): SystemUser {
  return {
    id: apiUser.employeeId || apiUser.id || "USER",
    employeeId: apiUser.employeeId,
    name: apiUser.name,
    email: apiUser.email,
    avatar:
      apiUser.avatar ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: apiUser.role,
    department: apiUser.department,
    designation: apiUser.designation,
    permissions:
      apiUser.role === "Super Admin"
        ? ["all_access", "employee_invite", "billing_manage", "user_manage"]
        : ["self_service"],
    lastLogin: "Active Session",
    status: apiUser.status === "Suspended" ? "Suspended" : "Active",
    twoFactorEnabled: true,
    isEmployee: apiUser.role === "Employee",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = React.useState<SystemUser | null>(null);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] =
    React.useState<boolean>(false);

  const refreshSession = React.useCallback(async (): Promise<SystemUser | null> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setCurrentUser(null);
        setIsHydrated(true);
        return null;
      }
      const data = (await res.json()) as {
        authenticated: boolean;
        user: Parameters<typeof mapApiUser>[0] | null;
      };
      if (data.authenticated && data.user) {
        const mapped = mapApiUser(data.user);
        setCurrentUser(mapped);
        setIsHydrated(true);
        return mapped;
      }
      setCurrentUser(null);
      setIsHydrated(true);
      return null;
    } catch {
      setCurrentUser(null);
      setIsHydrated(true);
      return null;
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            authenticated?: boolean;
            user?: Parameters<typeof mapApiUser>[0] | null;
          } | null
        ) => {
          if (cancelled) return;
          if (data?.authenticated && data.user) {
            setCurrentUser(mapApiUser(data.user));
          } else {
            setCurrentUser(null);
          }
          setIsHydrated(true);
        }
      )
      .catch(() => {
        if (!cancelled) {
          setCurrentUser(null);
          setIsHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticated = currentUser !== null;
  const currentRole: UserRole = currentUser?.role || "Employee";
  const isEmployeeView = currentRole === "Employee";
  const isSuperAdmin = currentRole === "Super Admin";

  const openSignOutModal = () => setIsSignOutModalOpen(true);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        user?: Parameters<typeof mapApiUser>[0];
        error?: string;
      };

      setIsLoading(false);

      if (!res.ok || !data.user) {
        return {
          success: false,
          error: data.error || "Invalid credentials. Please try again.",
        };
      }

      const mapped = mapApiUser(data.user);
      setCurrentUser(mapped);

      showToast(
        `Welcome, ${mapped.name}!`,
        `Signed in as ${mapped.role} (${mapped.department}).`,
        "success"
      );

      if (mapped.role === "Employee") {
        router.push("/employee/dashboard");
      } else {
        router.push("/");
      }

      return { success: true };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        error: "Network error while signing in. Please try again.",
      };
    }
  };

  const signOut = async () => {
    setIsSignOutModalOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network error during logout cleanup
    }
    setCurrentUser(null);
    showToast("Signed Out", "You have been logged out of Bayshore HR.", "info");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        isHydrated,
        isLoading,
        isEmployeeView,
        isSuperAdmin,
        refreshSession,
        signIn,
        signOut,
        isSignOutModalOpen,
        setIsSignOutModalOpen,
        openSignOutModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
