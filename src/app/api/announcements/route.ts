import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { AnnouncementModel } from "@/models/Announcement";
import { notifyAllActiveEmployees } from "@/lib/notification-service";
import { AnnouncementItem } from "@/types";

const VALID_CATEGORIES = [
  "Company Update",
  "Urgent Notice",
  "Policy",
  "Event & Culture",
] as const;

type AnyDoc = {
  _id: { toString(): string };
  title: string;
  summary: string;
  category: string;
  author: string;
  authorAvatar?: string;
  isImportant?: boolean;
  createdAt: Date | string;
};

function mapToItem(doc: AnyDoc): AnnouncementItem {
  return {
    id: doc._id.toString(),
    title: doc.title,
    summary: doc.summary,
    category: VALID_CATEGORIES.includes(doc.category as AnnouncementItem["category"])
      ? (doc.category as AnnouncementItem["category"])
      : "Company Update",
    date: new Date(doc.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    author: doc.author,
    authorAvatar: doc.authorAvatar || "",
    isImportant: Boolean(doc.isImportant),
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

    const docs = await AnnouncementModel.find({})
      .sort({ isImportant: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      announcements: docs.map((doc) => mapToItem(doc as unknown as AnyDoc)),
    });
  } catch (err) {
    console.error("GET /api/announcements error:", err);
    return NextResponse.json(
      { error: "Failed to load announcements." },
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
      summary?: string;
      category?: string;
      isImportant?: boolean;
    };

    const title = body.title?.trim();
    const summary = body.summary?.trim();
    if (!title || !summary) {
      return NextResponse.json(
        { error: "Title and summary are required." },
        { status: 400 }
      );
    }

    const category = (VALID_CATEGORIES as readonly string[]).includes(
      body.category ?? ""
    )
      ? (body.category as (typeof VALID_CATEGORIES)[number])
      : "Company Update";

    const created = await AnnouncementModel.create({
      title,
      summary,
      category,
      author: session.name,
      authorAvatar: session.avatar || "",
      isImportant: Boolean(body.isImportant),
    });

    // Push an in-app notification to every active employee when an
    // announcement notice goes out. Never fails the announcement itself.
    try {
      await notifyAllActiveEmployees(
        {
          type: "announcement",
          title: `${category}${body.isImportant ? " — Important" : ""}: ${title}`,
          message: summary,
          refId: created._id.toString(),
          dedupKey: `announcement:${created._id.toString()}`,
        },
        session.employeeId
      );
    } catch (notifyErr) {
      console.error("Announcement notification fan-out failed:", notifyErr);
    }

    return NextResponse.json({ announcement: mapToItem(created) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/announcements error:", err);
    return NextResponse.json(
      { error: "Failed to create announcement." },
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
    const result = await AnnouncementModel.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/announcements error:", err);
    return NextResponse.json(
      { error: "Failed to delete announcement." },
      { status: 500 }
    );
  }
}
