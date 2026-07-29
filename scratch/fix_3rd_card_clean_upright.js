const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");
const srcImg = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
const destImg = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

async function fixCleanUpright() {
  if (!fs.existsSync(srcImg)) return;

  const buf = fs.readFileSync(srcImg);
  
  // Rotate 270 degrees CW (exact 90deg counter-clockwise) to turn 857x1200 into clean 1200x857 upright landscape
  const rot270 = await sharp(buf).rotate(270).toBuffer();
  const meta270 = await sharp(rot270).metadata();
  console.log("Clean Upright Dimensions:", meta270.width, "x", meta270.height);

  fs.writeFileSync(destImg, rot270);
  console.log("Successfully saved clean upright landscape image to /images/about-newborn-stylist-upright.jpg!");
}

fixCleanUpright();
