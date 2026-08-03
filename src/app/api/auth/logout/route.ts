import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sk_session");

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session && session.userId) {
          const users = atomicDb.readJson("users.json", []);
          const targetIndex = users.findIndex((u: any) => u.id === session.userId || u.email === session.email);
          
          if (targetIndex !== -1) {
            users[targetIndex].isOnline = false;
            users[targetIndex].isLoggedIn = false;
            users[targetIndex].lastActiveAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
            await atomicDb.writeJson("users.json", users);

            // Broadcast real-time user logout event to Admin Console
            sseHub.broadcast("data_changed", { type: "user_logout", userId: session.userId });
          }
        }
      } catch (err) {}
    }
  } catch (err) {}

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
