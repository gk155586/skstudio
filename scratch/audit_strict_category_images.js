const fs = require("fs");
const path = require("path");

const galleryDir = path.join(process.cwd(), "public", "img", "gallery");

function getCategoryFirstImage(categoryFolder) {
  const catDir = path.join(galleryDir, categoryFolder);
  if (!fs.existsSync(catDir)) return null;

  const files = [];
  const scan = (dir) => {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scan(fullPath);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
        const rel = path.relative(path.join(process.cwd(), "public"), fullPath);
        files.push("/" + rel.split(path.sep).join("/"));
      }
    }
  };

  scan(catDir);
  return files.length > 0 ? files : null;
}

const folders = fs.readdirSync(galleryDir);
console.log("Found category folders in public/img/gallery:");
console.log(folders);

console.log("\n--- STRICT OWN CATEGORY IMAGES ---");
const map = {};
for (const folder of folders) {
  const images = getCategoryFirstImage(folder);
  map[folder] = images;
  console.log(`Folder [${folder}]: ${images ? images.length + " images. First: " + images[0] : "NO IMAGES"}`);
}
