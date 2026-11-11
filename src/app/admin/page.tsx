"use client";

import * as React from "react";
import { useAdmin } from "@/context/admin-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Download,
  Building,
  KeyRound,
  Lock,
  Search,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Clock,
  MapPin,
  Cpu,
} from "lucide-react";
import { AdminRole } from "@/types";

export default function AdminPage() {
  const {
    adminUsers,
    auditLogs,
    settings,
    updateSettings,
    toggleAdminStatus,
    deleteAdminUser,
    exportAuditLogs,
    setIsAddAdminModalOpen,
    activeRole,
    setActiveRole,
  } = useAdmin();

  const [auditSearch, setAuditSearch] = React.useState("");
  const [governanceForm, setGovernanceForm] = React.useState({
    companyLegalName: settings.companyLegalName,
    companyTradeLicense: settings.companyTradeLicense,
    tinNumber: settings.tinNumber,
    headOfficeAddress: settings.headOfficeAddress,
    workingHours: settings.workingHours,
    twoFactorMandatory: settings.twoFactorMandatory,
    ipWhitelisting: settings.ipWhitelisting,
  });

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.adminName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.category.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.ipAddress.includes(auditSearch)
  );

  const handleSaveGovernance = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(governanceForm);
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case "Super Admin":
        return <Badge variant="orange">Super Admin</Badge>;
      case "HR Admin":
        return <Badge variant="info">HR Admin</Badge>;
      case "Payroll Admin":
        return <Badge variant="success">Payroll Admin</Badge>;
      case "Compliance Auditor":
        return <Badge variant="purple">Compliance Auditor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <Badge variant="danger" dot>Security Event</Badge>;
      case "warning":
        return <Badge variant="warning" dot>Audit Warning</Badge>;
      default:
        return <Badge variant="secondary">Standard Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administrative Control Console
            </h1>
            <Badge variant="orange" className="font-semibold text-[10px]">
              Root Console
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC), Bangladesh corporate governance, audit logs, and security enforcement.
          </p>
        </div>

        <Button
          onClick={() => setIsAddAdminModalOpen(true)}
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-medium"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Admin</span>
        </Button>
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Admins
            </span>
            <ShieldCheck className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{adminUsers.length} Staff</p>
          <p className="text-[11px] text-slate-400 mt-0.5">1 Super, 3 Delegated Roles</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              2FA Authentication
            </span>
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">100% Enforced</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Hardware &amp; OTP tokens required</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Default Currency
            </span>
            <span className="font-bold text-sm text-blue-600">BDT (৳)</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">Bangladeshi Taka</p>
          <p className="text-[11px] text-slate-400 mt-0.5">South Asian numbering system</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workweek Schedule
            </span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">Sun — Thu</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Fri &amp; Sat standard weekend</p>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="admins" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="admins">Administrators &amp; Privileges</TabsTrigger>
          <TabsTrigger value="audit">Security Audit Logs</TabsTrigger>
          <TabsTrigger value="governance">Corporate Governance</TabsTrigger>
          <TabsTrigger value="simulator">Role Simulator</TabsTrigger>
        </TabsList>

        {/* TAB 1: ADMINISTRATORS */}
        <TabsContent value="admins" className="space-y-4">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Assigned Tier</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Security Posture</TableHead>
                  <TableHead>Last Console Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={admin.avatar}
                          alt={admin.name}
                          fallback={admin.name}
                          size="sm"
                          status="online"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{admin.name}</p>
                          <p className="text-[11px] text-slate-400">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(admin.role)}</TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-700">
                        {admin.department}
                      </span>
                    </TableCell>
                    <TableCell>
                      {admin.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          2FA Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600">Pending Setup</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 font-mono">
                        {admin.lastLogin}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={admin.status === "Active" ? "success" : "danger"}
                        dot
                      >
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAdminStatus(admin.id)}
                          className="h-7 px-2 text-[11px]"
                          disabled={admin.id === "ADM-001"}
                        >
                          {admin.status === "Active" ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAdminUser(admin.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                          disabled={admin.id === "ADM-001"}
                          aria-label="Revoke admin"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 2: AUDIT LOGS */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <Input
                icon={<Search className="h-4 w-4" />}
                placeholder="Search audit trail by admin, IP, or event..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAuditLogs}
              className="gap-1.5 border-slate-200 text-xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export Audit Logs (CSV)</span>
            </Button>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event &amp; Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>IP &amp; Location</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div>
                        <p className="text-xs text-slate-800">
                          {log.action}{" "}
                          <strong className="text-slate-900 font-semibold">
                            {log.target}
                          </strong>
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={log.adminAvatar}
                          alt={log.adminName}
                          fallback={log.adminName}
                          size="sm"
                        />
                        <span className="text-xs font-medium text-slate-900">
                          {log.adminName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs font-mono text-slate-700 block">
                          {log.ipAddress}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {log.location}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 font-medium">
                        {log.timestamp}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {getSeverityBadge(log.severity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 3: CORPORATE GOVERNANCE */}
        <TabsContent value="governance" className="space-y-4">
          <form onSubmit={handleSaveGovernance} className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bangladesh Legal Entity &amp; Trade Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Registered Name
                  </label>
                  <Input
                    value={governanceForm.companyLegalName}
                    onChange={(e) =>
                      setGovernanceForm({
                        ...governanceForm,
                        companyLegalName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trade License Number
                  </label>
                  <Input
                    value={governanceForm.companyTradeLicense}
                    onChange={(e) =>
                      setGovernanceForm({
                        ...governanceForm,
                        companyTradeLicense: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taxpayer Identification (TIN)
                  </label>
                  <Input
                    value={governanceForm.tinNumber}
                    onChange={(e) =>
                      setGovernanceForm({
                        ...governanceForm,
                        tinNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dhaka Headquarters Office Address
                </label>
                <Input
                  value={governanceForm.headOfficeAddress}
                  onChange={(e) =>
                    setGovernanceForm({
                      ...governanceForm,
                      headOfficeAddress: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Hours
                  </label>
                  <Input
                    value={governanceForm.workingHours}
                    onChange={(e) =>
                      setGovernanceForm({
                        ...governanceForm,
                        workingHours: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Weekend
                  </label>
                  <Input disabled value="Friday & Saturday (Standard BD)" />
                </div>
              </div>
            </Card>

            {/* Security controls */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <KeyRound className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Authentication &amp; Hardware Biometrics
                </h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Mandatory Two-Factor Authentication (2FA)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Require OTP verification for all employee self-service and admin portals.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={governanceForm.twoFactorMandatory}
                    onChange={(e) =>
                      setGovernanceForm({
                        ...governanceForm,
                        twoFactorMandatory: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-orange-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      ZKTeco / Hikvision Biometric Attendance Terminal Sync
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Auto-ingest live fingerprint and facial recognition punch logs into timesheets.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 accent-orange-600 rounded"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-medium">
                  Save Governance Policies
                </Button>
              </div>
            </Card>
          </form>
        </TabsContent>

        {/* TAB 4: ROLE SIMULATOR */}
        <TabsContent value="simulator" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Role Privilege Simulator &amp; Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch your active simulated session to test access restrictions across roles.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["Super Admin", "HR Admin", "Payroll Admin", "Compliance Auditor"] as AdminRole[]).map(
                (role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeRole === role
                        ? "border-orange-600 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{role}</span>
                      {activeRole === role && (
                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {role === "Super Admin"
                        ? "Root access"
                        : role === "HR Admin"
                        ? "Staff management"
                        : role === "Payroll Admin"
                        ? "Taka disbursement"
                        : "Read-only logs"}
                    </span>
                  </button>
                )
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Privilege Matrix for &quot;{activeRole}&quot;
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: "Employee CRUD Operations", allowed: activeRole !== "Compliance Auditor" },
                  { name: "Approve / Reject Leave Requests", allowed: activeRole === "Super Admin" || activeRole === "HR Admin" },
                  { name: "Disburse Monthly Salaries in BDT (৳)", allowed: activeRole === "Super Admin" || activeRole === "Payroll Admin" },
                  { name: "Manage System Governance & Admins", allowed: activeRole === "Super Admin" },
                  { name: "Read Biometric Terminal Logs", allowed: true },
                  { name: "Export Cryptographic Audit Logs", allowed: true },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60"
                  >
                    <span className="text-slate-700 font-medium">{item.name}</span>
                    {item.allowed ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        PERMITTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                        RESTRICTED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
