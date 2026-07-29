import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function getDirSize(dirPath: string): number {
  let size = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stat.size;
      }
    }
  } catch (e) {
    console.error(`[Storage API] Error reading dir: ${dirPath}`, e);
  }
  return size;
}

export async function GET() {
  try {
    // 1. Verify Admin Session Cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sk_session");
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 2. Scan Storage folder size
    const usedBytes = getDirSize(UPLOADS_DIR);
    
    // Set a total simulated allocation of 50 GB
    const totalBytes = 50000 * 1024 * 1024 * 1024 * 1024;
    const remainingBytes = Math.max(0, totalBytes - usedBytes);
    const percentageUsed = parseFloat(((usedBytes / totalBytes) * 100).toFixed(4));

    return NextResponse.json({
      success: true,
      totalBytes,
      usedBytes,
      remainingBytes,
      percentageUsed
    });
  } catch (error) {
    console.error("Storage scan failed:", error);
    return NextResponse.json({ success: false, message: "Failed to scan files" }, { status: 500 });
  }
}
