"use client";

import * as React from "react";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, UserPlus, Users, ArrowUpRight } from "lucide-react";

const openRoles = [
  {
    title: "Senior Next.js Frontend Developer",
    department: "Engineering",
    location: "Remote (US/Canada)",
    type: "Full-Time",
    applicants: 42,
    stage: "Interviewing",
    urgent: true,
  },
  {
    title: "Staff Security & Infrastructure Engineer",
    department: "Engineering",
    location: "Austin, TX (Hybrid)",
    type: "Full-Time",
    applicants: 19,
    stage: "Technical Screen",
    urgent: true,
  },
  {
    title: "Product Marketing Manager",
    department: "Sales & Marketing",
    location: "San Francisco, CA",
    type: "Full-Time",
    applicants: 31,
    stage: "Final Review",
    urgent: false,
  },
  {
    title: "Lead UX Researcher",
    department: "Product & Design",
    location: "New York, NY (Hybrid)",
    type: "Full-Time",
    applicants: 27,
    stage: "Portfolio Review",
    urgent: false,
  },
];

export default function RecruitmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Recruitment &amp; Talent Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active requisitions, candidate evaluation funnels, and scheduled interviews.
          </p>
        </div>
        <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
          <UserPlus className="h-4 w-4" />
          <span>Post New Job</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Positions List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 mb-2">
            Open Requisitions ({openRoles.length})
          </h2>
          {openRoles.map((role) => (
            <Card
              key={role.title}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-200 transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{role.title}</h3>
                  {role.urgent && (
                    <Badge variant="danger" className="text-[10px]">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {role.department} • {role.location} • {role.type}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-orange-600">
                    {role.applicants} applicants
                  </span>
                  <span>•</span>
                  <span>Stage: <strong>{role.stage}</strong></span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="shrink-0 self-end sm:self-center">
                <span>View Applicants</span>
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Interviews Widget */}
        <div className="lg:col-span-1">
          <UpcomingInterviews />
        </div>
      </div>
    </div>
  );
}
