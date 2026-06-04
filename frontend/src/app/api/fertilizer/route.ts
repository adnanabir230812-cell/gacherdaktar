import { NextResponse } from 'next/server';
import { CROPS } from '../data';
import { supabaseAdmin } from '@/lib/supabase';
import { checkSecurity } from '@/lib/security';

export async function POST(request: Request) {
  const security = checkSecurity(request, 'general');
  if (security.blocked && security.response) {
    return security.response;
  }
  try {
    const { cropId, landSize, season } = await request.json();

    if (!cropId || !landSize || !season) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const crop = CROPS.find(c => c.id === cropId);
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    let rule = crop.fertilizers.find(f => f.season === season);
    if (!rule) {
      rule = crop.fertilizers[0]; // fallback
    }

    if (!rule) {
      return NextResponse.json({ error: 'No fertilizer guidelines for this crop' }, { status: 400 });
    }

    const land = parseFloat(landSize);
    const ureaTotal = rule.urea * land;
    const tspTotal = rule.tsp * land;
    const mopTotal = rule.mop * land;
    const gypsumTotal = rule.gypsum * land;
    const zincTotal = rule.zinc * land;

    const guidelines = [
      `১. ইউরিয়া সার (${ureaTotal.toFixed(1)} কেজি) ৩টি কিস্তিতে সমানভাগে প্রয়োগ করুন। ১ম কিস্তি চারা রোপণের ১৫ দিন পর, ২য় কিস্তি ৩০ দিন পর এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে দিতে হবে।`,
      `২. জমি শেষ চাষের সময় সমস্ত টিএসপি (${tspTotal.toFixed(1)} কেজি), জিপসাম (${gypsumTotal.toFixed(1)} কেজি) এবং দস্তা (${zincTotal.toFixed(1)} কেজি) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`,
      `৩. এমওপি সার (${mopTotal.toFixed(1)} কেজি) ২ কিস্তিতে প্রয়োগ করতে হবে: অর্ধেক জমি শেষ চাষের সময় এবং বাকি অর্ধেক চারা রোপণের ৩৫-৪০ দিন পর (২য় বার ইউরিয়া দেওয়ার সময়)।`
    ];

    // Log fertilizer calculation to database
    try {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      await supabaseAdmin.from('usage_analytics').insert({
        session_id: 'fertilizer_session',
        user_agent: userAgent,
        ip_address: clientIp,
        location: null,
        page_visited: '/calculator',
        action: 'fertilizer_calc',
        metadata: {
          cropName: crop.name_bn,
          landSize: land,
          season: season,
          urea_kg: Math.round(ureaTotal * 100) / 100,
          tsp_kg: Math.round(tspTotal * 100) / 100,
          mop_kg: Math.round(mopTotal * 100) / 100
        },
        created_at: new Date().toISOString()
      });
    } catch (dbErr) {
      console.error("Failed to log fertilizer calculation:", dbErr);
    }

    return NextResponse.json({
      cropName: crop.name_bn,
      landSize: land,
      season: season,
      source: rule.source_org,
      urea_kg: Math.round(ureaTotal * 100) / 100,
      tsp_kg: Math.round(tspTotal * 100) / 100,
      mop_kg: Math.round(mopTotal * 100) / 100,
      gypsum_kg: Math.round(gypsumTotal * 100) / 100,
      zinc_kg: Math.round(zincTotal * 100) / 100,
      guidelines
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
