import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser } from "@/lib/auth-server";
import { getDhakaDateInfo } from "@/lib/geo";
import { parseDateOfBirth } from "@/lib/dashboard-analytics";
import { UserModel } from "@/models/User";
import { BirthdayWishModel } from "@/models/BirthdayWish";
import { NotificationModel } from "@/models/Notification";

/**
 * GET — today's celebrants (Dhaka calendar) with the wishes they have
 * received today, plus whether the current user already wished them.
 */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const { dateKey } = getDhakaDateInfo();
    const now = new Date();
    const todayMonth = now.getMonth();
    const todayDay = now.getDate();

    const users = await UserModel.find({
      status: { $ne: "Terminated" },
    })
      .select(
        "employeeId name avatar department designation role dateOfBirth"
      )
      .lean();

    const celebrants = users.filter((u) => {
      const dob = parseDateOfBirth(u.dateOfBirth);
      if (!dob) return false;
      return dob.getMonth() === todayMonth && dob.getDate() === todayDay;
    });

    const celebrantIds = celebrants.map((c) => c.employeeId);
    const wishes = await BirthdayWishModel.find({
      dateKey,
      celebrantEmployeeId: { $in: celebrantIds },
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      dateKey,
      birthdays: celebrants.map((c) => {
        const received = wishes
          .filter((w) => w.celebrantEmployeeId === c.employeeId)
          .map((w) => ({
            id: w._id.toString(),
            fromEmployeeId: w.senderEmployeeId,
            fromName: w.senderName,
            fromAvatar: w.senderAvatar,
            message: w.message,
            createdAt: w.createdAt.toISOString(),
          }));
        return {
          employeeId: c.employeeId,
          name: c.name,
          avatar: c.avatar,
          department: c.department,
          designation: c.designation,
          isToday: true,
          wishedByMe: wishes.some(
            (w) =>
              w.celebrantEmployeeId === c.employeeId &&
              w.senderEmployeeId === session.employeeId
          ),
          wishes: received,
        };
      }),
    });
  } catch (err) {
    console.error("GET /api/birthdays error:", err);
    return NextResponse.json(
      { error: "Failed to load today's birthdays." },
      { status: 500 }
    );
  }
}

interface WishBody {
  employeeId?: string;
  message?: string;
}

/**
 * POST — any signed-in user can wish a colleague a happy birthday.
 * One wish per sender per celebrant per day; the celebrant gets a
 * notification so they can read the messages.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const body = (await request.json().catch(() => ({}))) as WishBody;
    const employeeId = body.employeeId?.trim();
    const message = body.message?.trim().slice(0, 500);

    if (!employeeId || !message) {
      return NextResponse.json(
        { error: "Employee ID and a wish message are required." },
        { status: 400 }
      );
    }

    if (employeeId === session.employeeId) {
      return NextResponse.json(
        { error: "Cheer up! You cannot wish yourself a happy birthday." },
        { status: 400 }
      );
    }

    const celebrant = await UserModel.findOne({ employeeId }).lean();
    if (!celebrant) {
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    const { dateKey } = getDhakaDateInfo();

    const existing = await BirthdayWishModel.findOne({
      celebrantEmployeeId: employeeId,
      senderEmployeeId: session.employeeId,
      dateKey,
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: `You already wished ${celebrant.name} today.` },
        { status: 409 }
      );
    }

    await BirthdayWishModel.create({
      celebrantEmployeeId: employeeId,
      celebrantName: celebrant.name,
      senderEmployeeId: session.employeeId,
      senderName: session.name,
      senderAvatar: session.avatar,
      message,
      dateKey,
    });

    await NotificationModel.create({
      recipientEmployeeId: employeeId,
      type: "birthday",
      title: "Birthday Wishes",
      message: `${session.name} wished you: "${message}"`,
      refId: employeeId,
      dedupKey: `bday-wish:${dateKey}:${employeeId}:${session.employeeId}`,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/birthdays error:", err);
    return NextResponse.json(
      { error: "Failed to send birthday wish." },
      { status: 500 }
    );
  }
}
