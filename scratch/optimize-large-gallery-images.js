const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const galleryDir = path.join(process.cwd(), 'public', 'img', 'gallery');

async function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      await processDir(fullPath);
    } else if (item.isFile() && /\.(jpg|jpeg|png)$/i.test(item.name)) {
      const stat = fs.statSync(fullPath);
      // If file size is larger than 1MB (1000000 bytes)
      if (stat.size > 1000000) {
        try {
          const tempPath = fullPath + '.tmp.jpg';
          await sharp(fullPath)
            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 84, progressive: true })
            .toFile(tempPath);

          const newStat = fs.statSync(tempPath);
          if (newStat.size < stat.size) {
            fs.unlinkSync(fullPath);
            fs.renameSync(tempPath, fullPath);
            console.log(`Optimized ${path.relative(galleryDir, fullPath)}: ${(stat.size/(1024*1024)).toFixed(2)}MB -> ${(newStat.size/1024).toFixed(0)}KB`);
          } else {
            fs.unlinkSync(tempPath);
          }
        } catch (err) {
          console.error(`Failed to optimize ${item.name}:`, err.message);
        }
      }
    }
  }
}

async function main() {
  console.log('Starting image compression on public/img/gallery...');
  await processDir(galleryDir);
  console.log('Image compression completed!');
}

main();
