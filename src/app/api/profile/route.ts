import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { UserModel } from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const user = await UserModel.findOne({
      employeeId: session.employeeId,
    }).lean();

    if (!user) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user.employeeId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.designation,
        department: user.department,
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
        reportingManager: user.reportingManager || "Shamim Ahsan",
        reportingManagerRole: "Super Admin",
        reportingManagerAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        bloodGroup: user.bloodGroup || "O+",
        nidOrPassport: user.nidOrPassport || "Pending Verification",
        dateOfBirth: user.dateOfBirth || "Not Specified",
        salary: user.salary,
        emergencyContact: user.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        skills: user.skills || [],
        education: user.education || [],
      },
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      phone?: string;
      location?: string;
      bloodGroup?: string;
      emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
      };
    };

    const user = await UserModel.findOne({ employeeId: session.employeeId });
    if (!user) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    // Only permitted personal fields can be edited by the employee
    if (body.phone !== undefined) user.phone = body.phone.trim();
    if (body.location !== undefined) user.location = body.location.trim();
    if (body.bloodGroup !== undefined) user.bloodGroup = body.bloodGroup.trim();
    if (body.emergencyContact) {
      user.emergencyContact = {
        name: body.emergencyContact.name?.trim() || "",
        relationship: body.emergencyContact.relationship?.trim() || "",
        phone: body.emergencyContact.phone?.trim() || "",
      };
    }

    await user.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json(
      { error: "Failed to update personal profile." },
      { status: 500 }
    );
  }
}
