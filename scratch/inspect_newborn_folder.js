const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const newbornDir = path.join(process.cwd(), "public", "img", "gallery", "newborn");

async function checkNewbornImages() {
  if (!fs.existsSync(newbornDir)) {
    console.error("Newborn directory not found:", newbornDir);
    return;
  }

  function getFiles(dir, list = []) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        getFiles(full, list);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
        list.push(full);
      }
    }
    return list;
  }

  const allFiles = getFiles(newbornDir);
  console.log(`Found ${allFiles.length} files in newborn gallery:`);

  for (const f of allFiles) {
    const rel = path.relative(process.cwd(), f).split(path.sep).join("/");
    const buf = fs.readFileSync(f);
    const meta = await sharp(buf).metadata();
    console.log(`- /${rel}: ${meta.width}x${meta.height}, aspect: ${(meta.width/meta.height).toFixed(2)}`);
  }
}

checkNewbornImages();
