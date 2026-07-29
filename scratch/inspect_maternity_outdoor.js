const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const matDir = path.join(process.cwd(), "public", "img", "gallery", "maternity-outdoor");

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
      results.push(full);
    }
  }
  return results;
}

async function run() {
  const files = getFiles(matDir);
  console.log("Found files in maternity-outdoor:", files.length);
  for (const f of files) {
    const buf = fs.readFileSync(f);
    const meta = await sharp(buf).metadata();
    console.log(path.relative(process.cwd(), f), "=>", meta.width, "x", meta.height, "orientation:", meta.orientation);
  }
}

run();
