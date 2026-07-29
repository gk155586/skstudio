const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const galleryDir = path.join(process.cwd(), "public", "img", "gallery");

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function fixAllSideways() {
  const files = getAllFiles(galleryDir);
  console.log(`Processing ${files.length} total gallery images...`);

  let countRotated = 0;

  for (const f of files) {
    try {
      const inputBuf = fs.readFileSync(f);
      const meta = await sharp(inputBuf).metadata();

      // Step 1: If EXIF orientation is present (3, 6, 8), auto-rotate
      if (meta.orientation && meta.orientation !== 1) {
        console.log(`[EXIF Rotate] ${path.relative(galleryDir, f)} (Orientation ${meta.orientation})`);
        const outputBuf = await sharp(inputBuf).rotate().toBuffer();
        fs.writeFileSync(f, outputBuf);
        countRotated++;
        continue;
      }

      // Step 2: If image is saved sideways (width > height) without EXIF orientation
      if (meta.width > meta.height) {
        console.log(`[Sideways Rotate] ${path.relative(galleryDir, f)} (${meta.width}x${meta.height} -> ${meta.height}x${meta.width})`);
        // Rotate 270 degrees (90deg CW) to make portrait upright
        const outputBuf = await sharp(inputBuf).rotate(270).toBuffer();
        fs.writeFileSync(f, outputBuf);
        countRotated++;
      }
    } catch (e) {
      console.error("Error processing file:", f, e.message);
    }
  }

  console.log(`\n🎉 SUCCESS: Rotated ${countRotated} images into perfect upright portrait orientation!`);
}

fixAllSideways();
