"use client";

import * as React from "react";
import {
  EmployeeProfile,
  EmployeePunchRecord,
  EmployeeLeaveBalance,
  EmployeeSalaryBreakdown,
  EmployeePayslip,
  EmployeeGoal,
  EmployeeHRRequest,
  EmployeeNotification,
  GeolocationData,
  ExpenseClaim,
  ClaimEntitlement,
} from "@/types/employee-portal";
import { LeaveType, LeaveStatus, OfficeHoliday } from "@/types";
import {
  employeeGoalsList,
  employeeHRRequestsList,
  employeeNotificationsList,
} from "@/data/employee-mock-data";
import { employeeClaimEntitlements } from "@/data/claims-mock-data";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

export interface EmployeeLeaveRequestItem {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
}

interface ShiftClockState {
  isClockedIn: boolean;
  baseSeconds: number;
  startedAtMs: number | null;
  nowMs: number;
}

const shiftClockState: ShiftClockState = {
  isClockedIn: false,
  baseSeconds: 0,
  startedAtMs: null,
  nowMs: 0,
};

const shiftClockListeners = new Set<() => void>();
let shiftClockInterval: ReturnType<typeof setInterval> | null = null;

function notifyShiftClockListeners() {
  shiftClockListeners.forEach((listener) => listener());
}

function subscribeShiftClock(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  shiftClockListeners.add(listener);

  if (shiftClockState.isClockedIn) {
    setTimeout(() => {
      if (shiftClockState.isClockedIn) {
        shiftClockState.nowMs = Date.now();
        notifyShiftClockListeners();
      }
    }, 0);
  }

  if (!shiftClockInterval) {
    shiftClockInterval = setInterval(() => {
      if (!shiftClockState.isClockedIn) return;
      shiftClockState.nowMs = Date.now();
      notifyShiftClockListeners();
    }, 1000);
  }

  return () => {
    shiftClockListeners.delete(listener);
    if (shiftClockListeners.size === 0 && shiftClockInterval) {
      clearInterval(shiftClockInterval);
      shiftClockInterval = null;
    }
  };
}

function getLiveShiftSecondsSnapshot(): number {
  if (
    !shiftClockState.isClockedIn ||
    shiftClockState.startedAtMs === null ||
    shiftClockState.nowMs === 0
  ) {
    return shiftClockState.baseSeconds;
  }
  const elapsed = Math.max(
    0,
    Math.floor((shiftClockState.nowMs - shiftClockState.startedAtMs) / 1000)
  );
  return shiftClockState.baseSeconds + elapsed;
}

function getLiveShiftSecondsServerSnapshot(): number {
  return 0;
}

export function useLiveShiftSeconds(): number {
  return React.useSyncExternalStore(
    subscribeShiftClock,
    getLiveShiftSecondsSnapshot,
    getLiveShiftSecondsServerSnapshot
  );
}

const emptyProfile: EmployeeProfile = {
  id: "",
  name: "",
  email: "",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "Employee",
  department: "Engineering",
  phone: "",
  location: "Gulshan HQ, Dhaka",
  joinDate: "",
  reportingManager: "Shamim Ahsan",
  reportingManagerRole: "Super Admin",
  reportingManagerAvatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  bloodGroup: "O+",
  nidOrPassport: "Verified on Onboarding",
  dateOfBirth: "Not Specified",
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
  skills: ["Cloud & SaaS Operations", "Bayshore Communication Standards"],
  education: [],
  documents: [
    {
      id: "doc-1",
      title: "Employment Offer & Onboarding Agreement",
      type: "PDF Document",
      uploadedOn: "Active",
      fileSize: "1.4 MB",
    },
  ],
};

function computeSalaryBreakdown(grossSalary: number): EmployeeSalaryBreakdown {
  const safeGross = grossSalary > 0 ? grossSalary : 60000;
  const basicSalary = Math.round(safeGross * 0.6);
  const houseRentAllowance = Math.round(safeGross * 0.25);
  const medicalAllowance = Math.round(safeGross * 0.1);
  const conveyanceAllowance =
    safeGross - basicSalary - houseRentAllowance - medicalAllowance;
  const providentFundDeduction = Math.round(basicSalary * 0.08);
  const incomeTaxDeduction =
    safeGross > 40000 ? Math.round((safeGross - 40000) * 0.05) : 0;
  const netPayable =
    safeGross - providentFundDeduction - incomeTaxDeduction;

  return {
    currency: "BDT (৳)",
    grossSalary: safeGross,
    basicSalary,
    houseRentAllowance,
    medicalAllowance,
    conveyanceAllowance,
    providentFundDeduction,
    incomeTaxDeduction,
    netPayable,
    bankAccount: "City Bank Ltd. (Direct BEFTN)",
    bankName: "The City Bank Limited, Gulshan Avenue Branch",
    paymentMode: "Direct Corporate Bank Transfer (BEFTN/RTGS)",
  };
}

interface EmployeeContextType {
  profile: EmployeeProfile;
  isClockedIn: boolean;
  todayCheckInTime: string | null;
  todayCheckOutTime: string | null;
  punchHistory: EmployeePunchRecord[];
  leaveBalances: EmployeeLeaveBalance[];
  leaveRequests: EmployeeLeaveRequestItem[];
  officeHolidays: OfficeHoliday[];
  salaryDetails: EmployeeSalaryBreakdown;
  payslips: EmployeePayslip[];
  goals: EmployeeGoal[];
  hrRequests: EmployeeHRRequest[];
  notifications: EmployeeNotification[];
  unreadNotificationCount: number;
  isClockInModalOpen: boolean;
  setIsClockInModalOpen: (open: boolean) => void;
  selectedPunchForLocation: EmployeePunchRecord | null;
  openLocationModal: (record: EmployeePunchRecord) => void;
  closeLocationModal: () => void;
  expenseClaims: ExpenseClaim[];
  claimEntitlements: ClaimEntitlement[];
  submitClaim: (data: {
    title: string;
    category: ExpenseClaim["category"];
    amount: number;
    dateIncurred: string;
    merchantName: string;
    receiptFileName?: string;
    description: string;
  }) => Promise<{ success: boolean; message: string }>;
  cancelClaim: (id: string) => Promise<void>;
  clockIn: (location?: string, geo?: GeolocationData) => Promise<boolean>;
  clockOut: () => Promise<boolean>;
  applyLeave: (data: {
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => Promise<{ success: boolean; message: string }>;
  submitHRRequest: (data: {
    type: EmployeeHRRequest["type"];
    subject: string;
    details: string;
  }) => { success: boolean; message: string };
  submitAttendanceCorrection: (data: {
    date: string;
    punchType: string;
    correctTime: string;
    reason: string;
  }) => { success: boolean; message: string };
  updateProfile: (data: {
    phone: string;
    location: string;
    bloodGroup: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  }) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updateGoalSelfAssessment: (goalId: string, notes: string) => void;
}

const EmployeeContext = React.createContext<EmployeeContextType | undefined>(
  undefined
);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const { isHydrated, isAuthenticated, currentUser } = useAuth();
  const {
    leaveRequests: hrmsLeaves,
    officeHolidays,
    getEmployeeLeaveBalances,
    refreshHRMSData,
  } = useHRMS();

  const [profile, setProfile] = React.useState<EmployeeProfile>(emptyProfile);
  const [grossSalary, setGrossSalary] = React.useState<number>(60000);
  const [isClockedIn, setIsClockedIn] = React.useState<boolean>(false);
  const [todayCheckInTime, setTodayCheckInTime] = React.useState<string | null>(
    null
  );
  const [todayCheckOutTime, setTodayCheckOutTime] = React.useState<string | null>(
    null
  );
  const [punchHistory, setPunchHistory] = React.useState<EmployeePunchRecord[]>(
    []
  );
  const [expenseClaims, setExpenseClaims] = React.useState<ExpenseClaim[]>([]);
  const [goals, setGoals] = React.useState<EmployeeGoal[]>(employeeGoalsList);
  const [hrRequests, setHrRequests] =
    React.useState<EmployeeHRRequest[]>(employeeHRRequestsList);
  const [notifications, setNotifications] = React.useState<
    EmployeeNotification[]
  >(employeeNotificationsList);

  const [isClockInModalOpen, setIsClockInModalOpen] = React.useState(false);
  const [selectedPunchForLocation, setSelectedPunchForLocation] =
    React.useState<EmployeePunchRecord | null>(null);

  const openLocationModal = (record: EmployeePunchRecord) => {
    setSelectedPunchForLocation(record);
  };
  const closeLocationModal = () => {
    setSelectedPunchForLocation(null);
  };

  const hydrateEmployeePortal = React.useCallback(async () => {
    if (!isHydrated || !isAuthenticated || !currentUser) return;

    try {
      const [profRes, attRes, claimsRes] = await Promise.all([
        fetch("/api/profile", { cache: "no-store" }),
        fetch("/api/attendance", { cache: "no-store" }),
        fetch("/api/claims", { cache: "no-store" }),
      ]);

      if (profRes.ok) {
        const profJson = (await profRes.json()) as {
          profile?: EmployeeProfile & { salary?: number };
        };
        if (profJson.profile) {
          setProfile({
            ...emptyProfile,
            ...profJson.profile,
          });
          setGrossSalary(profJson.profile.salary || 60000);
        }
      }

      if (attRes.ok) {
        const attJson = (await attRes.json()) as {
          todayRecord?:
            | (EmployeePunchRecord & { checkInAt?: string; checkOutAt?: string | null })
            | null;
          records?: (EmployeePunchRecord & { checkInAt?: string })[];
        };

        const records = attJson.records || [];
        setPunchHistory(records);

        const today = attJson.todayRecord;
        if (today && !today.checkOut) {
          setIsClockedIn(true);
          setTodayCheckInTime(today.checkIn);
          setTodayCheckOutTime(null);
          const startedTs = today.checkInAt
            ? new Date(today.checkInAt).getTime()
            : Date.now();
          shiftClockState.baseSeconds = 0;
          shiftClockState.isClockedIn = true;
          shiftClockState.startedAtMs = startedTs;
          shiftClockState.nowMs = Date.now();
          notifyShiftClockListeners();
        } else if (today && today.checkOut) {
          setIsClockedIn(false);
          setTodayCheckInTime(today.checkIn);
          setTodayCheckOutTime(today.checkOut);
          shiftClockState.isClockedIn = false;
          shiftClockState.startedAtMs = null;
          shiftClockState.baseSeconds = 0;
          notifyShiftClockListeners();
        } else {
          setIsClockedIn(false);
          setTodayCheckInTime(null);
          setTodayCheckOutTime(null);
          shiftClockState.isClockedIn = false;
          shiftClockState.startedAtMs = null;
          shiftClockState.baseSeconds = 0;
          notifyShiftClockListeners();
        }
      }

      if (claimsRes.ok) {
        const cJson = (await claimsRes.json()) as { claims?: ExpenseClaim[] };
        if (cJson.claims) {
          setExpenseClaims(
            cJson.claims.filter(
              (c) => c.employeeId === (currentUser.employeeId || currentUser.id)
            )
          );
        }
      }
    } catch {
      // ignore transient errors cleanly
    }
  }, [isHydrated, isAuthenticated, currentUser]);

  React.useEffect(() => {
    if (!isHydrated || !isAuthenticated || !currentUser) return;
    const timer = setTimeout(() => {
      void hydrateEmployeePortal();
    }, 0);
    return () => clearTimeout(timer);
  }, [isHydrated, isAuthenticated, currentUser, hydrateEmployeePortal]);

  const syncedLeaveRequests: EmployeeLeaveRequestItem[] = React.useMemo(() => {
    const empId = profile.id || currentUser?.employeeId || "";
    return hrmsLeaves
      .filter((hl) => hl.employeeId === empId)
      .map((hl) => ({
        id: hl.id,
        type: hl.leaveType,
        startDate: hl.startDate,
        endDate: hl.endDate,
        days: hl.days,
        reason: hl.reason,
        status: hl.status,
        appliedOn: hl.appliedDate,
        reviewedBy:
          hl.status !== "Pending" ? hl.reviewedBy || "Admin" : undefined,
      }));
  }, [hrmsLeaves, profile.id, currentUser?.employeeId]);

  const syncedLeaveBalances = React.useMemo(() => {
    const empId = profile.id || currentUser?.employeeId || "";
    return getEmployeeLeaveBalances(empId);
  }, [getEmployeeLeaveBalances, profile.id, currentUser?.employeeId]);

  const syncedClaimEntitlements = React.useMemo(() => {
    const spentByCategory: Record<string, number> = {};
    for (const claim of expenseClaims) {
      if (claim.status !== "Rejected") {
        spentByCategory[claim.category] =
          (spentByCategory[claim.category] || 0) + claim.amount;
      }
    }
    return employeeClaimEntitlements.map((ent) => {
      const spent = spentByCategory[ent.category] || 0;
      return {
        ...ent,
        spent,
        remaining: Math.max(0, ent.annualLimit - spent),
      };
    });
  }, [expenseClaims]);

  const salaryDetails = React.useMemo(
    () => computeSalaryBreakdown(grossSalary),
    [grossSalary]
  );

  const payslips: EmployeePayslip[] = React.useMemo(() => {
    const totalDed =
      salaryDetails.providentFundDeduction + salaryDetails.incomeTaxDeduction;
    return [
      {
        id: "PAY-2026-10",
        monthYear: "October 2026",
        issueDate: "Nov 01, 2026",
        grossSalary: salaryDetails.grossSalary,
        totalDeductions: totalDed,
        netPayable: salaryDetails.netPayable,
        status: "Paid",
      },
      {
        id: "PAY-2026-09",
        monthYear: "September 2026",
        issueDate: "Oct 01, 2026",
        grossSalary: salaryDetails.grossSalary,
        totalDeductions: totalDed,
        netPayable: salaryDetails.netPayable,
        status: "Paid",
      },
    ];
  }, [salaryDetails]);

  const clockIn = React.useCallback(
    async (location?: string, geo?: GeolocationData): Promise<boolean> => {
      try {
        const res = await fetch("/api/attendance/clock-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: geo?.latitude ?? 23.7925,
            longitude: geo?.longitude ?? 90.4078,
            accuracy: geo?.accuracy ?? 15,
            address: geo?.address || location,
            shortLocation: location,
            checkInType: geo?.checkInType || "Time Clock",
            clientName: geo?.clientName,
            purposeNote: geo?.purposeNote,
            selfieUrl: geo?.selfieUrl,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          record?: EmployeePunchRecord & { checkInAt?: string };
          error?: string;
        };

        if (!res.ok || !data.record) {
          showToast(
            "Clock-In Failed",
            data.error || "Unable to verify GPS clock-in.",
            "error"
          );
          return false;
        }

        const nowTs = data.record.checkInAt
          ? new Date(data.record.checkInAt).getTime()
          : Date.now();
        shiftClockState.baseSeconds = 0;
        shiftClockState.isClockedIn = true;
        shiftClockState.startedAtMs = nowTs;
        shiftClockState.nowMs = Date.now();
        notifyShiftClockListeners();

        setIsClockedIn(true);
        setTodayCheckInTime(data.record.checkIn);
        setTodayCheckOutTime(null);

        setPunchHistory((prev) => {
          const rest = prev.filter((p) => p.date !== data.record!.date);
          return [data.record!, ...rest];
        });

        setNotifications((prev) => [
          {
            id: `enotif-${Date.now()}`,
            title: "Clocked In Successfully (GPS Saved)",
            message: `Check-in at ${data.record!.checkIn} from ${
              data.record!.geo?.address || data.record!.location
            }.`,
            type: "attendance",
            time: "Just now",
            read: false,
          },
          ...prev,
        ]);

        void refreshHRMSData();
        showToast(
          "Clocked In (GPS Logged)",
          `Verified location: ${data.record.location}`,
          "success"
        );
        return true;
      } catch {
        showToast("Network Error", "Could not save clock-in location.", "error");
        return false;
      }
    },
    [refreshHRMSData, showToast]
  );

  const clockOut = React.useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/attendance/clock-out", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        record?: EmployeePunchRecord;
        error?: string;
      };

      if (!res.ok || !data.record) {
        showToast(
          "Clock-Out Failed",
          data.error || "No active clock-in session found.",
          "error"
        );
        return false;
      }

      const elapsed =
        shiftClockState.startedAtMs !== null
          ? Math.max(
              0,
              Math.floor((Date.now() - shiftClockState.startedAtMs) / 1000)
            )
          : 0;
      shiftClockState.baseSeconds = elapsed;
      shiftClockState.isClockedIn = false;
      shiftClockState.startedAtMs = null;
      shiftClockState.nowMs = 0;
      notifyShiftClockListeners();

      setIsClockedIn(false);
      setTodayCheckOutTime(data.record.checkOut);

      setPunchHistory((prev) =>
        prev.map((p) => (p.date === data.record!.date ? data.record! : p))
      );

      setNotifications((prev) => [
        {
          id: `enotif-${Date.now()}`,
          title: "Clocked Out Successfully",
          message: `Logged out at ${data.record!.checkOut}. Hours logged: ${
            data.record!.workHours
          }.`,
          type: "attendance",
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);

      void refreshHRMSData();
      showToast(
        "Clocked Out",
        `Total duration logged: ${data.record.workHours}`,
        "success"
      );
      return true;
    } catch {
      showToast("Network Error", "Could not save clock-out.", "error");
      return false;
    }
  }, [refreshHRMSData, showToast]);

  const applyLeave = async (data: {
    type: LeaveType;
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
          startDate: data.startDate,
          endDate: data.endDate,
          days: data.days,
          reason: data.reason,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        request?: { id: string };
        error?: string;
      };

      if (!res.ok) {
        return {
          success: false,
          message: json.error || "Failed to submit Annual Leave application.",
        };
      }

      await refreshHRMSData();
      setNotifications((prev) => [
        {
          id: `enotif-${Date.now()}`,
          title: "Annual Leave Application Submitted",
          message: `Your ${data.days}-day leave request (${data.startDate} to ${data.endDate}) was submitted.`,
          type: "leave",
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);

      return {
        success: true,
        message: `Annual Leave application for ${data.days} day(s) submitted successfully.`,
      };
    } catch {
      return {
        success: false,
        message: "Network error submitting leave request.",
      };
    }
  };

  const submitClaim = async (data: {
    title: string;
    category: ExpenseClaim["category"];
    amount: number;
    dateIncurred: string;
    merchantName: string;
    receiptFileName?: string;
    description: string;
  }) => {
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as {
        claim?: ExpenseClaim;
        error?: string;
      };

      if (!res.ok || !json.claim) {
        return {
          success: false,
          message: json.error || "Failed to submit claim.",
        };
      }

      setExpenseClaims((prev) => [json.claim!, ...prev]);
      showToast(
        "e-Claim Submitted",
        `Claim #${json.claim.id} saved for Admin approval.`,
        "success"
      );
      return {
        success: true,
        message: `Claim #${json.claim.id} submitted for review.`,
      };
    } catch {
      return { success: false, message: "Network error submitting claim." };
    }
  };

  const cancelClaim = async (id: string) => {
    try {
      const res = await fetch(`/api/claims/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setExpenseClaims((prev) => prev.filter((c) => c.id !== id));
      showToast("Claim Cancelled", `Claim #${id} withdrawn.`, "info");
    } catch {
      showToast("Error", "Could not cancel claim.", "error");
    }
  };

  const submitHRRequest = (data: {
    type: EmployeeHRRequest["type"];
    subject: string;
    details: string;
  }) => {
    const newReq: EmployeeHRRequest = {
      id: `REQ-${Math.floor(400 + Math.random() * 500)}`,
      type: data.type,
      subject: data.subject,
      details: data.details,
      submittedOn: "Today",
      status: "Pending",
    };
    setHrRequests((prev) => [newReq, ...prev]);
    return {
      success: true,
      message: `Request #${newReq.id} logged with HR Operations.`,
    };
  };

  const submitAttendanceCorrection = (data: {
    date: string;
    punchType: string;
    correctTime: string;
    reason: string;
  }) => {
    const newReq: EmployeeHRRequest = {
      id: `REQ-${Math.floor(400 + Math.random() * 500)}`,
      type: "Attendance Correction",
      subject: `Correction Request for ${data.date} (${data.punchType})`,
      details: `Requested time: ${data.correctTime}. Reason: ${data.reason}`,
      submittedOn: "Today",
      status: "In Review",
    };
    setHrRequests((prev) => [newReq, ...prev]);
    return {
      success: true,
      message: "Attendance correction request submitted.",
    };
  };

  const updateProfile = async (data: {
    phone: string;
    location: string;
    bloodGroup: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  }) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return;
      setProfile((prev) => ({
        ...prev,
        phone: data.phone,
        location: data.location,
        bloodGroup: data.bloodGroup,
        emergencyContact: data.emergencyContact,
      }));
      showToast("Profile Updated", "Personal details saved to MongoDB.", "success");
    } catch {
      showToast("Error", "Failed to save profile.", "error");
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateGoalSelfAssessment = (goalId: string, notes: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, keyMetric: `${g.keyMetric} • [Self Note: ${notes}]` }
          : g
      )
    );
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <EmployeeContext.Provider
      value={{
        profile: isAuthenticated ? profile : emptyProfile,
        isClockedIn: isAuthenticated ? isClockedIn : false,
        todayCheckInTime: isAuthenticated ? todayCheckInTime : null,
        todayCheckOutTime: isAuthenticated ? todayCheckOutTime : null,
        punchHistory: isAuthenticated ? punchHistory : [],
        leaveBalances: isAuthenticated ? syncedLeaveBalances : [],
        leaveRequests: isAuthenticated ? syncedLeaveRequests : [],
        officeHolidays,
        salaryDetails,
        payslips,
        goals,
        hrRequests,
        notifications,
        unreadNotificationCount,
        isClockInModalOpen,
        setIsClockInModalOpen,
        selectedPunchForLocation,
        openLocationModal,
        closeLocationModal,
        expenseClaims: isAuthenticated ? expenseClaims : [],
        claimEntitlements: syncedClaimEntitlements,
        submitClaim,
        cancelClaim,
        clockIn,
        clockOut,
        applyLeave,
        submitHRRequest,
        submitAttendanceCorrection,
        updateProfile,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateGoalSelfAssessment,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = React.useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
}
