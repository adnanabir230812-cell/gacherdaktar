const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
    }).on('error', err => reject(err));
  });
}

async function verify() {
  console.log("Checking live production redirects...");
  try {
    const res = await fetchUrl('https://www.gacherdoctor.site/admin');
    console.log("/admin Status Code:", res.status);
    console.log("/admin Redirect Location:", res.headers.location);
  } catch (err) {
    console.error("Failed to fetch /admin:", err.message);
  }
}

verify();
