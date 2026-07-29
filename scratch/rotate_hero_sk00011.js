const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const srcImg = path.join(process.cwd(), "public", "img", "gallery", "baby-outdoor", "8", "SK_00011.JPG");
const destHero = path.join(process.cwd(), "public", "images", "hero-desktop.jpg");
const destSlid = path.join(process.cwd(), "public", "img", "slid", "3.jpg");

async function rotateHero() {
  if (!fs.existsSync(srcImg)) {
    console.error("Image not found");
    return;
  }

  const buf = fs.readFileSync(srcImg);
  const meta = await sharp(buf).metadata();
  console.log("Original Dimensions:", meta.width, "x", meta.height);

  // Rotate 270 degrees (90deg CW) to make it upright 1200x800 landscape
  const rotated270 = await sharp(buf).rotate(270).toBuffer();
  const meta270 = await sharp(rotated270).metadata();
  console.log("Rotated 270deg Dimensions:", meta270.width, "x", meta270.height);

  fs.writeFileSync(destHero, rotated270);
  fs.writeFileSync(destSlid, rotated270);
  console.log("Successfully saved rotated hero image!");
}

rotateHero();
