import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import maintenanceConfig from './config/maintenance.json';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if maintenance is enabled
  if (maintenanceConfig.enabled) {
    // Exclude:
    // - /maintenance (avoid infinite loop)
    // - /gorto (admin UI)
    // - /api/admin (admin API requests)
    // - static files and public assets
    // - _next internals
    const isExcluded = 
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/gorto') ||
      pathname.startsWith('/api/admin') ||
      pathname.includes('.') || 
      pathname.startsWith('/_next');

    if (!isExcluded) {
      // If it is an API route, return JSON response
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

      // Otherwise, rewrite to maintenance page
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
