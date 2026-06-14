const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Searching for the query in usage_analytics...");
  const { data, error } = await supabase
    .from('usage_analytics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${data.length} recent records:`);
  data.forEach((row, idx) => {
    const queryVal = row.metadata?.query;
    const respVal = row.metadata?.response;
    
    // We want to print records that match or are recent
    console.log(`\n[${idx + 1}] Time: ${row.created_at} | Action: ${row.action} | IP: ${row.ip_address}`);
    if (queryVal) console.log(`Query: ${JSON.stringify(queryVal)}`);
    if (respVal) console.log(`Response Snippet: ${respVal.substring(0, 200)}...`);
  });
}

run();
