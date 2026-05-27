const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'data.ts');
const fileContent = fs.readFileSync(dataFilePath, 'utf8');

const cropsMatch = fileContent.match(/export const CROPS: Crop\[] = (\[[\s\S]+?\]);/);
if (cropsMatch) {
  try {
    let arrayText = cropsMatch[1];
    const tempFile = path.join(__dirname, 'temp_crops_details.js');
    fs.writeFileSync(tempFile, 'module.exports = ' + arrayText);
    const crops = require(tempFile);
    fs.unlinkSync(tempFile);

    console.log("Checking some crops:");
    [24, 25, 30, 36, 46, 51, 52].forEach(id => {
      const c = crops.find(crop => crop.id === String(id));
      if (c) {
        console.log(`\nID: ${c.id} - ${c.name_bn}`);
        console.log(`Cultivation: ${c.cultivation_method_bn}`);
        console.log(`Spacing: ${c.spacing_info_bn}`);
        console.log(`Harvest: ${c.harvest_duration_bn}`);
      } else {
        console.log(`Crop ${id} not found.`);
      }
    });
  } catch (e) {
    console.error('Error parsing crops:', e);
  }
}
