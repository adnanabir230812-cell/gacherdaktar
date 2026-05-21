const fetch = require('node-fetch-native') || globalThis.fetch;

const lat = 23.8103;
const lon = 90.4125;
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,showers_sum,weathercode,windgusts_10m&current_weather=true&hourly=relativehumidity_2m,soil_temperature_0_to_7cm&timezone=Asia/Dhaka`;

console.log('Fetching weather url:', url);
fetch(url)
  .then(async (res) => {
    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response text (truncated):', text.substring(0, 1000));
  })
  .catch(err => {
    console.error('Fetch failed with error:', err);
  });
