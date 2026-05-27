const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/app/api/data.ts');
const fileContent = fs.readFileSync(dataPath, 'utf8');

const idx = fileContent.indexOf('KNOWLEDGE_SNIPPETS');
if (idx !== -1) {
  console.log(fileContent.substring(idx - 100, idx + 200));
} else {
  console.log('KNOWLEDGE_SNIPPETS not found');
}
