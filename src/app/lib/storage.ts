import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public", "images");

// Ensure folders exist locally
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

async function prepareOptimizedBuffer(file: File): Promise<Buffer> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const type = file.type?.toLowerCase() || "";
  const ext = path.extname(file.name).toLowerCase();

  const isImage = type.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic)$/i.test(ext);
  if (!isImage) {
    return inputBuffer;
  }

  try {
    const pipeline = sharp(inputBuffer).resize(1920, 1920, {
      fit: "inside",
      withoutEnlargement: true
    });

    if (ext === ".png" || type.includes("png")) {
      return await pipeline.png({ quality: 80, compressionLevel: 8 }).toBuffer();
    } else {
      return await pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
    }
  } catch (err) {
    console.error("[Image Compression] Optimization failed, using raw buffer:", err);
    return inputBuffer;
  }
}

export async function uploadFile(file: File): Promise<{ url: string; path: string }> {
  const optimizedBuffer = await prepareOptimizedBuffer(file);

  try {
    // 1. If Vercel Blob cloud storage token is configured, upload to Vercel Blob CDN
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`[Cloud Storage] Uploading compressed "${file.name}" directly to Vercel Blob...`);
      const blob = await put(file.name, optimizedBuffer, {
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
  console.log(`[Disk Storage] Saving compressed "${file.name}" to local uploads/ & public/images/ folders...`);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const diskFilename = `${Date.now()}-${safeName}`;
  const diskPath = path.join(UPLOADS_DIR, diskFilename);

  fs.writeFileSync(diskPath, optimizedBuffer);

  // Sync to public/images for direct static serving
  try {
    const publicExactPath = path.join(PUBLIC_IMAGES_DIR, diskFilename);
    const publicBasePath = path.join(PUBLIC_IMAGES_DIR, safeName);
    fs.writeFileSync(publicExactPath, optimizedBuffer);
    fs.writeFileSync(publicBasePath, optimizedBuffer);
  } catch (syncErr) {
    console.error("Failed to copy image to public/images:", syncErr);
  }

  return {
    url: `/api/admin/gallery/file?name=${encodeURIComponent(diskFilename)}`,
    path: diskFilename
  };
}
