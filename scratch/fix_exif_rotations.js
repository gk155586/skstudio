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

async function fixExif() {
  const files = getAllFiles(galleryDir);
  console.log(`Checking ${files.length} images for EXIF auto-rotation...`);

  let count = 0;
  for (const f of files) {
    try {
      const inputBuffer = fs.readFileSync(f);
      const meta = await sharp(inputBuffer).metadata();
      if (meta.orientation && meta.orientation !== 1) {
        console.log(`Auto-rotating EXIF orientation ${meta.orientation}:`, path.relative(process.cwd(), f));
        const outputBuffer = await sharp(inputBuffer).rotate().toBuffer();
        fs.writeFileSync(f, outputBuffer);
        count++;
      }
    } catch (e) {
      console.error("Error processing", f, e.message);
    }
  }

  console.log(`Successfully auto-rotated ${count} EXIF-tagged images.`);
}

fixExif();
