"use client";

import * as React from "react";
import {
  Plus,
  MessageSquare,
} from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NewHRRequestModal } from "@/components/employee/new-hr-request-modal";

export default function EmployeeRequestsPage() {
  const { hrRequests } = useEmployee();
  const [isNewRequestOpen, setIsNewRequestOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState("All");

  const filtered = hrRequests.filter((req) => {
    const matchType = filterType === "All" || req.type === filterType;
    const matchSearch =
      req.subject.toLowerCase().includes(search.toLowerCase()) ||
      req.details.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              HR Service Requests & Helpdesk
            </h1>
            <Badge variant="warning">People Operations</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Submit salary certificates, experience letters, document verifications, or ask HR inquiries.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewRequestOpen(true)}
          className="gap-2 bg-orange-600 hover:bg-orange-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New HR Request</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            "All",
            "Salary Certificate",
            "Attendance Correction",
            "Experience Letter",
            "General HR Inquiry",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === type
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Requests History List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-500 text-xs">
            No service requests found matching your filter.
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-bold text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                    {req.id}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {req.type}
                  </Badge>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{req.subject}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      req.status === "Approved" || req.status === "Resolved"
                        ? "success"
                        : req.status === "In Review"
                        ? "info"
                        : "warning"
                    }
                    className="text-[10px]"
                  >
                    {req.status}
                  </Badge>
                  <span className="text-xs text-slate-400">Filed: {req.submittedOn}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                {req.details}
              </p>

              {req.response && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                  <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-800 font-semibold mb-0.5">
                      HR People Operations Response:
                    </strong>
                    <p className="leading-relaxed">{req.response}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <NewHRRequestModal
        open={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
      />
    </div>
  );
}
