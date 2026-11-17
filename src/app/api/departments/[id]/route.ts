import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { DepartmentModel } from "@/models/Department";
import { ActivityLogModel } from "@/models/ActivityLog";
import mongoose from "mongoose";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const body = await request.json().catch(() => ({}));
    const updateData: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (typeof body.head === "string" && body.head.trim()) {
      updateData.head = body.head.trim();
    }
    if (typeof body.headRole === "string" && body.headRole.trim()) {
      updateData.headRole = body.headRole.trim();
    }
    if (typeof body.headAvatar === "string" && body.headAvatar.trim()) {
      updateData.headAvatar = body.headAvatar.trim();
    }
    if (typeof body.headcount === "number" || (typeof body.headcount === "string" && !isNaN(Number(body.headcount)))) {
      updateData.headcount = Math.max(0, Number(body.headcount));
    }
    if (typeof body.openPositions === "number" || (typeof body.openPositions === "string" && !isNaN(Number(body.openPositions)))) {
      updateData.openPositions = Math.max(0, Number(body.openPositions));
    }
    if (typeof body.budget === "number" || (typeof body.budget === "string" && !isNaN(Number(body.budget)))) {
      updateData.budget = Math.max(0, Number(body.budget));
    }
    if (typeof body.color === "string" && body.color.trim()) {
      updateData.color = body.color.trim();
    }

    let query: Record<string, unknown>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { name: id };
    }

    const updated = await DepartmentModel.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Department not found." }, { status: 404 });
    }

    return NextResponse.json({
      department: {
        id: updated._id.toString(),
        name: updated.name,
        head: updated.head,
        headRole: updated.headRole,
        headAvatar: updated.headAvatar,
        headcount: updated.headcount,
        openPositions: updated.openPositions,
        budget: updated.budget,
        color: updated.color,
      },
    });
  } catch (err) {
    console.error("PATCH /api/departments/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update department." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { name: id };
    const deleted = await DepartmentModel.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json({ error: "Department not found." }, { status: 404 });
    }

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "deleted department",
      target: deleted.name,
      type: "policy",
    });

    return NextResponse.json({
      success: true,
      id: deleted._id.toString(),
      message: `Department ${deleted.name} deleted.`,
    });
  } catch (err) {
    console.error("DELETE /api/departments/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete department." },
      { status: 500 }
    );
  }
}
