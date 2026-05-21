const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'data.ts');
const fileContent = fs.readFileSync(dataFilePath, 'utf8');

// Strip TypeScript annotations
let jsContent = fileContent;
jsContent = jsContent.replace(/: District\[]/g, '');
jsContent = jsContent.replace(/: Crop\[]/g, '');
jsContent = jsContent.replace(/: FertilizerRule\[]/g, '');
jsContent = jsContent.replace(/: Disease\[]/g, '');
jsContent = jsContent.replace(/export interface [\s\S]+?\n}/g, '');

const tempFile = path.join(__dirname, 'temp_seasons.js');
fs.writeFileSync(tempFile, jsContent);
const { CROPS } = require(tempFile);
fs.unlinkSync(tempFile);

const uniqueSeasons = new Set();
CROPS.forEach(c => {
  c.seasons.forEach(s => uniqueSeasons.add(s));
});

console.log("All unique seasons in database:", Array.from(uniqueSeasons));

const englishPattern = /[a-zA-Z]/;
const englishSeasons = Array.from(uniqueSeasons).filter(s => englishPattern.test(s));
if (englishSeasons.length > 0) {
  console.log("WARNING: Found English seasons:", englishSeasons);
} else {
  console.log("SUCCESS: No English seasons found in the crop dataset!");
}
