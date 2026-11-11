import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { connectToDatabase } from "./mongodb";
import { UserModel, UserRoleType, UserStatusType } from "@/models/User";

export const SESSION_COOKIE_NAME = "bayshore_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRoleType;
  department: string;
  designation: string;
  avatar: string;
  status: UserStatusType;
  phone: string;
  location: string;
  joinDate: string;
  salary: number;
}

interface JWTPayload {
  sub: string;
  employeeId: string;
  role: UserRoleType;
}

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured in .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({
    employeeId: payload.employeeId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.employeeId !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      employeeId: payload.employeeId,
      role: payload.role as UserRoleType,
    };
  } catch {
    return null;
  }
}

function isSecureRequest(request: NextRequest): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
  request: NextRequest
) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    secure: isSecureRequest(request),
  });
}

export function clearSessionCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: isSecureRequest(request),
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    await connectToDatabase();
    const user = await UserModel.findById(payload.sub).lean();
    if (!user) return null;

    if (user.status !== "Active" && user.status !== "On Leave") {
      return null;
    }

    return {
      id: user._id.toString(),
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      avatar: user.avatar,
      status: user.status,
      phone: user.phone,
      location: user.location,
      joinDate: user.joinDate,
      salary: user.salary,
    };
  } catch {
    return null;
  }
}

export function isAdminRole(role: UserRoleType): boolean {
  return (
    role === "Super Admin" ||
    role === "HR Admin" ||
    role === "Payroll Admin" ||
    role === "Compliance Auditor"
  );
}

export function hashInviteToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateInviteToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashInviteToken(rawToken);
  return { rawToken, tokenHash };
}

export function getAppBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/$/, "");
  }
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("host") || request.nextUrl.host;
  return `${proto}://${host}`;
}
