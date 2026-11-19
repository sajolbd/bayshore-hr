"use client";

import * as React from "react";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Briefcase, UserPlus, Loader2, Plus, Trash2, Video, Users, ArrowUpRight } from "lucide-react";

interface JobOpeningDto {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  stage: string;
  applicants: number;
  urgent: boolean;
  isOpen: boolean;
}

export default function RecruitmentPage() {
  const { currentRole } = useAuth();
  const { refreshHRMSData } = useHRMS();
  const isAdmin = currentRole !== "Employee";

  const [openings, setOpenings] = React.useState<JobOpeningDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isJobOpen, setIsJobOpen] = React.useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = React.useState(false);

  const loadOpenings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/job-openings", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { openings?: JobOpeningDto[] };
        setOpenings(data.openings || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadOpenings();
  }, [loadOpenings]);

  const deleteOpening = async (id: string) => {
    const res = await fetch(`/api/job-openings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setOpenings((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const totalApplicants = openings.reduce((sum, o) => sum + (o.applicants || 0), 0);
  const urgentCount = openings.filter((o) => o.urgent).length;
  const inFinalStage = openings.filter(
    (o) => o.stage.toLowerCase().includes("final") || o.stage.toLowerCase().includes("review")
  ).length;

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
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsInterviewOpen(true)}
              variant="outline"
              className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Video className="h-4 w-4" />
              <span>Schedule Interview</span>
            </Button>
            <Button
              onClick={() => setIsJobOpen(true)}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              <span>Post New Job</span>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <span className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-orange-600" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{openings.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Open Requisitions ({urgentCount} urgent)</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <span className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalApplicants}</p>
            <p className="text-[11px] text-slate-500 font-medium">Total Applicants</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <span className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{inFinalStage}</p>
            <p className="text-[11px] text-slate-500 font-medium">In Final Review Stage</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Positions List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 mb-2">
            Open Requisitions ({openings.length})
          </h2>
          {isLoading ? (
            <div className="p-10 rounded-xl border border-dashed border-slate-200 bg-white text-center text-xs text-slate-400">
              Loading requisitions...
            </div>
          ) : openings.length === 0 ? (
            <div className="p-10 rounded-xl border border-dashed border-slate-200 bg-white text-center space-y-2">
              <Briefcase className="h-6 w-6 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-500">No open requisitions</p>
              <p className="text-[11px] text-slate-400">
                {isAdmin
                  ? "Post a job to start the talent pipeline."
                  : "Check back later for new openings."}
              </p>
            </div>
          ) : (
            openings.map((role) => (
              <Card
                key={role.id}
                className="group p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-200 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{role.title}</h3>
                    {role.urgent && (
                      <Badge variant="danger" className="text-[10px]">
                        Urgent
                      </Badge>
                    )}
                    {!role.isOpen && (
                      <Badge variant="outline" className="text-[10px]">
                        Closed
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

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => deleteOpening(role.id)}
                    title="Remove requisition"
                    className="shrink-0 self-end sm:self-center text-slate-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Interviews Widget */}
        <div className="lg:col-span-1">
          <UpcomingInterviews />
        </div>
      </div>

      {isAdmin && (
        <>
          <PostJobModal
            isOpen={isJobOpen}
            onClose={() => setIsJobOpen(false)}
            onCreated={(opening) => setOpenings((prev) => [opening, ...prev])}
          />
          <ScheduleInterviewModal
            isOpen={isInterviewOpen}
            onClose={() => setIsInterviewOpen(false)}
            onCreated={() => {
              void refreshHRMSData();
            }}
          />
        </>
      )}
    </div>
  );
}

function PostJobModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (opening: JobOpeningDto) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [type, setType] = React.useState("Full-Time");
  const [urgent, setUrgent] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/job-openings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, department, location, type, urgent }),
      });
      if (res.ok) {
        const data = (await res.json()) as { opening?: JobOpeningDto };
        if (data.opening) onCreated(data.opening);
        setTitle("");
        setDepartment("");
        setLocation("");
        setType("Full-Time");
        setUrgent(false);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post New Job" description="Creates an open requisition on the talent pipeline.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Job Title <span className="text-red-500">*</span>
          </label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Senior Backend Engineer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Department</label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Abtab Nagar HQ, Dhaka" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Employment Type</label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={["Full-Time", "Part-Time", "Contract", "Internship"].map((t) => ({
              label: t,
              value: t,
            }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
            className="h-4 w-4 accent-orange-600"
          />
          <span>Urgent hiring</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Publish Requisition</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ScheduleInterviewModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [candidateName, setCandidateName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [interviewType, setInterviewType] = React.useState("Initial HR");
  const [meetingLink, setMeetingLink] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !date || !time) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          position,
          department,
          date,
          time,
          interviewType,
          meetingLink,
          interviewers: [],
        }),
      });
      if (res.ok) {
        setCandidateName("");
        setPosition("");
        setDepartment("");
        setDate("");
        setTime("");
        setInterviewType("Initial HR");
        setMeetingLink("");
        onCreated();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Interview" description="Saves to the recruitment pipeline and appears on the dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Candidate Name <span className="text-red-500">*</span>
            </label>
            <Input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Position</label>
            <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Backend Engineer" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Date <span className="text-red-500">*</span>
            </label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Time <span className="text-red-500">*</span>
            </label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Department</label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Round</label>
            <Select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              options={[
                "Initial HR",
                "Technical Round",
                "System Design",
                "Culture Fit",
                "Final Executive",
              ].map((t) => ({ label: t, value: t }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Meeting Link</label>
          <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.example.com/..." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !candidateName.trim() || !date || !time}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
            <span>Schedule Interview</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
