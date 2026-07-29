import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const IMG_EXT = new Set([".jpg",".jpeg",".png",".webp",".gif",".avif",".svg"]);
const PUBLIC_IMAGES = path.join(process.cwd(), "public", "images");

function scanDir(dir: string, base: string = "/images"): string[] {
  const urls: string[] = [];
  if (!fs.existsSync(dir)) return urls;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const urlPath = `${base}/${entry.name}`;
    if (entry.isDirectory()) {
      urls.push(...scanDir(fullPath, urlPath));
    } else if (IMG_EXT.has(path.extname(entry.name).toLowerCase())) {
      urls.push(urlPath);
    }
  }
  return urls;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sk_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    let session: any;
    try { session = JSON.parse(sessionCookie.value); } catch {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const urls = scanDir(PUBLIC_IMAGES);
    return NextResponse.json({ success: true, images: urls, total: urls.length });
  } catch (err) {
    console.error("[Images API]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
