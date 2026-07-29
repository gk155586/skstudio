const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");

// Select the 8192x5464 8K master image: SK_00521.jpg.jpeg or SK_00604 copy.jpg.jpeg
const masterPath = path.join(publicDir, "images", "SK_00521.jpg.jpeg");
const destHero = path.join(publicDir, "images", "hero-desktop.jpg");
const destSlid = path.join(publicDir, "img", "slid", "3.jpg");

async function prepareUltraHdHero() {
  if (!fs.existsSync(masterPath)) {
    console.error("Master image not found at:", masterPath);
    return;
  }

  const inputBuf = fs.readFileSync(masterPath);
  const meta = await sharp(inputBuf).metadata();
  console.log(`Master Image Dimensions: ${meta.width} x ${meta.height}`);

  // Convert 8K master to a crystal clear 2560x1707 ultra-HD desktop hero image with 98% top quality
  const outputBuf = await sharp(inputBuf)
    .resize(2560, 1707, { fit: "cover", position: "center" })
    .jpeg({ quality: 98, progressive: true })
    .toBuffer();

  const outputMeta = await sharp(outputBuf).metadata();
  console.log(`Generated HD Hero Dimensions: ${outputMeta.width} x ${outputMeta.height}`);

  fs.writeFileSync(destHero, outputBuf);
  fs.writeFileSync(destSlid, outputBuf);
  console.log("Successfully created 2560x1707 Ultra-HD Hero image!");
}

prepareUltraHdHero();
