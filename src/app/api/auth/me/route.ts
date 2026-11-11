import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }
    return NextResponse.json({ authenticated: true, user }, { status: 200 });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json(
      { authenticated: false, user: null, error: "Session verification failed." },
      { status: 500 }
    );
  }
}
