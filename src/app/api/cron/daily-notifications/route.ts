import { NextRequest, NextResponse } from "next/server";
import { runDailyNotificationSweep } from "@/lib/notification-service";

/**
 * Daily scheduler endpoint. Call once a day (system cron / Vercel cron /
 * uptime pinger):
 *
 *   curl -X POST https://<host>/api/cron/daily-notifications \
 *     -H "x-cron-secret: $CRON_SECRET"
 *
 * If CRON_SECRET is set in the environment the header is required;
 * otherwise the endpoint is open (safe — it is idempotent per day).
 *
 * Note: even without this endpoint, birthdays/anniversaries are generated
 * lazily the first time any signed-in employee loads /api/notifications.
 */
async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const provided =
      request.headers.get("x-cron-secret") ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";
    if (provided !== secret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const result = await runDailyNotificationSweep();
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/cron/daily-notifications error:", err);
    return NextResponse.json(
      { error: "Sweep failed." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
