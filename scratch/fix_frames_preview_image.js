const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");
const srcImg = path.join(publicDir, "img", "gallery", "Themes", "SK_00064.JPG");
const destImg = path.join(publicDir, "images", "frames-preview.jpg");

if (fs.existsSync(srcImg)) {
  fs.copyFileSync(srcImg, destImg);
  console.log("Created /images/frames-preview.jpg from Themes image!");
} else {
  console.log("Source image not found");
}
