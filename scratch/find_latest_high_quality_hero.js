const fs = require("fs");
const path = require("path");

const userUploadedDir = path.join("C:", "Users", "SK Studio", ".gemini", "antigravity", "brain", "79ca3c8b-0808-4d41-bf26-9dd8eaa15426", ".user_uploaded");

if (fs.existsSync(userUploadedDir)) {
  const files = fs.readdirSync(userUploadedDir);
  console.log("User uploaded files:");
  files.forEach(f => {
    const full = path.join(userUploadedDir, f);
    const stat = fs.statSync(full);
    console.log(`- ${f} (${stat.size} bytes, modified: ${stat.mtime.toISOString()})`);
  });
}
