import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./app/lib/jwt";

// In-memory token bucket rate limit repository (IP keyed)
const ipRateStore = new Map<string, { tokens: number; lastRefill: number }>();
const BUCKET_CAPACITY = 40; // Max 40 calls per minute
const REFILL_INTERVAL = 60000; // Refill window: 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientBucket = ipRateStore.get(ip) || { tokens: BUCKET_CAPACITY, lastRefill: now };

  const timePassed = now - clientBucket.lastRefill;
  if (timePassed >= REFILL_INTERVAL) {
    clientBucket.tokens = BUCKET_CAPACITY;
    clientBucket.lastRefill = now;
  }

  if (clientBucket.tokens > 0) {
    clientBucket.tokens--;
    ipRateStore.set(ip, clientBucket);
    return false; // Not rate limited
  }

  return true; // Rate limited
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const path = request.nextUrl.pathname;

  // 1. Rate Limiting Enforcer (Protected API endpoints)
  if (path.startsWith("/api/auth/login") || path.startsWith("/api/bookings")) {
    if (checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Too many concurrent requests. Rate limit exceeded." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Admin API & Page Protection
  if (path.startsWith("/api/admin") || (path.startsWith("/admin") && path !== "/admin/login")) {
    const jwtCookie = request.cookies.get("sk_session_jwt");
    const sessionCookie = request.cookies.get("sk_session");
    let isAuthorized = false;

    if (jwtCookie?.value) {
      const payload: any = await verifyJWT(jwtCookie.value);
      if (payload && (payload.role === "admin" || payload.email?.toLowerCase() === "ganeshkalapadgk@gmail.com")) {
        isAuthorized = true;
      }
    } else if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session && (session.role === "admin" || session.email?.toLowerCase() === "ganeshkalapadgk@gmail.com")) {
          isAuthorized = true;
        }
      } catch (e) {}
    }

    if (!isAuthorized) {
      if (path.startsWith("/api/admin")) {
        return new NextResponse(
          JSON.stringify({ success: false, error: "Unauthorized access" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      } else {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  const response = NextResponse.next();

  // 3. Security Headers Enforcer
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/auth/login", "/api/bookings"],
};
