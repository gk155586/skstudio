const fs = require("fs");
const path = require("path");

function getCategoryCovers() {
  const galleryDir = path.join(process.cwd(), "public", "img", "gallery");
  const imagesDir = path.join(process.cwd(), "public", "images");

  const categories = [
    "pre-wedding",
    "haldi",
    "wedding",
    "maternity-indoor",
    "maternity-outdoor",
    "baby-indoor",
    "baby-outdoor",
    "newborn",
    "Themes",
    "photo-frames"
  ];

  const results = {};

  for (const cat of categories) {
    let cover = "";
    // Check gallery folders
    const catDir = path.join(galleryDir, cat);
    if (fs.existsSync(catDir)) {
      const files = [];
      const scan = (d) => {
        const list = fs.readdirSync(d, { withFileTypes: true });
        for (const item of list) {
          const full = path.join(d, item.name);
          if (item.isDirectory()) scan(full);
          else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
            const rel = path.relative(path.join(process.cwd(), "public"), full);
            files.push("/" + rel.split(path.sep).join("/"));
          }
        }
      };
      scan(catDir);
      if (files.length > 0) {
        cover = files[0];
      }
    }
    results[cat] = cover;
  }

  console.log(JSON.stringify(results, null, 2));
}

getCategoryCovers();
