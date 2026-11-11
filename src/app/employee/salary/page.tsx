"use client";

import * as React from "react";
import {
  Eye,
  Building,
  Lock,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/utils";
import { PayslipModal } from "@/components/employee/payslip-modal";
import { EmployeePayslip } from "@/types/employee-portal";

export default function EmployeeSalaryPage() {
  const { salaryDetails, payslips } = useEmployee();
  const [selectedPayslip, setSelectedPayslip] = React.useState<EmployeePayslip | null>(null);

  const totalAllowances =
    salaryDetails.houseRentAllowance +
    salaryDetails.medicalAllowance +
    salaryDetails.conveyanceAllowance;

  const totalDeductions =
    salaryDetails.providentFundDeduction + salaryDetails.incomeTaxDeduction;

  return (
    <div className="space-y-6">
      {/* Header with Confidentiality Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              My Finance & Salary Statement
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200">
              <Lock className="h-3 w-3" />
              Confidential
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Personal compensation package, allowance breakdown, and historical monthly payslips.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Current Net Pay (Monthly)</span>
          <span className="text-2xl font-black text-orange-600">
            {formatBDT(salaryDetails.netPayable)}
          </span>
        </div>
      </div>

      {/* Salary Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Total Gross Compensation</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {formatBDT(salaryDetails.grossSalary)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Monthly Contractual Base</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-emerald-600 block font-medium">Total Allowances</span>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {formatBDT(totalAllowances)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">HRA, Medical, Conveyance</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-red-600 block font-medium">Monthly Deductions</span>
          <div className="text-2xl font-bold text-red-600 mt-2">
            -{formatBDT(totalDeductions)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Provident Fund & TDS Tax</span>
        </div>
      </div>

      {/* Detailed Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Structure */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Earnings Breakdown</h3>
            <Badge variant="success">Disbursed via Bank</Badge>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Basic Salary (63.6%)</span>
              <span className="font-bold text-slate-900">{formatBDT(salaryDetails.basicSalary)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">House Rent Allowance (HRA)</span>
              <span className="font-semibold text-slate-900">{formatBDT(salaryDetails.houseRentAllowance)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Medical Allowance</span>
              <span className="font-semibold text-slate-900">{formatBDT(salaryDetails.medicalAllowance)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Conveyance Allowance</span>
              <span className="font-semibold text-slate-900">{formatBDT(salaryDetails.conveyanceAllowance)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Festival Bonus Provision</span>
              <span className="text-emerald-600 font-semibold">2x Annual Basic (Eid/Puja)</span>
            </div>
            <div className="py-3 flex justify-between text-sm font-bold bg-slate-50/70 px-3 rounded-xl border border-slate-200">
              <span className="text-slate-900">Total Monthly Gross</span>
              <span className="text-orange-600">{formatBDT(salaryDetails.grossSalary)}</span>
            </div>
          </div>
        </div>

        {/* Deductions & Bank Routing */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Statutory Deductions</h3>
              <span className="text-xs text-slate-400">Monthly</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <div>
                  <span className="text-slate-700 font-medium block">Employee Provident Fund (EPF)</span>
                  <span className="text-[11px] text-slate-400">Matched 100% by Bayshore Communication</span>
                </div>
                <span className="font-bold text-red-600">-{formatBDT(salaryDetails.providentFundDeduction)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <div>
                  <span className="text-slate-700 font-medium block">Tax Deducted at Source (TDS)</span>
                  <span className="text-[11px] text-slate-400">NBR Assessment Year 2025-2026</span>
                </div>
                <span className="font-bold text-red-600">-{formatBDT(salaryDetails.incomeTaxDeduction)}</span>
              </div>
              <div className="py-3 flex justify-between text-sm font-bold bg-slate-50/70 px-3 rounded-xl border border-slate-200">
                <span className="text-slate-900">Total Deductions</span>
                <span className="text-red-600">-{formatBDT(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Bank Disbursement Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-orange-600" />
              Corporate Bank Disbursement Account
            </h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank & Branch:</span>
                <strong className="text-slate-800">{salaryDetails.bankName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Details:</span>
                <strong className="text-slate-800 font-mono">{salaryDetails.bankAccount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="text-emerald-700 font-medium">{salaryDetails.paymentMode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Payslip Archive</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;View Statement&quot; to inspect line items or download official PDF payslips.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Payslip ID</th>
                <th className="px-6 py-3">Salary Month</th>
                <th className="px-6 py-3">Disbursed Date</th>
                <th className="px-6 py-3">Gross Earnings</th>
                <th className="px-6 py-3">Total Deductions</th>
                <th className="px-6 py-3">Net Take Home</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payslips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-bold font-mono text-slate-900">{slip.id}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-800">{slip.monthYear}</td>
                  <td className="px-6 py-3.5 text-slate-500">{slip.issueDate}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{formatBDT(slip.grossSalary)}</td>
                  <td className="px-6 py-3.5 text-red-600 font-medium">-{formatBDT(slip.totalDeductions)}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">
                    {formatBDT(slip.netPayable)}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge variant="success" className="text-[10px]">
                      {slip.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPayslip(slip)}
                      className="gap-1.5 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Statement</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PayslipModal
        payslip={selectedPayslip}
        open={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
      />
    </div>
  );
}
