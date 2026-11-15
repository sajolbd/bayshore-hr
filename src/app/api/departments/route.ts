import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { DepartmentModel } from "@/models/Department";
import { getDefaultCartoonAvatar } from "@/lib/avatar";

const DEFAULT_DEPARTMENTS = [
  {
    name: "Engineering",
    head: "Marcus Vance",
    headRole: "VP of Engineering",
    headAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    headcount: 88,
    openPositions: 4,
    budget: 4200000,
    color: "orange",
  },
  {
    name: "Product & Design",
    head: "David Chen",
    headRole: "Head of Product & UX",
    headAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    headcount: 40,
    openPositions: 2,
    budget: 2100000,
    color: "emerald",
  },
  {
    name: "Sales & Marketing",
    head: "Sophia Al-Mansoor",
    headRole: "Chief Revenue Officer",
    headAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    headcount: 54,
    openPositions: 1,
    budget: 3100000,
    color: "amber",
  },
  {
    name: "Operations",
    head: "Carlos Mendez",
    headRole: "Director of Operations",
    headAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    headcount: 46,
    openPositions: 1,
    budget: 1850000,
    color: "blue",
  },
  {
    name: "HR, People & Legal",
    head: "Alex Morgan",
    headRole: "Head of People & Culture",
    headAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    headcount: 20,
    openPositions: 0,
    budget: 950000,
    color: "purple",
  },
];

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Auto-seed if empty
    const count = await DepartmentModel.countDocuments();
    if (count === 0) {
      await DepartmentModel.insertMany(DEFAULT_DEPARTMENTS);
    }

    const docs = await DepartmentModel.find().sort({ name: 1 }).lean();

    return NextResponse.json({
      departments: docs.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        head: d.head,
        headRole: d.headRole,
        headAvatar: d.headAvatar || getDefaultCartoonAvatar(d.head),
        headcount: d.headcount,
        openPositions: d.openPositions,
        budget: d.budget,
        color: d.color || "orange",
      })),
    });
  } catch (err) {
    console.error("GET /api/departments error:", err);
    return NextResponse.json(
      { error: "Failed to load departments." },
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
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const head = String(body.head || "").trim();
    const headRole = String(body.headRole || "").trim();
    const headcount = Number(body.headcount) || 0;
    const openPositions = Number(body.openPositions) || 0;
    const budget = Number(body.budget) || 0;
    const color = String(body.color || "orange").trim();
    const headAvatar = body.headAvatar?.trim() || getDefaultCartoonAvatar(head || name);

    if (!name || !head || !headRole) {
      return NextResponse.json(
        { error: "Department name, department lead, and lead title are required." },
        { status: 400 }
      );
    }

    const existing = await DepartmentModel.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { error: `Department "${name}" already exists.` },
        { status: 409 }
      );
    }

    const created = await DepartmentModel.create({
      name,
      head,
      headRole,
      headAvatar,
      headcount,
      openPositions,
      budget,
      color,
    });

    return NextResponse.json(
      {
        department: {
          id: created._id.toString(),
          name: created.name,
          head: created.head,
          headRole: created.headRole,
          headAvatar: created.headAvatar,
          headcount: created.headcount,
          openPositions: created.openPositions,
          budget: created.budget,
          color: created.color,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/departments error:", err);
    return NextResponse.json(
      { error: "Failed to create department." },
      { status: 500 }
    );
  }
}

