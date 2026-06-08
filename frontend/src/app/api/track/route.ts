import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isOwnerIp } from '@/lib/security';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: Request) {
  try {
    const { sessionId, pageVisited, action, metadata, location } = await request.json();
    
    if (!sessionId || !pageVisited) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Skip database logging if request originates from owner/admin IP
    if (await isOwnerIp(ip)) {
      return NextResponse.json({ success: true, bypassed: true });
    }

    // Insert analytics log bypassing RLS using admin client
    const { error } = await supabaseAdmin
      .from('usage_analytics')
      .insert({
        session_id: sessionId,
        user_agent: userAgent,
        ip_address: ip,
        location: location || null,
        page_visited: pageVisited,
        action: action || 'visit',
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Tracking API Error:", error);
    // Silent return to prevent disrupting user experience on network errors
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
