import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { LeavePolicyModel } from "@/models/LeavePolicy";
import { ActivityLogModel } from "@/models/ActivityLog";

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only admin users can configure yearly leave quotas." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      yearlyQuota?: number;
      carryForwardMax?: number;
    };

    const yearlyQuota = Math.max(0, Math.min(365, Number(body.yearlyQuota ?? 20)));
    const carryForwardMax = Math.max(
      0,
      Math.min(60, Number(body.carryForwardMax ?? 5))
    );

    const updated = await LeavePolicyModel.findOneAndUpdate(
      { key: "annual_leave" },
      {
        $set: {
          yearlyQuota,
          carryForwardMax,
          updatedBy: session.name,
        },
      },
      { upsert: true, new: true }
    );

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "updated yearly Annual Leave quota to",
      target: `${yearlyQuota} days/year per employee`,
      type: "policy",
    });

    return NextResponse.json({
      policy: {
        type: "Annual Leave",
        yearlyQuota: updated.yearlyQuota,
        carryForwardMax: updated.carryForwardMax,
        paid: updated.paid,
        description: updated.description,
        color: updated.color,
      },
    });
  } catch (err) {
    console.error("PUT /api/leaves/policy error:", err);
    return NextResponse.json(
      { error: "Failed to update annual leave quota." },
      { status: 500 }
    );
  }
}
