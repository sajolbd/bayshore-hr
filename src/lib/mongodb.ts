import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

const DEFAULT_DB_NAME = "bayshore_hr";

function stripWrappingQuotes(value?: string): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * Resolves the MongoDB connection string from standard environment variable names
 * and provides the default database name if the URI omits one (e.g. ends with `/`).
 */
export function resolveMongoConfig(): { uri: string; dbName?: string } | null {
  const rawUri =
    stripWrappingQuotes(process.env.MONGODB_URI) ||
    stripWrappingQuotes(process.env.MONGO_URI) ||
    stripWrappingQuotes(process.env.DATABASE_URL) ||
    stripWrappingQuotes(process.env.MONGODB_URL);

  if (!rawUri) return null;

  let dbName: string | undefined;
  const pathMatch = /^mongodb(?:\+srv)?:\/\/[^/?]+(?:\/([^?]*))?/i.exec(rawUri);
  const parsedDb = pathMatch?.[1]?.trim();
  if (!parsedDb) {
    dbName = DEFAULT_DB_NAME;
  }

  return { uri: rawUri, dbName };
}

/**
 * Connects to MongoDB Atlas with connection pooling and timeouts tuned for
 * both local runtimes and Vercel serverless functions.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const config = resolveMongoConfig();
  if (!config) {
    throw new Error(
      "MONGODB_URI environment variable is missing in server configuration."
    );
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(config.uri, {
        ...(config.dbName ? { dbName: config.dbName } : {}),
        bufferCommands: false,
        serverSelectionTimeoutMS: 6500,
        connectTimeoutMS: 6500,
        socketTimeoutMS: 20000,
        maxPoolSize: 5,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

/**
 * Maps runtime config or database errors into safe, actionable messages without
 * leaking credentials or raw connection strings.
 */
export function diagnoseServerError(err: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const rawMsg = err instanceof Error ? err.message : String(err ?? "");
  const errName = err instanceof Error ? err.name : "ServerError";
  const lower = rawMsg.toLowerCase();

  if (!resolveMongoConfig() || lower.includes("mongodb_uri")) {
    return {
      status: 500,
      code: "MISSING_MONGODB_URI",
      message:
        "Server configuration error: MONGODB_URI is missing in environment variables. Add MONGODB_URI and redeploy.",
    };
  }

  if (lower.includes("invalid scheme") || lower.includes("openuri")) {
    return {
      status: 500,
      code: "INVALID_MONGODB_URI",
      message:
        "Invalid MONGODB_URI format. Ensure it starts with mongodb+srv:// or mongodb:// without extra quotes.",
    };
  }

  if (lower.includes("jwt_secret")) {
    return {
      status: 500,
      code: "MISSING_JWT_SECRET",
      message:
        "Server configuration error: JWT_SECRET is missing in environment variables (Vercel Project Settings -> Environment Variables). Add JWT_SECRET and redeploy.",
    };
  }

  if (
    lower.includes("authentication failed") ||
    lower.includes("bad auth") ||
    lower.includes("auth failed")
  ) {
    return {
      status: 500,
      code: "MONGO_AUTH_FAILED",
      message:
        "MongoDB authentication failed. Verify the database username and password inside MONGODB_URI.",
    };
  }

  if (
    errName === "MongooseServerSelectionError" ||
    lower.includes("server selection") ||
    lower.includes("whitelist") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("enotfound") ||
    lower.includes("querysrv")
  ) {
    return {
      status: 500,
      code: "MONGO_NETWORK_OR_WHITELIST",
      message:
        "Cannot connect to MongoDB Atlas. Ensure MONGODB_URI is valid and add 0.0.0.0/0 in MongoDB Atlas -> Network Access so Vercel servers can connect.",
    };
  }

  return {
    status: 500,
    code: errName || "INTERNAL_SERVER_ERROR",
    message:
      "Unable to complete sign-in. Check /api/health or server logs to verify environment variables and database connectivity.",
  };
}
