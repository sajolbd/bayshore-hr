"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Building2, Users, DollarSign, Plus, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const departmentsList = [
  {
    name: "Engineering",
    head: "Marcus Vance",
    headRole: "VP of Engineering",
    headAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    headcount: 88,
    openPositions: 4,
    budget: 4200000,
    color: "orange",
  },
  {
    name: "Product & Design",
    head: "David Chen",
    headRole: "Head of Product & UX",
    headAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    headcount: 40,
    openPositions: 2,
    budget: 2100000,
    color: "emerald",
  },
  {
    name: "Sales & Marketing",
    head: "Sophia Al-Mansoor",
    headRole: "Chief Revenue Officer",
    headAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    headcount: 54,
    openPositions: 1,
    budget: 3100000,
    color: "amber",
  },
  {
    name: "Operations",
    head: "Carlos Mendez",
    headRole: "Director of Operations",
    headAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    headcount: 46,
    openPositions: 1,
    budget: 1850000,
    color: "blue",
  },
  {
    name: "HR, People & Legal",
    head: "Alex Morgan",
    headRole: "Head of People & Culture",
    headAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    headcount: 20,
    openPositions: 0,
    budget: 950000,
    color: "purple",
  },
];

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Departments &amp; Organizational Units
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of department heads, headcount budgets, and organizational structure.
          </p>
        </div>
        <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New Department</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departmentsList.map((dept) => (
          <Card
            key={dept.name}
            className="p-5 flex flex-col justify-between hover:border-orange-200 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                    <p className="text-[11px] text-slate-400">Headcount: {dept.headcount}</p>
                  </div>
                </div>
                {dept.openPositions > 0 && (
                  <Badge variant="orange" className="text-[10px]">
                    {dept.openPositions} Hiring
                  </Badge>
                )}
              </div>

              {/* Department Head */}
              <div className="mt-4 flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <Avatar
                  src={dept.headAvatar}
                  alt={dept.head}
                  fallback={dept.head}
                  size="md"
                />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Department Lead
                  </span>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {dept.head}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{dept.headRole}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Annual Budget
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(dept.budget)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Total Members
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {dept.headcount} Staff
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-orange-600 font-semibold cursor-pointer hover:underline">
              <span>View Department Roster</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
