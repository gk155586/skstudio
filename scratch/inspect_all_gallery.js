const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const galleryDir = path.join(process.cwd(), "public", "img", "gallery");

function getAllFiles(dirPath, arrayOfFiles = []) {
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

async function inspectAll() {
  const files = getAllFiles(galleryDir);
  console.log(`Found ${files.length} images in gallery.`);

  const list = [];
  for (const f of files) {
    try {
      const meta = await sharp(f).metadata();
      const rel = path.relative(process.cwd(), f);
      list.push({
        rel,
        width: meta.width,
        height: meta.height,
        orientation: meta.orientation,
        aspect: (meta.width / meta.height).toFixed(2)
      });
    } catch (e) {
      console.error("Error reading", f, e.message);
    }
  }

  fs.writeFileSync(
    path.join(process.cwd(), "scratch", "gallery_meta.json"),
    JSON.stringify(list, null, 2)
  );
  console.log("Wrote gallery_meta.json with", list.length, "items.");
}

inspectAll();
