"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Upload, Shield, Search, Calendar } from "lucide-react";
import { useToast } from "@/context/toast-context";

const companyDocuments = [
  {
    id: "DOC-01",
    title: "Bayshore Employee Handbook & Code of Conduct 2026",
    category: "Company Policy",
    updatedOn: "Oct 15, 2026",
    size: "2.8 MB",
    visibility: "All Employees",
  },
  {
    id: "DOC-02",
    title: "Annual Leave & Public Holiday Guidelines",
    category: "HR Compliance",
    updatedOn: "Nov 01, 2026",
    size: "1.1 MB",
    visibility: "All Employees",
  },
  {
    id: "DOC-03",
    title: "GPS Time Clock & Hybrid Work Geofencing SOP",
    category: "Operations",
    updatedOn: "Nov 05, 2026",
    size: "920 KB",
    visibility: "All Employees",
  },
  {
    id: "DOC-04",
    title: "e-Claims Reimbursement & Travel Per Diem Policy",
    category: "Finance",
    updatedOn: "Oct 28, 2026",
    size: "1.4 MB",
    visibility: "All Employees",
  },
  {
    id: "DOC-05",
    title: "Standard Employment Agreement & NDA Template",
    category: "Legal Template",
    updatedOn: "Sep 12, 2026",
    size: "680 KB",
    visibility: "HR & Admins Only",
  },
];

export default function AdminDocumentsPage() {
  const { showToast } = useToast();
  const [query, setQuery] = React.useState("");

  const filteredDocs = companyDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            HR Documents &amp; Policy Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized policy handbooks, legal contracts, and compliance documents for Bayshore Communication.
          </p>
        </div>
        <Button
          onClick={() =>
            showToast(
              "Upload Policy Triggered",
              "Document upload dialog ready for PDF/DOCX distribution.",
              "info"
            )
          }
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm text-xs"
        >
          <Upload className="h-4 w-4" />
          <span>Upload New Policy</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search policies or templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredDocs.length} managed documents
        </span>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="p-5 flex flex-col justify-between hover:border-orange-200 transition-colors">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/60 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {doc.category}
                      </Badge>
                      <Badge
                        variant={doc.visibility === "All Employees" ? "success" : "warning"}
                        className="text-[10px]"
                      >
                        <Shield className="h-2.5 w-2.5" /> {doc.visibility}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Updated {doc.updatedOn}
                </span>
                <span>PDF • {doc.size}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                showToast("Downloading Document", `Preparing ${doc.title} (${doc.size})...`, "success")
              }
              className="mt-4 w-full gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5 text-orange-600" />
              <span>Download PDF</span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

