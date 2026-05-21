const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/app/api/data.ts');
const fileContent = fs.readFileSync(dataPath, 'utf8');

// Print last 500 characters
console.log(fileContent.substring(fileContent.length - 500));
