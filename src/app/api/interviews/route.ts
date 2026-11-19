import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { InterviewModel } from "@/models/Interview";
import { InterviewItem } from "@/types";

const VALID_TYPES = [
  "Initial HR",
  "Technical Round",
  "System Design",
  "Culture Fit",
  "Final Executive",
] as const;

const VALID_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;

function mapToItem(doc: Record<string, unknown>): InterviewItem {
  return {
    id: String(doc._id),
    candidateName: String(doc.candidateName ?? ""),
    avatar: "",
    position: String(doc.position ?? ""),
    department: String(doc.department ?? ""),
    date: String(doc.date ?? ""),
    time: String(doc.time ?? ""),
    interviewType: (VALID_TYPES.includes(doc.interviewType as (typeof VALID_TYPES)[number])
      ? doc.interviewType
      : "Initial HR") as InterviewItem["interviewType"],
    interviewers: Array.isArray(doc.interviewers)
      ? (doc.interviewers as string[]).filter(Boolean)
      : [],
    status: (VALID_STATUSES.includes(doc.status as (typeof VALID_STATUSES)[number])
      ? doc.status
      : "Scheduled") as InterviewItem["status"],
    meetingLink: String(doc.meetingLink ?? ""),
  };
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const docs = await InterviewModel.find({})
      .sort({ date: 1, time: 1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      interviews: docs.map((doc) =>
        mapToItem(doc as unknown as Record<string, unknown>)
      ),
    });
  } catch (err) {
    console.error("GET /api/interviews error:", err);
    return NextResponse.json(
      { error: "Failed to load interviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const body = (await request.json().catch(() => ({}))) as {
      candidateName?: string;
      position?: string;
      department?: string;
      date?: string;
      time?: string;
      interviewType?: string;
      interviewers?: string[];
      meetingLink?: string;
    };

    if (!body.candidateName?.trim() || !body.date?.trim() || !body.time?.trim()) {
      return NextResponse.json(
        { error: "Candidate name, date and time are required." },
        { status: 400 }
      );
    }

    const interviewType = (VALID_TYPES as readonly string[]).includes(
      body.interviewType ?? ""
    )
      ? (body.interviewType as (typeof VALID_TYPES)[number])
      : "Initial HR";

    const created = await InterviewModel.create({
      candidateName: body.candidateName.trim(),
      position: body.position?.trim() || "Open Position",
      department: body.department?.trim() || "Engineering",
      date: body.date.trim(),
      time: body.time.trim(),
      interviewType,
      interviewers: Array.isArray(body.interviewers)
        ? body.interviewers.map((s) => s.trim()).filter(Boolean)
        : [],
      meetingLink: body.meetingLink?.trim() || "",
      status: "Scheduled",
    });

    return NextResponse.json(
      {
        interview: mapToItem(
          created.toObject() as unknown as Record<string, unknown>
        ),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/interviews error:", err);
    return NextResponse.json(
      { error: "Failed to schedule interview." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      status?: string;
    };
    const id = body.id;
    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Valid id required." }, { status: 400 });
    }
    if (!body.status || !VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json({ error: "Valid status required." }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await InterviewModel.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    ).lean();
    if (!updated) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({
      interview: mapToItem(updated as unknown as Record<string, unknown>),
    });
  } catch (err) {
    console.error("PATCH /api/interviews error:", err);
    return NextResponse.json(
      { error: "Failed to update interview." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required." },
        { status: 403 }
      );
    }

    const id = new URL(request.url).searchParams.get("id");
    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Valid id required." }, { status: 400 });
    }

    await connectToDatabase();
    const result = await InterviewModel.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/interviews error:", err);
    return NextResponse.json(
      { error: "Failed to delete interview." },
      { status: 500 }
    );
  }
}
