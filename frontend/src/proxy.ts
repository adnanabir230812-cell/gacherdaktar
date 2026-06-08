import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from './lib/supabase';
import maintenanceConfig from './config/maintenance.json';

// In-memory cache for blocked IPs to optimize page response times
let blockedIpsCache: Set<string> | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 30000; // 30 seconds

async function isIpBlocked(clientIp: string): Promise<boolean> {
  // If cache is empty or expired, refresh from database
  if (!blockedIpsCache || Date.now() - lastCacheUpdate > CACHE_TTL) {
    try {
      const { data, error } = await supabaseAdmin
        .from('usage_analytics')
        .select('ip_address')
        .eq('session_id', 'SYSTEM_BLOCKED_IP');
      
      if (!error && data) {
        blockedIpsCache = new Set(data.map((r: any) => r.ip_address));
        lastCacheUpdate = Date.now();
      }
    } catch (err) {
      console.error("Error updating blocked IPs cache:", err);
      if (!blockedIpsCache) {
        blockedIpsCache = new Set();
      }
    }
  }
  return blockedIpsCache ? blockedIpsCache.has(clientIp) : false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Set custom header for pathname so Server Components can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Resolve client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : (realIp || '127.0.0.1');

  // Verify if IP is blocked
  const blocked = await isIpBlocked(clientIp);
  if (blocked) {
    // If it is an API route, return JSON error payload
    if (pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Forbidden',
          message: 'নিরাপত্তা জনিত কারণে আপনার আইপি অ্যাড্রেস থেকে এই ওয়েবসাইট ব্যবহার করা সাময়িকভাবে নিষিদ্ধ করা হয়েছে।'
        }),
        { 
          status: 403, 
          headers: { 
            'content-type': 'application/json; charset=utf-8' 
          } 
        }
      );
    }

    // Otherwise, return a premium custom HTML access denied card
    return new NextResponse(
      `<!DOCTYPE html>
       <html lang="bn">
       <head>
         <meta charset="UTF-8">
         <title>প্রবেশাধিকার নিষিদ্ধ - Access Denied</title>
         <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@500;700;900&display=swap" rel="stylesheet">
         <style>
           body {
             background-color: #090d16;
             color: #cbd5e1;
             font-family: 'Noto Sans Bengali', sans-serif;
             display: flex;
             align-items: center;
             justify-content: center;
             min-height: 100vh;
             margin: 0;
             text-align: center;
             padding: 20px;
           }
           .card {
             background: rgba(15, 23, 42, 0.6);
             border: 1px solid rgba(239, 68, 68, 0.2);
             padding: 40px;
             border-radius: 24px;
             max-width: 450px;
             box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
             backdrop-filter: blur(12px);
           }
           h1 {
             color: #ef4444;
             font-size: 24px;
             font-weight: 900;
             margin-top: 0;
             margin-bottom: 15px;
           }
           p {
             font-size: 14px;
             line-height: 1.6;
             margin-bottom: 25px;
           }
           .ip {
             font-family: monospace;
             background: rgba(239, 68, 68, 0.1);
             color: #fca5a5;
             padding: 6px 12px;
             border-radius: 8px;
             font-size: 13px;
             border: 1px solid rgba(239, 68, 68, 0.15);
           }
         </style>
       </head>
       <body>
         <div class="card">
           <h1>অ্যাক্সেস ব্লক করা হয়েছে (Access Denied)</h1>
           <p>দুঃখিত, নিরাপত্তা নীতি ও সন্দেহজনক কার্যক্রম সনাক্তকরণের কারণে আপনার নেটওয়ার্ক থেকে এই ওয়েবসাইটে প্রবেশাধিকার সাময়িকভাবে স্থগিত করা হয়েছে।</p>
           <span class="ip">আপনার আইপি: ${clientIp}</span>
         </div>
       </body>
       </html>`,
      {
        status: 403,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        }
      }
    );
  }

  // Check if maintenance is enabled
  if (maintenanceConfig.enabled) {
    const isExcluded = 
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/gorto') ||
      pathname.startsWith('/api/admin') ||
      pathname.includes('.') || 
      pathname.startsWith('/_next');

    if (!isExcluded) {
      if (pathname.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Maintenance Mode',
            message: 'আমাদের নতুন মোবাইল অ্যাপ্লিকেশন তৈরির কাজ চলায় সকল এপিআই সেবা সাময়িকভাবে বন্ধ রাখা হয়েছে।'
          }),
          { 
            status: 503, 
            headers: { 
              'content-type': 'application/json; charset=utf-8' 
            } 
          }
        );
      }

      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        }
      });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
