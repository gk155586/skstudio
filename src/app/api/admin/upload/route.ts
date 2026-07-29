import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";
import { uploadFile } from "@/app/lib/storage";

export const dynamic = "force-dynamic";

const GALLERIES_FILE = path.join(process.cwd(), "data", "galleries.json");

// Helper to load galleries
function loadGalleries() {
  if (fs.existsSync(GALLERIES_FILE)) {
    try {
      const content = fs.readFileSync(GALLERIES_FILE, "utf8");
      return JSON.parse(content || "{}");
    } catch (err) {
      console.error("Error reading galleries file:", err);
    }
  }
  return {};
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const galleryId = formData.get("galleryId")?.toString().trim();
    const clientEmail = formData.get("client")?.toString().trim().toLowerCase();
    const files = formData.getAll("files") as File[];

    if (!galleryId && !clientEmail) {
      return NextResponse.json({ success: false, message: "Gallery ID or client email is required" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
    }

    const galleries = loadGalleries();
    let targetGallery: any = null;

    // 1. If galleryId is specified, write directly to that gallery session
    if (galleryId && galleries[galleryId]) {
      targetGallery = galleries[galleryId];
    } 
    // 2. Fallback: find first gallery for client, or auto-create a default one
    else if (clientEmail) {
      targetGallery = Object.values(galleries).find((g: any) => g.clientEmail?.toLowerCase() === clientEmail);
      if (!targetGallery) {
        const newId = "gal-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
        const token = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
        targetGallery = {
          id: newId,
          name: "Default Session Gallery",
          clientEmail,
          token,
          files: [],
          createdAt: new Date().toISOString()
        };
        galleries[newId] = targetGallery;
      }
    }

    const savedFilesMetadata = [];

    for (const file of files) {
      // Direct call to storage driver (handles Cloud vs Local automatically)
      const storageResult = await uploadFile(file);

      const fileId = "file-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
      
      const metadata = {
        id: fileId,
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        path: storageResult.path,
        url: storageResult.url,
        uploadedAt: new Date().toISOString()
      };

      if (targetGallery) {
        targetGallery.files.push(metadata);
      }
      savedFilesMetadata.push(metadata);
    }

    if (targetGallery) {
      // Atomic synchronous database write
      await atomicDb.writeJson("galleries.json", galleries);
      // Broadcast change to active SSE dashboards
      sseHub.broadcast("data_changed", { type: "storage_updated" });
    }

    return NextResponse.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      galleryId: targetGallery?.id || null,
      token: targetGallery?.token || null,
      files: savedFilesMetadata
    });

  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
