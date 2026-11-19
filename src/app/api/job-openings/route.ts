import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { JobOpeningModel } from "@/models/JobOpening";

type AnyDoc = {
  _id: { toString(): string };
  title: string;
  department: string;
  location: string;
  employmentType: string;
  stage: string;
  applicants: number;
  urgent: boolean;
  isOpen: boolean;
};

function mapToDto(doc: AnyDoc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    department: doc.department,
    location: doc.location,
    type: doc.employmentType,
    stage: doc.stage,
    applicants: doc.applicants,
    urgent: doc.urgent,
    isOpen: doc.isOpen,
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

    const docs = await JobOpeningModel.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      openings: docs.map((doc) => mapToDto(doc as unknown as AnyDoc)),
    });
  } catch (err) {
    console.error("GET /api/job-openings error:", err);
    return NextResponse.json(
      { error: "Failed to load job openings." },
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
      title?: string;
      department?: string;
      location?: string;
      type?: string;
      urgent?: boolean;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const created = await JobOpeningModel.create({
      title: body.title.trim(),
      department: body.department?.trim() || "Engineering",
      location: body.location?.trim() || "Abtab Nagar HQ, Dhaka",
      employmentType: body.type || "Full-Time",
      urgent: Boolean(body.urgent),
      stage: "Open",
      applicants: 0,
    });

    return NextResponse.json(
      { opening: mapToDto(created.toObject() as unknown as AnyDoc) },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/job-openings error:", err);
    return NextResponse.json(
      { error: "Failed to create job opening." },
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
      applicants?: number;
      stage?: string;
      isOpen?: boolean;
    };
    if (!body.id || !mongoose.isValidObjectId(body.id)) {
      return NextResponse.json({ error: "Valid id required." }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (typeof body.applicants === "number") update.applicants = Math.max(0, body.applicants);
    if (typeof body.stage === "string" && body.stage.trim()) update.stage = body.stage.trim();
    if (typeof body.isOpen === "boolean") update.isOpen = body.isOpen;

    await connectToDatabase();
    const updated = await JobOpeningModel.findByIdAndUpdate(body.id, update, {
      new: true,
    }).lean();
    if (!updated) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({
      opening: mapToDto(updated as unknown as AnyDoc),
    });
  } catch (err) {
    console.error("PATCH /api/job-openings error:", err);
    return NextResponse.json(
      { error: "Failed to update job opening." },
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
    const result = await JobOpeningModel.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/job-openings error:", err);
    return NextResponse.json(
      { error: "Failed to delete job opening." },
      { status: 500 }
    );
  }
}
