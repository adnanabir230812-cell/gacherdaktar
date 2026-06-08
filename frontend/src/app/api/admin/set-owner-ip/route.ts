import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to verify admin session
function isAuthorizedAdmin(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const parts = c.trim().split('=');
      return [parts[0], parts.slice(1).join('=')];
    })
  );

  const rawToken = cookies['krishisathi_admin_session'];
  if (!rawToken) return false;

  const token = decodeURIComponent(rawToken);
  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'abir230812';
  const expectedToken = Buffer.from(`${envUsername}:${envPassword}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`).toString('base64');

  return token === expectedToken;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (realIp || '127.0.0.1');

    // 1. Delete old owner IP registrations
    await supabaseAdmin
      .from('usage_analytics')
      .delete()
      .eq('session_id', 'SYSTEM_OWNER_IP');

    // 2. Insert new owner IP
    const { error } = await supabaseAdmin
      .from('usage_analytics')
      .insert({
        session_id: 'SYSTEM_OWNER_IP',
        ip_address: clientIp,
        page_visited: 'SYSTEM',
        action: 'owner',
        metadata: { registered_at: new Date().toISOString() }
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'আপনার আইপি সফলভাবে সেভ করা হয়েছে।',
      ownerIp: clientIp
    });

  } catch (error: any) {
    console.error("Set-Owner-IP error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Error registering owner IP' }, { status: 500 });
  }
}
