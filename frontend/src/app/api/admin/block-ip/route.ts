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

// GET: Fetch list of blocked IPs and current owner IP
export async function GET(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Blocked IPs
    const { data: blockedIpsData, error: blockedError } = await supabaseAdmin
      .from('usage_analytics')
      .select('ip_address, created_at')
      .eq('session_id', 'SYSTEM_BLOCKED_IP')
      .order('created_at', { ascending: false });

    if (blockedError) throw blockedError;

    // 2. Fetch Owner IP
    const { data: ownerIpData, error: ownerError } = await supabaseAdmin
      .from('usage_analytics')
      .select('ip_address')
      .eq('session_id', 'SYSTEM_OWNER_IP')
      .limit(1);

    if (ownerError) throw ownerError;

    const blockedList = (blockedIpsData || []).map((item: any) => ({
      ip: item.ip_address,
      blocked_at: item.created_at
    }));

    const ownerIp = ownerIpData && ownerIpData.length > 0 ? ownerIpData[0].ip_address : null;

    return NextResponse.json({
      success: true,
      blockedList,
      ownerIp
    });

  } catch (error: any) {
    console.error("Block-IP fetch error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Error loading block data' }, { status: 500 });
  }
}

// POST: Block or Unblock an IP address
export async function POST(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { ip, action } = await request.json();

    if (!ip) {
      return NextResponse.json({ success: false, error: 'IP address is required' }, { status: 400 });
    }

    // Fetch current owner IP to prevent owner self-blocking
    const { data: ownerData } = await supabaseAdmin
      .from('usage_analytics')
      .select('ip_address')
      .eq('session_id', 'SYSTEM_OWNER_IP')
      .limit(1);
    
    const ownerIp = ownerData && ownerData.length > 0 ? ownerData[0].ip_address : null;

    if (action === 'block') {
      if (ip === ownerIp) {
        return NextResponse.json({ success: false, error: 'অ্যাডমিন নিজের আইপি ব্লক করতে পারবেন না!' }, { status: 400 });
      }

      // Check if already blocked
      const { data: existing } = await supabaseAdmin
        .from('usage_analytics')
        .select('id')
        .eq('session_id', 'SYSTEM_BLOCKED_IP')
        .eq('ip_address', ip)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({ success: true, message: 'আইপিটি ইতিমধ্যে ব্লকড তালিকায় রয়েছে।' });
      }

      // Insert block record
      const { error } = await supabaseAdmin
        .from('usage_analytics')
        .insert({
          session_id: 'SYSTEM_BLOCKED_IP',
          ip_address: ip,
          page_visited: 'SYSTEM',
          action: 'blocked',
          metadata: { blocked_at: new Date().toISOString() }
        });

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'আইপিটি সফলভাবে ব্লক করা হয়েছে।' });

    } else if (action === 'unblock') {
      // Remove block record
      const { error } = await supabaseAdmin
        .from('usage_analytics')
        .delete()
        .eq('session_id', 'SYSTEM_BLOCKED_IP')
        .eq('ip_address', ip);

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'আইপিটি সফলভাবে আনব্লক করা হয়েছে।' });

    } else {
      return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Block-IP post error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Error processing request' }, { status: 500 });
  }
}
