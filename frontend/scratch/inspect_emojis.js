const fs = require('fs');
const path = require('path');

function walk(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file, filter));
      }
    } else {
      if (filter(file)) results.push(file);
    }
  });
  return results;
}

// Regex for emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;

const files = walk(path.join(__dirname, '../src'), file => file.endsWith('.tsx') || file.endsWith('.ts'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      const relPath = path.relative(path.join(__dirname, '..'), file);
      console.log(`${relPath}:${idx + 1}: ${line.trim()}`);
    }
  });
});
