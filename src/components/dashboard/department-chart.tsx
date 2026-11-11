"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { departmentDistributionData } from "@/data/mock-data";
import { PieChart as PieIcon } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      color: string;
      percentage: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg text-xs">
        <p className="font-bold text-slate-900">{data.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="text-slate-600 font-medium">
            {data.value} employees ({data.payload.percentage})
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function DepartmentChart() {
  const mounted = useMounted();
  const total = departmentDistributionData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-orange-600" />
              <span>Department Distribution</span>
            </CardTitle>
            <CardDescription>
              Workforce distribution across functional divisions.
            </CardDescription>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            5 Departments
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
        {mounted ? (
          <div className="relative h-[210px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={departmentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {departmentDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 leading-none">
                {total}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                Team Total
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[210px] w-full bg-slate-50 animate-pulse rounded-lg" />
        )}

        {/* Legend pills */}
        <div className="space-y-1.5 mt-2">
          {departmentDistributionData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 font-medium truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-slate-900">{item.value}</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  ({item.percentage})
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
