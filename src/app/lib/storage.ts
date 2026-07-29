import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public", "images");

// Ensure folders exist locally
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

export async function uploadFile(file: File): Promise<{ url: string; path: string }> {
  try {
    // 1. If Vercel Blob cloud storage token is configured, upload to Vercel Blob CDN
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`[Cloud Storage] Uploading "${file.name}" directly to Vercel Blob...`);
      const blob = await put(file.name, file, {
        access: "public"
      });
      return {
        url: blob.url,
        path: blob.url // In cloud mode, the direct URL acts as the path identifier
      };
    }
  } catch (err) {
    console.error("[Cloud Storage] Vercel Blob upload failed, falling back to disk...", err);
  }

  // 2. Default fallback to local disk storage (Perfect for local development/localhost)
  console.log(`[Disk Storage] Saving "${file.name}" to local uploads/ & public/images/ folders...`);
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const diskFilename = `${Date.now()}-${safeName}`;
  const diskPath = path.join(UPLOADS_DIR, diskFilename);

  fs.writeFileSync(diskPath, buffer);

  // Sync to public/images for direct static serving
  try {
    const publicExactPath = path.join(PUBLIC_IMAGES_DIR, diskFilename);
    const publicBasePath = path.join(PUBLIC_IMAGES_DIR, safeName);
    fs.writeFileSync(publicExactPath, buffer);
    fs.writeFileSync(publicBasePath, buffer);
  } catch (syncErr) {
    console.error("Failed to copy image to public/images:", syncErr);
  }

  return {
    url: `/api/admin/gallery/file?name=${encodeURIComponent(diskFilename)}`,
    path: diskFilename
  };
}
