import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { ExpenseClaimModel, IExpenseClaim } from "@/models/ExpenseClaim";
import { ActivityLogModel } from "@/models/ActivityLog";
import { getDhakaDateInfo } from "@/lib/geo";

const VALID_CLAIM_CATEGORIES: readonly IExpenseClaim["category"][] = [
  "Travel & Mileage",
  "Meals & Entertainment",
  "Medical & Wellness",
  "Mobile & Internet",
  "Office Supplies",
  "Training & Certification",
  "Client Hospitality",
];

function mapClaim(doc: {
  claimCode: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  title: string;
  category: string;
  amount: number;
  dateIncurred: string;
  submissionDate: string;
  status: string;
  merchantName: string;
  receiptUrl?: string;
  receiptFileName?: string;
  description: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  reimbursementDate?: string;
}) {
  return {
    id: doc.claimCode,
    employeeId: doc.employeeId,
    employeeName: doc.employeeName,
    employeeAvatar: doc.employeeAvatar,
    department: doc.department,
    title: doc.title,
    category: doc.category,
    amount: doc.amount,
    dateIncurred: doc.dateIncurred,
    submissionDate: doc.submissionDate,
    status: doc.status,
    merchantName: doc.merchantName,
    receiptUrl: doc.receiptUrl,
    receiptFileName: doc.receiptFileName,
    description: doc.description,
    approvedBy: doc.approvedBy,
    approvalDate: doc.approvalDate,
    rejectionReason: doc.rejectionReason,
    reimbursementDate: doc.reimbursementDate,
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
      : { employeeId: session.employeeId };

    const claims = await ExpenseClaimModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      claims: claims.map(mapClaim),
    });
  } catch (err) {
    console.error("GET /api/claims error:", err);
    return NextResponse.json(
      { error: "Failed to load expense claims." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      category?: string;
      amount?: number;
      dateIncurred?: string;
      merchantName?: string;
      receiptFileName?: string;
      description?: string;
    };

    const title = body.title?.trim();
    const rawCategory = body.category?.trim();
    const amount = Number(body.amount);
    const dateIncurred = body.dateIncurred?.trim();
    const merchantName = body.merchantName?.trim();
    const description = body.description?.trim() || "Expense voucher submission";

    const category = VALID_CLAIM_CATEGORIES.find((c) => c === rawCategory);

    if (
      !title ||
      !category ||
      !merchantName ||
      !dateIncurred ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Valid title, category, merchant, date, and positive amount are required." },
        { status: 400 }
      );
    }

    const { dateKey } = getDhakaDateInfo();
    const claimCode = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;

    const created = await ExpenseClaimModel.create({
      claimCode,
      employeeId: session.employeeId,
      employeeName: session.name,
      employeeAvatar: session.avatar,
      department: session.department,
      title,
      category,
      amount,
      dateIncurred,
      submissionDate: dateKey,
      status: "Pending",
      merchantName,
      receiptUrl:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
      receiptFileName: body.receiptFileName || "Expense_Receipt.pdf",
      description,
    });

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "submitted e-claim reimbursement for",
      target: `৳${amount.toLocaleString()} (${title})`,
      type: "payroll",
    });

    return NextResponse.json({ claim: mapClaim(created) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/claims error:", err);
    return NextResponse.json(
      { error: "Failed to submit expense claim." },
      { status: 500 }
    );
  }
}
