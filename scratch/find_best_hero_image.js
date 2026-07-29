const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function findBestHero() {
  const publicDir = path.join(process.cwd(), "public");

  const candidates = [
    "img/gallery/baby-outdoor/1/SKO03266.JPG",
    "img/gallery/maternity-outdoor/1/SKO00321.JPG",
    "img/wedding-seg/divya-divyank/1.jpg",
    "img/wedding-seg/laveena-yash/1.jpg",
    "img/gallery/Eyara/SK_09102 copy.jpg",
    "img/gallery/family-photoshoot/SK_00587 copy.jpg",
    "images/sk_studio_pune_1728266877_3473276763711290682_63216979904.jpg",
    "images/sk_studio_pune_1728267502_3473282008428328340_63216979904.jpg"
  ];

  console.log("Analyzing hero candidates:");
  for (const rel of candidates) {
    const full = path.join(publicDir, rel);
    if (fs.existsSync(full)) {
      const buf = fs.readFileSync(full);
      const meta = await sharp(buf).metadata();
      console.log(`- [${rel}]: ${meta.width}x${meta.height}, aspect: ${(meta.width/meta.height).toFixed(2)}, format: ${meta.format}`);
    }
  }
}

findBestHero();
