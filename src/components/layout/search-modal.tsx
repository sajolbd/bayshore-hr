"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  X,
  FileDown,
  Plus,
  MapPin,
  CalendarOff,
  Receipt,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useHRMS } from "@/context/hrms-context";
import { useAuth } from "@/context/auth-context";
import { useEmployee } from "@/context/employee-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function SearchModal() {
  const router = useRouter();
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    employees,
    setIsAddEmployeeOpen,
    setIsExportModalOpen,
  } = useHRMS();

  const { isEmployeeView, isSuperAdmin } = useAuth();
  const { setIsClockInModalOpen } = useEmployee();

  const [query, setQuery] = React.useState("");

  const closeModal = React.useCallback(() => {
    setQuery("");
    setIsSearchModalOpen(false);
  }, [setIsSearchModalOpen]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      } else if (e.key === "Escape" && isSearchModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen, closeModal]);

  if (!isSearchModalOpen) return null;

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.role.toLowerCase().includes(query.toLowerCase()) ||
      emp.department.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="h-4 w-4 text-orange-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEmployeeView
                ? "Type to search colleagues, quick actions, or modules..."
                : "Type to search employees, departments, or quick actions..."
            }
            className="w-full px-3 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions Group */}
          <div>
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isEmployeeView ? "Self-Service Quick Shortcuts" : "Admin Quick Shortcuts"}
            </p>
            <div className="space-y-1">
              {isEmployeeView ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      setIsClockInModalOpen(true);
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <span>Clock In / Field Check-In (GPS)</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      router.push("/employee/leave");
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                        <CalendarOff className="h-3.5 w-3.5" />
                      </span>
                      <span>Apply for Leave</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-orange-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      router.push("/employee/claims");
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                        <Receipt className="h-3.5 w-3.5" />
                      </span>
                      <span>Submit e-Claim Expense Voucher</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      router.push("/employee/salary");
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                        <CreditCard className="h-3.5 w-3.5" />
                      </span>
                      <span>View My Payslips &amp; Compensation</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      router.push("/employee/calendar");
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <Calendar className="h-3.5 w-3.5" />
                      </span>
                      <span>Company Holiday Calendar 2026</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600" />
                  </button>
                </>
              ) : (
                <>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchModalOpen(false);
                        setIsAddEmployeeOpen(true);
                      }}
                      className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                        <span>Add &amp; Invite New Employee</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-orange-600" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      setIsExportModalOpen(true);
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                        <FileDown className="h-3.5 w-3.5" />
                      </span>
                      <span>Export HRMS Report (CSV/PDF)</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Directory Team Results (Admin Only) */}
          {!isEmployeeView && (
            <div>
              <div className="flex items-center justify-between px-2 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Team Directory ({filteredEmployees.length})
                </span>
              </div>

              {filteredEmployees.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching team members found for &quot;{query}&quot;.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredEmployees.slice(0, 5).map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => {
                        closeModal();
                        router.push("/employees");
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={emp.avatar}
                          alt={emp.name}
                          fallback={emp.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {emp.role} • {emp.department}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {emp.department}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search navigation</span>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
