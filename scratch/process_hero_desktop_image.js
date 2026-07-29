const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploadedPath = path.join("C:", "Users", "SK Studio", ".gemini", "antigravity", "brain", "79ca3c8b-0808-4d41-bf26-9dd8eaa15426", ".user_uploaded", "media__1784873082140.jpg");
const destPath = path.join(process.cwd(), "public", "images", "hero-desktop.jpg");

async function processHeroImage() {
  if (!fs.existsSync(uploadedPath)) {
    console.error("Uploaded file not found at:", uploadedPath);
    return;
  }

  const inputBuf = fs.readFileSync(uploadedPath);
  const meta = await sharp(inputBuf).metadata();
  console.log("Original Dimensions:", meta.width, "x", meta.height);

  // Rotate 90 degrees clockwise so it is upright
  const outputBuf = await sharp(inputBuf).rotate(90).toBuffer();
  const newMeta = await sharp(outputBuf).metadata();
  console.log("Rotated Dimensions:", newMeta.width, "x", newMeta.height);

  fs.writeFileSync(destPath, outputBuf);
  console.log("Successfully saved rotated image to:", destPath);
}

processHeroImage();
