const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'src');
const terms = ['কৃষিসাথী', 'সহকারী', 'চ্যাটবট', 'এআই', '৩ডি', '3D', 'অফলাইন'];

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css'))) {
      callback(fullPath);
    }
  }
}

console.log('Searching for target terms...');
walk(rootDir, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    terms.forEach(term => {
      if (line.includes(term)) {
        console.log(`${path.relative(rootDir, filePath)}:${idx + 1} (${term}) -> ${line.trim()}`);
      }
    });
  });
});
