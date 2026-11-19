"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Download, FolderOpen, BookOpen, Plus } from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyDocumentItem } from "@/types";

export default function EmployeeDocumentsPage() {
  const { profile } = useEmployee();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"personal" | "policies">(
    "personal",
  );
  const [companyPoliciesList, setCompanyPoliciesList] = React.useState<
    CompanyDocumentItem[]
  >([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/documents", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as {
          documents?: CompanyDocumentItem[];
        };
        setCompanyPoliciesList(data.documents ?? []);
      } catch {
        showToast("Load Failed", "Could not load company policies.", "error");
      } finally {
        setIsLoadingPolicies(false);
      }
    };
    void load();
  }, [showToast]);

  const handleDownload = (title: string, fileUrl?: string) => {
    if (!fileUrl) {
      showToast(
        "No File Attached",
        `"${title}" has no file link attached yet.`,
        "info",
      );
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Documents & Corporate Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access employment contracts, verified certifications, tax
            certificates, and corporate handbooks.
          </p>
        </div>

        <Link href="/employee/requests">
          <Button
            variant="primary"
            size="sm"
            className="gap-2 bg-orange-600 hover:bg-orange-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Request Document Attestation</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "personal"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>My Personal Documents ({profile.documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "policies"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>
            Company Policies & Handbooks ({companyPoliciesList.length})
          </span>
        </button>
      </div>

      {/* Tab 1: Personal Documents */}
      {activeTab === "personal" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personal File & Employment Artifacts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stored in encrypted compliance storage compliant with ISO 27001
                & Bangladesh Data Privacy guidelines.
              </p>
            </div>
            <Badge variant="success">All Files Verified</Badge>
          </div>

          <div className="divide-y divide-slate-100">
            {profile.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="font-medium text-slate-700">
                        {doc.type}
                      </span>
                      <span>•</span>
                      <span>Uploaded: {doc.uploadedOn}</span>
                      <span>•</span>
                      <span className="text-slate-400">{doc.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.title)}
                    className="gap-1.5 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </Button>{" "}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Company Policies & Handbooks */}
      {activeTab === "policies" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Company Policies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard Operating Procedures (SOPs) approved by Bayshore
                Communication Board of Directors.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoadingPolicies ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Loading company policies...
              </div>
            ) : companyPoliciesList.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-xs text-slate-500">
                  No company policies published yet.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Handbooks and SOPs shared by HR will appear here.
                </p>
              </div>
            ) : (
              companyPoliciesList.map((policy) => (
                <div
                  key={policy.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {policy.title}
                        </h4>
                        <Badge variant="outline" className="text-[10px]">
                          {policy.visibility}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="font-semibold text-slate-700">
                          {policy.category}
                        </span>
                        <span>•</span>
                        <span>Last Updated: {policy.updatedAt}</span>
                        {policy.fileSize ? (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">
                              {policy.fileSize}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(policy.title)}
                      className="gap-1.5 text-xs text-slate-700 hover:text-orange-600"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
