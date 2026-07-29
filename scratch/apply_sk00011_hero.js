const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");
const srcImg = path.join(publicDir, "img", "gallery", "baby-outdoor", "8", "SK_00011.JPG");
const destHero = path.join(publicDir, "images", "hero-desktop.jpg");
const destSlid = path.join(publicDir, "img", "slid", "3.jpg");

if (fs.existsSync(srcImg)) {
  fs.copyFileSync(srcImg, destHero);
  fs.copyFileSync(srcImg, destSlid);
  console.log("Successfully copied SK_00011.JPG to hero-desktop.jpg and slid/3.jpg!");
} else {
  console.error("SK_00011.JPG not found");
}
