"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { adminNavItems, employeeNavItems } from "./sidebar";
import { Avatar } from "@/components/ui/avatar";
import { BayshoreLogo } from "@/components/common/bayshore-logo";

export function MobileNav() {
  const pathname = usePathname();
  const { isMobileNavOpen, setIsMobileNavOpen } = useHRMS();
  const { currentUser, isEmployeeView, setIsSignOutModalOpen } = useAuth();

  const currentNav = isEmployeeView ? employeeNavItems : adminNavItems;

  const displayUser = currentUser || {
    id: "USER",
    name: "Bayshore User",
    email: "",
    role: "Employee",
    avatar: "",
  };

  React.useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname, setIsMobileNavOpen]);

  if (!isMobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
          <Link
            href={isEmployeeView ? "/employee/dashboard" : "/"}
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center gap-3"
          >
            <BayshoreLogo size={36} />
            <div>
              <span className="text-base font-bold text-slate-900">
                Bayshore <span className="text-orange-600">HR</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Bayshore Communication</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Switcher in Mobile Drawer */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              {isEmployeeView ? (
                <User className="h-4 w-4 text-orange-600" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-orange-600" />
              )}
              <span className="font-semibold text-slate-900">
                {isEmployeeView ? "Employee Mode" : displayUser.role}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/employee/dashboard"
                  ? pathname === "/employee/dashboard" || pathname === "/employee" || (isEmployeeView && pathname === "/")
                  : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-50 text-orange-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-orange-600" : "text-slate-400"
                  )}
                />
                <span className="truncate flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={displayUser.avatar}
              alt={displayUser.name}
              fallback={displayUser.name}
              size="md"
              status="online"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {displayUser.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {displayUser.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsSignOutModalOpen(true);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
