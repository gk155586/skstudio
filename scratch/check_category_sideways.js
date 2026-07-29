const fs = require("fs");
const path = require("path");

const audit = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scratch", "category_audit.json"), "utf8"));

console.log("=== BABY-INDOOR LANDSCAPE FILES ===");
console.log(audit["baby-indoor"].landscape);

console.log("\n=== BABY-OUTDOOR LANDSCAPE FILES (first 30) ===");
console.log(audit["baby-outdoor"].landscape.slice(0, 30));

console.log("\n=== EYARA LANDSCAPE FILES ===");
console.log(audit["Eyara"].landscape);

console.log("\n=== THEMES LANDSCAPE FILES ===");
console.log(audit["Themes"].landscape);
