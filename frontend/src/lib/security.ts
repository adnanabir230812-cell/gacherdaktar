import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';

// Simple in-memory rate limiter store
// Key: IP_address:type, Value: array of timestamps (ms)
const rateLimitStore = new Map<string, number[]>();

// Clean up store every 10 minutes to avoid memory leaks
if (typeof globalThis !== 'undefined') {
  const globalAny = globalThis as any;
  if (!globalAny.rateLimitInterval) {
    globalAny.rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of rateLimitStore.entries()) {
        const filtered = timestamps.filter(t => now - t < 60000); // keep only last 1 minute
        if (filtered.length === 0) {
          rateLimitStore.delete(key);
        } else {
          rateLimitStore.set(key, filtered);
        }
      }
    }, 600000); // 10 minutes
  }
}

// In-memory cache for owner/admin IP to avoid database overload
let ownerIpCache: string | null = null;
let lastOwnerCacheUpdate = 0;
const OWNER_CACHE_TTL = 30000; // 30 seconds

export async function getOwnerIp(): Promise<string | null> {
  if (!ownerIpCache || Date.now() - lastOwnerCacheUpdate > OWNER_CACHE_TTL) {
    try {
      const { data, error } = await supabaseAdmin
        .from('usage_analytics')
        .select('ip_address')
        .eq('session_id', 'SYSTEM_OWNER_IP')
        .limit(1);
      
      if (!error && data && data.length > 0) {
        ownerIpCache = data[0].ip_address;
        lastOwnerCacheUpdate = Date.now();
      }
    } catch (err) {
      console.error("Error fetching owner IP:", err);
    }
  }
  return ownerIpCache;
}

export async function isOwnerIp(ip: string): Promise<boolean> {
  const owner = await getOwnerIp();
  return owner === ip;
}

// Known bot patterns in User-Agent
const BAD_BOT_PATTERNS = [
  /python/i,
  /go-http-client/i,
  /curl/i,
  /wget/i,
  /scrapy/i,
  /postman/i,
  /headless/i,
  /selenium/i,
  /puppeteer/i,
  /node-fetch/i,
  /axios/i,
  /urllib/i,
  /httpclient/i,
  /libwww/i,
  /apachebench/i,
  /jmeter/i
];

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export interface SecurityCheckResult {
  blocked: boolean;
  reason?: string;
  response?: NextResponse;
}

export async function checkSecurity(
  request: Request,
  type: 'chat' | 'classify' | 'general'
): Promise<SecurityCheckResult> {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = getClientIp(request);

  // If request is from the registered admin/owner IP, bypass security rate limits
  const isOwner = await isOwnerIp(ip);
  if (isOwner) {
    return { blocked: false };
  }

  // 1. Block known bad bots/CLI tools
  for (const pattern of BAD_BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      console.warn(`[Security Block] Suspicious User-Agent: "${userAgent}" from IP: ${ip}`);
      return {
        blocked: true,
        reason: 'Suspicious request blocked (Bot/CLI tool)',
        response: NextResponse.json(
          { success: false, error: 'Access Denied: Suspicious activity detected.' },
          { status: 403 }
        )
      };
    }
  }

  // 2. Rate Limiting Limits
  // chat: 10 requests per minute
  // classify: 5 requests per minute
  // general: 25 requests per minute
  let limit = 25;
  if (type === 'chat') limit = 10;
  else if (type === 'classify') limit = 5;

  const now = Date.now();
  const storeKey = `${ip}:${type}`;
  const timestamps = rateLimitStore.get(storeKey) || [];
  
  // Filter out timestamps older than 60 seconds (1 minute window)
  const recentRequests = timestamps.filter(t => now - t < 60000);
  
  if (recentRequests.length >= limit) {
    console.warn(`[Security Block] Rate limit exceeded for IP: ${ip} on type: ${type}`);
    return {
      blocked: true,
      reason: 'Rate limit exceeded',
      response: NextResponse.json(
        { success: false, error: 'অনুরোধের সীমা অতিক্রম করেছে। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন।' },
        { status: 429 }
      )
    };
  }

  // Record this request timestamp
  recentRequests.push(now);
  rateLimitStore.set(storeKey, recentRequests);

  return { blocked: false };
}
