const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");

async function checkAboutImages() {
  const img1 = path.join(publicDir, "img", "gallery", "baby-outdoor", "1", "SKO03266.JPG");
  const img2 = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
  const img3 = path.join(publicDir, "img", "gallery", "newborn", "newborn-cover.jpeg");

  if (fs.existsSync(img1)) {
    const meta1 = await sharp(img1).metadata();
    console.log(`SKO03266.JPG: ${meta1.width}x${meta1.height}, Orientation: ${meta1.orientation}`);
  }
  if (fs.existsSync(img2)) {
    const meta2 = await sharp(img2).metadata();
    console.log(`IMG_2457.JPG.jpeg: ${meta2.width}x${meta2.height}, Orientation: ${meta2.orientation}`);
  }
  if (fs.existsSync(img3)) {
    const meta3 = await sharp(img3).metadata();
    console.log(`newborn-cover.jpeg: ${meta3.width}x${meta3.height}, Orientation: ${meta3.orientation}`);
  }
}

checkAboutImages();
