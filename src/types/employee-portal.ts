import { AttendanceStatus, Department, LeaveType } from "./index";

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: Department;
  phone: string;
  location: string;
  joinDate: string;
  reportingManager: string;
  reportingManagerRole: string;
  reportingManagerAvatar: string;
  bloodGroup: string;
  nidOrPassport: string;
  dateOfBirth: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  documents: {
    id: string;
    title: string;
    type: string;
    uploadedOn: string;
    fileSize: string;
  }[];
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

export interface EmployeePunchRecord {
  id?: string;
  date: string; // "2026-11-08"
  day: string;  // "Sun"
  checkIn: string | null;
  checkOut: string | null;
  workHours: string;
  status: AttendanceStatus;
  overtimeHours?: string;
  location: string;
  geo?: GeolocationData;
}

export interface EmployeeLeaveBalance {
  type: LeaveType;
  total: number;
  used: number;
  available: number;
  color: string;
}

export interface EmployeeSalaryBreakdown {
  currency: string;
  grossSalary: number;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  providentFundDeduction: number;
  incomeTaxDeduction: number;
  netPayable: number;
  bankAccount: string;
  bankName: string;
  paymentMode: string;
}

export interface EmployeePayslip {
  id: string;
  monthYear: string; // e.g. "October 2026"
  issueDate: string;
  netPayable: number;
  grossSalary: number;
  totalDeductions: number;
  status: "Paid" | "Processing";
}

export interface EmployeeGoal {
  id: string;
  title: string;
  category: "Technical" | "Leadership" | "Operational" | "Process";
  targetDate: string;
  progress: number;
  status: "In Progress" | "Completed" | "Pending Review";
  keyMetric: string;
}

export interface EmployeeHRRequest {
  id: string;
  type:
    | "Attendance Correction"
    | "Salary Certificate"
    | "Experience Letter"
    | "Document Attestation"
    | "General HR Inquiry";
  subject: string;
  details: string;
  submittedOn: string;
  status: "Pending" | "In Review" | "Approved" | "Resolved";
  response?: string;
}

export interface EmployeeNotification {
  id: string;
  title: string;
  message: string;
  type: "leave" | "attendance" | "payroll" | "announcement" | "review";
  time: string;
  read: boolean;
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
