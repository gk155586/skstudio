const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "data", "content.json");
const data = fs.readFileSync(file, "utf8");

try {
  JSON.parse(data);
  console.log("JSON is 100% VALID!");
} catch (e) {
  console.error("JSON Syntax Error:", e.message);
}
