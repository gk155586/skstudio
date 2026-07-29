const fs = require("fs");
const path = require("path");

const uploadedPath = path.join("C:", "Users", "SK Studio", ".gemini", "antigravity", "brain", "79ca3c8b-0808-4d41-bf26-9dd8eaa15426", ".user_uploaded", "media__1784873316751.jpg");
const destHeroPath = path.join(process.cwd(), "public", "images", "hero-desktop.jpg");
const destSlidPath = path.join(process.cwd(), "public", "img", "slid", "3.jpg");

if (fs.existsSync(uploadedPath)) {
  // Direct file copy ensures 100% loss-free original picture quality without any compression or downscaling
  fs.copyFileSync(uploadedPath, destHeroPath);
  fs.copyFileSync(uploadedPath, destSlidPath);
  console.log("Successfully copied high-quality image losslessly to:");
  console.log(" -", destHeroPath);
  console.log(" -", destSlidPath);
} else {
  console.error("File not found at:", uploadedPath);
}
