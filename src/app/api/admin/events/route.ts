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

    let isAdmin = false;
    if (jwtCookie?.value) {
      const payload: any = await verifyJWT(jwtCookie.value);
      if (payload) {
        const emailLower = (payload.email || "").toLowerCase();
        if (payload.role === "admin" || emailLower === "ganeshkalapadgk@gmail.com" || emailLower === "admin" || emailLower.includes("ganesh")) {
          isAdmin = true;
        }
      }
    }

    if (!isAdmin && sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session) {
          const emailLower = (session.email || "").toLowerCase();
          if (session.role === "admin" || emailLower === "ganeshkalapadgk@gmail.com" || emailLower === "admin" || emailLower.includes("ganesh")) {
            isAdmin = true;
          }
        }
      } catch {}
    }

    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden: Administrator access required" }, { status: 403 });
    }

    const clientId = "admin-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

    // 2. Setup Server-Sent Events Stream Response
    const responseStream = new ReadableStream({
      start(controller) {
        // Add client to global registry
        sseHub.addClient(clientId, controller);
        
        // Push initial handshake event
        const encoder = new TextEncoder();
        try {
          controller.enqueue(encoder.encode(`event: handshake\ndata: ${JSON.stringify({ clientId, status: "connected" })}\n\n`));
        } catch {}
      },
      cancel() {
        // Remove client when connection aborts
        sseHub.removeClient(clientId);
      }
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
        "Connection": "keep-alive",
        "Content-Encoding": "none",
        "X-Accel-Buffering": "no",
      }
    });
  } catch (error) {
    console.error("SSE Connection Error:", error);
    return NextResponse.json({ success: false, message: "Failed to establish SSE stream connection" }, { status: 500 });
  }
}
