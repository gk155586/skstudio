const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function check() {
  const file1 = path.join(process.cwd(), "public", "img", "gallery", "maternity-outdoor", "1", "SKO00321.JPG");
  const file2 = path.join(process.cwd(), "public", "img", "gallery", "maternity-outdoor", "2", "SKO00262.JPG");
  const file3 = path.join(process.cwd(), "public", "img", "gallery", "maternity-outdoor", "4", "SK_05074.JPG");
  const file4 = path.join(process.cwd(), "public", "img", "gallery", "maternity-outdoor", "3", "SKO00302.JPG");

  for (const f of [file1, file2, file3, file4]) {
    if (fs.existsSync(f)) {
      const meta = await sharp(f).metadata();
      console.log(path.basename(f), "=> width:", meta.width, "height:", meta.height, "orientation:", meta.orientation);
    } else {
      console.log("File missing:", f);
    }
  }
}

check();
