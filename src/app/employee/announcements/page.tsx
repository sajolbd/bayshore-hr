"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const announcementsData = [
  {
    id: "ann-01",
    title: "Q4 All-Hands Town Hall & Employee Excellence Awards",
    category: "Events",
    publishedDate: "Nov 06, 2026",
    publisher: "Sarah Jenkins (Chief People Officer)",
    content:
      "Join our CEO and Executive leadership team at the Gulshan 2 corporate auditorium or via our live stream bridge on Wednesday, Nov 11 at 4:00 PM. We will share Q3 business results, preview 2027 strategic initiatives, and present the Quarterly Employee Excellence recognitions.",
    urgent: true,
  },
  {
    id: "ann-02",
    title: "Annual Corporate Retreat 2026: Cox's Bazar",
    category: "Company Retreat",
    publishedDate: "Nov 04, 2026",
    publisher: "People Operations Committee",
    content:
      "Registration is officially open for our 3-day corporate offsite retreat at Sayeman Beach Resort, Cox's Bazar scheduled for December 18–20. Please confirm your flight preferences, room pairing, and dietary choices via the HR portal by Friday, November 20.",
    urgent: false,
  },
  {
    id: "ann-03",
    title: "Biometric Terminal Upgrade at Level 11 Gulshan HQ",
    category: "Facilities",
    publishedDate: "Nov 02, 2026",
    publisher: "IT & Infrastructure Security",
    content:
      "We have upgraded the facial recognition and fingerprint biometric attendance readers at all Level 11 entrance turns. The new terminals provide instant sub-second recognition with auto-sync to our cloud HRMS database. Please contact IT Helpdesk if you experience miss-punches.",
    urgent: false,
  },
  {
    id: "ann-04",
    title: "Winter Festival Working Hours & Public Holiday Schedule",
    category: "Policy",
    publishedDate: "Oct 28, 2026",
    publisher: "HR Operations",
    content:
      "Please note that in observance of Victory Day (বিজয় দিবস) on December 16, all Bayshore offices will be closed. Engineering teams running critical 24/7 cloud systems will operate under rotating on-call rosters with double overtime allowances.",
    urgent: false,
  },
];

export default function EmployeeAnnouncementsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const categories = ["All", "Events", "Company Retreat", "Facilities", "Policy"];

  const filteredAnnouncements = announcementsData.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
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
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-500 text-xs">
            No announcements found matching your criteria.
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-6 shadow-xs transition-all space-y-3 ${
                item.urgent
                  ? "border-orange-300 ring-1 ring-orange-200/50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {item.urgent && (
                    <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                      Urgent Notice
                    </span>
                  )}
                  <Badge variant="outline" className="text-orange-600 border-orange-200 text-[10px]">
                    {item.category}
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                </div>

                <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                  <Calendar className="h-3.5 w-3.5" />
                  {item.publishedDate}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Published by: <strong className="text-slate-700">{item.publisher}</strong></span>
                <span className="text-orange-600 font-semibold cursor-pointer hover:underline">
                  Add to Calendar
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
