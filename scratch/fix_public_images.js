const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const imgDir = path.join(process.cwd(), "public", "images");

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

async function fixPublicImages() {
  const files = getAllFiles(imgDir);
  console.log(`Auditing ${files.length} images in public/images...`);

  let count = 0;
  for (const f of files) {
    try {
      const inputBuf = fs.readFileSync(f);
      const meta = await sharp(inputBuf).metadata();

      if (meta.orientation && meta.orientation !== 1) {
        console.log(`[EXIF Rotate] ${path.relative(imgDir, f)}`);
        const outputBuf = await sharp(inputBuf).rotate().toBuffer();
        fs.writeFileSync(f, outputBuf);
        count++;
      }
    } catch (e) {
      console.error("Error processing file:", f, e.message);
    }
  }

  console.log(`Done! Rotated ${count} images in public/images.`);
}

fixPublicImages();
