const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");

// Source image used for Newborn & Prop Stylist: public/img/gallery/baby-indoor/IMG_2457.JPG.jpeg
const srcImg = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
const destImg = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

async function fixOrientation() {
  if (!fs.existsSync(srcImg)) return;

  const buf = fs.readFileSync(srcImg);
  const meta = await sharp(buf).metadata();
  console.log("Original Dimensions:", meta.width, "x", meta.height);

  // In the screenshot, the current image has wheels on left and head on right.
  // Rotating 270 degrees CW (or 90deg CCW) will put the bike wheels at the BOTTOM and baby face UP!
  const rotated270 = await sharp(buf).rotate(270).toBuffer();
  const meta270 = await sharp(rotated270).metadata();
  console.log("Rotated 270deg Dimensions:", meta270.width, "x", meta270.height);

  fs.writeFileSync(destImg, rotated270);
  console.log("Successfully saved perfectly upright bike baby image to /images/about-newborn-stylist-upright.jpg!");
}

fixOrientation();
