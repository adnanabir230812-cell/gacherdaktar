import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import OFFICIAL_FALLBACK_ARTICLES from '@/data/fallback_articles.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFallback = searchParams.get('force') === 'true';

    // Security Check: Enforce SYNC_SECRET to prevent unauthorized write/delete on database
    const syncSecret = process.env.SYNC_SECRET || 'krishisathi_sync_secret_token_2026';
    const authHeader = request.headers.get('Authorization');
    const paramSecret = searchParams.get('secret');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (token !== syncSecret && paramSecret !== syncSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid sync secret' },
        { status: 401 }
      );
    }

    let syncedArticles: any[] = [...OFFICIAL_FALLBACK_ARTICLES];

    if (!forceFallback) {
      try {
        // Try scraping live DAE notices (Notice Board page)
        const daeRes = await fetch('https://dae.gov.bd/site/view/notices', {
          signal: AbortSignal.timeout(4000), // 4-second timeout to prevent serverless function hangs
        });

        if (daeRes.ok) {
          const html = await daeRes.text();
          // Extract notice titles and links using lightweight regex parsing
          const linkRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
          let match;
          const scrapedDae = [];
          
          while ((match = linkRegex.exec(html)) !== null && scrapedDae.length < 3) {
            const url = match[1];
            const title = match[2].trim();
            if (url.includes('/site/notices/') && title.length > 15) {
              scrapedDae.push({
                title: title,
                content: `কৃষি সম্প্রসারণ অধিদপ্তর (DAE) এর নোটিশ বোর্ড থেকে সরাসরি প্রকাশিত জরুরি বিজ্ঞপ্তি। বিস্তারিত তথ্য ও নির্দেশনা জানতে লিংকে ভিজিট করুন।`,
                source_site: 'dae',
                source_url: url.startsWith('http') ? url : `https://dae.gov.bd${url}`,
                publish_date: new Date().toISOString(),
              });
            }
          }
          if (scrapedDae.length > 0) {
            syncedArticles = [...scrapedDae, ...syncedArticles];
          }
        }
      } catch (err) {
        console.warn("Live DAE scraping timed out or failed. Using official database seed fallback.");
      }
    }

    // Upsert into Supabase (will insert new items or update matching source_url fields)
    const { data, error } = await supabaseAdmin
      .from('articles')
      .upsert(syncedArticles, { onConflict: 'source_url' });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `${syncedArticles.length}টি আর্টিকেল সফলভাবে সুপাবেস ডাটাবেজের সাথে সিঙ্ক করা হয়েছে।`,
      count: syncedArticles.length,
      synced: syncedArticles
    });

  } catch (error: any) {
    console.error("Article sync error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "আর্টিকেল সিঙ্ক করতে সমস্যা হয়েছে।"
    }, { status: 500 });
  }
}
