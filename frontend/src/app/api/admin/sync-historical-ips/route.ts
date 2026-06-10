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

    // Fetch up to 1000 recent tracking logs to analyze and backfill missing geo details
    const { data: records, error } = await supabaseAdmin
      .from('usage_analytics')
      .select('id, ip_address, metadata')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;
    if (!records || records.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No logs found to resolve.' });
    }

    let resolvedCount = 0;
    const ipCache = new Map<string, any>();

    for (const rec of records) {
      const ip = rec.ip_address;
      // Skip system or internal IPs
      if (!ip || ip.startsWith('sess_') || ip === 'SYSTEM_BLOCKED_IP' || ip === 'SYSTEM_OWNER_IP' || ip === '127.0.0.1' || ip === '::1') continue;

      // Skip if metadata already has geolocated info
      const meta = rec.metadata || {};
      if (meta.country_name || meta.isp) continue;

      let geo = ipCache.get(ip);
      if (!geo) {
        try {
          const res = await fetch(`https://api.iplocation.net/?ip=${ip}`);
          if (res.ok) {
            const data = await res.json();
            if (data.country_name) {
              const ispLower = (data.isp || '').toLowerCase();
              const isSpam = ['amazon', 'digitalocean', 'google', 'microsoft', 'linode', 'hetzner', 'ovh', 'cloudflare', 'm247', 'colocrossing', 'leaseweb'].some(provider => ispLower.includes(provider));
              
              geo = {
                country_name: data.country_name,
                country_code: data.country_code2,
                isp: data.isp,
                is_spam: isSpam,
                spam_reason: isSpam ? 'Hosting Provider/Proxy Network' : null
              };
              ipCache.set(ip, geo);
              
              // Respect API guidelines by introducing a 150ms sleep
              await new Promise(resolve => setTimeout(resolve, 150));
            }
          }
        } catch (err) {
          console.error(`Failed to geolocate old IP ${ip}:`, err);
        }
      }

      if (geo) {
        const { error: updateError } = await supabaseAdmin
          .from('usage_analytics')
          .update({
            metadata: {
              ...meta,
              ...geo
            }
          })
          .eq('id', rec.id);

        if (!updateError) {
          resolvedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: resolvedCount,
      message: `সফলভাবে ${resolvedCount}টি পুরনো লগের আইপি ডাটা লোকেশনসহ আপডেট করা হয়েছে!`
    });

  } catch (err: any) {
    console.error('Historical IP Sync Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
