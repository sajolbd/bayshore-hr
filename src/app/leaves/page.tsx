"use client";

import * as React from "react";
import { LeaveRequests } from "@/components/dashboard/leave-requests";
import { LeavePolicyModal } from "@/components/leaves/leave-policy-modal";
import { RecordLeaveModal } from "@/components/leaves/record-leave-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useHRMS } from "@/context/hrms-context";
import { OfficeHoliday } from "@/types";
import {
  SlidersHorizontal,
  Plus,
  Calendar,
  Search,
  Trash2,
  CalendarMinus,
} from "lucide-react";

export default function LeavesPage() {
  const {
    employees,
    annualLeavePolicies,
    officeHolidays,
    getEmployeeLeaveBalances,
    addOfficeHoliday,
    deleteOfficeHoliday,
  } = useHRMS();

  const [isPolicyModalOpen, setIsPolicyModalOpen] = React.useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [selectedEmpId, setSelectedEmpId] = React.useState<string | undefined>(
    undefined
  );
  const [employeeSearch, setEmployeeSearch] = React.useState("");

  // Inline Add Holiday state
  const [showAddHoliday, setShowAddHoliday] = React.useState(false);
  const [holidayForm, setHolidayForm] = React.useState({
    name: "",
    date: "",
    day: "",
    type: "Company Holiday" as OfficeHoliday["type"],
  });

  const annualPolicy = annualLeavePolicies[0] || {
    type: "Annual Leave" as const,
    yearlyQuota: 20,
    carryForwardMax: 5,
    paid: true,
    description: "",
    color: "#EA580C",
  };

  const employeeBalanceRows = React.useMemo(() => {
    return employees.map((emp) => {
      const balances = getEmployeeLeaveBalances(emp.id);
      const annual = balances[0] || {
        type: "Annual Leave" as const,
        total: annualPolicy.yearlyQuota,
        used: 0,
        available: annualPolicy.yearlyQuota,
        color: annualPolicy.color,
      };

      return {
        employee: emp,
        annual,
      };
    });
  }, [employees, getEmployeeLeaveBalances, annualPolicy.yearlyQuota, annualPolicy.color]);

  const filteredBalanceRows = employeeBalanceRows.filter(
    ({ employee }) =>
      employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      employee.department
        .toLowerCase()
        .includes(employeeSearch.toLowerCase()) ||
      employee.id.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const totalAllocated = Math.max(
    0,
    employees.length * annualPolicy.yearlyQuota
  );
  const totalUsed = employeeBalanceRows.reduce(
    (sum, row) => sum + row.annual.used,
    0
  );
  const totalRemaining = Math.max(0, totalAllocated - totalUsed);
  const pctUsed =
    totalAllocated > 0
      ? Math.min(100, Math.round((totalUsed / totalAllocated) * 100))
      : 0;

  const handleOpenRecordModal = (empId?: string) => {
    setSelectedEmpId(empId);
    setIsRecordModalOpen(true);
  };

  const handleAddHolidaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.name.trim() || !holidayForm.date.trim()) return;
    addOfficeHoliday({
      name: holidayForm.name.trim(),
      date: holidayForm.date.trim(),
      day: holidayForm.day.trim() || "Official Day Off",
      type: holidayForm.type,
    });
    setHolidayForm({
      name: "",
      date: "",
      day: "",
      type: "Company Holiday",
    });
    setShowAddHoliday(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Annual Leave Management &amp; Quotas
            </h1>
            <Badge variant="orange" className="text-[11px] font-semibold">
              {annualPolicy.yearlyQuota} Fixed Days / Yr •{" "}
              {officeHolidays.length} Holidays
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Set fixed yearly Annual Leave days, manage fixed office holidays,
            approve requests, and track automatic day deductions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPolicyModalOpen(true)}
            className="gap-1.5 border-orange-200 bg-orange-50/70 text-orange-700 hover:bg-orange-100"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Set Yearly Quota</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenRecordModal(undefined)}
            className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Record Leave</span>
          </Button>
        </div>
      </div>

      {/* Live Annual Leave Policy & Pool Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Yearly Annual Leave Quota
            </span>
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(true)}
              className="text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              Edit Quota
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {annualPolicy.yearlyQuota} Days
            </span>
            <span className="text-xs text-slate-500">/ employee per year</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Max carry-forward: {annualPolicy.carryForwardMax} days to next cycle
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Team Annual Leave Pool
            </span>
            <Badge variant="outline" className="text-[10px]">
              {employees.length} Staff
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {totalRemaining}d
            </span>
            <span className="text-xs text-slate-500">
              {totalUsed}d used of {totalAllocated}d
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${pctUsed}%` }}
            />
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fixed Office Holidays
            </span>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {officeHolidays.length} Days
            </span>
            <span className="text-xs text-slate-500">Gazetted &amp; Company</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Excluded from Annual Leave day deductions
          </p>
        </Card>
      </div>

      {/* Pending Requests + Fixed Office Holidays Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeaveRequests />
        </div>

        {/* Fixed Yearly Office Holidays Panel */}
        <div className="lg:col-span-1">
          <Card className="p-5 h-full flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Fixed Office Holidays ({officeHolidays.length})
                  </h3>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddHoliday((prev) => !prev)}
                  className="h-7 px-2 text-[11px] gap-1"
                >
                  <Plus className="h-3 w-3 text-orange-600" />
                  <span>{showAddHoliday ? "Close" : "Add Holiday"}</span>
                </Button>
              </div>

              {showAddHoliday && (
                <form
                  onSubmit={handleAddHolidaySubmit}
                  className="p-3 rounded-xl border border-orange-200 bg-orange-50/40 space-y-2.5 text-xs"
                >
                  <Input
                    placeholder="Holiday name (e.g. Eid-ul-Fitr)"
                    value={holidayForm.name}
                    onChange={(e) =>
                      setHolidayForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Date (e.g. Mar 20, 2027)"
                      value={holidayForm.date}
                      onChange={(e) =>
                        setHolidayForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      required
                    />
                    <Input
                      placeholder="Day (e.g. Saturday)"
                      value={holidayForm.day}
                      onChange={(e) =>
                        setHolidayForm((prev) => ({
                          ...prev,
                          day: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Select
                    value={holidayForm.type}
                    onChange={(e) =>
                      setHolidayForm((prev) => ({
                        ...prev,
                        type: e.target.value as OfficeHoliday["type"],
                      }))
                    }
                    options={[
                      { label: "National Holiday", value: "National Holiday" },
                      { label: "Gazetted Holiday", value: "Gazetted Holiday" },
                      { label: "Company Holiday", value: "Company Holiday" },
                    ]}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Save Fixed Holiday
                  </Button>
                </form>
              )}

              <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto pr-0.5">
                {officeHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-slate-900">{holiday.name}</p>
                        <Badge variant="orange" className="text-[10px]">
                          {holiday.type}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">
                        {holiday.date} • {holiday.day}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteOfficeHoliday(holiday.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                      aria-label={`Remove ${holiday.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 text-center">
              Synced live across Bayshore Admin &amp; Employee Self-Service calendars.
            </p>
          </Card>
        </div>
      </div>

      {/* Live Employee Annual Leave Balance & Deduction Register */}
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Employee Annual Leave Balances (Auto-Deducted)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Remaining days automatically decrease when Annual Leave is taken and restore if rejected.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search employee or dept..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Fixed Yearly Quota</TableHead>
              <TableHead>Used YTD</TableHead>
              <TableHead>Remaining Days</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBalanceRows.map(({ employee, annual }) => (
              <TableRow key={employee.id} className="hover:bg-slate-50/70">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={employee.avatar}
                      alt={employee.name}
                      fallback={employee.name}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {employee.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {employee.id} • {employee.department}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px] font-semibold">
                    {annual.total} Days / Yr
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-amber-700">
                    {annual.used}d used
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={annual.available > 5 ? "success" : "warning"}
                    className="text-[11px] font-bold"
                  >
                    {annual.available} / {annual.total}d left
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenRecordModal(employee.id)}
                    className="h-7 px-2.5 text-[11px] gap-1"
                  >
                    <CalendarMinus className="h-3.5 w-3.5 text-orange-600" />
                    <span>Deduct Leave</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modals */}
      <LeavePolicyModal
        open={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />
      <RecordLeaveModal
        open={isRecordModalOpen}
        initialEmployeeId={selectedEmpId}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </div>
  );
}
