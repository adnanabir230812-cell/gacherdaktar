const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'data.ts');
const fileContent = fs.readFileSync(dataFilePath, 'utf8');

// A quick regex to find crop objects in the array
// We can parse the file content as JS by stripping the exports or evaluating/importing it.
// Let's parse it using a simple Node.js execution. We can compile data.ts to JS or use a ts-node like execution, or we can just extract the CROPS array content.
// Since data.ts has TypeScript types, evaluating it directly might throw.
// Let's strip the exports and types or use ts-node.
// Let's look at how we can extract the JSON-like array from CROPS.
const cropsMatch = fileContent.match(/export const CROPS: Crop\[] = (\[[\s\S]+?\]);/);
if (cropsMatch) {
  try {
    // Replace export or interface syntax if any, but it's a JSON array mostly.
    // Let's evaluate it using a safe sandbox or JSON.parse after replacing trailing commas.
    let arrayText = cropsMatch[1];
    // Remove TypeScript casting or other TS details if any
    // Let's write it to a temporary JS file and load it.
    const tempFile = path.join(__dirname, 'temp_crops.js');
    fs.writeFileSync(tempFile, 'module.exports = ' + arrayText);
    const crops = require(tempFile);
    fs.unlinkSync(tempFile);

    console.log(`Total crops found: ${crops.length}`);
    crops.forEach(c => {
      console.log(`${c.id}: ${c.name_bn} (${c.name_en}) [Category: ${c.category}]`);
      if (c.cultivation_method_bn && c.cultivation_method_bn.includes('সবজি চাষে নিয়মিত')) {
        console.log(`  -> Has boilerplate!`);
      }
    });
  } catch (e) {
    console.error('Error parsing crops:', e);
  }
} else {
  console.log('Could not match export const CROPS');
}
