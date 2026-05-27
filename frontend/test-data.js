const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, 'src', 'app', 'api', 'data.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const idRegex = /"id":\s*["']([^"']+)["']/g;
  const categoryRegex = /"category":\s*["']([^"']+)["']/g;
  const nameRegex = /"name_bn":\s*["']([^"']+)["']/g;

  const ids = [];
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }

  const categories = [];
  while ((match = categoryRegex.exec(content)) !== null) {
    categories.push(match[1]);
  }

  const names = [];
  while ((match = nameRegex.exec(content)) !== null) {
    names.push(match[1]);
  }

  console.log('Total Crops Found:', ids.length);
  console.log('Unique Categories:', [...new Set(categories)]);
  console.log('Sample crops:', names.slice(0, 10));
} catch (err) {
  console.error(err);
}
