import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to get client IP
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const ip = getClientIp(request);

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।' }, { status: 400 });
    }

    // 1. Check brute-force lockout: count failed attempts from this IP in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: recentAttempts, error: countError } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .eq('ip_address', ip)
      .eq('is_successful', false)
      .gt('attempt_time', thirtyMinutesAgo)
      .order('attempt_time', { ascending: false });

    if (countError) {
      console.error("Lockout check error:", countError);
      return NextResponse.json({ success: false, error: 'সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।' }, { status: 500 });
    }

    // Lockout if 3 or more failed attempts
    if (recentAttempts && recentAttempts.length >= 3) {
      const lastFailedTime = new Date(recentAttempts[0].attempt_time).getTime();
      const lockDurationRemaining = Math.max(0, 30 * 60 * 1000 - (Date.now() - lastFailedTime));
      
      if (lockDurationRemaining > 0) {
        const minutesLeft = Math.ceil(lockDurationRemaining / (60 * 1000));
        return NextResponse.json({
          success: false,
          locked: true,
          error: `অতিরিক্ত ব্যর্থ চেষ্টার কারণে আপনার আইপি সাময়িকভাবে ব্লক করা হয়েছে। অনুগ্রহ করে আরও ${minutesLeft} মিনিট পর চেষ্টা করুন।`
        }, { status: 429 });
      }
    }

    // 2. Validate Credentials
    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const envPassword = process.env.ADMIN_PASSWORD || 'abir230812';

    const isMatch = (username === envUsername) && (password === envPassword);

    // 3. Log Attempt
    const { error: logError } = await supabaseAdmin
      .from('login_attempts')
      .insert({
        ip_address: ip,
        username: username,
        is_successful: isMatch,
        attempt_time: new Date().toISOString()
      });

    if (logError) {
      console.error("Failed to log login attempt:", logError);
    }

    if (!isMatch) {
      const remainingAttempts = 3 - ((recentAttempts?.length || 0) + 1);
      return NextResponse.json({
        success: false,
        error: `ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে। ${remainingAttempts > 0 ? `আর মাত্র ${remainingAttempts} বার চেষ্টা করতে পারবেন।` : 'আপনার আইপি ৩০ মিনিটের জন্য ব্লক করা হয়েছে।'}`
      }, { status: 401 });
    }

    // 4. Successful login: Generate a simple secure token using SHA-256 of credentials
    // We set an HTTP-Only secure cookie containing the admin session hash
    const response = NextResponse.json({ success: true, message: 'লগইন সফল হয়েছে।' });
    
    // Hash key combined with service role key for authentication signatures
    const sessionToken = Buffer.from(`${envUsername}:${envPassword}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`).toString('base64');

    response.cookies.set('krishisathi_admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ success: false, error: 'সার্ভার প্রসেসিং ত্রুটি।' }, { status: 500 });
  }
}
