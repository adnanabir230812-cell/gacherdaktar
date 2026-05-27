const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const articlesPath = path.join(process.cwd(), 'src', 'data', 'fallback_articles.json');
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

async function sync() {
  console.log(`Syncing ${articles.length} articles to Supabase...`);
  
  // Format articles for DB (make sure id is omitted to let DB auto-increment or handle, or preserve id)
  // Let's keep the id so they are ordered consistently and update existing IDs if present
  const dbArticles = articles.map(art => ({
    title: art.title,
    content: art.content,
    source_site: art.source_site,
    source_url: art.source_url,
    publish_date: art.publish_date
  }));

  // Clean out the old articles to prevent conflict or just upsert
  // Since we have a unique constraint on source_url, upsert is safe
  // Let's do batch upserts (e.g. 20 articles per batch)
  const batchSize = 25;
  for (let i = 0; i < dbArticles.length; i += batchSize) {
    const batch = dbArticles.slice(i, i + batchSize);
    console.log(`Upserting batch ${Math.floor(i/batchSize) + 1} (${batch.length} items)...`);
    
    const { data, error } = await supabase
      .from('articles')
      .upsert(batch, { onConflict: 'source_url' });
      
    if (error) {
      console.error(`Error upserting batch starting at index ${i}:`, error);
    } else {
      console.log(`Batch ${Math.floor(i/batchSize) + 1} successfully upserted.`);
    }
  }
  
  console.log("Sync complete!");
}

sync();
