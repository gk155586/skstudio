import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("sk_session_jwt");
    const sessionCookie = cookieStore.get("sk_session");

    if (jwtCookie?.value) {
      const payload = await verifyJWT(jwtCookie.value);
      if (payload) {
        return NextResponse.json({
          success: true,
          user: payload,
        });
      }
    }

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session) {
          return NextResponse.json({
            success: true,
            user: session,
          });
        }
      } catch (e) {}
    }

    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid session" },
      { status: 401 }
    );
  }
}
