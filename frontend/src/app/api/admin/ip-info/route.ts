import { NextResponse } from 'next/server';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json({ error: 'IP parameter is required' }, { status: 400 });
    }

    const res = await fetch(`http://ip-api.com/json/${ip}`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Failed to fetch details from IP API' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("IP Info API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
