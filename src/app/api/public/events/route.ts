import { NextResponse } from "next/server";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clientId = "public-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    let pingInterval: NodeJS.Timeout;

    const responseStream = new ReadableStream({
      start(controller) {
        sseHub.addClient(clientId, controller);
        
        // Initial connection handshake
        try {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: "connected", clientId })}\n\n`)
          );
        } catch {
          // Ignore if controller enqueue fails on start
        }

        // Keep-alive ping interval every 15 seconds to prevent server timeouts
        pingInterval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(`:ping\n\n`));
          } catch {
            clearInterval(pingInterval);
            sseHub.removeClient(clientId);
          }
        }, 15000);
      },
      cancel() {
        if (pingInterval) clearInterval(pingInterval);
        sseHub.removeClient(clientId);
      }
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  } catch (error: unknown) {
    return new Response(`data: ${JSON.stringify({ type: "error" })}\n\n`, {
      headers: { "Content-Type": "text/event-stream" }
    });
  }
}
