const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");

// Select a high resolution, perfectly upright, adorable newborn prop photo from SK Kids Pune
const srcImg = path.join(publicDir, "images", "1784105354580-Insta_Saver__sk_kids_pune_image_3703446461858243121_1440x960_73.jpg");
const destImg = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

if (fs.existsSync(srcImg)) {
  fs.copyFileSync(srcImg, destImg);
  console.log("Successfully set adorable newborn photoshoot image to /images/about-newborn-stylist-upright.jpg!");
} else {
  console.error("Source image not found at:", srcImg);
}
