const fs = require("fs");
const path = require("path");

function scanAll(dir, depth = 0) {
  if (depth > 4) return;
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      const rel = path.relative(process.cwd(), full);
      const count = fs.readdirSync(full).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).length;
      console.log(`Directory: [${rel}] -> Direct images: ${count}`);
      scanAll(full, depth + 1);
    }
  }
}

scanAll(path.join(process.cwd(), "public"));
