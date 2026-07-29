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

async function fixSideways() {
  const files = getFiles(matDir);
  console.log("Checking maternity-outdoor files for 1920x1280 landscape sideways orientation...");

  let count = 0;
  for (const f of files) {
    const inputBuf = fs.readFileSync(f);
    const meta = await sharp(inputBuf).metadata();
    if (meta.width > meta.height) {
      console.log(`Rotating sideways file ${meta.width}x${meta.height} -> portrait:`, path.relative(process.cwd(), f));
      // Rotate 270 degrees (90deg CW)
      const outputBuf = await sharp(inputBuf).rotate(270).toBuffer();
      fs.writeFileSync(f, outputBuf);
      count++;
    }
  }

  console.log(`Done! Rotated ${count} sideways images in maternity-outdoor.`);
}

fixSideways();
