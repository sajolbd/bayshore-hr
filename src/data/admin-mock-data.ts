import { AdminUser, AuditLog, SystemSettings } from "@/types";

export const initialAdminUsers: AdminUser[] = [
  {
    id: "ADM-001",
    name: "Alex Morgan",
    email: "alex.morgan@bayshore.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Super Admin",
    department: "Executive Leadership",
    permissions: [
      "all_access",
      "billing_manage",
      "user_manage",
      "audit_export",
      "security_config",
    ],
    lastLogin: "Active Now (Dhaka, BD)",
    status: "Active",
    twoFactorEnabled: true,
  },
  {
    id: "ADM-002",
    name: "Tahmidur Rahman",
    email: "tahmid.r@bayshore.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "HR Admin",
    department: "People Operations",
    permissions: [
      "employee_crud",
      "attendance_override",
      "leave_approve",
      "recruitment_manage",
    ],
    lastLogin: "25 minutes ago",
    status: "Active",
    twoFactorEnabled: true,
  },
  {
    id: "ADM-003",
    name: "Nusrat Jahan",
    email: "nusrat.j@bayshore.com",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "Payroll Admin",
    department: "Finance & Accounts",
    permissions: [
      "payroll_disburse",
      "tax_calculate",
      "salary_structure",
      "bank_sheet_export",
    ],
    lastLogin: "2 hours ago",
    status: "Active",
    twoFactorEnabled: true,
  },
  {
    id: "ADM-004",
    name: "Farhan Sadik",
    email: "farhan.s@bayshore.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Compliance Auditor",
    department: "Internal Audit",
    permissions: ["audit_logs_read", "report_export", "biometric_monitor"],
    lastLogin: "Yesterday at 5:12 PM",
    status: "Active",
    twoFactorEnabled: true,
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "LOG-901",
    adminName: "Alex Morgan",
    adminAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    action: "Updated company default currency to",
    target: "Bangladeshi Taka (BDT ৳)",
    category: "HR Governance",
    ipAddress: "103.205.74.12",
    location: "Gulshan, Dhaka, BD",
    timestamp: "8 minutes ago",
    severity: "info",
  },
  {
    id: "LOG-902",
    adminName: "Nusrat Jahan",
    adminAvatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    action: "Executed payroll disbursement batch for",
    target: "October 2026 (248 Employees)",
    category: "Compensation & Payroll",
    ipAddress: "118.179.223.45",
    location: "Banani, Dhaka, BD",
    timestamp: "1 hour ago",
    severity: "warning",
  },
  {
    id: "LOG-903",
    adminName: "Tahmidur Rahman",
    adminAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    action: "Onboarded & assigned employee record for",
    target: "Elena Rostova (EMP-1042)",
    category: "User Management",
    ipAddress: "103.205.74.12",
    location: "Gulshan, Dhaka, BD",
    timestamp: "3 hours ago",
    severity: "info",
  },
  {
    id: "LOG-904",
    adminName: "System Daemon",
    adminAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    action: "Synchronized biometric terminal logs with",
    target: "Main Terminal A (Gulshan HQ)",
    category: "Terminal Integration",
    ipAddress: "192.168.10.250",
    location: "Intranet HQ Server",
    timestamp: "09:00 AM Today",
    severity: "info",
  },
  {
    id: "LOG-905",
    adminName: "Security Gateway",
    adminAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    action: "Enforced mandatory 2FA security challenge for",
    target: "All Administrative Portals",
    category: "Security & Auth",
    ipAddress: "103.205.74.12",
    location: "Dhaka Security Node",
    timestamp: "Yesterday",
    severity: "critical",
  },
];

export const initialSystemSettings: SystemSettings = {
  companyLegalName: "Bayshore Communication",
  companyTradeLicense: "TRAD/DNCC/024891/2024",
  tinNumber: "482910492810",
  defaultCurrency: "BDT (৳)",
  timezone: "Asia/Dhaka (GMT+6)",
  headOfficeAddress:
    "Level 11, Bay's Bellavista, Road 11, Banani / Gulshan 2, Dhaka 1213",
  workingDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  workingHours: "09:30 AM - 06:30 PM (Sun-Thu)",
  twoFactorMandatory: true,
  sessionTimeoutMinutes: 30,
  ipWhitelisting: true,
  biometricSyncAuto: true,
};

