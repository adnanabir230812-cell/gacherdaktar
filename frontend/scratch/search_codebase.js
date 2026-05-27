const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(rootDir);
const targets = ['boro', 'rabi', 'aman', 'kharif', 'aus', 'winter', 'year-round'];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  targets.forEach(target => {
    if (content.includes(`"${target}"`) || content.includes(`'${target}'`)) {
      console.log(`Found "${target}" in ${path.relative(rootDir, file)}`);
    }
  });
});
