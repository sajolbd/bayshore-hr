"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Trash2, FileText, Download, Upload, Shield, Search, Calendar, ExternalLink } from "lucide-react";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/context/auth-context";
import { CompanyDocumentItem } from "@/types";

export default function AdminDocumentsPage() {
  const { showToast } = useToast();
  const { currentRole } = useAuth();
  const isAdmin = currentRole !== "Employee";

  const [query, setQuery] = React.useState("");
  const [documents, setDocuments] = React.useState<CompanyDocumentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    title: "",
    category: "Company Policy",
    visibility: "All Employees",
    fileUrl: "",
    fileSize: "",
  });

  const loadDocuments = React.useCallback(async () => {
    try {
      const res = await fetch("/api/documents", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load documents");
      const data = (await res.json()) as { documents?: CompanyDocumentItem[] };
      setDocuments(data.documents ?? []);
    } catch {
      showToast("Load Failed", "Could not load documents. Please retry.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleUpload = async () => {
    if (!form.title.trim()) {
      showToast("Missing Title", "Please enter a document title.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { document?: CompanyDocumentItem; error?: string };
      if (!res.ok || !data.document) {
        showToast("Upload Failed", data.error ?? "Could not create the document.", "error");
        return;
      }
      setDocuments((prev) => [data.document as CompanyDocumentItem, ...prev]);
      showToast("Document Published", `"${data.document.title}" is now available.`, "success");
      setForm({
        title: "",
        category: "Company Policy",
        visibility: "All Employees",
        fileUrl: "",
        fileSize: "",
      });
      setIsUploadOpen(false);
    } catch {
      showToast("Upload Failed", "Something went wrong. Please retry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (doc: CompanyDocumentItem) => {
    if (!doc.fileUrl) {
      showToast(
        "No File Attached",
        `"${doc.title}" has no file link attached yet.`,
        "info"
      );
      return;
    }
    window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (doc: CompanyDocumentItem) => {
    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      showToast("Document Removed", `"${doc.title}" was deleted.`, "success");
    } catch {
      showToast("Delete Failed", "Could not delete the document.", "error");
    }
  };

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
        {isAdmin && (
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm text-xs"
          >
            <Upload className="h-4 w-4" />
            <span>Upload New Policy</span>
          </Button>
        )}
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
          Showing {filteredDocs.length} managed document{filteredDocs.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Document Cards */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading documents...
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            {documents.length === 0
              ? "No documents published yet."
              : "No documents match your search."}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? "Use 'Upload New Policy' to add the first document."
              : "Documents published by HR will appear here."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="p-5 flex flex-col justify-between hover:border-orange-200 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/60 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
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
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label={`Delete ${doc.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Updated {doc.updatedAt}
                  </span>
                  <span>{doc.fileSize ? `PDF • ${doc.fileSize}` : "PDF"}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(doc)}
                className="mt-4 w-full gap-1.5 text-xs"
              >
                {doc.fileUrl ? (
                  <>
                    <Download className="h-3.5 w-3.5 text-orange-600" />
                    <span>Open Document</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-400">No File Attached</span>
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Upload / Create Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Publish New Document"
        description="Add a policy, handbook, or template to the repository. Attach a file link (Drive, S3, etc.) so employees can open it."
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Document Title *
            </label>
            <Input
              placeholder="e.g. Employee Handbook & Code of Conduct"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <Input
                placeholder="e.g. Company Policy"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Visibility
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-orange-500 focus:outline-none"
                value={form.visibility}
                onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value }))}
              >
                <option value="All Employees">All Employees</option>
                <option value="HR & Admins Only">HR &amp; Admins Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              File Link (URL)
            </label>
            <Input
              placeholder="https://drive.google.com/file/..."
              value={form.fileUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              File Size (optional)
            </label>
            <Input
              placeholder="e.g. 2.8 MB"
              value={form.fileSize}
              onChange={(e) => setForm((prev) => ({ ...prev, fileSize: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleUpload}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? "Publishing..." : "Publish Document"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
