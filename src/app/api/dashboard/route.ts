import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseBootstrapped } from "@/lib/bootstrap";
import { getSessionUser, isAdminRole } from "@/lib/auth-server";
import { ActivityLogModel } from "@/models/ActivityLog";

function formatRelativeTime(date: Date): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(session.role)) {
      return NextResponse.json({ activities: [] });
    }

    await connectToDatabase();
    await ensureDatabaseBootstrapped();

    const logs = await ActivityLogModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      activities: logs.map((l) => ({
        id: l._id.toString(),
        user: l.user,
        avatar:
          l.avatar ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        action: l.action,
        target: l.target,
        timestamp: formatRelativeTime(l.createdAt),
        type: l.type,
      })),
    });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json(
      { error: "Failed to load activity feed." },
      { status: 500 }
    );
  }
}
