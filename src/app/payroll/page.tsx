"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CreditCard, Search, CheckCircle2, FileDown, Receipt } from "lucide-react";
import { useHRMS } from "@/context/hrms-context";
import { useToast } from "@/context/toast-context";
import { formatBDT } from "@/lib/utils";

export default function AdminPayrollPage() {
  const { employees, expenseClaims, setIsExportModalOpen } = useHRMS();
  const { showToast } = useToast();

  const [query, setQuery] = React.useState("");
  const [disbursedIds, setDisbursedIds] = React.useState<string[]>([]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.department.toLowerCase().includes(query.toLowerCase()) ||
      emp.id.toLowerCase().includes(query.toLowerCase())
  );

  const totalGrossPayroll = employees.reduce((acc, emp) => acc + emp.salary, 0);
  const totalApprovedClaims = expenseClaims
    .filter((c) => c.status === "Approved" || c.status === "Reimbursed")
    .reduce((acc, c) => acc + c.amount, 0);
  const netPayableTotal = totalGrossPayroll + totalApprovedClaims;

  const handleRunPayrollBatch = () => {
    setDisbursedIds(employees.map((e) => e.id));
    showToast(
      "Payroll Batch Queued (BDT)",
      `Disbursement instructions for ${formatBDT(netPayableTotal)} sent to City Bank BEFTN node.`,
      "success"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Payroll &amp; Salary Disbursements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            November 2026 monthly salary cycle in Bangladeshi Taka (৳ BDT) with e-Claim settlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
            className="gap-2 text-xs"
          >
            <FileDown className="h-4 w-4 text-slate-500" />
            <span>Export Bank Sheet</span>
          </Button>
          <Button
            onClick={handleRunPayrollBatch}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm text-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Disburse November Payroll</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Gross Monthly Payroll</span>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatBDT(totalGrossPayroll)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{employees.length} active roster members</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Settled e-Claims Added</span>
            <Receipt className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatBDT(totalApprovedClaims)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Merged into net bank payout</p>
        </Card>

        <Card className="p-5 bg-emerald-50/40 border-emerald-200/80">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>Net Bank Disbursement</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{formatBDT(netPayableTotal)}</p>
          <p className="text-[11px] text-emerald-600 mt-1">City Bank BEFTN • Due Nov 30</p>
        </Card>
      </div>

      {/* Salary Register */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Employee Salary Register (৳ BDT)</h2>
            <p className="text-xs text-slate-500">Monthly gross salary and direct bank transfer disbursement</p>
          </div>
          <div className="w-full sm:w-64">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search employee or dept..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Gross Pay</th>
                <th className="py-3 px-4">Net Payable</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => {
                const netPay = emp.salary;
                const isPaid = disbursedIds.includes(emp.id);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.avatar} alt={emp.name} fallback={emp.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] text-slate-500">{emp.id} • {emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{formatBDT(emp.salary)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatBDT(netPay)}</td>
                    <td className="py-3 px-5 text-right">
                      <Badge variant={isPaid ? "success" : "warning"} dot>
                        {isPaid ? "Disbursed" : "Ready"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

