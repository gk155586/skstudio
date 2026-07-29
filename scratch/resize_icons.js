const sharp = require('sharp');
const path = require('path');

const inputPath = "C:\\Users\\SK Studio\\.gemini\\antigravity\\brain\\bc055b58-592c-404e-9364-15beb2c34fd5\\.user_uploaded\\media__1785325892446.png";
const projectDir = "D:\\A Personal\\College\\Projects\\kiro SK PHOTO STUDIO PUNE";

async function processIcons() {
  try {
    // 1. Trim surrounding blank space so the camera lens fills the entire square canvas
    const trimmedBuffer = await sharp(inputPath).trim().toBuffer();

    // 2. Generate 512x512, 180x180, and 48x48 icon files
    await sharp(trimmedBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectDir, "public", "icon.png"));

    await sharp(trimmedBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectDir, "public", "favicon.png"));

    await sharp(trimmedBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectDir, "public", "apple-touch-icon.png"));

    await sharp(trimmedBuffer)
      .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectDir, "public", "favicon.ico"));

    await sharp(trimmedBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectDir, "src", "app", "icon.png"));

    await sharp(trimmedBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectDir, "src", "app", "apple-icon.png"));

    await sharp(trimmedBuffer)
      .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(projectDir, "src", "app", "favicon.ico"));

    console.log("All camera lens icons trimmed and resized successfully!");
  } catch (err) {
    console.error("Error processing icons:", err);
  }
}

processIcons();
