import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sseHub } from "@/app/lib/sse";
import { verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Verify Admin Session Cookie (JWT or raw session)
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("sk_session_jwt");
    const sessionCookie = cookieStore.get("sk_session");

    let role = "";
    if (jwtCookie?.value) {
      const payload = await verifyJWT(jwtCookie.value);
      if (payload && payload.role) {
        role = payload.role;
      }
    }

    if (!role && sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        role = session.role || "";
      } catch {}
    }

    if (role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Administrator access required" }, { status: 403 });
    }

    const clientId = "client-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

    // 2. Setup Server-Sent Events Stream Response
    const responseStream = new ReadableStream({
      start(controller) {
        // Add client to global registry
        sseHub.addClient(clientId, controller);
        
        // Push initial handshake event
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: handshake\ndata: ${JSON.stringify({ clientId, status: "connected" })}\n\n`));
      },
      cancel() {
        // Remove client when connection aborts
        sseHub.removeClient(clientId);
      }
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Content-Encoding": "none",
      }
    });
  } catch (error) {
    console.error("SSE Connection Error:", error);
    return NextResponse.json({ success: false, message: "Failed to establish SSE stream connection" }, { status: 500 });
  }
}
