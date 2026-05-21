const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/app/api/data.ts');
const fileContent = fs.readFileSync(dataPath, 'utf8');

const regex = /"name_bn"\s*:\s*"([^"]+)"/g;
let match;
const names = [];
while ((match = regex.exec(fileContent)) !== null) {
  names.push(match[1]);
}

console.log('All crops found in data.ts:', names);
