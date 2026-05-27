import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Gracefully handle missing Supabase credentials to prevent fatal crashes at runtime/build-time
const createSafeClient = (url: string, key: string, options?: any) => {
  if (!url || !key) {
    console.warn("সুপাবেস কনফিগারেশন কী অনুপস্থিত! একটি ডামি ক্লায়েন্ট ব্যবহার করা হচ্ছে।");
    return {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: null, error: new Error("Supabase credentials missing") }),
          order: () => Promise.resolve({ data: null, error: new Error("Supabase credentials missing") }),
          limit: () => Promise.resolve({ data: null, error: new Error("Supabase credentials missing") }),
        }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase credentials missing") }),
        update: () => Promise.resolve({ data: null, error: new Error("Supabase credentials missing") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Supabase credentials missing") }),
      })
    } as any;
  }
  return createClient(url, key, options);
};

// Public client for client-side interactions (respects RLS)
export const supabase = createSafeClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend tasks (e.g., automated crawlers that bypass RLS)
export const supabaseAdmin = createSafeClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

