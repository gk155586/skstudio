import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Global keep-alive heartbeat interval to prevent hosting sleep mode & cold starts
let keepAliveTimer: NodeJS.Timeout | null = null;

function ensureKeepAlive() {
  if (!keepAliveTimer && typeof window === "undefined") {
    keepAliveTimer = setInterval(async () => {
      try {
        const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://skstudio.store";
        await fetch(`${domain}/api/health`, {
          headers: { "User-Agent": "SK-Studio-Self-KeepAlive/1.0" },
          cache: "no-store"
        });
      } catch (err) {
        // Silent catch for background heartbeat
      }
    }, 4 * 60 * 1000); // Self-ping every 4 minutes (before 15m idle timeout)
  }
}

export async function GET() {
  ensureKeepAlive();
  return NextResponse.json(
    {
      status: "ok",
      service: "SK Photo Studio Pune API",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      keepAlive: "active 24/7"
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
