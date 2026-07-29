const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");
const srcImg = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
const destImg = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

async function rotate135() {
  if (!fs.existsSync(srcImg)) return;

  const buf = fs.readFileSync(srcImg);
  const meta = await sharp(buf).metadata();
  console.log("Original dimensions:", meta.width, "x", meta.height);

  // Rotate 135 degrees CW (90deg + 45deg)
  const rot135 = await sharp(buf)
    .rotate(135, { background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .toBuffer();
    
  const meta135 = await sharp(rot135).metadata();
  console.log("Rotated 135deg dimensions:", meta135.width, "x", meta135.height);

  fs.writeFileSync(destImg, rot135);
  console.log("Successfully saved 135deg CW rotated image to /images/about-newborn-stylist-upright.jpg!");
}

rotate135();
