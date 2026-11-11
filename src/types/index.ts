export type Department =
  | "Engineering"
  | "Product & Design"
  | "Sales & Marketing"
  | "Operations"
  | "HR & People"
  | "Finance & Legal";

export type AttendanceStatus = "Present" | "Late" | "On Leave" | "Remote" | "Absent";

export type LeaveType = "Annual Leave";

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: Department;
  status: "Invited" | "Active" | "On Leave" | "Terminated" | "Suspended";
  joinDate: string;
  phone: string;
  location: string;
  salary: number;
  inviteSentAt?: string;
}

export interface InviteEmailResultDto {
  delivered: boolean;
  mode: "smtp" | "ethereal" | "direct-link";
  previewUrl?: string;
  inviteUrl: string;
  message: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  geofenceStatus: "Inside Office Geofence" | "Outside Geofence (Remote)" | "Field Client Visit";
  distanceFromHQ?: number; // in meters
  ipAddress?: string;
  selfieUrl?: string;
  checkInType: "Time Clock" | "Field Check-In";
  clientName?: string;
  purposeNote?: string;
  timestamp?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  avatar: string;
  department: Department;
  role: string;
  checkIn: string;
  checkOut: string | null;
  status: AttendanceStatus;
  workHours: string;
  location?: string;
  geo?: GeolocationData;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: Department;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
}

export interface BirthdayItem {
  id: string;
  employeeName: string;
  avatar: string;
  department: Department;
  role: string;
  birthday: string;
  isToday: boolean;
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: "leave" | "onboarding" | "payroll" | "recruitment" | "review" | "policy";
}

export interface InterviewItem {
  id: string;
  candidateName: string;
  avatar: string;
  position: string;
  department: Department;
  date: string;
  time: string;
  interviewType: "Initial HR" | "Technical Round" | "System Design" | "Culture Fit" | "Final Executive";
  interviewers: string[];
  status: "Scheduled" | "Completed" | "Cancelled";
  meetingLink: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  category: "Company Update" | "Urgent Notice" | "Policy" | "Event & Culture";
  date: string;
  author: string;
  authorAvatar: string;
  isImportant?: boolean;
}

export interface KPICardData {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  subtext: string;
  iconName: string;
}

export interface HeadcountTrendData {
  month: string;
  Engineering: number;
  SalesMarketing: number;
  Operations: number;
  ProductDesign: number;
  Total: number;
}

export interface DepartmentDistributionData {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

export interface AttendanceOverviewData {
  day: string;
  present: number;
  remote: number;
  late: number;
  leave: number;
}

// ----------------- ADMIN SYSTEM TYPES -----------------

export type AdminRole =
  | "Super Admin"
  | "HR Admin"
  | "Payroll Admin"
  | "Compliance Auditor";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: AdminRole;
  department: string;
  permissions: string[];
  lastLogin: string;
  status: "Active" | "Suspended";
  twoFactorEnabled: boolean;
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminAvatar: string;
  action: string;
  target: string;
  category: "User Management" | "Security & Auth" | "Compensation & Payroll" | "HR Governance" | "Terminal Integration";
  ipAddress: string;
  location: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

export interface SystemSettings {
  companyLegalName: string;
  companyTradeLicense: string;
  tinNumber: string;
  defaultCurrency: string;
  timezone: string;
  headOfficeAddress: string;
  workingDays: string[];
  workingHours: string;
  twoFactorMandatory: boolean;
  sessionTimeoutMinutes: number;
  ipWhitelisting: boolean;
  biometricSyncAuto: boolean;
}

// ----------------- E-CLAIM (EXPENSE MANAGEMENT) TYPES -----------------

export type ClaimCategory =
  | "Travel & Mileage"
  | "Meals & Entertainment"
  | "Medical & Wellness"
  | "Mobile & Internet"
  | "Office Supplies"
  | "Training & Certification"
  | "Client Hospitality";

export type ClaimStatus = "Pending" | "Approved" | "Rejected" | "Reimbursed";

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: Department;
  title: string;
  category: ClaimCategory;
  amount: number; // in ৳ BDT
  dateIncurred: string;
  submissionDate: string;
  status: ClaimStatus;
  merchantName: string;
  receiptUrl?: string;
  receiptFileName?: string;
  description: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  reimbursementDate?: string;
}

export interface ClaimEntitlement {
  category: ClaimCategory;
  annualLimit: number;
  spent: number;
  remaining: number;
}

// ----------------- ANNUAL LEAVE POLICY & HOLIDAY TYPES -----------------

export interface AnnualLeavePolicyItem {
  type: LeaveType;
  yearlyQuota: number;
  carryForwardMax: number;
  paid: boolean;
  description: string;
  color: string;
}

export interface OfficeHoliday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: "National Holiday" | "Gazetted Holiday" | "Company Holiday";
}
