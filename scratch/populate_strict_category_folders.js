const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");

const copies = [
  {
    src: path.join(publicDir, "img", "wedding-seg", "divya-divyank", "1.jpg"),
    destDir: path.join(publicDir, "img", "gallery", "wedding"),
    filename: "wedding-cover.jpg"
  },
  {
    src: path.join(publicDir, "img", "wedding-seg", "janhavi-akash", "1.jpg"),
    destDir: path.join(publicDir, "img", "gallery", "pre-wedding"),
    filename: "pre-wedding-cover.jpg"
  },
  {
    src: path.join(publicDir, "img", "wedding-seg", "sagar-jaya", "1.jpg"),
    destDir: path.join(publicDir, "img", "gallery", "haldi"),
    filename: "haldi-cover.jpg"
  },
  {
    src: path.join(publicDir, "img", "event", "Riya-Baby-Shower", "1.jpeg"),
    destDir: path.join(publicDir, "img", "gallery", "maternity-indoor"),
    filename: "maternity-indoor-cover.jpeg"
  },
  {
    src: path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg"),
    destDir: path.join(publicDir, "img", "gallery", "newborn"),
    filename: "newborn-cover.jpeg"
  }
];

for (const item of copies) {
  if (!fs.existsSync(item.destDir)) {
    fs.mkdirSync(item.destDir, { recursive: true });
  }
  const destFile = path.join(item.destDir, item.filename);
  if (fs.existsSync(item.src)) {
    fs.copyFileSync(item.src, destFile);
    console.log(`Copied ${item.src} -> ${destFile}`);
  } else {
    console.log(`Source not found: ${item.src}`);
  }
}
