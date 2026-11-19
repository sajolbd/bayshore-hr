import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { CompanyDocumentModel } from "@/models/Document";
import { CompanyDocumentItem } from "@/types";

const VALID_VISIBILITIES = ["All Employees", "HR & Admins Only"] as const;

function mapToItem(doc: Record<string, unknown>): CompanyDocumentItem {
  return {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    category: String(doc.category ?? ""),
    visibility:
      doc.visibility === "HR & Admins Only"
        ? "HR & Admins Only"
        : "All Employees",
    fileUrl: String(doc.fileUrl ?? ""),
    fileSize: String(doc.fileSize ?? ""),
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
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

    const filter = isAdminRole(session.role)
      ? {}
      : { visibility: "All Employees" as const };

    const docs = await CompanyDocumentModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      documents: docs.map((doc) =>
        mapToItem(doc as unknown as Record<string, unknown>)
      ),
    });
  } catch (err) {
    console.error("GET /api/documents error:", err);
    return NextResponse.json(
      { error: "Failed to load documents." },
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
      category?: string;
      visibility?: string;
      fileUrl?: string;
      fileSize?: string;
    };

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Document title is required." },
        { status: 400 }
      );
    }

    const visibility = (VALID_VISIBILITIES as readonly string[]).includes(
      body.visibility ?? ""
    )
      ? (body.visibility as (typeof VALID_VISIBILITIES)[number])
      : "All Employees";

    const created = await CompanyDocumentModel.create({
      title: body.title.trim(),
      category: body.category?.trim() || "Company Policy",
      visibility,
      fileUrl: body.fileUrl?.trim() || "",
      fileSize: body.fileSize?.trim() || "",
      createdBy: session.name || "HR Team",
    });

    return NextResponse.json(
      {
        document: mapToItem(
          created.toObject() as unknown as Record<string, unknown>
        ),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/documents error:", err);
    return NextResponse.json(
      { error: "Failed to create document." },
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
    const result = await CompanyDocumentModel.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/documents error:", err);
    return NextResponse.json(
      { error: "Failed to delete document." },
      { status: 500 }
    );
  }
}
