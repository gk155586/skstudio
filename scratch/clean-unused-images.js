const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'data');
const srcDir = path.join(rootDir, 'src');
const publicDir = path.join(rootDir, 'public');
const imagesDir = path.join(publicDir, 'images');

// 1. Gather all text content from data/*.json and src/**/*.{ts,tsx}
function getAllTextContent() {
  let text = '';
  
  function readAllInDir(dir, filter) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        readAllInDir(full, filter);
      } else if (e.isFile() && filter(e.name)) {
        text += ' ' + fs.readFileSync(full, 'utf8');
      }
    }
  }

  readAllInDir(dataDir, (name) => name.endsWith('.json'));
  readAllInDir(srcDir, (name) => name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.css'));
  return text;
}

const allText = getAllTextContent();

if (!fs.existsSync(imagesDir)) {
  console.log('No public/images dir found.');
  process.exit(0);
}

const files = fs.readdirSync(imagesDir);
console.log('Total files in public/images:', files.length);

let deletedCount = 0;
let freedBytes = 0;

for (const file of files) {
  const filePath = path.join(imagesDir, file);
  const stat = fs.statSync(filePath);

  // Check if file is a copy or duplicated file not referenced
  const isCopy = file.includes(' - Copy') || file.includes(' (1) - Copy') || file.includes(' (2)');
  const isReferenced = allText.includes(file);

  if (isCopy || !isReferenced) {
    // Delete file
    try {
      fs.unlinkSync(filePath);
      deletedCount++;
      freedBytes += stat.size;
    } catch (err) {
      console.error('Failed to delete:', file, err.message);
    }
  }
}

console.log(`Deleted ${deletedCount} unreferenced/duplicate files.`);
console.log(`Freed ${(freedBytes / (1024 * 1024)).toFixed(2)} MB of disk space.`);
