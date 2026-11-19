"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { useHRMS } from "@/context/hrms-context";
import {
  buildAttendanceOverview,
  AttendanceOverviewRow,
} from "@/lib/dashboard-analytics";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-900 mb-1.5">{label} Attendance</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function AttendanceChart() {
  const mounted = useMounted();
  const { attendanceRecords } = useHRMS();

  const overview = React.useMemo(
    () => buildAttendanceOverview(attendanceRecords),
    [attendanceRecords]
  );
  const hasAnyRecord = overview.some(
    (row: AttendanceOverviewRow) =>
      row.present + row.remote + row.late + row.leave > 0
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-orange-600" />
            <span>Attendance Overview</span>
          </CardTitle>
          <CardDescription>
            Daily in-office, late, and leave metrics for the last 5 days.
          </CardDescription>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Last 5 Days
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {mounted ? (
          hasAnyRecord ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overview}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={16}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
                  />
                  <Bar
                    dataKey="present"
                    fill="#EA580C"
                    radius={[4, 4, 0, 0]}
                    name="In-Office"
                  />
                  <Bar
                    dataKey="remote"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    name="Remote"
                  />
                  <Bar
                    dataKey="late"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    name="Late Check-in"
                  />
                  <Bar
                    dataKey="leave"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    name="On Leave"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] w-full flex items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
              No attendance records yet for the last 5 days.
            </div>
          )
        ) : (
          <div className="h-[280px] w-full bg-slate-50 animate-pulse rounded-lg" />
        )}
      </CardContent>
    </Card>
  );
}
