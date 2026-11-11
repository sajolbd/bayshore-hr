"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/context/toast-context";
import { HRMSProvider, useHRMS } from "@/context/hrms-context";
import { AdminProvider } from "@/context/admin-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { EmployeeProvider, useEmployee } from "@/context/employee-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchModal } from "@/components/layout/search-modal";
import { AddEmployeeModal } from "@/components/dashboard/add-employee-modal";
import { ExportModal } from "@/components/dashboard/export-modal";
import { EmployeeDetailModal } from "@/components/employees/employee-detail-modal";
import { EditEmployeeModal } from "@/components/employees/edit-employee-modal";
import { DeleteEmployeeModal } from "@/components/employees/delete-employee-modal";
import { AddAdminModal } from "@/components/admin/add-admin-modal";
import { SignOutModal } from "@/components/auth/signout-modal";
import { AttendanceLocationModal } from "@/components/common/attendance-location-modal";
import { ClockInModal } from "@/components/employee/clock-in-modal";
import { AttendanceRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, selectedAttendanceForLocation, closeLocationModal } =
    useHRMS();
  const {
    profile,
    isClockInModalOpen,
    setIsClockInModalOpen,
    selectedPunchForLocation,
    closeLocationModal: closeEmployeeLocationModal,
  } = useEmployee();
  const { isEmployeeView, isAuthenticated, isHydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicAuthRoute =
    pathname === "/login" || pathname.startsWith("/accept-invite");

  React.useEffect(() => {
    if (isHydrated && !isAuthenticated && !isPublicAuthRoute) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, isPublicAuthRoute, router]);

  if (isPublicAuthRoute) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
          <span className="text-xs font-medium text-slate-500">
            Loading Bayshore HR...
          </span>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center max-w-md w-full shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-3">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Please sign in with your Bayshore HR credentials to access this workspace.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            Go to Sign In Page
          </Button>
        </div>
      </main>
    );
  }

  const employeeConvertedRecord: AttendanceRecord | null =
    selectedPunchForLocation
      ? {
          id: selectedPunchForLocation.id || "punch-active",
          employeeId: profile.id,
          employeeName: profile.name,
          employeeEmail: profile.email,
          avatar: profile.avatar,
          department: profile.department,
          role: profile.role,
          checkIn: selectedPunchForLocation.checkIn || "--:--",
          checkOut: selectedPunchForLocation.checkOut,
          status: selectedPunchForLocation.status,
          workHours: selectedPunchForLocation.workHours,
          location: selectedPunchForLocation.location,
          geo: selectedPunchForLocation.geo,
        }
      : null;

  const activeRecordToInspect =
    selectedAttendanceForLocation || employeeConvertedRecord;

  const isAdminOnlyRoute =
    isEmployeeView && !pathname.startsWith("/employee") && pathname !== "/";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-100 selection:text-orange-900">
      <Sidebar />
      <MobileNav />
      <SearchModal />
      <AddEmployeeModal />
      <ExportModal />
      <EmployeeDetailModal />
      <EditEmployeeModal />
      <DeleteEmployeeModal />
      <AddAdminModal />
      <SignOutModal />
      <AttendanceLocationModal
        isOpen={Boolean(activeRecordToInspect)}
        onClose={() => {
          if (selectedAttendanceForLocation) closeLocationModal();
          if (selectedPunchForLocation) closeEmployeeLocationModal();
        }}
        record={activeRecordToInspect}
      />
      <ClockInModal
        isOpen={isClockInModalOpen}
        onClose={() => setIsClockInModalOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Header />
        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all duration-300",
            isSidebarCollapsed ? "lg:pl-24" : "lg:pl-68"
          )}
        >
          {isAdminOnlyRoute ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-8 text-center max-w-lg mx-auto my-12 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4 shadow-2xs">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Administrative Route Restricted
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Signed in as Employee <strong>{profile.name}</strong>.
                Administrative modules and organization payroll tools are
                accessible only to authorized Admin accounts.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/employee/dashboard")}
                  className="text-xs"
                >
                  Return to My Dashboard
                </Button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminProvider>
          <HRMSProvider>
            <EmployeeProvider>
              <ShellContent>{children}</ShellContent>
            </EmployeeProvider>
          </HRMSProvider>
        </AdminProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
