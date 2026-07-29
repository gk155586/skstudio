import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const cookieStore = await cookies();
  cookieStore.set("sk_session", "", { path: "/", maxAge: 0, expires: new Date(0) });
  cookieStore.set("sk_session_jwt", "", { path: "/", maxAge: 0, expires: new Date(0) });

  response.cookies.set("sk_session", "", { path: "/", maxAge: 0, expires: new Date(0) });
  response.cookies.set("sk_session_jwt", "", { path: "/", maxAge: 0, expires: new Date(0) });

  return response;
}
