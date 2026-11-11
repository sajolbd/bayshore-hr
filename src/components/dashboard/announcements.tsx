"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useHRMS } from "@/context/hrms-context";
import { Megaphone, Pin, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Announcements() {
  const { announcements } = useHRMS();

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Urgent Notice":
        return <Badge variant="danger">{category}</Badge>;
      case "Event & Culture":
        return <Badge variant="orange">{category}</Badge>;
      case "Policy":
        return <Badge variant="warning">{category}</Badge>;
      default:
        return <Badge variant="info">{category}</Badge>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-orange-600" />
            <span>Company Announcements</span>
          </CardTitle>
          <CardDescription>
            Official bulletins, holiday schedules, and workplace policies.
          </CardDescription>
        </div>
        <Link
          href="/announcements"
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
        >
          <span>All Bulletins</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 flex-1 space-y-3.5">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xs transition-all relative"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.isImportant && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                    <Pin className="h-3 w-3 fill-orange-600" />
                    Pinned
                  </span>
                )}
                {getCategoryBadge(item.category)}
              </div>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3" />
                {item.date}
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-900 mt-2">
              {item.title}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>

            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-50">
              <Avatar
                src={item.authorAvatar}
                alt={item.author}
                fallback={item.author}
                size="sm"
              />
              <span className="text-[11px] font-medium text-slate-500">
                Posted by <strong className="text-slate-800">{item.author}</strong>
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
