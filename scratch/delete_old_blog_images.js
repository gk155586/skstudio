const fs = require("fs");
const path = require("path");

const blogDir = path.join(process.cwd(), "public", "img", "blog");

if (fs.existsSync(blogDir)) {
  const files = fs.readdirSync(blogDir);
  for (const f of files) {
    if (/^s[1-8]\.(jpg|jpeg|png|webp)$/i.test(f)) {
      const fullPath = path.join(blogDir, f);
      fs.unlinkSync(fullPath);
      console.log("Deleted old template image:", f);
    }
  }
}
