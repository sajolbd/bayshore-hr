import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  diagnoseServerError,
  resolveMongoConfig,
} from "@/lib/mongodb";
import { getJwtSecretValue } from "@/lib/crypto-utils";
import { resolveSmtpConfig } from "@/lib/mailer";

/**
 * Safe runtime diagnostic endpoint for local and Vercel deployments.
 * Exposes boolean configuration status and actionable error hints without secrets.
 */
export async function GET(request: NextRequest) {
  void request.nextUrl.pathname;
  const mongoConfig = resolveMongoConfig();
  const jwtSecretConfigured = Boolean(getJwtSecretValue());

  let databaseConnected = false;
  let databaseName: string | null = null;
  let smtpConfigured = false;
  let smtpSource: "database" | "env" | "none" = "none";
  let issue: { code: string; message: string } | null = null;

  try {
    await connectToDatabase();
    databaseConnected = mongoose.connection.readyState === 1;
    databaseName = mongoose.connection.name || mongoConfig?.dbName || null;

    const smtp = await resolveSmtpConfig();
    smtpConfigured = Boolean(smtp);
    smtpSource = smtp?.source ?? "none";

    if (!jwtSecretConfigured) {
      issue = {
        code: "MISSING_JWT_SECRET",
        message:
          "Database connected, but JWT_SECRET is missing in Vercel Environment Variables. Add JWT_SECRET and redeploy.",
      };
    }
  } catch (err) {
    const diag = diagnoseServerError(err);
    issue = { code: diag.code, message: diag.message };
  }

  const ok = databaseConnected && jwtSecretConfigured;
  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      checks: {
        mongodbUriConfigured: Boolean(mongoConfig),
        jwtSecretConfigured,
        databaseConnected,
        databaseName,
        smtpConfigured,
        smtpSource,
      },
      ...(issue ? { issue } : {}),
    },
    { status: ok ? 200 : 500 }
  );
}
