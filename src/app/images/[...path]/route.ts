import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams?.path || [];
    if (pathSegments.length === 0) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const rawPath = pathSegments.map(s => safeDecode(s)).join("/");
    const safeFilename = path.basename(safeDecode(pathSegments[pathSegments.length - 1]));

    // Fast candidate locations array
    const candidates = [
      path.join(PUBLIC_DIR, "images", rawPath),
      path.join(PUBLIC_DIR, "images", safeFilename),
      path.join(UPLOADS_DIR, safeFilename),
      path.join(PUBLIC_DIR, "img", safeFilename),
      path.join(PUBLIC_DIR, "img", "blog", safeFilename),
      path.join(PUBLIC_DIR, "img", "slid", safeFilename),
      path.join(PUBLIC_DIR, "img", "clients", safeFilename),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        try {
          if (fs.statSync(candidate).isFile()) {
            return serveFile(candidate, safeFilename);
          }
        } catch {
          // Continue to next candidate
        }
      }
    }

    // Timestamp-prefixed match in UPLOADS_DIR
    if (fs.existsSync(UPLOADS_DIR)) {
      const uploadFiles = fs.readdirSync(UPLOADS_DIR);
      const lowerSafe = safeFilename.toLowerCase();
      const matchedUpload = uploadFiles.find(f =>
        f.toLowerCase().endsWith(`-${lowerSafe}`) ||
        f.toLowerCase() === lowerSafe
      );
      if (matchedUpload) {
        const fullUploadPath = path.join(UPLOADS_DIR, matchedUpload);
        if (fs.existsSync(fullUploadPath) && fs.statSync(fullUploadPath).isFile()) {
          return serveFile(fullUploadPath, safeFilename);
        }
      }
    }

    return new NextResponse("File Not Found", { status: 404 });
  } catch (err: any) {
    console.error("Error serving /images path:", err);
    return new NextResponse("File Not Found", { status: 404 });
  }
}

async function serveFile(filePath: string, filename: string) {
  try {
    let fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let mimeType = "application/octet-stream";
    const isImage = ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp";

    if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
    else if (ext === ".png") mimeType = "image/png";
    else if (ext === ".webp") mimeType = "image/webp";
    else if (ext === ".gif") mimeType = "image/gif";
    else if (ext === ".svg") mimeType = "image/svg+xml";
    else if (ext === ".mp4") mimeType = "video/mp4";

    // Dynamic on-the-fly compression fallback if image buffer > 1MB
    if (isImage && fileBuffer.length > 1024 * 1024) {
      try {
        fileBuffer = await sharp(fileBuffer)
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();
        mimeType = "image/jpeg";
      } catch (sharpErr) {
        console.error("On-the-fly image compression failed:", sharpErr);
      }
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${filename}"`
      }
    });
  } catch {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
