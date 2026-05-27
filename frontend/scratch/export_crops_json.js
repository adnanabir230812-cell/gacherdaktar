const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'data.ts');
const fileContent = fs.readFileSync(dataFilePath, 'utf8');

const cropsMatch = fileContent.match(/export const CROPS: Crop\[] = (\[[\s\S]+?\]);/);
if (cropsMatch) {
  try {
    let arrayText = cropsMatch[1];
    const tempFile = path.join(__dirname, 'temp_crops_export.js');
    fs.writeFileSync(tempFile, 'module.exports = ' + arrayText);
    const crops = require(tempFile);
    fs.unlinkSync(tempFile);

    const outPath = path.join(__dirname, 'crops_data.json');
    fs.writeFileSync(outPath, JSON.stringify(crops, null, 2), 'utf8');
    console.log(`Successfully exported ${crops.length} crops to ${outPath}`);
  } catch (e) {
    console.error('Failed to parse or export crops:', e);
  }
} else {
  console.error('Could not match export const CROPS in data.ts');
}
