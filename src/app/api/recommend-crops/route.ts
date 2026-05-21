import { NextResponse } from 'next/server';
import { CROPS } from '../data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') || '';
  const season = searchParams.get('season') || '';
  const soilType = searchParams.get('soilType') || '';

  if (!season || !soilType) {
    return NextResponse.json({ error: 'Season and soilType are required' }, { status: 400 });
  }

  const recommended = CROPS.filter(crop => {
    // Check season compatibility
    const seasonMatch = crop.seasons.some(s => s.toLowerCase() === season.toLowerCase());
    
    // Check soil compatibility (using basic sub-string match)
    const soilMatch = crop.soil_preference.some(s => 
      s.toLowerCase().includes(soilType.toLowerCase()) || 
      soilType.toLowerCase().includes(s.toLowerCase())
    );

    return seasonMatch && soilMatch;
  }).map(c => ({
    id: c.id,
    name_bn: c.name_bn,
    name_en: c.name_en,
    category: c.category,
    yield_avg: c.yield_avg,
    profit_avg: c.profit_avg,
    icon_name: c.icon_name,
    suitability: c.profit_avg > 15000 ? "উচ্চ (Highly Suitable)" : "মাঝারি"
  }));

  // Sort by expected profitability
  recommended.sort((a, b) => b.profit_avg - a.profit_avg);

  return NextResponse.json(recommended);
}
