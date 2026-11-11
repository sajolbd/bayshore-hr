"use client";

import * as React from "react";
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { NewClaimModal } from "@/components/employee/new-claim-modal";
import { ExpenseClaim } from "@/types/employee-portal";
import { formatBDT } from "@/lib/utils";

export default function EmployeeClaimsPage() {
  const { expenseClaims, claimEntitlements, cancelClaim } = useEmployee();

  const [isNewClaimOpen, setIsNewClaimOpen] = React.useState(false);
  const [filterCategory, setFilterCategory] = React.useState<string>("All");
  const [filterStatus, setFilterStatus] = React.useState<string>("All");
  const [selectedReceipt, setSelectedReceipt] = React.useState<ExpenseClaim | null>(null);

  const filteredClaims = expenseClaims.filter((claim) => {
    const matchesCat = filterCategory === "All" || claim.category === filterCategory;
    const matchesStatus = filterStatus === "All" || claim.status === filterStatus;
    return matchesCat && matchesStatus;
  });

  const totalClaimed = expenseClaims.reduce((acc, c) => acc + c.amount, 0);
  const pendingAmount = expenseClaims
    .filter((c) => c.status === "Pending")
    .reduce((acc, c) => acc + c.amount, 0);
  const reimbursedAmount = expenseClaims
    .filter((c) => c.status === "Reimbursed")
    .reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              e-Claim Expense Reimbursements
            </h1>
            <Badge variant="warning" className="text-[10px]">
              HR.my Module
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Submit business expenses, track manager approvals, and manage annual allowance limits.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsNewClaimOpen(true)}
          className="w-full sm:w-auto gap-2 bg-orange-600 hover:bg-orange-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Submit New Claim</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Claims Submitted</span>
            <Receipt className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{formatBDT(totalClaimed)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{expenseClaims.length} total vouchers submitted</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Manager Approval</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{formatBDT(pendingAmount)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting HR review &amp; disbursement</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Reimbursed &amp; Paid (YTD)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{formatBDT(reimbursedAmount)}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Paid directly via City Bank</div>
        </div>
      </div>

      {/* Entitlements Progress Tracker (HR.my Feature) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Annual Benefit Entitlements &amp; Allowances</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track remaining quota for health, mobile, travel, and professional training.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {claimEntitlements.map((ent) => {
            const pct = Math.min(100, Math.round((ent.spent / ent.annualLimit) * 100));
            return (
              <div
                key={ent.category}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{ent.category}</span>
                  <span className="text-[11px] font-semibold text-slate-500">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-600 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Spent: {formatBDT(ent.spent)}</span>
                  <span>Limit: {formatBDT(ent.annualLimit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claims List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Expense Claim Records</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review claim vouchers, attachments, and payment disbursement status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Travel & Mileage">Travel &amp; Mileage</option>
              <option value="Medical & Wellness">Medical &amp; Wellness</option>
              <option value="Mobile & Internet">Mobile &amp; Internet</option>
              <option value="Training & Certification">Training &amp; Certification</option>
              <option value="Client Hospitality">Client Hospitality</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Reimbursed">Reimbursed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Claim ID &amp; Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Vendor / Merchant</th>
                <th className="px-6 py-3">Date Incurred</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Receipt</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{claim.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">#{claim.id} • Submitted {claim.submissionDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-slate-800">{claim.category}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 font-medium">
                    {claim.merchantName}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {claim.dateIncurred}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    {formatBDT(claim.amount)}
                  </td>
                  <td className="px-6 py-3.5">
                    {claim.receiptFileName ? (
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(claim)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Voucher</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">No receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge
                      variant={
                        claim.status === "Approved"
                          ? "success"
                          : claim.status === "Reimbursed"
                          ? "success"
                          : claim.status === "Pending"
                          ? "warning"
                          : "danger"
                      }
                      className="text-[10px]"
                    >
                      {claim.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {claim.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => cancelClaim(claim.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Cancel Pending Claim"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewClaimModal isOpen={isNewClaimOpen} onClose={() => setIsNewClaimOpen(false)} />

      {/* Digital Receipt Viewer Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title={`Digital Receipt Voucher — #${selectedReceipt.id}`}
          description={`Verified expense proof for ${selectedReceipt.title}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedReceipt.merchantName}</p>
                <p className="text-[11px] text-slate-500">
                  Incurred: {selectedReceipt.dateIncurred} • Category: {selectedReceipt.category}
                </p>
              </div>
              <span className="text-sm font-bold text-orange-600 font-mono">
                {formatBDT(selectedReceipt.amount)}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center p-2">
              <img
                src={selectedReceipt.receiptUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80"}
                alt="Receipt Scan"
                className="max-h-72 object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close Voucher
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
