import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { HolidayModel } from "@/models/Holiday";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can add office holidays." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      date?: string;
      day?: string;
      type?: "National Holiday" | "Gazetted Holiday" | "Company Holiday";
    };

    const name = body.name?.trim();
    const date = body.date?.trim();
    const day = body.day?.trim() || "Official Day Off";
    const type = body.type || "Company Holiday";

    if (!name || !date) {
      return NextResponse.json(
        { error: "Holiday name and date are required." },
        { status: 400 }
      );
    }

    const created = await HolidayModel.create({ name, date, day, type });
    return NextResponse.json(
      {
        holiday: {
          id: created._id.toString(),
          name: created.name,
          date: created.date,
          day: created.day,
          type: created.type,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/leaves/holidays error:", err);
    return NextResponse.json(
      { error: "Failed to add office holiday." },
      { status: 500 }
    );
  }
}
