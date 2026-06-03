import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface LogEntry {
  id: number;
  crop_name: string;
  disease_name: string;
  confidence: number;
  location: string;
  created_at: string;
}

interface ActivityEntry {
  id: number;
  session_id: string;
  user_agent: string;
  page_visited: string;
  action: string;
  location: string;
  created_at: string;
}


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

export async function GET(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Diagnostic Logs (limit to 100 for display, but count totals)
    const { data: logs, error: logsError, count: totalScans } = await supabaseAdmin
      .from('diagnostic_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (logsError) throw logsError;

    // 2. Fetch Usage Analytics (limit to 200 for recent activities, but count totals)
    const { data: analytics, error: analyticsError, count: totalPageViews } = await supabaseAdmin
      .from('usage_analytics')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (analyticsError) throw analyticsError;

    // 3. Fetch Login Attempts
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .order('attempt_time', { ascending: false })
      .limit(50);

    if (attemptsError) throw attemptsError;

    // Calculate crop distribution
    const cropCounts: { [key: string]: number } = {};
    const diseaseCounts: { [key: string]: number } = {};
    let confidenceSum = 0;

    (logs || []).forEach((log: LogEntry) => {
      cropCounts[log.crop_name] = (cropCounts[log.crop_name] || 0) + 1;
      diseaseCounts[log.disease_name] = (diseaseCounts[log.disease_name] || 0) + 1;
      confidenceSum += Number(log.confidence) || 0;
    });

    const averageConfidence = logs && logs.length > 0 ? (confidenceSum / logs.length).toFixed(2) : '0';

    // Unique active sessions
    const uniqueSessions = new Set((analytics || []).map((a: ActivityEntry) => a.session_id)).size;

    // Page distribution
    const pageCounts: { [key: string]: number } = {};
    (analytics || []).forEach((item: ActivityEntry) => {
      pageCounts[item.page_visited] = (pageCounts[item.page_visited] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalScans: totalScans || 0,
        averageConfidence: averageConfidence,
        totalPageViews: totalPageViews || 0,
        activeSessions: uniqueSessions,
        cropCounts,
        diseaseCounts,
        pageCounts
      },
      logs: logs || [],
      analytics: analytics || [],
      attempts: attempts || []
    });

  } catch (error: any) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Error loading dashboard data.' }, { status: 500 });
  }
}

// Support DELETE route to allow clearing logs or test records
export async function DELETE(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { target } = await request.json();

    if (target === 'diagnostics') {
      const { error } = await supabaseAdmin.from('diagnostic_logs').delete().neq('crop_name', 'placeholder_impossible_string_123');
      if (error) throw error;
    } else if (target === 'analytics') {
      const { error } = await supabaseAdmin.from('usage_analytics').delete().neq('page_visited', 'placeholder_impossible_string_123');
      if (error) throw error;
    } else if (target === 'attempts') {
      const { error } = await supabaseAdmin.from('login_attempts').delete().neq('username', 'placeholder_impossible_string_123');
      if (error) throw error;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid clear target' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'উপাত্ত সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error: any) {
    console.error("Admin data clear error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Error clearing data.' }, { status: 500 });
  }
}
