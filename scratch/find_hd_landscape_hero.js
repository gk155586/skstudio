const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const publicDir = path.join(process.cwd(), "public");

function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      getAllImages(full, fileList);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(f.name)) {
      fileList.push(full);
    }
  }
  return fileList;
}

async function findHdLandscape() {
  const allFiles = getAllImages(publicDir);
  console.log(`Scanning ${allFiles.length} total images for HD landscape hero...`);

  const landscapes = [];

  for (const fullPath of allFiles) {
    try {
      const buf = fs.readFileSync(fullPath);
      const meta = await sharp(buf).metadata();
      if (meta.width && meta.height && meta.width >= meta.height && meta.width >= 1200) {
        const rel = path.relative(publicDir, fullPath).split(path.sep).join("/");
        landscapes.push({
          rel: "/" + rel,
          width: meta.width,
          height: meta.height,
          ratio: (meta.width / meta.height).toFixed(2),
          size: buf.length
        });
      }
    } catch (e) {}
  }

  landscapes.sort((a, b) => b.width - a.width || b.size - a.size);

  console.log(`Found ${landscapes.length} landscape candidates >= 1200px width:`);
  console.log(landscapes.slice(0, 15));
}

findHdLandscape();
