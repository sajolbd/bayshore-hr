import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { UserModel } from "@/models/User";
import { AttendanceModel } from "@/models/Attendance";

const MAX_AVATAR_DATA_URL_CHARS = 450_000;
const AVATAR_DATA_URL_REGEX =
  /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i;

function isValidAvatarInput(value: string): boolean {
  if (value.startsWith("https://") && value.length <= 512) {
    return true;
  }
  return (
    value.length <= MAX_AVATAR_DATA_URL_CHARS &&
    AVATAR_DATA_URL_REGEX.test(value)
  );
}

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
      avatar?: unknown;
      phone?: unknown;
      location?: unknown;
      bloodGroup?: unknown;
      emergencyContact?: {
        name?: unknown;
        relationship?: unknown;
        phone?: unknown;
      } | null;
    };

    const user = await UserModel.findOne({ employeeId: session.employeeId });
    if (!user) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    if (body.avatar !== undefined) {
      if (typeof body.avatar !== "string") {
        return NextResponse.json(
          {
            error:
              "Invalid profile photo. Please upload a PNG, JPG, or WebP image under 300 KB.",
          },
          { status: 400 }
        );
      }
      const nextAvatar = body.avatar.trim();
      if (!nextAvatar || !isValidAvatarInput(nextAvatar)) {
        return NextResponse.json(
          {
            error:
              "Invalid profile photo. Please upload a PNG, JPG, or WebP image under 300 KB.",
          },
          { status: 400 }
        );
      }
      user.avatar = nextAvatar;
      await AttendanceModel.updateMany(
        { employeeId: session.employeeId },
        { $set: { avatar: nextAvatar } }
      );
    }

    // Only permitted personal fields can be edited by the user
    if (body.phone !== undefined) {
      if (typeof body.phone !== "string") {
        return NextResponse.json({ error: "Invalid phone value." }, { status: 400 });
      }
      user.phone = body.phone.trim();
    }
    if (body.location !== undefined) {
      if (typeof body.location !== "string") {
        return NextResponse.json({ error: "Invalid location value." }, { status: 400 });
      }
      user.location = body.location.trim();
    }
    if (body.bloodGroup !== undefined) {
      if (typeof body.bloodGroup !== "string") {
        return NextResponse.json({ error: "Invalid blood group value." }, { status: 400 });
      }
      user.bloodGroup = body.bloodGroup.trim();
    }
    if (body.emergencyContact !== undefined) {
      if (
        !body.emergencyContact ||
        typeof body.emergencyContact !== "object" ||
        Array.isArray(body.emergencyContact)
      ) {
        return NextResponse.json(
          { error: "Invalid emergency contact payload." },
          { status: 400 }
        );
      }
      const ec = body.emergencyContact;
      user.emergencyContact = {
        name: typeof ec.name === "string" ? ec.name.trim() : "",
        relationship: typeof ec.relationship === "string" ? ec.relationship.trim() : "",
        phone: typeof ec.phone === "string" ? ec.phone.trim() : "",
      };
    }

    await user.save();

    return NextResponse.json({ ok: true, avatar: user.avatar });
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json(
      { error: "Failed to update personal profile." },
      { status: 500 }
    );
  }
}
