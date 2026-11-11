import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { ExpenseClaimModel } from "@/models/ExpenseClaim";
import { getDhakaDateInfo } from "@/lib/geo";

export async function PATCH(
  request: NextRequest,
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
        { error: "Forbidden: Only admins can review claims." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      status?: "Approved" | "Rejected" | "Reimbursed";
      reason?: string;
    };

    const claim = await ExpenseClaimModel.findOne({ claimCode: id });
    if (!claim) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    const { dateKey } = getDhakaDateInfo();

    if (body.status === "Approved") {
      claim.status = "Approved";
      claim.approvedBy = `${session.name} (${session.role})`;
      claim.approvalDate = dateKey;
    } else if (body.status === "Rejected") {
      claim.status = "Rejected";
      claim.rejectionReason =
        body.reason || "Disallowed under Bayshore expense policy.";
    } else if (body.status === "Reimbursed") {
      claim.status = "Reimbursed";
      claim.reimbursementDate = "Disbursed via City Bank BEFTN";
    } else {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    await claim.save();
    return NextResponse.json({ ok: true, id, status: claim.status });
  } catch (err) {
    console.error("PATCH /api/claims/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update expense claim." },
      { status: 500 }
    );
  }
}

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

    const { id } = await context.params;
    const claim = await ExpenseClaimModel.findOne({ claimCode: id });
    if (!claim) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    // Employees may only cancel their own Pending claims
    if (!isAdminRole(session.role)) {
      if (claim.employeeId !== session.employeeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (claim.status !== "Pending") {
        return NextResponse.json(
          { error: "Only pending claims can be cancelled." },
          { status: 400 }
        );
      }
    }

    await ExpenseClaimModel.deleteOne({ _id: claim._id });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /api/claims/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete claim." },
      { status: 500 }
    );
  }
}
