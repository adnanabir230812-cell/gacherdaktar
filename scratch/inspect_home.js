const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const fileContent = fs.readFileSync(pageFilePath, 'utf8');

// Find occurrences of weather API or variables related to weather
const apiOccurrences = fileContent.match(/\/api\/weather/g);
console.log("Occurrences of '/api/weather' in page.tsx:", apiOccurrences ? apiOccurrences.length : 0);

// Find active states or variables related to weather
const weatherState = fileContent.match(/const \[weather,[\s\S]+?\]\s*=\s*useState/g);
console.log("Weather state variable definitions:", weatherState);

// Let's print sections containing weather fetch logic
const lines = fileContent.split('\n');
let fetchStart = -1;
let fetchEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fetchWeather') || lines[i].includes('/api/weather')) {
    fetchStart = Math.max(0, i - 10);
    fetchEnd = Math.min(lines.length, i + 35);
    break;
  }
}

if (fetchStart !== -1) {
  console.log(`\n--- Fetch Weather Code Block (Lines ${fetchStart + 1} to ${fetchEnd}) ---`);
  console.log(lines.slice(fetchStart, fetchEnd).join('\n'));
} else {
  console.log("Could not locate weather fetching function by simple keyword match.");
}
