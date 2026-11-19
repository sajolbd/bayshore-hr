"use client";

import * as React from "react";
import { Calendar, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useHRMS } from "@/context/hrms-context";
import { AnnouncementItem } from "@/types";

export default function EmployeeAnnouncementsPage() {
  const { announcements, isLoadingData } = useHRMS();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const categories = React.useMemo(() => {
    const unique = [...new Set(announcements.map((item) => item.category))];
    return ["All", ...unique];
  }, [announcements]);

  const filteredAnnouncements = announcements.filter((item: AnnouncementItem) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Company Announcements & Bulletins
            </h1>
            <Badge variant="warning">Bayshore Communication</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Stay informed with executive updates, facility notices, retreats, and holiday circulars.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search bulletins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoadingData && announcements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400 text-xs">
            Loading announcements...
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-500 text-xs space-y-2">
            <Megaphone className="h-6 w-6 text-slate-300 mx-auto" />
            <p>
              {announcements.length === 0
                ? "No announcements have been published yet."
                : "No announcements found matching your criteria."}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((item: AnnouncementItem) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-6 shadow-xs transition-all space-y-3 ${
                item.isImportant
                  ? "border-orange-300 ring-1 ring-orange-200/50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {item.isImportant && (
                    <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                      Important
                    </span>
                  )}
                  <Badge variant="outline" className="text-orange-600 border-orange-200 text-[10px]">
                    {item.category}
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                </div>

                <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                  <Calendar className="h-3.5 w-3.5" />
                  {item.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.summary}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Published by: <strong className="text-slate-700">{item.author}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
