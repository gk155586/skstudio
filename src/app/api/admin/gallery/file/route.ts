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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filename = searchParams.get("name");

    if (!filename) {
      return new NextResponse("Filename parameter missing", { status: 400 });
    }

    const decodedName = safeDecode(filename);
    const safeFilename = path.basename(decodedName);

    // Fast candidate locations array
    const candidates = [
      path.join(UPLOADS_DIR, safeFilename),
      path.join(PUBLIC_DIR, "images", safeFilename),
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
      const matched = uploadFiles.find(f =>
        f.toLowerCase().endsWith(`-${lowerSafe}`) ||
        f.toLowerCase() === lowerSafe
      );
      if (matched) {
        const fullUploadPath = path.join(UPLOADS_DIR, matched);
        if (fs.existsSync(fullUploadPath) && fs.statSync(fullUploadPath).isFile()) {
          return serveFile(fullUploadPath, safeFilename);
        }
      }
    }

    return new NextResponse("File Not Found", { status: 404 });

  } catch (error: any) {
    console.error("Gallery file serving error:", error);
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
    else if (ext === ".heic") mimeType = "image/heic";
    else if (ext === ".mp4") mimeType = "video/mp4";
    else if (ext === ".mov") mimeType = "video/quicktime";
    else if (ext === ".avi") mimeType = "video/x-msvideo";
    else if (ext === ".pdf") mimeType = "application/pdf";
    else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (ext === ".xlsx") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    else if (ext === ".txt") mimeType = "text/plain";

    // Dynamic on-the-fly compression fallback if image buffer > 1MB
    if (isImage && fileBuffer.length > 1024 * 1024) {
      try {
        fileBuffer = await sharp(fileBuffer)
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();
        mimeType = "image/jpeg";
      } catch (sharpErr) {
        console.error("On-the-fly gallery image compression failed:", sharpErr);
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
