"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useHRMS } from "@/context/hrms-context";
import { useToast } from "@/context/toast-context";
import { Video, Calendar, Clock, ExternalLink } from "lucide-react";

export function UpcomingInterviews() {
  const { interviews } = useHRMS();
  const { showToast } = useToast();

  const handleJoin = (candidateName: string, link: string) => {
    showToast(
      "Joining Interview Room",
      `Launching virtual session for ${candidateName}...`,
      "info"
    );
    window.open(link, "_blank");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-4 w-4 text-orange-600" />
            <span>Upcoming Candidate Interviews</span>
          </CardTitle>
          <Badge variant="info">
            {interviews.length} Scheduled
          </Badge>
        </div>
        <CardDescription>
          Talent acquisition rounds &amp; technical assessments for today.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 flex-1 space-y-3">
        {interviews.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xs transition-all"
          >
            <div className="flex items-start gap-3 min-w-0">
              <Avatar
                src={item.avatar}
                alt={item.candidateName}
                fallback={item.candidateName}
                size="md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.candidateName}
                  </p>
                  <Badge variant="purple" className="text-[10px] py-0">
                    {item.interviewType}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                  {item.position} • {item.department}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-orange-500" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {item.time}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Interviewers: {item.interviewers.join(", ")}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleJoin(item.candidateName, item.meetingLink)}
              className="h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white shrink-0 self-end sm:self-center font-medium gap-1.5"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Join Meeting</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
