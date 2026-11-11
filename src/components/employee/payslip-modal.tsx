"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useEmployee } from "@/context/employee-context";
import { EmployeePayslip } from "@/types/employee-portal";
import { formatBDT } from "@/lib/utils";
import { Download, Printer, ShieldCheck, CheckCircle2 } from "lucide-react";
import { BayshoreLogo } from "@/components/common/bayshore-logo";

interface PayslipModalProps {
  payslip: EmployeePayslip | null;
  open: boolean;
  onClose: () => void;
}

export function PayslipModal({ payslip, open, onClose }: PayslipModalProps) {
  const { profile, salaryDetails } = useEmployee();
  const [downloading, setDownloading] = React.useState(false);
  const downloadTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(() => {
    return () => {
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    };
  }, []);

  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    setDownloading(true);
    downloadTimerRef.current = setTimeout(() => {
      setDownloading(false);
      // Simulate download trigger
      const element = document.createElement("a");
      const file = new Blob(
        [
          `BAYSHORE COMMUNICATION - OFFICIAL PAYSLIP\n` +
            `Month: ${payslip.monthYear}\n` +
            `Employee: ${profile.name} (${profile.id})\n` +
            `Department: ${profile.department} | Role: ${profile.role}\n` +
            `Gross Salary: ৳${payslip.grossSalary.toLocaleString("en-IN")}\n` +
            `Net Payable: ৳${payslip.netPayable.toLocaleString("en-IN")}\n` +
            `Bank: ${salaryDetails.bankAccount} (${salaryDetails.bankName})\n` +
            `Status: ${payslip.status}\n` +
            `Issued: ${payslip.issueDate}`,
        ],
        { type: "text/plain" }
      );
      const url = URL.createObjectURL(file);
      element.href = url;
      element.download = `Payslip_${profile.id}_${payslip.monthYear.replace(" ", "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    }, 600);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Payslip - ${payslip.monthYear}`}
      description="Official monthly compensation statement issued by Bayshore Communication Finance Department."
      size="lg"
    >
      <div className="space-y-5">
        {/* Printable Payslip Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5 print:border-none print:shadow-none">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <BayshoreLogo size={44} />
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Bayshore Communication Ltd.
                </h3>
                <p className="text-xs text-slate-500">
                  Level 11, Bay&apos;s Bellavista, Gulshan 2, Dhaka-1212, Bangladesh
                </p>
                <p className="text-[11px] text-slate-400">
                  Trade License: TRAD/DNCC/024891/2024 • TIN: 482910492810
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {payslip.status} • {payslip.monthYear}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Disbursement Date: {payslip.issueDate}
              </span>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">EMPLOYEE NAME</span>
              <strong className="text-slate-900 font-semibold">{profile.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">EMPLOYEE ID</span>
              <strong className="text-slate-900 font-semibold">{profile.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DESIGNATION</span>
              <strong className="text-slate-900 font-semibold truncate block">{profile.role}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DEPARTMENT</span>
              <strong className="text-slate-900 font-semibold">{profile.department}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[10px]">SALARY ACCOUNT</span>
              <strong className="text-slate-900 font-semibold">{salaryDetails.bankAccount}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[10px]">DISBURSEMENT CHANNEL</span>
              <strong className="text-slate-900 font-semibold truncate block">{salaryDetails.paymentMode}</strong>
            </div>
          </div>

          {/* Earnings Breakdown Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100/70 px-3.5 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">
              Earnings Breakdown
            </div>
            <div className="divide-y divide-slate-100 p-2 text-xs">
              <div className="flex justify-between py-1.5 px-2">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-semibold text-slate-900">{formatBDT(salaryDetails.basicSalary)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-2">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-slate-900">{formatBDT(salaryDetails.houseRentAllowance)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-2">
                <span className="text-slate-600">Medical Allowance</span>
                <span className="font-semibold text-slate-900">{formatBDT(salaryDetails.medicalAllowance)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-2">
                <span className="text-slate-600">Conveyance Allowance</span>
                <span className="font-semibold text-slate-900">{formatBDT(salaryDetails.conveyanceAllowance)}</span>
              </div>
              <div className="flex justify-between py-2 px-2 bg-slate-50 font-bold border-t border-slate-200">
                <span className="text-slate-900">Total Gross Earnings</span>
                <span className="text-orange-600">{formatBDT(payslip.grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight */}
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-orange-900 uppercase tracking-wider block">
                Net Disbursed Compensation (Take Home)
              </span>
              <span className="text-2xl font-black text-orange-600">
                {formatBDT(payslip.netPayable)}
              </span>
              <span className="text-xs text-orange-800/80 block mt-0.5">
                Direct Bank Transfer • Monthly Net Payable
              </span>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500">
              <div className="flex items-center gap-1.5 sm:justify-end text-emerald-700 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Digitally Verified & Signed</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Head of Finance • Bayshore HR
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Payslip</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span>{downloading ? "Preparing..." : "Download PDF"}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
