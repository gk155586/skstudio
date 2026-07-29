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
      const payload: any = await verifyJWT(jwtCookie.value);
      if (payload) {
        const emailLower = (payload.email || "").toLowerCase();
        if (emailLower === "ganeshkalapadgk@gmail.com" || emailLower === "admin") {
          payload.role = "admin";
        }
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
          const emailLower = (session.email || "").toLowerCase();
          if (emailLower === "ganeshkalapadgk@gmail.com" || emailLower === "admin") {
            session.role = "admin";
          }
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
