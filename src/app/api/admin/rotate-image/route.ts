import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
      const rel = path.relative(path.join(process.cwd(), "public"), fullPath);
      arrayOfFiles.push("/" + rel.split(path.sep).join("/"));
    }
  });

  return arrayOfFiles;
}

// GET: Return all gallery images with metadata
export async function GET(req: Request) {
  try {
    const galleryDir = path.join(process.cwd(), "public", "img", "gallery");
    const filePaths = getAllFiles(galleryDir);

    const images = [];
    for (const relUrl of filePaths) {
      try {
        const fullPath = path.join(process.cwd(), "public", relUrl.slice(1));
        const buf = fs.readFileSync(fullPath);
        const meta = await sharp(buf).metadata();
        const parts = relUrl.split("/");
        const category = parts[3] || "other";

        images.push({
          url: relUrl,
          filename: path.basename(fullPath),
          category: category,
          width: meta.width || 0,
          height: meta.height || 0,
          aspectRatio: meta.width && meta.height ? (meta.width / meta.height).toFixed(2) : "1",
          isLandscape: (meta.width || 0) > (meta.height || 0)
        });
      } catch (err) {
        console.error("Error reading meta for " + relUrl, err);
      }
    }

    return NextResponse.json({ success: true, count: images.length, images });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Rotate a specific image file permanently
export async function POST(req: Request) {
  try {
    const { filePath, angle } = await req.json();
    if (!filePath || typeof angle !== "number") {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), "public", cleanPath);
    const publicDir = path.join(process.cwd(), "public");

    if (!fullPath.startsWith(publicDir) || !fs.existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: "File not found or security check failed" }, { status: 404 });
    }

    const inputBuf = fs.readFileSync(fullPath);
    const outputBuf = await sharp(inputBuf).rotate(angle).toBuffer();
    fs.writeFileSync(fullPath, outputBuf);

    // Read updated dimensions
    const meta = await sharp(outputBuf).metadata();

    return NextResponse.json({
      success: true,
      filePath,
      width: meta.width,
      height: meta.height,
      message: `Rotated by ${angle}° successfully`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
