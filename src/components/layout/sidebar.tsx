"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  Clock,
  CreditCard,
  UserPlus,
  Award,
  FileText,
  BarChart3,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
  Receipt,
  Calendar,
  HelpCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const adminNavItems: NavItem[] = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Employees", href: "/employees", icon: Users, badge: "248" },
  { title: "Departments", href: "/departments", icon: Building2 },
  { title: "Attendance & GPS", href: "/attendance", icon: CalendarCheck },
  { title: "Leave Management", href: "/leaves", icon: CalendarOff, badge: "4" },
  { title: "Shifts & Schedules", href: "/schedules", icon: Clock },
  { title: "Payroll & Salaries", href: "/payroll", icon: CreditCard },
  { title: "e-Claims", href: "/claims", icon: Receipt, badge: "3" },
  { title: "Recruitment", href: "/recruitment", icon: UserPlus, badge: "8" },
  { title: "Performance Reviews", href: "/performance", icon: Award },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { title: "Announcements", href: "/announcements", icon: Megaphone, badge: "New" },
  { title: "Admin Console", href: "/admin", icon: ShieldCheck, badge: "Secured" },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const employeeNavItems: NavItem[] = [
  { title: "My Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { title: "My Profile", href: "/employee/profile", icon: User },
  { title: "My Attendance (GPS)", href: "/employee/attendance", icon: CalendarCheck, badge: "GPS" },
  { title: "My Leave", href: "/employee/leave", icon: CalendarOff, badge: "3d" },
  { title: "My Schedule", href: "/employee/schedule", icon: Clock },
  { title: "My Salary & Payslips", href: "/employee/salary", icon: CreditCard },
  { title: "e-Claims & Expenses", href: "/employee/claims", icon: Receipt, badge: "New" },
  { title: "Goals & Performance", href: "/employee/performance", icon: Award },
  { title: "My Documents", href: "/employee/documents", icon: FileText },
  { title: "Company Calendar", href: "/employee/calendar", icon: Calendar },
  { title: "HR Requests", href: "/employee/requests", icon: HelpCircle, badge: "2" },
  { title: "Announcements", href: "/employee/announcements", icon: Megaphone },
  { title: "Notifications", href: "/employee/notifications", icon: Bell },
  { title: "Settings", href: "/employee/settings", icon: Settings },
];

// Default export for backward compatibility
export const navItems = adminNavItems;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebar } = useHRMS();
  const { currentUser, isEmployeeView, setIsSignOutModalOpen } = useAuth();

  const currentNav = isEmployeeView ? employeeNavItems : adminNavItems;

  const displayUser = currentUser || {
    id: "USER",
    name: "Bayshore User",
    email: "",
    role: "Employee",
    avatar: "",
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out select-none shadow-xs",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
        <Link
          href={isEmployeeView ? "/employee/dashboard" : "/"}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
            <Sparkles className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                Bayshore <span className="text-orange-600">HR</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                Bayshore Communication
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Role Context Bar */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-colors",
              isEmployeeView
                ? "bg-orange-50/80 border-orange-200/90 text-orange-900"
                : "bg-slate-50 border-slate-200/90 text-slate-800"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isEmployeeView ? (
                <User className="h-3.5 w-3.5 text-orange-600 shrink-0" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-orange-600 shrink-0" />
              )}
              <span className="font-semibold truncate">
                {isEmployeeView ? "Employee Portal" : displayUser.role}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
        </div>
      )}

      {/* Navigation Items List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/employee/dashboard"
                ? pathname === "/employee/dashboard" || pathname === "/employee" || (isEmployeeView && pathname === "/")
                : pathname.startsWith(item.href);

          const navButton = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative cursor-pointer",
                isActive
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                isSidebarCollapsed && "justify-center px-0"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-orange-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />

              {!isSidebarCollapsed && (
                <>
                  <span className="truncate flex-1">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                        isActive
                          ? "bg-orange-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Active Orange Bar for Collapsed View */}
              {isSidebarCollapsed && isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-orange-600" />
              )}
            </Link>
          );

          if (isSidebarCollapsed) {
            return (
              <Tooltip key={item.href} content={item.title} position="right">
                {navButton}
              </Tooltip>
            );
          }

          return navButton;
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs transition-all border border-transparent hover:border-slate-200",
                isSidebarCollapsed && "justify-center p-1"
              )}
            >
              <Avatar
                src={displayUser.avatar}
                alt={displayUser.name}
                fallback={displayUser.name}
                size="md"
                status="online"
              />
              {!isSidebarCollapsed && (
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {displayUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {displayUser.role}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-60 mb-2">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-900">{displayUser.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{displayUser.email}</p>
              <div className="mt-1">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                  {displayUser.role}
                </span>
              </div>
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
            {!isEmployeeView && (
              <DropdownMenuItem onClick={() => router.push("/admin")}>
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span>Admin & Roles</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                router.push(isEmployeeView ? "/employee/settings" : "/settings")
              }
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Settings & Preferences</span>
            </DropdownMenuItem>
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
    </aside>
  );
}
