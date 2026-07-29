import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signJWT, verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("sk_session_jwt");
    const sessionCookie = cookieStore.get("sk_session");

    let sessionData: any = null;

    if (jwtCookie?.value) {
      const payload = await verifyJWT(jwtCookie.value);
      if (payload && payload.userId) {
        sessionData = payload;
      }
    }

    if (!sessionData && sessionCookie?.value) {
      try {
        sessionData = JSON.parse(sessionCookie.value);
      } catch (err) {}
    }

    if (!sessionData || !sessionData.userId) {
      return NextResponse.json(
        { success: false, message: "No active session to refresh" },
        { status: 401 }
      );
    }

    const { userId, email, name, role } = sessionData;
    const cleanSessionObj = { userId, email, name, role: role || "user" };

    const token = await signJWT(cleanSessionObj, 30 * 24 * 60 * 60 * 1000);

    const response = NextResponse.json({
      success: true,
      message: "Session refreshed successfully",
      user: cleanSessionObj,
    });

    response.cookies.set("sk_session", JSON.stringify(cleanSessionObj), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    response.cookies.set("sk_session_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
