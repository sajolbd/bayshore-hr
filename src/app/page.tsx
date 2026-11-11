"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import EmployeeDashboardPage from "@/app/employee/dashboard/page";
import { PageHeader } from "@/components/dashboard/page-header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { HeadcountChart } from "@/components/dashboard/headcount-chart";
import { DepartmentChart } from "@/components/dashboard/department-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import { LeaveRequests } from "@/components/dashboard/leave-requests";
import { Birthdays } from "@/components/dashboard/birthdays";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { Announcements } from "@/components/dashboard/announcements";

export default function DashboardPage() {
  const { isEmployeeView } = useAuth();

  if (isEmployeeView) {
    return <EmployeeDashboardPage />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Greeting & Primary Actions */}
      <PageHeader />

      {/* 2. Responsive Metric KPI Cards */}
      <KPICards />

      {/* 3. Primary Charts Section (Headcount Trend + Department Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HeadcountChart />
        </div>
        <div className="lg:col-span-1">
          <DepartmentChart />
        </div>
      </div>

      {/* 4. Attendance Overview Chart & Today's Attendance Live Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <AttendanceChart />
        </div>
        <div className="xl:col-span-2">
          <AttendanceTable />
        </div>
      </div>

      {/* 5. Pending Leaves & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaveRequests />
        <UpcomingInterviews />
      </div>

      {/* 6. Activities, Birthdays & Company Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecentActivities />
        <Birthdays />
        <Announcements />
      </div>
    </div>
  );
}
