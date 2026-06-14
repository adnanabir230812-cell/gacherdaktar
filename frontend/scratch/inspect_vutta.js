const fs = require('fs');
const content = fs.readFileSync('src/app/crops/rotation/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('ভুট্টা')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
    const match = line.match(/ভুট্টা/);
    if (match) {
      const chars = match[0].split('').map(c => c.charCodeAt(0).toString(16).padStart(4, '0'));
      console.log(`  Chars: ${chars.join(' ')}`);
    }
  }
});
