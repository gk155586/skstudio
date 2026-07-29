const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scratch", "gallery_meta.json"), "utf8"));

const withOrientation = data.filter(d => d.orientation !== undefined && d.orientation !== 1);
const landscape = data.filter(d => d.width > d.height);
const portrait = data.filter(d => d.height >= d.width);

console.log("Total images:", data.length);
console.log("Images with EXIF orientation (not 1):", withOrientation.length);
console.log("Landscape dimensions (width > height):", landscape.length);
console.log("Portrait dimensions (height >= width):", portrait.length);

console.log("\nSample images with EXIF orientation:");
console.log(withOrientation.slice(0, 10));

console.log("\nSample landscape images:");
console.log(landscape.slice(0, 15));
