const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const srcImg = path.join(process.cwd(), "public", "img", "gallery", "baby-outdoor", "8", "SK_00011.JPG");
const destHero = path.join(process.cwd(), "public", "images", "hero-desktop.jpg");
const destSlid = path.join(process.cwd(), "public", "img", "slid", "3.jpg");

async function fixHeroFaceUp() {
  if (!fs.existsSync(srcImg)) return;

  const buf = fs.readFileSync(srcImg);
  const meta = await sharp(buf).metadata();
  console.log("Source dimensions:", meta.width, "x", meta.height);

  // Rotate 90 degrees Clockwise (opposite of 270deg) so baby's face points UP!
  const rotated90 = await sharp(buf).rotate(90).toBuffer();
  const meta90 = await sharp(rotated90).metadata();
  console.log("Rotated 90deg dimensions:", meta90.width, "x", meta90.height);

  fs.writeFileSync(destHero, rotated90);
  fs.writeFileSync(destSlid, rotated90);
  console.log("Successfully saved 90deg CW rotated image (Face UP) to hero-desktop.jpg!");
}

fixHeroFaceUp();
