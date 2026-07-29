import { NextResponse } from "next/server";
import { atomicDb } from "@/app/lib/db";

export const dynamic = "force-dynamic";

// Self-sustaining keepalive ping timer (prevents Render container spin-down/sleep mode)
if (typeof globalThis !== "undefined") {
  const globalRef = globalThis as any;
  if (!globalRef.__renderKeepAliveStarted) {
    globalRef.__renderKeepAliveStarted = true;
    setInterval(() => {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skstudio.store";
        fetch(`${siteUrl}/api/public/content`).catch(() => {});
      } catch (e) {}
    }, 8 * 60 * 1000); // Self-ping every 8 minutes
  }
}

export async function GET() {
  try {
    const content = atomicDb.readJson("content.json", {});
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
