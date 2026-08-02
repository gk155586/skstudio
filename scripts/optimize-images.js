const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIRS = [
  path.join(process.cwd(), 'public', 'images'),
  path.join(process.cwd(), 'public', 'img'),
  path.join(process.cwd(), 'uploads'),
];

const MIN_SIZE_TO_OPTIMIZE_BYTES = 300 * 1024; // 300 KB

function getAllImageFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getAllImageFiles(fullPath, arrayOfFiles);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        arrayOfFiles.push({ path: fullPath, size: stat.size });
      }
    } catch (e) {
      // Ignore broken symlinks or inaccessible files
    }
  }

  return arrayOfFiles;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const tempPath = `${filePath}.tmp.${Date.now()}`;

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Max dimensions 1920x1920 while maintaining aspect ratio
    let pipeline = image;
    if ((metadata.width && metadata.width > 1920) || (metadata.height && metadata.height > 1920)) {
      pipeline = pipeline.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (ext === '.png') {
      await pipeline
        .png({ quality: 80, compressionLevel: 8 })
        .toFile(tempPath);
    } else {
      // For jpg, jpeg, webp -> output web-optimized jpeg or webp
      await pipeline
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(tempPath);
    }

    const oldSize = fs.statSync(filePath).size;
    const newSize = fs.statSync(tempPath).size;

    // Only replace if new size is actually smaller
    if (newSize < oldSize) {
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      return { success: true, savedBytes: oldSize - newSize, oldSize, newSize };
    } else {
      fs.unlinkSync(tempPath);
      return { success: false, savedBytes: 0, oldSize, newSize: oldSize };
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
    console.error(`Error optimizing ${path.basename(filePath)}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('🔍 Gathering image files across public/images, public/img, and uploads...');
  let allFiles = [];
  for (const dir of TARGET_DIRS) {
    allFiles = getAllImageFiles(dir, allFiles);
  }

  const largeFiles = allFiles.filter(f => f.size >= MIN_SIZE_TO_OPTIMIZE_BYTES);
  console.log(`Found ${allFiles.length} total images. ${largeFiles.length} images are larger than 300KB.`);

  let totalSavedBytes = 0;
  let processedCount = 0;

  for (let i = 0; i < largeFiles.length; i++) {
    const item = largeFiles[i];
    const fileName = path.basename(item.path);
    const oldMb = (item.size / (1024 * 1024)).toFixed(2);

    process.stdout.write(`[${i + 1}/${largeFiles.length}] Optimizing ${fileName} (${oldMb} MB)... `);
    const result = await optimizeImage(item.path);

    if (result.success) {
      const newMb = (result.newSize / (1024 * 1024)).toFixed(2);
      const savedMb = (result.savedBytes / (1024 * 1024)).toFixed(2);
      totalSavedBytes += result.savedBytes;
      processedCount++;
      console.log(`✅ Reduced from ${oldMb} MB to ${newMb} MB (saved ${savedMb} MB)`);
    } else {
      console.log(`⏩ Skipped (no size reduction or error)`);
    }
  }

  const totalSavedMb = (totalSavedBytes / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 Optimization complete! Processed ${processedCount} images. Total disk space & bandwidth saved: ${totalSavedMb} MB!`);
}

main().catch(console.error);
