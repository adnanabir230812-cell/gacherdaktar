const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found at:", envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local!");
  process.exit(1);
}

console.log("Connecting to new Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Default crop prices to seed
const BASE_CROP_PRICES = [
  { crop_name: "ব্রি ধান ২৯ (ধান)", min: 1250, max: 1350, unit: "মণ" },
  { crop_name: "রোপা আমন ধান", min: 1200, max: 1270, unit: "মণ" },
  { crop_name: "ধান (আউশ)", min: 1050, max: 1100, unit: "মণ" },
  { crop_name: "নাজিরশাইল চাল", min: 71, max: 75, unit: "কেজি" },
  { crop_name: "মিনিকেট চাল", min: 65, max: 68, unit: "কেজি" },
  { crop_name: "চিনিগুঁড়া চাল", min: 125, max: 135, unit: "কেজি" },
  { crop_name: "গম", min: 1400, max: 1500, unit: "মণ" },
  { crop_name: "আলু (ডায়মন্ড)", min: 28, max: 32, unit: "কেজি" },
  { crop_name: "দেশি পেঁয়াজ", min: 65, max: 70, unit: "কেজি" },
  { crop_name: "আমদানি পেঁয়াজ", min: 50, max: 55, unit: "কেজি" },
  { crop_name: "কাঁচা মরিচ", min: 80, max: 90, unit: "কেজি" },
  { crop_name: "শুকনা মরিচ (দেশি)", min: 320, max: 350, unit: "কেজি" },
  { crop_name: "দেশি রসুন", min: 120, max: 135, unit: "কেজি" },
  { crop_name: "আমদানি রসুন", min: 160, max: 175, unit: "কেজি" },
  { crop_name: "আদা (দেশি)", min: 180, max: 200, unit: "কেজি" },
  { crop_name: "হলুদ (গুঁড়া)", min: 240, max: 270, unit: "কেজি" },
  { crop_name: "বেগুন (গোল)", min: 40, max: 48, unit: "কেজি" },
  { crop_name: "টমেটো (লাল)", min: 35, max: 42, unit: "কেজি" },
  { crop_name: "মিষ্টি কুমড়া", min: 25, max: 30, unit: "কেজি" },
  { crop_name: "লাল শাক", min: 15, max: 20, unit: "আঁটি" },
  { crop_name: "পটল", min: 35, max: 40, unit: "কেজি" },
  { crop_name: "মসুর ডাল (দেশি)", min: 130, max: 140, unit: "কেজি" },
  { crop_name: "মুগ ডাল (উন্নত)", min: 135, max: 145, unit: "কেজি" },
  { crop_name: "খেসারি ডাল", min: 85, max: 95, unit: "কেজি" },
  { crop_name: "বারি সরিষা", min: 3200, max: 3400, unit: "মণ" },
  { crop_name: "সয়াবিন তেল (খোলা)", min: 155, max: 165, unit: "লিটার" },
  { crop_name: "সরিষার তেল (ঘানি)", min: 240, max: 260, unit: "লিটার" },
  { crop_name: "তোষা পাট", min: 2800, max: 3200, unit: "মণ" },
  { crop_name: "হাইব্রিড ভুট্টা", min: 850, max: 920, unit: "মণ" },
  { crop_name: "লাউ", min: 30, max: 40, unit: "পিস" },
  { crop_name: "করলা", min: 50, max: 60, unit: "কেজি" },
  { crop_name: "ঝিঙা", min: 40, max: 45, unit: "কেজি" },
  { crop_name: "চিচিঙ্গা", min: 35, max: 40, unit: "কেজি" },
  { crop_name: "ধুন্দুল", min: 35, max: 40, unit: "কেজি" },
  { crop_name: "ঢেঁড়স", min: 35, max: 42, unit: "কেজি" },
  { crop_name: "ধনে পাতা", min: 80, max: 100, unit: "কেজি" },
  { crop_name: "আম (গোপালভোগ)", min: 3500, max: 4200, unit: "মণ" },
  { crop_name: "কলা (সবরি)", min: 280, max: 320, unit: "ছড়া" },
  { crop_name: "পেঁপে (কাঁচা)", min: 25, max: 30, unit: "কেজি" },
  { crop_name: "গাজর", min: 40, max: 50, unit: "কেজি" },
  { crop_name: "শিম", min: 50, max: 65, unit: "কেজি" },
  { crop_name: "বাধাকপি", min: 25, max: 30, unit: "পিস" },
  { crop_name: "ফুলকпи", min: 30, max: 35, unit: "পিস" },
  { crop_name: "লেবু (কাগজি)", min: 100, max: 120, unit: "১০০টি" },
  { crop_name: "শসা (দেশি)", min: 40, max: 45, unit: "কেজি" },
  { crop_name: "ডিম (লাল ফার্ম)", min: 120, max: 130, unit: "১২টি" },
  { crop_name: "ব্রয়লার মুরগি", min: 160, max: 175, unit: "কেজি" },
  { crop_name: "গরুর মাংস", min: 720, max: 750, unit: "কেজি" },
  { crop_name: "খাসির মাংস", min: 950, max: 1050, unit: "কেজি" },
  { crop_name: "রুই মাছ (১.৫+ কেজি)", min: 280, max: 320, unit: "কেজি" },
  { crop_name: "ইলিশ মাছ (৮০০ গ্রাম)", min: 1200, max: 1400, unit: "কেজি" }
];

async function seed() {
  try {
    console.log("1. Seeding fallback articles...");
    const articlesPath = path.join(__dirname, '..', 'src', 'data', 'fallback_articles.json');
    if (!fs.existsSync(articlesPath)) {
      console.warn("Warning: fallback_articles.json not found at:", articlesPath);
    } else {
      const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
      const dbArticles = articles.map(({ id, ...rest }) => rest);
      
      console.log(`Clearing existing articles...`);
      await supabase.from('articles').delete().neq('title', 'placeholder_impossible_string_123');
      
      console.log(`Inserting ${dbArticles.length} articles in batches...`);
      const batchSize = 20;
      for (let i = 0; i < dbArticles.length; i += batchSize) {
        const batch = dbArticles.slice(i, i + batchSize);
        const { error } = await supabase.from('articles').insert(batch);
        if (error) {
          console.error(`Error inserting articles batch starting at index ${i}:`, error);
        } else {
          console.log(`Articles batch starting at index ${i} successfully seeded.`);
        }
      }
    }

    console.log("\n2. Seeding market prices...");
    const today = new Date().toISOString().split('T')[0];
    
    // Format prices for insertion
    const dbPrices = BASE_CROP_PRICES.map(item => {
      const percentageChange = (Math.random() * 6 - 3) / 100;
      const minPrice = Math.round(item.min * (1 + percentageChange));
      const maxPrice = Math.round(item.max * (1 + percentageChange));
      
      const changeVal = percentageChange > 0.01 
        ? `+${Math.round(item.min * percentageChange)} ৳`
        : percentageChange < -0.01 
          ? `-${Math.round(Math.abs(item.min * percentageChange))} ৳`
          : "০ ৳";
          
      const trend = percentageChange > 0.01 ? "up" : percentageChange < -0.01 ? "down" : "stable";

      const englishToBanglaMap = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
        '-': '-', '+': '+'
      };
      
      const translateToBanglaDigits = (val) => {
        return String(val).split('').map(c => englishToBanglaMap[c] || c).join('');
      };

      const formattedPriceRange = `${translateToBanglaDigits(minPrice.toLocaleString())} - ${translateToBanglaDigits(maxPrice.toLocaleString())} ৳ / ${item.unit}`;
      const formattedChangeVal = translateToBanglaDigits(changeVal);

      return {
        crop_name: item.crop_name,
        price_range: formattedPriceRange,
        trend: trend,
        change_val: formattedChangeVal,
        market_date: today,
        created_at: new Date().toISOString()
      };
    });

    console.log(`Clearing existing prices for ${today}...`);
    await supabase.from('market_prices').delete().eq('market_date', today);

    console.log(`Inserting ${dbPrices.length} crop prices...`);
    const { error: priceError } = await supabase.from('market_prices').insert(dbPrices);
    if (priceError) {
      console.error("Error inserting crop prices:", priceError);
    } else {
      console.log("Crop prices successfully seeded.");
    }

    console.log("\nDatabase seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed with error:", err);
  }
}

seed();
