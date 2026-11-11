"use client";

import * as React from "react";
import { AdminRole, AdminUser, AuditLog, SystemSettings } from "@/types";
import { initialSystemSettings } from "@/data/admin-mock-data";
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";

interface AdminContextValue {
  adminUsers: AdminUser[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  activeRole: AdminRole;
  setActiveRole: (role: AdminRole) => void;
  addAdminUser: (admin: Omit<AdminUser, "id" | "lastLogin">) => Promise<void>;
  toggleAdminStatus: (id: string) => void;
  deleteAdminUser: (id: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  exportAuditLogs: () => void;
  isAddAdminModalOpen: boolean;
  setIsAddAdminModalOpen: (open: boolean) => void;
}

const AdminContext = React.createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const { isHydrated, isAuthenticated, currentRole, currentUser } = useAuth();

  const [adminUsers, setAdminUsers] = React.useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [settings, setSettings] = React.useState<SystemSettings>(
    initialSystemSettings
  );
  const [simulatedRole, setSimulatedRole] = React.useState<AdminRole>("Super Admin");
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isHydrated || !isAuthenticated || currentRole === "Employee") {
      return;
    }

    let cancelled = false;
    fetch("/api/admins", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { admins?: AdminUser[]; auditLogs?: AuditLog[] } | null) => {
        if (!data || cancelled) return;
        if (data.admins) setAdminUsers(data.admins);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      })
      .catch(() => {
        // ignore transient network errors
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, isAuthenticated, currentRole]);

  const activeRole: AdminRole =
    currentRole !== "Employee" ? currentRole : simulatedRole;

  const setActiveRole = (role: AdminRole) => {
    setSimulatedRole(role);
  };

  const addAdminUser = async (data: Omit<AdminUser, "id" | "lastLogin">) => {
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await res.json().catch(() => ({}))) as {
        admin?: AdminUser;
        error?: string;
      };

      if (!res.ok || !result.admin) {
        showToast(
          "Operation Failed",
          result.error || "Unable to create administrator account.",
          "error"
        );
        return;
      }

      setAdminUsers((prev) => [...prev, result.admin!]);
      showToast(
        "Administrator Added",
        `${result.admin.name} has been granted ${result.admin.role} privileges.`,
        "success"
      );
    } catch {
      showToast("Network Error", "Could not save administrator account.", "error");
    }
  };

  const toggleAdminStatus = (id: string) => {
    const admin = adminUsers.find((a) => a.id === id);
    if (!admin) return;
    const newStatus = admin.status === "Active" ? "Suspended" : "Active";
    setAdminUsers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    showToast(
      `Admin Account ${newStatus}`,
      `${admin.name}'s console access has been ${newStatus.toLowerCase()}.`,
      newStatus === "Active" ? "success" : "warning"
    );
  };

  const deleteAdminUser = (id: string) => {
    const admin = adminUsers.find((a) => a.id === id);
    if (!admin) return;

    if (admin.id === "ADM-001") {
      showToast(
        "Operation Blocked",
        "Cannot delete the root Super Administrator account.",
        "error"
      );
      return;
    }

    setAdminUsers((prev) => prev.filter((a) => a.id !== id));
    showToast(
      "Admin Removed",
      `${admin.name} was revoked of administrative privileges.`,
      "warning"
    );
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    const actorName = currentUser?.name || "Super Admin";
    const actorAvatar = currentUser?.avatar || "";
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        adminName: actorName,
        adminAvatar: actorAvatar,
        action: "Updated system governance settings",
        target: "Bayshore HR Master Configuration",
        category: "HR Governance",
        ipAddress: "Server Policy",
        location: "Dhaka, Bangladesh",
        timestamp: "Just now",
        severity: "info",
      },
      ...prev,
    ]);
    showToast(
      "System Settings Updated",
      "Organization configuration and security policies saved.",
      "success"
    );
  };

  const exportAuditLogs = () => {
    const headers =
      "Log ID,Admin,Action,Target,Category,IP Address,Location,Timestamp,Severity\n";
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.id}","${l.adminName}","${l.action}","${l.target}","${l.category}","${l.ipAddress}","${l.location}","${l.timestamp}","${l.severity}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BayshoreHR_AuditLogs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      "Audit Logs Exported",
      "Downloaded security audit logs in CSV format.",
      "success"
    );
  };

  return (
    <AdminContext.Provider
      value={{
        adminUsers,
        auditLogs,
        settings,
        activeRole,
        setActiveRole,
        addAdminUser,
        toggleAdminStatus,
        deleteAdminUser,
        updateSettings,
        exportAuditLogs,
        isAddAdminModalOpen,
        setIsAddAdminModalOpen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
