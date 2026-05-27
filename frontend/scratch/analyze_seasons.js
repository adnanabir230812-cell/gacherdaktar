const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/app/api/data.ts');
const fileContent = fs.readFileSync(dataPath, 'utf8');

// Find all "seasons": [ ... ]
const seasonRegex = /"seasons"\s*:\s*\[([^\]]+)\]/g;
let match;
const seasons = new Set();
while ((match = seasonRegex.exec(fileContent)) !== null) {
  const items = match[1].split(',').map(s => s.trim().replace(/"/g, ''));
  items.forEach(item => seasons.add(item));
}

// Find all "season": "..."
const fertSeasonRegex = /"season"\s*:\s*"([^"]+)"/g;
const fertSeasons = new Set();
while ((match = fertSeasonRegex.exec(fileContent)) !== null) {
  fertSeasons.add(match[1]);
}

// Count crops
const cropRegex = /"id"\s*:\s*"([^"]+)"/g;
let cropCount = 0;
while ((match = cropRegex.exec(fileContent)) !== null) {
  cropCount++;
}

console.log('Crops count:', cropCount);
console.log('Unique seasons in CROPS.seasons:', Array.from(seasons));
console.log('Unique seasons in CROPS.fertilizers.season:', Array.from(fertSeasons));
