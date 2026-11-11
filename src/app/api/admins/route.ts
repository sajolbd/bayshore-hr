import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { UserModel } from "@/models/User";
import { ActivityLogModel } from "@/models/ActivityLog";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const [admins, logs] = await Promise.all([
      UserModel.find({ role: { $ne: "Employee" } })
        .sort({ createdAt: 1 })
        .lean(),
      ActivityLogModel.find().sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    return NextResponse.json({
      admins: admins.map((a) => ({
        id: a.employeeId,
        name: a.name,
        email: a.email,
        avatar: a.avatar,
        role: a.role,
        department: a.department,
        permissions:
          a.role === "Super Admin"
            ? ["all_access", "employee_invite", "payroll_manage"]
            : ["employee_read", "leave_review"],
        lastLogin: a.lastLoginAt
          ? new Date(a.lastLoginAt).toLocaleString("en-US")
          : "Never",
        status: a.status === "Suspended" ? "Suspended" : "Active",
        twoFactorEnabled: true,
      })),
      auditLogs: logs.map((l) => ({
        id: l._id.toString(),
        adminName: l.user,
        adminAvatar:
          l.avatar ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        action: l.action,
        target: l.target,
        category:
          l.type === "payroll"
            ? "Compensation & Payroll"
            : l.type === "policy"
            ? "HR Governance"
            : "User Management",
        ipAddress: l.ipAddress || "127.0.0.1",
        location: l.location || "Dhaka, BD",
        timestamp: new Date(l.createdAt).toLocaleString("en-US"),
        severity: "info",
      })),
    });
  } catch (err) {
    console.error("GET /api/admins error:", err);
    return NextResponse.json(
      { error: "Failed to load admin governance console." },
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
    if (session.role !== "Super Admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can create administrator accounts." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      password?: string;
      role?: "Super Admin" | "HR Admin" | "Payroll Admin" | "Compliance Auditor";
      department?: string;
      avatar?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";
    const role = body.role || "HR Admin";
    const department = body.department?.trim() || "People Operations";

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "Name, corporate email, and password (min 6 chars) are required." },
        { status: 400 }
      );
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: `Account with email "${email}" already exists.` },
        { status: 409 }
      );
    }

    const adminDocs = await UserModel.find({
      employeeId: { $regex: /^ADM-\d+$/ },
    })
      .select("employeeId")
      .lean();
    const maxNum = adminDocs.reduce((max, d) => {
      const n = parseInt(d.employeeId.replace("ADM-", ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const employeeId = `ADM-${String(maxNum + 1).padStart(3, "0")}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await UserModel.create({
      employeeId,
      name,
      email,
      passwordHash,
      role,
      department,
      designation: role,
      location: "Gulshan HQ, Dhaka",
      avatar:
        body.avatar ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "Active",
    });

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "created administrator credentials for",
      target: `${created.name} (${created.role})`,
      type: "onboarding",
    });

    return NextResponse.json(
      {
        admin: {
          id: created.employeeId,
          name: created.name,
          email: created.email,
          avatar: created.avatar,
          role: created.role,
          department: created.department,
          permissions: ["admin_access"],
          lastLogin: "Never",
          status: "Active",
          twoFactorEnabled: true,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admins error:", err);
    return NextResponse.json(
      { error: "Failed to create admin user." },
      { status: 500 }
    );
  }
}
