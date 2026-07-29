const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const folder8 = path.join(process.cwd(), "public", "img", "gallery", "baby-outdoor", "8");

async function checkImage() {
  if (!fs.existsSync(folder8)) {
    console.error("Folder not found:", folder8);
    return;
  }

  const files = fs.readdirSync(folder8);
  const matched = files.filter(f => f.toLowerCase().includes("sk_00011"));
  console.log("Matched files in folder 8:", matched);

  for (const f of matched) {
    const fullPath = path.join(folder8, f);
    const buf = fs.readFileSync(fullPath);
    const meta = await sharp(buf).metadata();
    console.log(`File: ${f}, Dimensions: ${meta.width}x${meta.height}, Orientation: ${meta.orientation || "None"}`);
  }
}

checkImage();
