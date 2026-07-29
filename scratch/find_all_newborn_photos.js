const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const publicDir = path.join(process.cwd(), "public");

function getFiles(dir, list = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      getFiles(full, list);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
      list.push(full);
    }
  }
  return list;
}

async function searchNewborn() {
  const files = getFiles(publicDir);
  const matched = files.filter(f => /newborn|baby|kids|prop/i.test(f));
  console.log(`Found ${matched.length} matched baby/newborn images in public folder.`);

  for (const f of matched.slice(0, 20)) {
    const rel = path.relative(publicDir, f).split(path.sep).join("/");
    try {
      const buf = fs.readFileSync(f);
      const meta = await sharp(buf).metadata();
      console.log(`- /${rel}: ${meta.width}x${meta.height}, aspect: ${(meta.width/meta.height).toFixed(2)}`);
    } catch(e) {}
  }
}

searchNewborn();
