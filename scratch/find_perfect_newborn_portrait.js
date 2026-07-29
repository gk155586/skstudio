const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");

async function checkOptions() {
  const options = [
    "img/gallery/newborn/newborn-cover.jpeg",
    "img/gallery/Themes/SK_00064.JPG",
    "images/SK_00582 copy.jpg.jpeg",
    "images/SK_00604 copy.jpg.jpeg",
    "img/gallery/baby-indoor/IMG_2457.JPG.jpeg"
  ];

  for (const rel of options) {
    const full = path.join(publicDir, rel);
    if (fs.existsSync(full)) {
      const buf = fs.readFileSync(full);
      const meta = await sharp(buf).metadata();
      console.log(`- ${rel}: ${meta.width}x${meta.height}, aspect: ${(meta.width/meta.height).toFixed(2)}`);
    }
  }
}

checkOptions();
