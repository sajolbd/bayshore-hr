import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import {
  generateInviteToken,
  getAppBaseUrl,
  getSessionUser,
  isAdminRole,
} from "@/lib/auth-server";
import { UserModel } from "@/models/User";
import { ActivityLogModel } from "@/models/ActivityLog";
import { sendEmployeeInviteEmail } from "@/lib/mailer";
import { getClientIp } from "@/lib/geo";

function mapUserToEmployeeDto(doc: {
  employeeId: string;
  name: string;
  email: string;
  avatar: string;
  designation: string;
  department: string;
  status: string;
  joinDate: string;
  phone: string;
  location: string;
  salary: number;
  role: string;
  inviteSentAt?: Date | null;
}) {
  return {
    id: doc.employeeId,
    name: doc.name,
    email: doc.email,
    avatar: doc.avatar,
    role: doc.designation,
    systemRole: doc.role,
    department: doc.department,
    status: doc.status,
    joinDate: doc.joinDate,
    phone: doc.phone,
    location: doc.location,
    salary: doc.salary,
    inviteSentAt: doc.inviteSentAt ? doc.inviteSentAt.toISOString() : undefined,
  };
}

export async function GET() {
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

    const docs = await UserModel.find({ role: "Employee" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      employees: docs.map(mapUserToEmployeeDto),
    });
  } catch (err) {
    console.error("GET /api/employees error:", err);
    return NextResponse.json(
      { error: "Failed to load employees." },
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

    // Strict RBAC check: ONLY Super Admin can add & invite employees
    if (session.role !== "Super Admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin is authorized to add employees." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      department?: string;
      salary?: number | string;
      location?: string;
      joinDate?: string;
      avatar?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || "";
    const designation = body.role?.trim();
    const department = body.department?.trim() || "Engineering";
    const salary = Number(body.salary) || 60000;
    const location = body.location?.trim() || "Gulshan HQ, Dhaka";
    const joinDate =
      body.joinDate?.trim() || new Date().toISOString().slice(0, 10);

    if (!name || !email || !designation) {
      return NextResponse.json(
        { error: "Full name, work email, and designation are required." },
        { status: 400 }
      );
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: `An account with email "${email}" already exists.` },
        { status: 409 }
      );
    }

    // Generate next unique EMP-XXXX employee ID
    const existingEmps = await UserModel.find({
      employeeId: { $regex: /^EMP-\d+$/ },
    })
      .select("employeeId")
      .lean();
    const maxNum = existingEmps.reduce((max, u) => {
      const parsed = parseInt(u.employeeId.replace("EMP-", ""), 10);
      return Number.isNaN(parsed) ? max : Math.max(max, parsed);
    }, 1000);
    const employeeId = `EMP-${maxNum + 1}`;

    const { rawToken, tokenHash } = generateInviteToken();
    const inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const avatar =
      body.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

    const createdUser = await UserModel.create({
      employeeId,
      name,
      email,
      role: "Employee",
      department,
      designation,
      phone,
      location,
      joinDate,
      salary,
      avatar,
      status: "Invited",
      inviteTokenHash: tokenHash,
      inviteExpiresAt,
      inviteSentAt: new Date(),
      reportingManager: `${session.name} (${session.role})`,
    });

    const baseUrl = getAppBaseUrl(request);
    const inviteUrl = `${baseUrl}/accept-invite?token=${rawToken}`;

    const emailStatus = await sendEmployeeInviteEmail({
      to: email,
      employeeName: name,
      employeeId,
      designation,
      department,
      inviteUrl,
      expiresHours: 48,
    });

    await ActivityLogModel.create({
      user: session.name,
      avatar: session.avatar,
      action: "added employee & sent email invitation to",
      target: `${name} (${email})`,
      type: "onboarding",
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(
      {
        employee: mapUserToEmployeeDto(createdUser),
        emailStatus,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/employees error:", err);
    return NextResponse.json(
      { error: "Failed to add employee and send invitation." },
      { status: 500 }
    );
  }
}
