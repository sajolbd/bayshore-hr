import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { HolidayModel } from "@/models/Holiday";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete office holidays." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    await HolidayModel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /api/leaves/holidays/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to remove office holiday." },
      { status: 500 }
    );
  }
}
