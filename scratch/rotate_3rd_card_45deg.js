const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");
const srcImg = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
const destImg = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

async function rotate45() {
  if (!fs.existsSync(srcImg)) return;

  const buf = fs.readFileSync(srcImg);
  const meta = await sharp(buf).metadata();
  console.log("Original dimensions:", meta.width, "x", meta.height);

  // Rotate 45 degrees CW
  const rot45 = await sharp(buf)
    .rotate(45, { background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .toBuffer();
    
  const meta45 = await sharp(rot45).metadata();
  console.log("Rotated 45deg dimensions:", meta45.width, "x", meta45.height);

  fs.writeFileSync(destImg, rot45);
  console.log("Successfully saved 45deg CW rotated image to /images/about-newborn-stylist-upright.jpg!");
}

rotate45();
