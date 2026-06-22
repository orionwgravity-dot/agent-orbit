import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_FALLBACK = "orbit-agent-jwt-secret-change-in-production";

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET || SECRET_FALLBACK;
  return new TextEncoder().encode(raw);
}

async function hasValidToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/chat-bg.jpeg"
  ) {
    return NextResponse.next();
  }

  const valid = await hasValidToken(request);

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
