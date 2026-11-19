"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useHRMS } from "@/context/hrms-context";
import { AnnouncementItem } from "@/types";
import { Loader2, Megaphone } from "lucide-react";

const CATEGORY_OPTIONS: AnnouncementItem["category"][] = [
  "Company Update",
  "Urgent Notice",
  "Policy",
  "Event & Culture",
];

export function ComposeAnnouncementModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { createAnnouncement } = useHRMS();
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [category, setCategory] = React.useState<AnnouncementItem["category"]>("Company Update");
  const [isImportant, setIsImportant] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const reset = () => {
    setTitle("");
    setSummary("");
    setCategory("Company Update");
    setIsImportant(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    setIsSubmitting(true);
    const result = await createAnnouncement({
      title: title.trim(),
      summary: summary.trim(),
      category,
      isImportant,
    });
    setIsSubmitting(false);
    if (result.success) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose New Bulletin"
      description="Publishes immediately and becomes visible company-wide."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 All-Hands Town Hall"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500"
            placeholder="Write the bulletin body..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Category</label>
          <Select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as AnnouncementItem["category"])
            }
            options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            className="h-4 w-4 accent-orange-600"
          />
          <span>Mark as important (pinned to top)</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !summary.trim()}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Megaphone className="h-4 w-4" />
            )}
            <span>Publish Bulletin</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
