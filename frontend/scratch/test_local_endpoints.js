const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local for database credentials
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const syncSecret = "krishisathi_sync_secret_token_2026";
const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const baseOptions = {
  hostname: 'localhost',
  port: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
};

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      ...baseOptions,
      path: path,
      method: method,
      headers: {
        ...baseOptions.headers,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data.trim().startsWith('{') || data.trim().startsWith('[') ? JSON.parse(data) : data
          });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', err => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING LOCAL INTEGRATION VERIFICATION ===");
  
  // Wait a bit to ensure dev server has fully started
  await new Promise(r => setTimeout(r, 3000));

  let passed = true;

  // 1. Check Crops API
  try {
    const res = await makeRequest('/api/crops');
    if (res.status === 200 && Array.isArray(res.data)) {
      console.log(`[PASS] Crops API: Found ${res.data.length} crops.`);
    } else {
      console.error(`[FAIL] Crops API returned status ${res.status}:`, res.data);
      passed = false;
    }
  } catch (err) {
    console.error(`[FAIL] Crops API request error:`, err.message);
    passed = false;
  }

  // 2. Check Districts API
  try {
    const res = await makeRequest('/api/districts');
    if (res.status === 200 && Array.isArray(res.data)) {
      console.log(`[PASS] Districts API: Found ${res.data.length} districts.`);
    } else {
      console.error(`[FAIL] Districts API returned status ${res.status}:`, res.data);
      passed = false;
    }
  } catch (err) {
    console.error(`[FAIL] Districts API request error:`, err.message);
    passed = false;
  }

  // 3. Check Weather API
  try {
    const res = await makeRequest('/api/weather?district=' + encodeURIComponent('খুলনা'));
    if (res.status === 200 && res.data.district) {
      console.log(`[PASS] Weather API (Khulna): Temperature is ${res.data.temp}°C, Condition: ${res.data.condition}`);
    } else {
      console.error(`[FAIL] Weather API returned status ${res.status}:`, res.data);
      passed = false;
    }
  } catch (err) {
    console.error(`[FAIL] Weather API request error:`, err.message);
    passed = false;
  }

  // 4. Check Sync Prices API
  try {
    const res = await makeRequest(`/api/sync/prices?secret=${syncSecret}`);
    if (res.status === 200 && res.data.success) {
      console.log(`[PASS] Price Sync Engine: ${res.data.message}`);
    } else {
      console.error(`[FAIL] Price Sync Engine returned status ${res.status}:`, res.data);
      passed = false;
    }
  } catch (err) {
    console.error(`[FAIL] Price Sync Engine request error:`, err.message);
    passed = false;
  }

  // 5. Check Sync Articles API
  try {
    const res = await makeRequest(`/api/sync/articles?secret=${syncSecret}`);
    if (res.status === 200 && res.data.success) {
      console.log(`[PASS] Articles Sync Engine: ${res.data.message}`);
    } else {
      console.error(`[FAIL] Articles Sync Engine returned status ${res.status}:`, res.data);
      passed = false;
    }
  } catch (err) {
    console.error(`[FAIL] Articles Sync Engine request error:`, err.message);
    passed = false;
  }

  // 6. Test User Tracking Event Logging
  try {
    const res = await makeRequest('/api/track', 'POST', {
      sessionId: 'test_session_verification_2026',
      pageVisited: '/chat',
      action: 'visit',
      location: 'খুলনা'
    });
    if (res.status === 200 && res.data.success) {
      console.log(`[PASS] User Tracking API: Success.`);
    } else {
      console.error(`[FAIL] User Tracking API returned status ${res.status}:`, res.data);
      passed = false;
    }
  } catch (err) {
    console.error(`[FAIL] User Tracking API request error:`, err.message);
    passed = false;
  }

  // 7. Test Admin Panel Lockout Security Mechanisms
  console.log("\n--- STARTING ADMIN PANEL SECURITY & LOCKOUT AUDIT ---");
  
  // Clean up attempts database first to start tests in a clean state
  try {
    await supabase.from('login_attempts').delete().neq('username', 'placeholder_impossible_string_123');
    console.log("[INFO] Lockout history database cleared for clean audit.");
  } catch (dbErr) {
    console.error("[WARN] Could not reset attempts history:", dbErr.message);
  }

  // Unauthorized data access check
  try {
    const res = await makeRequest('/api/admin/data');
    if (res.status === 401) {
      console.log("[PASS] Admin Data Access: Blocked unauthorized fetch (HTTP 401).");
    } else {
      console.error("[FAIL] Admin Data Access: Expected 401 but got", res.status);
      passed = false;
    }
  } catch (err) {
    console.error("[FAIL] Admin Data Access check error:", err.message);
    passed = false;
  }

  // First failed login attempt
  try {
    const res = await makeRequest('/api/admin/login', 'POST', { username: 'admin', password: 'wrongpassword1' });
    if (res.status === 401 && !res.data.success) {
      console.log("[PASS] Admin Login Attempt 1: Rejected wrong password (HTTP 401). Msg:", res.data.error);
    } else {
      console.error("[FAIL] Admin Login Attempt 1: Expected 401 but got", res.status);
      passed = false;
    }
  } catch (err) {
    console.error("[FAIL] Admin Login Attempt 1 error:", err.message);
    passed = false;
  }

  // Second failed login attempt
  try {
    const res = await makeRequest('/api/admin/login', 'POST', { username: 'admin', password: 'wrongpassword2' });
    if (res.status === 401 && !res.data.success) {
      console.log("[PASS] Admin Login Attempt 2: Rejected wrong password (HTTP 401). Msg:", res.data.error);
    } else {
      console.error("[FAIL] Admin Login Attempt 2: Expected 401 but got", res.status);
      passed = false;
    }
  } catch (err) {
    console.error("[FAIL] Admin Login Attempt 2 error:", err.message);
    passed = false;
  }

  // Third failed login attempt (This logs the 3rd failure - next attempts are locked out)
  try {
    const res = await makeRequest('/api/admin/login', 'POST', { username: 'admin', password: 'wrongpassword3' });
    if (res.status === 401 && !res.data.success) {
      console.log("[PASS] Admin Login Attempt 3: Rejected wrong password (HTTP 401). Msg:", res.data.error);
    } else {
      console.error("[FAIL] Admin Login Attempt 3: Expected 401 but got", res.status);
      passed = false;
    }
  } catch (err) {
    console.error("[FAIL] Admin Login Attempt 3 error:", err.message);
    passed = false;
  }

  // Fourth attempt - should trigger Lockout (HTTP 429)
  try {
    const res = await makeRequest('/api/admin/login', 'POST', { username: 'admin', password: 'wrongpassword4' });
    if (res.status === 429 && res.data.locked) {
      console.log("[PASS] Admin Login Lockout: Successfully triggered 30-minute block (HTTP 429). Msg:", res.data.error);
    } else {
      console.error("[FAIL] Admin Login Lockout: Expected 429 locked status but got", res.status, res.data);
      passed = false;
    }
  } catch (err) {
    console.error("[FAIL] Admin Login Lockout error:", err.message);
    passed = false;
  }

  // Reset database lockout attempts to test successful login
  try {
    await supabase.from('login_attempts').delete().neq('username', 'placeholder_impossible_string_123');
    console.log("[INFO] Lockout history database reset to audit successful login.");
  } catch (dbErr) {
    console.error("[WARN] Could not reset attempts history:", dbErr.message);
  }

  // Test successful login with correct password "abir230812"
  let sessionCookie = '';
  try {
    const res = await makeRequest('/api/admin/login', 'POST', { username: 'admin', password: 'abir230812' });
    if (res.status === 200 && res.data.success) {
      console.log("[PASS] Admin Login: Successful authentication using password 'abir230812'!");
      // Extract session cookie
      const cookies = res.headers['set-cookie'];
      if (cookies && cookies.length > 0) {
        sessionCookie = cookies[0].split(';')[0];
        console.log("[PASS] Admin Session: Received secure cookie.");
      }
    } else {
      console.error("[FAIL] Admin Login: Failed to authenticate with correct password. Status:", res.status, res.data);
      passed = false;
    }
  } catch (err) {
    console.error("[FAIL] Admin Login success path error:", err.message);
    passed = false;
  }

  // Test authenticated dashboard data access
  if (sessionCookie) {
    try {
      const res = await makeRequest('/api/admin/data', 'GET', null, { 'Cookie': sessionCookie });
      if (res.status === 200 && res.data.success) {
        console.log(`[PASS] Admin Dashboard Data: Load successful! Pageviews logged: ${res.data.stats.totalPageViews}, Scans logged: ${res.data.stats.totalScans}.`);
      } else {
        console.error("[FAIL] Admin Dashboard Data: Failed to load data with cookie. Status:", res.status, res.data);
        passed = false;
      }
    } catch (err) {
      console.error("[FAIL] Admin Dashboard Data fetch error:", err.message);
      passed = false;
    }
  } else {
    console.error("[FAIL] Admin Dashboard Data: Skipped due to missing session cookie.");
    passed = false;
  }

  console.log("\n=== INTEGRATION VERIFICATION COMPLETE ===");
  process.exit(passed ? 0 : 1);
}

runTests();
