"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useHRMS } from "@/context/hrms-context";
import { Cake, Gift } from "lucide-react";

export function Birthdays() {
  const { birthdays, sendBirthdayWish } = useHRMS();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-4 w-4 text-orange-600" />
            <span>Upcoming Birthdays</span>
          </CardTitle>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            This Month
          </span>
        </div>
        <CardDescription>
          Keep workplace spirits high by celebrating team milestones.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 flex-1 space-y-3">
        {birthdays.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-slate-100"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                src={item.avatar}
                alt={item.employeeName}
                fallback={item.employeeName}
                size="md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {item.employeeName}
                  </p>
                  {item.isToday && (
                    <Badge variant="orange" className="text-[10px] py-0 px-1.5">
                      Today!
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {item.role} • {item.department}
                </p>
                <p className="text-[10px] text-orange-600 font-semibold mt-0.5">
                  {item.birthday}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => sendBirthdayWish(item.id)}
              className="h-7 px-2.5 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 shrink-0 font-medium"
            >
              <Gift className="h-3 w-3 mr-1" />
              <span>Send Wish</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
