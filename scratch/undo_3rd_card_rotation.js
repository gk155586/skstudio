const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");
const srcImg = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
const destImg = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

async function undoRotation() {
  if (!fs.existsSync(srcImg)) return;

  const buf = fs.readFileSync(srcImg);
  // Restore clean 270deg CW (90deg CCW) rotation so it's a true upright 1200x857 landscape
  const rot270 = await sharp(buf).rotate(270).toBuffer();
  fs.writeFileSync(destImg, rot270);
  console.log("Successfully restored clean upright landscape image!");
}

undoRotation();
