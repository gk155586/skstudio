const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");

const pathsToCheck = [
  "/img/gallery/pre-wedding/pre-wedding-cover.jpg",
  "/img/gallery/haldi/haldi-cover.jpg",
  "/img/gallery/wedding/wedding-cover.jpg",
  "/img/gallery/maternity-indoor/maternity-indoor-cover.jpeg",
  "/img/gallery/maternity-outdoor/1/SKO00321.JPG",
  "/img/gallery/baby-indoor/IMG_2457.JPG.jpeg",
  "/img/gallery/baby-outdoor/1/SKO03266.JPG",
  "/img/gallery/newborn/newborn-cover.jpeg",
  "/img/gallery/Themes/SK_00064.JPG",
  "/images/frames-preview.jpg"
];

console.log("Checking image paths on disk:");
for (const rel of pathsToCheck) {
  const fullPath = path.join(publicDir, rel.slice(1));
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? "EXISTS ✅" : "MISSING ❌"} : ${rel}`);
}
