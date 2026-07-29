const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");
const srcImg = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
const destImg = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

async function rotate90() {
  if (!fs.existsSync(srcImg)) return;

  const buf = fs.readFileSync(srcImg);
  const meta = await sharp(buf).metadata();
  console.log("Original dimensions:", meta.width, "x", meta.height);

  // Rotate 90 degrees CW
  const rot90 = await sharp(buf).rotate(90).toBuffer();
  const meta90 = await sharp(rot90).metadata();
  console.log("Rotated 90deg dimensions:", meta90.width, "x", meta90.height);

  fs.writeFileSync(destImg, rot90);
  console.log("Successfully saved 90deg CW rotated image to /images/about-newborn-stylist-upright.jpg!");
}

rotate90();
