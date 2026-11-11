"use client";

import * as React from "react";
import { Announcements } from "@/components/dashboard/announcements";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus } from "lucide-react";
import { useToast } from "@/context/toast-context";

export default function AnnouncementsPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Company Bulletins &amp; Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast organizational updates, policy amendments, and executive memorandums.
          </p>
        </div>
        <Button
          onClick={() =>
            showToast("Compose Notice", "Announcement editor opened.", "info")
          }
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Bulletin</span>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Announcements />
      </div>
    </div>
  );
}
