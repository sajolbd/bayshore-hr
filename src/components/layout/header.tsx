"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  Menu,
  ChevronRight,
  UserPlus,
  FileDown,
  Megaphone,
  CalendarCheck,
  User,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  Crown,
  MapPin,
  Receipt,
  CalendarOff,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { useEmployee, useLiveShiftSeconds } from "@/context/employee-context";
import { ActivityItem } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function getAdminNotificationMeta(activity: ActivityItem): {
  title: string;
  route: string;
} {
  const lowerAction = activity.action.toLowerCase();
  if (lowerAction.includes("clocked")) {
    return { title: "GPS Attendance Event", route: "/attendance" };
  }
  if (lowerAction.includes("e-claim")) {
    return { title: "e-Claim Voucher Submitted", route: "/claims" };
  }
  switch (activity.type) {
    case "leave":
      return { title: "Leave Request Activity", route: "/leaves" };
    case "payroll":
      return { title: "Payroll & Compensation", route: "/payroll" };
    case "recruitment":
      return { title: "Recruitment & Interviews", route: "/recruitment" };
    case "review":
      return { title: "Performance Review", route: "/performance" };
    case "policy":
      return { title: "HR Policy & Documents", route: "/documents" };
    default:
      return { title: "People Operations Update", route: "/employees" };
  }
}

function HeaderShiftTimer({ onClick }: { onClick: () => void }) {
  const todayWorkSeconds = useLiveShiftSeconds();
  const empHours = Math.floor(todayWorkSeconds / 3600);
  const empMinutes = Math.floor((todayWorkSeconds % 3600) / 60);

  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden xl:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      <Clock className="h-3.5 w-3.5 text-emerald-600" />
      <span>
        {String(empHours).padStart(2, "0")}h {String(empMinutes).padStart(2, "0")}m
      </span>
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activities,
    isSidebarCollapsed,
    setIsMobileNavOpen,
    setIsAddEmployeeOpen,
    setIsExportModalOpen,
    setIsSearchModalOpen,
  } = useHRMS();

  const {
    currentUser,
    currentRole,
    isEmployeeView,
    isSuperAdmin,
    setIsSignOutModalOpen,
  } = useAuth();

  const {
    isClockedIn,
    setIsClockInModalOpen,
    notifications: employeeNotifications,
    unreadNotificationCount: empUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useEmployee();

  const [readAdminActivityIds, setReadAdminActivityIds] = React.useState<Set<string>>(
    () => new Set()
  );

  const adminNotifications = React.useMemo(() => {
    return activities.slice(0, 6).map((act) => {
      const meta = getAdminNotificationMeta(act);
      return {
        id: act.id,
        title: meta.title,
        description: `${act.user} ${act.action} ${act.target}`,
        time: act.timestamp,
        route: meta.route,
        unread: !readAdminActivityIds.has(act.id),
      };
    });
  }, [activities, readAdminActivityIds]);

  const adminUnreadCount = adminNotifications.filter((n) => n.unread).length;

  const markAllAdminAsRead = () => {
    setReadAdminActivityIds(new Set(activities.map((a) => a.id)));
  };

  const markAdminNotificationAsRead = (id: string) => {
    setReadAdminActivityIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const displayUser = currentUser || {
    id: "USER",
    name: "User",
    email: "",
    avatar: "",
    role: currentRole,
    department: "Bayshore Communication",
  };

  const getBreadcrumbTitle = () => {
    switch (pathname) {
      case "/":
        return isEmployeeView ? "My Dashboard" : "Dashboard Overview";
      case "/employees":
        return "Employee Directory";
      case "/departments":
        return "Departments & Teams";
      case "/attendance":
        return "Daily Attendance & GPS";
      case "/leaves":
        return "Annual Leave & Quotas";
      case "/schedules":
        return "Shifts & Scheduling";
      case "/payroll":
        return "Payroll & Compensation";
      case "/claims":
        return "e-Claims & Expense Management";
      case "/recruitment":
        return "Recruitment & ATS";
      case "/performance":
        return "Performance Reviews";
      case "/documents":
        return "HR Documents";
      case "/reports":
        return "Reports & Analytics";
      case "/announcements":
        return "Company Bulletins";
      case "/admin":
        return "Admin Governance Console";
      case "/settings":
        return "System Settings";
      case "/employee/dashboard":
        return "My Dashboard";
      case "/employee/profile":
        return "My Profile";
      case "/employee/attendance":
        return "My Attendance & GPS Logs";
      case "/employee/leave":
        return "My Annual Leave";
      case "/employee/schedule":
        return "My Shifts & Schedule";
      case "/employee/salary":
        return "My Salary & Payslips";
      case "/employee/claims":
        return "My e-Claims & Expenses";
      case "/employee/performance":
        return "Goals & OKRs";
      case "/employee/documents":
        return "My Document Library";
      case "/employee/calendar":
        return "Company Holiday Calendar";
      case "/employee/requests":
        return "HR Helpdesk & Requests";
      case "/employee/announcements":
        return "Company Announcements";
      case "/employee/notifications":
        return "Notifications Center";
      case "/employee/settings":
        return "Account Preferences";
      default:
        return "Dashboard";
    }
  };

  const activeUnreadCount = isEmployeeView ? empUnreadCount : adminUnreadCount;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md transition-all duration-300",
        isSidebarCollapsed ? "lg:pl-24" : "lg:pl-68"
      )}
    >
      {/* Left side: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs truncate">
          <span className="text-slate-400 font-medium">
            {isEmployeeView ? "Employee Self-Service" : "Admin Suite"}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">
            {getBreadcrumbTitle()}
          </span>
        </nav>
      </div>

      {/* Right side: Role Badge + Search + Quick Action + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 w-48 lg:w-56 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-100/70 transition-all cursor-pointer shadow-2xs"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Search...</span>
          <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {isEmployeeView && !isClockedIn && (
          <Button
            size="sm"
            onClick={() => setIsClockInModalOpen(true)}
            className="hidden sm:inline-flex gap-1.5 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Clock In (GPS)</span>
          </Button>
        )}

        {isEmployeeView && isClockedIn && (
          <HeaderShiftTimer onClick={() => router.push("/employee/attendance")} />
        )}

        {/* Active Role Badge */}
        <div
          className={cn(
            "hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold shadow-2xs",
            isEmployeeView
              ? "bg-orange-50 border-orange-200 text-orange-800"
              : "bg-slate-900 border-slate-800 text-white"
          )}
        >
          {isEmployeeView ? (
            <User className="h-3.5 w-3.5 text-orange-600 shrink-0" />
          ) : (
            <Crown className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          )}
          <span className="truncate max-w-[120px]">{currentRole}</span>
        </div>

        {/* Quick Action Button Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className:
                  "gap-1.5 h-9 rounded-xl border-slate-200 text-slate-700 hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-700 font-medium",
              })}
            >
              <Plus className="h-4 w-4 text-orange-600" />
              <span className="hidden lg:inline">Quick Action</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-56">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {isEmployeeView ? "Self-Service Actions" : "Admin Shortcuts"}
            </div>
            {isEmployeeView ? (
              <>
                <DropdownMenuItem onClick={() => setIsClockInModalOpen(true)}>
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>GPS Clock In / Field Check-In</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/employee/leave")}>
                  <CalendarOff className="h-4 w-4 text-orange-600" />
                  <span>Apply for Annual Leave</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/employee/claims")}>
                  <Receipt className="h-4 w-4 text-blue-600" />
                  <span>Submit e-Claim Voucher</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/employee/requests")}>
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>Raise HR Ticket</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {isSuperAdmin && (
                  <DropdownMenuItem onClick={() => setIsAddEmployeeOpen(true)}>
                    <UserPlus className="h-4 w-4 text-orange-600" />
                    <span>Add &amp; Invite Employee</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsExportModalOpen(true)}>
                  <FileDown className="h-4 w-4 text-slate-500" />
                  <span>Export Reports</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/leaves")}>
                  <CalendarCheck className="h-4 w-4 text-emerald-600" />
                  <span>Leave Management</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/claims")}>
                  <Receipt className="h-4 w-4 text-orange-600" />
                  <span>Review e-Claims Queue</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/announcements")}>
                  <Megaphone className="h-4 w-4 text-blue-600" />
                  <span>Post Announcement</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Popover */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {activeUnreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-80 p-0 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {activeUnreadCount > 0 && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                    {activeUnreadCount} new
                  </span>
                )}
              </div>
              {activeUnreadCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    isEmployeeView ? markAllNotificationsAsRead() : markAllAdminAsRead()
                  }
                  className="text-[11px] font-medium text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {isEmployeeView ? (
                employeeNotifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      router.push("/employee/notifications");
                    }}
                    className={cn(
                      "p-3.5 transition-colors hover:bg-slate-50 cursor-pointer flex gap-3",
                      !notif.read && "bg-orange-50/30"
                    )}
                  >
                    <div className="mt-0.5">
                      <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))
              ) : adminNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No recent notifications yet.
                </div>
              ) : (
                adminNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAdminNotificationAsRead(notif.id);
                      router.push(notif.route);
                    }}
                    className={cn(
                      "p-3.5 transition-colors hover:bg-slate-50 cursor-pointer flex gap-3",
                      notif.unread && "bg-orange-50/30"
                    )}
                  >
                    <div className="mt-0.5">
                      <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {notif.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    isEmployeeView ? "/employee/notifications" : "/attendance"
                  )
                }
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline py-1 cursor-pointer"
              >
                {isEmployeeView
                  ? "View all notifications"
                  : "View live attendance & GPS logs"}
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="User account menu"
            >
              <Avatar
                src={displayUser.avatar}
                alt={displayUser.name}
                fallback={displayUser.name}
                size="md"
                status="online"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-60">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-900">
                {displayUser.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {displayUser.email}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                {displayUser.role}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                router.push(isEmployeeView ? "/employee/profile" : "/settings")
              }
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>{isEmployeeView ? "My Profile" : "Account Profile"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(isEmployeeView ? "/employee/settings" : "/settings")
              }
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Preferences</span>
            </DropdownMenuItem>
            {!isEmployeeView && (
              <DropdownMenuItem onClick={() => router.push("/admin")}>
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span>Admin Console</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onClick={() => setIsSignOutModalOpen(true)}
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
