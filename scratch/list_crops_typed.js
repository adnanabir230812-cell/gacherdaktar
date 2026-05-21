const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/app/api/data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

// Strip TypeScript types so it can be evaluated as JS
content = content.replace(/export interface [^{]+{[^}]+}/g, ''); // strip interfaces
content = content.replace(/:\s*District\[\]/g, '');
content = content.replace(/:\s*Crop\[\]/g, '');
content = content.replace(/export const/g, 'const');
content = content.replace(/export /g, '');

// Append module.exports at the end
content += '\nmodule.exports = { DISTRICTS, CROPS };';

// Write a temp file and require it
const tempPath = path.join(__dirname, 'temp_data.js');
fs.writeFileSync(tempPath, content);

const { CROPS } = require(tempPath);
console.log('Total Crops:', CROPS.length);
CROPS.forEach((c, idx) => {
  console.log(`${idx + 1}. BN: ${c.name_bn} | EN: ${c.name_en} | Seasons: ${c.seasons.join(', ')}`);
});

fs.unlinkSync(tempPath);
