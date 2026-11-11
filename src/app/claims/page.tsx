"use client";

import * as React from "react";
import {
  Receipt,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Search,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { useHRMS } from "@/context/hrms-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ExpenseClaim } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminClaimsPage() {
  const { expenseClaims, approveClaim, rejectClaim, reimburseClaim } = useHRMS();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedReceipt, setSelectedReceipt] = React.useState<ExpenseClaim | null>(null);

  // Reject Modal State
  const [claimToReject, setClaimToReject] = React.useState<ExpenseClaim | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const filteredClaims = expenseClaims.filter((claim) => {
    const matchesSearch =
      claim.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === "All" || claim.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || claim.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalAmount = expenseClaims.reduce((acc, c) => acc + c.amount, 0);
  const pendingAmount = expenseClaims
    .filter((c) => c.status === "Pending")
    .reduce((acc, c) => acc + c.amount, 0);
  const pendingCount = expenseClaims.filter((c) => c.status === "Pending").length;
  const reimbursedAmount = expenseClaims
    .filter((c) => c.status === "Reimbursed")
    .reduce((acc, c) => acc + c.amount, 0);

  const handleConfirmReject = () => {
    if (!claimToReject) return;
    rejectClaim(claimToReject.id, rejectReason || "Disallowed under company expense governance.");
    setClaimToReject(null);
    setRejectReason("");
  };

  const handleExportClaimsCSV = () => {
    const headers = ["Claim ID", "Employee", "Department", "Category", "Amount (BDT)", "Date Incurred", "Vendor", "Status"];
    const rows = filteredClaims.map((c) => [
      c.id,
      `"${c.employeeName}"`,
      `"${c.department}"`,
      `"${c.category}"`,
      c.amount,
      c.dateIncurred,
      `"${c.merchantName}"`,
      c.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bayshore_Claims_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              e-Claims &amp; Expense Management
            </h1>
            <Badge variant="warning" className="text-[10px]">
              HR.my Feature
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit staff reimbursement vouchers, verify digital invoices, and disburse approved claims via payroll.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportClaimsCSV}
          className="gap-2 border-slate-200 text-slate-700"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export Claims Sheet (CSV)</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Review Queue</span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(pendingAmount)}</p>
          <p className="text-[11px] text-orange-600 font-semibold mt-0.5">{pendingCount} claims awaiting approval</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Reimbursed (YTD)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(reimbursedAmount)}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Disbursed to staff bank accounts</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Gross Claims Volume</span>
            <Receipt className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(totalAmount)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{expenseClaims.length} total submitted vouchers</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Corporate Benefit Cap</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">৳2,10,000</p>
          <p className="text-[11px] text-purple-600 font-medium mt-0.5">Annual departmental budget</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search claim by employee name, title, vendor, or #CLM ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs w-44"
            >
              <option value="All">All Categories</option>
              <option value="Travel & Mileage">Travel &amp; Mileage</option>
              <option value="Meals & Entertainment">Meals &amp; Entertainment</option>
              <option value="Medical & Wellness">Medical &amp; Wellness</option>
              <option value="Mobile & Internet">Mobile &amp; Internet</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Training & Certification">Training &amp; Certification</option>
              <option value="Client Hospitality">Client Hospitality</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs w-36"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Reimbursed">Reimbursed</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Claims Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Claim Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor / Proof</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount (৳)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Management Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                    No expense claims match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClaims.map((claim) => (
                  <TableRow key={claim.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar src={claim.employeeAvatar} alt={claim.employeeName} fallback={claim.employeeName} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 leading-tight">{claim.employeeName}</p>
                          <p className="text-[11px] text-slate-400">{claim.department}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[220px]">
                        <p className="text-xs font-semibold text-slate-900 truncate">{claim.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{claim.description}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-800">{claim.category}</span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-xs font-medium text-slate-700">{claim.merchantName}</p>
                        {claim.receiptFileName && (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(claim)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 hover:underline mt-0.5"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Voucher Receipt</span>
                          </button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600">{formatDate(claim.dateIncurred)}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {formatCurrency(claim.amount)}
                      </span>
                    </TableCell>

                    <TableCell>
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
                        dot
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {claim.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveClaim(claim.id)}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setClaimToReject(claim)}
                              className="h-7 text-xs text-red-600 hover:bg-red-50 border-red-200"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {claim.status === "Approved" && (
                          <Button
                            size="sm"
                            onClick={() => reimburseClaim(claim.id)}
                            className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Disburse (BEFTN)</span>
                          </Button>
                        )}

                        {claim.status === "Reimbursed" && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Paid Out
                          </span>
                        )}

                        {claim.status === "Rejected" && (
                          <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                            Disallowed
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Receipt Viewer Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title={`Digital Receipt Voucher — #${selectedReceipt.id}`}
          description={`Verified proof uploaded for ${selectedReceipt.title}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedReceipt.merchantName}</p>
                <p className="text-[11px] text-slate-500">Incurred: {selectedReceipt.dateIncurred} • Category: {selectedReceipt.category}</p>
              </div>
              <span className="text-sm font-bold text-orange-600 font-mono">
                {formatCurrency(selectedReceipt.amount)}
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

      {/* Reject Claim Modal */}
      {claimToReject && (
        <Modal
          isOpen={Boolean(claimToReject)}
          onClose={() => setClaimToReject(null)}
          title="Reject Expense Claim"
          description={`Provide governance reason for rejecting claim #${claimToReject.id}.`}
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Employee <strong>{claimToReject.employeeName}</strong> requested {formatCurrency(claimToReject.amount)} for &ldquo;{claimToReject.title}&rdquo;.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Non-compliant vendor, missing VAT registration receipt..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setClaimToReject(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
