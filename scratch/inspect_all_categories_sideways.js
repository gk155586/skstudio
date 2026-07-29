const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const galleryDir = path.join(process.cwd(), "public", "img", "gallery");

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function auditAllCategories() {
  const files = getAllFiles(galleryDir);
  console.log(`Auditing ${files.length} total gallery images...`);

  const categoryStats = {};

  for (const f of files) {
    const inputBuf = fs.readFileSync(f);
    const meta = await sharp(inputBuf).metadata();
    const rel = path.relative(galleryDir, f);
    const categoryFolder = rel.split(path.sep)[0];

    if (!categoryStats[categoryFolder]) {
      categoryStats[categoryFolder] = { total: 0, landscape: [], portrait: [] };
    }

    categoryStats[categoryFolder].total++;
    if (meta.width > meta.height) {
      categoryStats[categoryFolder].landscape.push({ file: rel, width: meta.width, height: meta.height });
    } else {
      categoryStats[categoryFolder].portrait.push({ file: rel, width: meta.width, height: meta.height });
    }
  }

  console.log("\n--- Category Breakdown ---");
  for (const [cat, stat] of Object.entries(categoryStats)) {
    console.log(`Category [${cat}]: Total=${stat.total}, Landscape(W>H)=${stat.landscape.length}, Portrait(H>=W)=${stat.portrait.length}`);
  }

  fs.writeFileSync(
    path.join(process.cwd(), "scratch", "category_audit.json"),
    JSON.stringify(categoryStats, null, 2)
  );
}

auditAllCategories();
