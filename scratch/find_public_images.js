const fs = require("fs");
const path = require("path");

const imgDir = path.join(process.cwd(), "public", "images");
const files = fs.readdirSync(imgDir);

console.log("Found", files.length, "images in public/images:");
console.log(files.slice(0, 30));
