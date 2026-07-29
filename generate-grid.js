const fs = require('fs');
const path = require('path');
const dirs = ['public/img/gallery/baby-outdoor', 'public/img/gallery/baby-indoor'];
let html = '<html><body style="display:flex; flex-wrap:wrap; gap:10px; font-family:sans-serif;">';
dirs.forEach(dir => {
  if(fs.existsSync(dir)){
    fs.readdirSync(dir, {recursive: true}).forEach(f => {
      if(f.endsWith('.jpg') || f.endsWith('.JPG') || f.endsWith('.jpeg')) {
        const fullPath = path.join(dir, f);
        const webPath = fullPath.replace('public', '').replace(/\\/g, '/');
        html += '<div style="width:200px; text-align:center;"><img src="' + webPath + '" style="width:100%; height:auto; object-fit:contain;"/><p style="font-size:12px; overflow-wrap:anywhere;">' + webPath + '</p></div>';
      }
    });
  }
});
html += '</body></html>';
fs.writeFileSync('public/gallery-grid.html', html);
console.log('Done');
