const fs = require("fs");
const path = require("path");

function getFirstImage(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
      const rel = path.relative(path.join(process.cwd(), "public"), path.join(dir, f));
      return "/" + rel.split(path.sep).join("/");
    }
  }
  return null;
}

const weddingSeg = path.join(process.cwd(), "public", "img", "wedding-seg");
if (fs.existsSync(weddingSeg)) {
  const dirs = fs.readdirSync(weddingSeg);
  console.log("Wedding Segments:");
  for (const d of dirs) {
    const p = path.join(weddingSeg, d);
    if (fs.statSync(p).isDirectory()) {
      console.log(`- ${d}: ${getFirstImage(p)}`);
    }
  }
}

const events = path.join(process.cwd(), "public", "img", "event");
if (fs.existsSync(events)) {
  const dirs = fs.readdirSync(events);
  console.log("\nEvents:");
  for (const d of dirs) {
    const p = path.join(events, d);
    if (fs.statSync(p).isDirectory()) {
      console.log(`- ${d}: ${getFirstImage(p)}`);
    }
  }
}
