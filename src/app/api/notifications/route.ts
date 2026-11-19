import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { runDailyNotificationSweep } from "@/lib/notification-service";
import { NotificationModel, NotificationType } from "@/models/Notification";
import { UserModel } from "@/models/User";

/**
 * GET — current user's notifications. Runs the lazy daily sweep first with
 * a one-run-per-day guard so birthdays / work anniversaries are generated
 * even without an external cron hitting /api/cron/daily-notifications.
 */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    try {
      await runDailyNotificationSweep();
    } catch (sweepErr) {
      console.error("notification sweep error:", sweepErr);
    }

    const docs = await NotificationModel.find({
      recipientEmployeeId: session.employeeId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const unreadCount = docs.filter((d) => !d.read).length;

    return NextResponse.json({
      notifications: docs.map((doc) => ({
        id: doc._id.toString(),
        type: doc.type as NotificationType,
        title: doc.title,
        message: doc.message,
        refId: doc.refId || "",
        read: Boolean(doc.read),
        createdAt: doc.createdAt,
      })),
      unreadCount,
    });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json(
      { error: "Failed to load notifications." },
      { status: 500 }
    );
  }
}

interface PatchBody {
  id?: string;
  all?: boolean;
}

/** PATCH — mark one notification read ({ id }) or all read ({ all: true }). */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = (await request.json().catch(() => ({}))) as PatchBody;

    if (body.all) {
      await NotificationModel.updateMany(
        { recipientEmployeeId: session.employeeId, read: false },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true });
    }

    if (!body.id || !mongoose.isValidObjectId(body.id)) {
      return NextResponse.json(
        { error: "Valid id or all:true required." },
        { status: 400 }
      );
    }

    await NotificationModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(body.id),
        recipientEmployeeId: session.employeeId,
      },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json(
      { error: "Failed to update notifications." },
      { status: 500 }
    );
  }
}

const VALID_TYPES: NotificationType[] = [
  "announcement",
  "birthday",
  "work-anniversary",
  "leave",
  "attendance",
  "payroll",
];

interface PostBody {
  title?: string;
  message?: string;
  type?: string;
  /** Omit to broadcast to every active employee. */
  employeeId?: string;
}

/**
 * POST — admin-only manual notification. Omit employeeId to broadcast to
 * every active employee.
 */
export async function POST(request: NextRequest) {
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

    const body = (await request.json().catch(() => ({}))) as PostBody;
    const title = body.title?.trim();
    const message = body.message?.trim();
    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required." },
        { status: 400 }
      );
    }

    const type = (VALID_TYPES as string[]).includes(body.type ?? "")
      ? (body.type as NotificationType)
      : "announcement";

    let count: number;
    if (body.employeeId) {
      const target = await UserModel.exists({ employeeId: body.employeeId });
      if (!target) {
        return NextResponse.json(
          { error: "Employee not found." },
          { status: 404 }
        );
      }
      await NotificationModel.create({
        recipientEmployeeId: body.employeeId,
        type,
        title,
        message,
        refId: body.employeeId,
      });
      count = 1;
    } else {
      const activeUsers = await UserModel.find({
        status: { $ne: "Terminated" },
      })
        .select("employeeId")
        .lean();
      if (activeUsers.length === 0) {
        return NextResponse.json({ created: 0 });
      }
      const created = await NotificationModel.insertMany(
        activeUsers.map((u) => ({
          recipientEmployeeId: u.employeeId,
          type,
          title,
          message,
          refId: "",
          dedupKey: "",
        }))
      );
      count = created.length;
    }

    return NextResponse.json({ created: count }, { status: 201 });
  } catch (err) {
    console.error("POST /api/notifications error:", err);
    return NextResponse.json(
      { error: "Failed to send notification." },
      { status: 500 }
    );
  }
}
