const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    }).on('error', err => reject(err));
  });
}

async function verify() {
  console.log("Verifying live production DATABASE endpoints...");
  const syncSecret = "krishisathi_sync_secret_token_2026";
  
  try {
    const res = await fetchUrl(`https://www.gacherdoctor.site/api/sync/prices?secret=${syncSecret}`);
    console.log("Prices Sync API Status:", res.status);
    console.log("Prices Sync Data:", res.data);
  } catch (err) {
    console.error("Failed to query live prices sync API:", err.message);
  }

  try {
    const res = await fetchUrl(`https://www.gacherdoctor.site/api/sync/articles?secret=${syncSecret}`);
    console.log("Articles Sync API Status:", res.status);
    console.log("Articles Sync Data:", res.data);
  } catch (err) {
    console.error("Failed to query live articles sync API:", err.message);
  }
}

verify();
