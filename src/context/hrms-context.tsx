"use client";

import * as React from "react";
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  BirthdayItem,
  ActivityItem,
  InterviewItem,
  AnnouncementItem,
  ExpenseClaim,
  AnnualLeavePolicyItem,
  OfficeHoliday,
  LeaveType,
  InviteEmailResultDto,
} from "@/types";
import { EmployeeLeaveBalance } from "@/types/employee-portal";
import {
  mockBirthdays,
  mockUpcomingInterviews,
  mockAnnouncements,
  initialAnnualLeavePolicies,
} from "@/data/mock-data";
import { companyHolidaysList } from "@/data/employee-mock-data";
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";

interface HRMSContextValue {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  birthdays: BirthdayItem[];
  activities: ActivityItem[];
  interviews: InterviewItem[];
  announcements: AnnouncementItem[];
  isLoadingData: boolean;
  refreshHRMSData: () => Promise<void>;
  // Modals & Navigation
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  isAddEmployeeOpen: boolean;
  setIsAddEmployeeOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // CRUD state & modals
  selectedEmployee: Employee | null;
  isViewEmployeeOpen: boolean;
  openViewEmployee: (emp: Employee) => void;
  closeViewEmployee: () => void;
  employeeToEdit: Employee | null;
  isEditEmployeeOpen: boolean;
  openEditEmployee: (emp: Employee) => void;
  closeEditEmployee: () => void;
  employeeToDelete: Employee | null;
  isDeleteEmployeeOpen: boolean;
  openDeleteEmployee: (emp: Employee) => void;
  closeDeleteEmployee: () => void;
  // Geolocation & Map Modal
  selectedAttendanceForLocation: AttendanceRecord | null;
  openLocationModal: (record: AttendanceRecord) => void;
  closeLocationModal: () => void;
  // e-Claim Management
  expenseClaims: ExpenseClaim[];
  approveClaim: (claimId: string) => Promise<void>;
  rejectClaim: (claimId: string, reason?: string) => Promise<void>;
  reimburseClaim: (claimId: string) => Promise<void>;
  // CRUD Actions
  addEmployee: (
    emp: Omit<Employee, "id" | "status">
  ) => Promise<{
    success: boolean;
    employee?: Employee;
    emailStatus?: InviteEmailResultDto;
    error?: string;
  }>;
  resendEmployeeInvite: (employeeId: string) => Promise<{
    success: boolean;
    emailStatus?: InviteEmailResultDto;
    error?: string;
  }>;
  updateEmployee: (id: string, updatedData: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  approveLeave: (leaveId: string) => Promise<void>;
  rejectLeave: (leaveId: string, reason?: string) => Promise<void>;
  sendBirthdayWish: (birthdayId: string) => void;
  exportReport: (format: "csv" | "xlsx" | "pdf", range: string) => void;
  // Yearly Leave Quotas, Employee Balances & Office Holidays
  annualLeavePolicies: AnnualLeavePolicyItem[];
  officeHolidays: OfficeHoliday[];
  getEmployeeLeaveBalances: (employeeId: string) => EmployeeLeaveBalance[];
  updateAnnualLeavePolicies: (policies: AnnualLeavePolicyItem[]) => Promise<void>;
  addOfficeHoliday: (holiday: Omit<OfficeHoliday, "id">) => Promise<void>;
  deleteOfficeHoliday: (id: string) => Promise<void>;
  addAdminLeaveRecord: (data: {
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => Promise<{ success: boolean; message: string }>;
}

const HRMSContext = React.createContext<HRMSContextValue | undefined>(undefined);

export function HRMSProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const { isHydrated, isAuthenticated, currentRole } = useAuth();

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = React.useState<
    AttendanceRecord[]
  >([]);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [annualLeavePolicies, setAnnualLeavePolicies] = React.useState<
    AnnualLeavePolicyItem[]
  >(initialAnnualLeavePolicies);
  const [officeHolidays, setOfficeHolidays] =
    React.useState<OfficeHoliday[]>(companyHolidaysList);
  const [expenseClaims, setExpenseClaims] = React.useState<ExpenseClaim[]>([]);
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [birthdays] = React.useState<BirthdayItem[]>(mockBirthdays);
  const [interviews] = React.useState<InterviewItem[]>(mockUpcomingInterviews);
  const [announcements] = React.useState<AnnouncementItem[]>(mockAnnouncements);
  const [isLoadingData, setIsLoadingData] = React.useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = React.useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // CRUD modal states
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [isViewEmployeeOpen, setIsViewEmployeeOpen] = React.useState(false);

  const [employeeToEdit, setEmployeeToEdit] = React.useState<Employee | null>(
    null
  );
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = React.useState(false);

  const [employeeToDelete, setEmployeeToDelete] =
    React.useState<Employee | null>(null);
  const [isDeleteEmployeeOpen, setIsDeleteEmployeeOpen] = React.useState(false);

  // Geolocation Map Modal
  const [selectedAttendanceForLocation, setSelectedAttendanceForLocation] =
    React.useState<AttendanceRecord | null>(null);
  const openLocationModal = (record: AttendanceRecord) => {
    setSelectedAttendanceForLocation(record);
  };
  const closeLocationModal = () => {
    setSelectedAttendanceForLocation(null);
  };

  const refreshHRMSData = React.useCallback(async () => {
    if (!isHydrated || !isAuthenticated) return;

    setIsLoadingData(true);
    try {
      const isAdmin = currentRole !== "Employee";
      const leavesReq = fetch("/api/leaves", { cache: "no-store" });

      if (!isAdmin) {
        const leavesRes = await leavesReq;
        if (leavesRes.ok) {
          const leavesData = (await leavesRes.json()) as {
            policies?: AnnualLeavePolicyItem[];
            holidays?: OfficeHoliday[];
            requests?: LeaveRequest[];
          };
          if (leavesData.policies) setAnnualLeavePolicies(leavesData.policies);
          if (leavesData.holidays) setOfficeHolidays(leavesData.holidays);
          if (leavesData.requests) setLeaveRequests(leavesData.requests);
        }
        setEmployees([]);
        setAttendanceRecords([]);
        setExpenseClaims([]);
        setActivities([]);
        return;
      }

      const [empRes, attRes, leavesRes, claimsRes, dashRes] = await Promise.all([
        fetch("/api/employees", { cache: "no-store" }),
        fetch("/api/attendance", { cache: "no-store" }),
        leavesReq,
        fetch("/api/claims", { cache: "no-store" }),
        fetch("/api/dashboard", { cache: "no-store" }),
      ]);

      if (empRes.ok) {
        const d = (await empRes.json()) as { employees?: Employee[] };
        if (d.employees) setEmployees(d.employees);
      }
      if (attRes.ok) {
        const d = (await attRes.json()) as { records?: AttendanceRecord[] };
        if (d.records) setAttendanceRecords(d.records);
      }
      if (leavesRes.ok) {
        const d = (await leavesRes.json()) as {
          policies?: AnnualLeavePolicyItem[];
          holidays?: OfficeHoliday[];
          requests?: LeaveRequest[];
        };
        if (d.policies) setAnnualLeavePolicies(d.policies);
        if (d.holidays) setOfficeHolidays(d.holidays);
        if (d.requests) setLeaveRequests(d.requests);
      }
      if (claimsRes.ok) {
        const d = (await claimsRes.json()) as { claims?: ExpenseClaim[] };
        if (d.claims) setExpenseClaims(d.claims);
      }
      if (dashRes.ok) {
        const d = (await dashRes.json()) as { activities?: ActivityItem[] };
        if (d.activities) setActivities(d.activities);
      }
    } catch {
      // ignore transient errors cleanly
    } finally {
      setIsLoadingData(false);
    }
  }, [isHydrated, isAuthenticated, currentRole]);

  React.useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    const timer = setTimeout(() => {
      void refreshHRMSData();
    }, 0);
    return () => clearTimeout(timer);
  }, [isHydrated, isAuthenticated, refreshHRMSData]);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const openViewEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsViewEmployeeOpen(true);
  };
  const closeViewEmployee = () => {
    setSelectedEmployee(null);
    setIsViewEmployeeOpen(false);
  };

  const openEditEmployee = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsEditEmployeeOpen(true);
  };
  const closeEditEmployee = () => {
    setEmployeeToEdit(null);
    setIsEditEmployeeOpen(false);
  };

  const openDeleteEmployee = (emp: Employee) => {
    setEmployeeToDelete(emp);
    setIsDeleteEmployeeOpen(true);
  };
  const closeDeleteEmployee = () => {
    setEmployeeToDelete(null);
    setIsDeleteEmployeeOpen(false);
  };

  const addEmployee = async (empData: Omit<Employee, "id" | "status">) => {
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empData),
      });
      const data = (await res.json().catch(() => ({}))) as {
        employee?: Employee;
        emailStatus?: InviteEmailResultDto;
        error?: string;
      };

      if (!res.ok || !data.employee) {
        showToast(
          "Could Not Add Employee",
          data.error || "Only Super Admin can invite new employees.",
          "error"
        );
        return {
          success: false,
          error: data.error || "Failed to create employee.",
        };
      }

      setEmployees((prev) => [data.employee!, ...prev]);
      void refreshHRMSData();

      showToast(
        data.emailStatus?.delivered
          ? "Employee Added & Email Sent"
          : "Employee Saved (SMTP Needed for Real Gmail)",
        data.emailStatus?.delivered
          ? `Invitation email sent directly to ${data.employee.email}.`
          : `${data.employee.name} saved. Configure Gmail App Password in Settings to deliver to real inboxes.`,
        data.emailStatus?.delivered ? "success" : "warning"
      );

      return {
        success: true,
        employee: data.employee,
        emailStatus: data.emailStatus,
      };
    } catch {
      showToast("Network Error", "Failed to save employee to MongoDB.", "error");
      return { success: false, error: "Network error while creating employee." };
    }
  };

  const resendEmployeeInvite = async (employeeId: string) => {
    try {
      const res = await fetch(`/api/employees/${employeeId}/resend-invite`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        emailStatus?: InviteEmailResultDto;
        error?: string;
      };

      if (!res.ok) {
        showToast(
          "Invite Resend Failed",
          data.error || "Unable to resend invitation.",
          "error"
        );
        return { success: false, error: data.error };
      }

      showToast(
        "Invitation Link Refreshed",
        data.emailStatus?.message || "Fresh email invitation generated.",
        "success"
      );
      return { success: true, emailStatus: data.emailStatus };
    } catch {
      showToast("Network Error", "Could not resend invitation.", "error");
      return { success: false, error: "Network error" };
    }
  };

  const updateEmployee = async (id: string, updatedData: Partial<Employee>) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = (await res.json().catch(() => ({}))) as {
        employee?: Employee;
        error?: string;
      };

      if (!res.ok || !data.employee) {
        showToast(
          "Update Failed",
          data.error || "Unable to update employee.",
          "error"
        );
        return;
      }

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? data.employee! : emp))
      );
      setSelectedEmployee((prev) =>
        prev && prev.id === id ? data.employee! : prev
      );
      void refreshHRMSData();

      showToast(
        "Employee Record Updated",
        `Changes for ${data.employee.name} saved to MongoDB.`,
        "success"
      );
    } catch {
      showToast("Network Error", "Failed to save employee updates.", "error");
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const targetEmp = employees.find((e) => e.id === id);
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        showToast(
          "Delete Failed",
          data.error || "Only Super Admin can delete employees.",
          "error"
        );
        return;
      }

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      setAttendanceRecords((prev) => prev.filter((att) => att.employeeId !== id));
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null);
        setIsViewEmployeeOpen(false);
      }
      void refreshHRMSData();

      showToast(
        "Employee Deleted",
        `${targetEmp?.name || id} removed from Bayshore HR database.`,
        "warning"
      );
    } catch {
      showToast("Network Error", "Could not delete employee.", "error");
    }
  };

  const approveClaim = async (claimId: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }),
      });
      if (!res.ok) return;
      setExpenseClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: "Approved" } : c))
      );
      showToast(
        "Claim Approved",
        `Expense claim #${claimId} approved for disbursement.`,
        "success"
      );
    } catch {
      showToast("Error", "Could not approve expense claim.", "error");
    }
  };

  const rejectClaim = async (
    claimId: string,
    reason = "Disallowed under Bayshore expense policy."
  ) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", reason }),
      });
      if (!res.ok) return;
      setExpenseClaims((prev) =>
        prev.map((c) =>
          c.id === claimId
            ? { ...c, status: "Rejected", rejectionReason: reason }
            : c
        )
      );
      showToast(
        "Claim Rejected",
        `Expense claim #${claimId} marked as rejected.`,
        "info"
      );
    } catch {
      showToast("Error", "Could not reject expense claim.", "error");
    }
  };

  const reimburseClaim = async (claimId: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Reimbursed" }),
      });
      if (!res.ok) return;
      setExpenseClaims((prev) =>
        prev.map((c) =>
          c.id === claimId
            ? {
                ...c,
                status: "Reimbursed",
                reimbursementDate: "Disbursed via City Bank BEFTN",
              }
            : c
        )
      );
      showToast(
        "Reimbursement Dispatched",
        `Funds for claim #${claimId} queued for payroll bank transfer.`,
        "success"
      );
    } catch {
      showToast("Error", "Could not mark claim reimbursed.", "error");
    }
  };

  const approveLeave = async (leaveId: string) => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { request: LeaveRequest };
      setLeaveRequests((prev) =>
        prev.map((item) => (item.id === leaveId ? data.request : item))
      );
      void refreshHRMSData();
      showToast(
        "Leave Approved",
        `Approved ${data.request.days} day(s) for ${data.request.employeeName}.`,
        "success"
      );
    } catch {
      showToast("Error", "Failed to approve leave request.", "error");
    }
  };

  const rejectLeave = async (leaveId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", reason }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { request: LeaveRequest };
      setLeaveRequests((prev) =>
        prev.map((item) => (item.id === leaveId ? data.request : item))
      );
      void refreshHRMSData();
      showToast(
        "Leave Request Rejected",
        `Declined ${data.request.employeeName}'s request and restored ${data.request.days} day(s) to balance.`,
        "warning"
      );
    } catch {
      showToast("Error", "Failed to reject leave request.", "error");
    }
  };

  const getEmployeeLeaveBalances = React.useCallback(
    (employeeId: string): EmployeeLeaveBalance[] => {
      return annualLeavePolicies.map((policy) => {
        const activeUsed = leaveRequests
          .filter(
            (req) =>
              req.employeeId === employeeId &&
              req.leaveType === policy.type &&
              (req.status === "Approved" || req.status === "Pending")
          )
          .reduce((sum, req) => sum + req.days, 0);

        const available = Math.max(0, policy.yearlyQuota - activeUsed);
        return {
          type: policy.type,
          total: policy.yearlyQuota,
          used: activeUsed,
          available,
          color: policy.color,
        };
      });
    },
    [annualLeavePolicies, leaveRequests]
  );

  const updateAnnualLeavePolicies = async (
    policies: AnnualLeavePolicyItem[]
  ) => {
    const annual = policies.find((p) => p.type === "Annual Leave");
    if (!annual) return;

    try {
      const res = await fetch("/api/leaves/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearlyQuota: annual.yearlyQuota,
          carryForwardMax: annual.carryForwardMax,
        }),
      });
      if (!res.ok) {
        showToast("Error", "Failed to save yearly leave policy.", "error");
        return;
      }
      const data = (await res.json()) as { policy: AnnualLeavePolicyItem };
      setAnnualLeavePolicies([data.policy]);
      void refreshHRMSData();
      showToast(
        "Annual Leave Policy Updated",
        `Fixed Annual Leave set to ${data.policy.yearlyQuota} day(s)/year in MongoDB.`,
        "success"
      );
    } catch {
      showToast("Network Error", "Could not update leave policy.", "error");
    }
  };

  const addOfficeHoliday = async (holiday: Omit<OfficeHoliday, "id">) => {
    try {
      const res = await fetch("/api/leaves/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holiday),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { holiday: OfficeHoliday };
      setOfficeHolidays((prev) => [...prev, data.holiday]);
      showToast(
        "Office Holiday Added",
        `"${data.holiday.name}" (${data.holiday.date}) saved to MongoDB.`,
        "success"
      );
    } catch {
      showToast("Error", "Could not add holiday.", "error");
    }
  };

  const deleteOfficeHoliday = async (id: string) => {
    try {
      const target = officeHolidays.find((h) => h.id === id);
      const res = await fetch(`/api/leaves/holidays/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setOfficeHolidays((prev) => prev.filter((h) => h.id !== id));
      if (target) {
        showToast(
          "Office Holiday Removed",
          `Removed "${target.name}" from fixed office holidays.`,
          "info"
        );
      }
    } catch {
      showToast("Error", "Could not delete holiday.", "error");
    }
  };

  const addAdminLeaveRecord = async (data: {
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: data.employeeId,
          startDate: data.startDate,
          endDate: data.endDate,
          days: data.days,
          reason: data.reason,
          autoApprove: true,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        request?: LeaveRequest;
        error?: string;
      };

      if (!res.ok || !json.request) {
        return {
          success: false,
          message: json.error || "Could not record leave deduction.",
        };
      }

      setLeaveRequests((prev) => [json.request!, ...prev]);
      void refreshHRMSData();
      showToast(
        "Leave Recorded & Deducted",
        `Deducted ${data.days} day(s) of Annual Leave from ${json.request.employeeName}.`,
        "success"
      );
      return {
        success: true,
        message: `Deducted ${data.days} day(s) from ${json.request.employeeName}.`,
      };
    } catch {
      return { success: false, message: "Network error recording leave." };
    }
  };

  const sendBirthdayWish = (birthdayId: string) => {
    const bday = birthdays.find((b) => b.id === birthdayId);
    if (!bday) return;
    showToast(
      "Birthday Wish Sent! 🎂",
      `Celebration message dispatched to ${bday.employeeName}.`,
      "success"
    );
  };

  const exportReport = (format: "csv" | "xlsx" | "pdf", range: string) => {
    showToast(
      "Report Generated",
      `Exported HRMS summary (${range}) in .${format.toUpperCase()} format.`,
      "success"
    );
  };

  return (
    <HRMSContext.Provider
      value={{
        employees: isAuthenticated ? employees : [],
        attendanceRecords: isAuthenticated ? attendanceRecords : [],
        leaveRequests: isAuthenticated ? leaveRequests : [],
        birthdays,
        activities: isAuthenticated ? activities : [],
        interviews,
        announcements,
        isLoadingData,
        refreshHRMSData,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileNavOpen,
        setIsMobileNavOpen,
        isAddEmployeeOpen,
        setIsAddEmployeeOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        searchQuery,
        setSearchQuery,
        selectedEmployee,
        isViewEmployeeOpen,
        openViewEmployee,
        closeViewEmployee,
        employeeToEdit,
        isEditEmployeeOpen,
        openEditEmployee,
        closeEditEmployee,
        employeeToDelete,
        isDeleteEmployeeOpen,
        openDeleteEmployee,
        closeDeleteEmployee,
        selectedAttendanceForLocation,
        openLocationModal,
        closeLocationModal,
        expenseClaims: isAuthenticated ? expenseClaims : [],
        approveClaim,
        rejectClaim,
        reimburseClaim,
        addEmployee,
        resendEmployeeInvite,
        updateEmployee,
        deleteEmployee,
        approveLeave,
        rejectLeave,
        sendBirthdayWish,
        exportReport,
        annualLeavePolicies,
        officeHolidays,
        getEmployeeLeaveBalances,
        updateAnnualLeavePolicies,
        addOfficeHoliday,
        deleteOfficeHoliday,
        addAdminLeaveRecord,
      }}
    >
      {children}
    </HRMSContext.Provider>
  );
}

export function useHRMS() {
  const context = React.useContext(HRMSContext);
  if (!context) {
    throw new Error("useHRMS must be used within HRMSProvider");
  }
  return context;
}
