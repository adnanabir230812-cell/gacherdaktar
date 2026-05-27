'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BookOpen, RefreshCw, ArrowLeft, Search, Calendar, Globe, X } from 'lucide-react';
import FALLBACK_ARTICLES from '@/data/fallback_articles.json';


interface Article {
  id: number;
  title: string;
  content: string;
  source_site: 'dae' | 'bina' | string;
  source_url: string;
  publish_date: string;
}
// Timeout helper to avoid infinite loading states in the browser
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database query timed out")), timeoutMs)
    )
  ]);
}




// Helper to format structured agricultural guides into premium book-like layouts
const renderFormattedContent = (content: string) => {
  return content.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('১. ') || trimmed.startsWith('২. ') || trimmed.startsWith('৩. ') || trimmed.startsWith('৪. ') || trimmed.startsWith('৫. ')) {
      return (
        <h3 key={idx} className="text-lg font-black text-green-primary mt-6 mb-2 border-b border-green-primary/10 pb-1 flex items-center gap-2">
          {trimmed}
        </h3>
      );
    }
    if (trimmed.startsWith('- ')) {
      return (
        <li key={idx} className="ml-4 list-disc text-sm text-text-primary/90 py-1 font-semibold">
          {trimmed.substring(2)}
        </li>
      );
    }
    if (trimmed === '') {
      return <div key={idx} className="h-2" />;
    }
    return (
      <p key={idx} className="text-sm md:text-base text-text-primary/80 leading-relaxed mb-2 font-medium">
        {trimmed}
      </p>
    );
  });
};

export default function ArticlesPage() {

  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [syncMessage, setSyncMessage] = useState('');

  // Fetch articles from Supabase
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const dbQuery = supabase
        .from('articles')
        .select('*')
        .order('publish_date', { ascending: false });

      const { data, error } = (await withTimeout(dbQuery as any, 2500)) as any;

      if (error) throw error;
      
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(FALLBACK_ARTICLES);
        handleAutoSync(); // Trigger background sync if empty
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setArticles(FALLBACK_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  // Background auto-sync if DB is empty
  const handleAutoSync = async () => {
    try {
      const syncSecret = process.env.NEXT_PUBLIC_SYNC_SECRET || 'krishisathi_sync_secret_token_2026';
      const res = await fetch(`/api/sync/articles?secret=${syncSecret}`);
      const data = await res.json();
      if (data.success) {
        const dbQuery = supabase.from('articles').select('*').order('publish_date', { ascending: false });
        const { data: dbData } = (await withTimeout(dbQuery as any, 2000)) as any;
        if (dbData && dbData.length > 0) {
          setArticles(dbData);
        }
      }
    } catch (e) {
      console.warn("Background auto-sync failed:", e);
    }
  };



  // Sync latest updates from official sites
  const handleSyncArticles = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const syncSecret = process.env.NEXT_PUBLIC_SYNC_SECRET || 'krishisathi_sync_secret_token_2026';
      const res = await fetch(`/api/sync/articles?secret=${syncSecret}`);
      const data = await res.json();
      if (data.success) {
        setSyncMessage('তথ্য ভান্ডারের খবর সফলভাবে আপডেট করা হয়েছে।');
        await fetchArticles();
      } else {
        setSyncMessage('সার্ভার থেকে নোটিশ সিঙ্ক করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setSyncMessage('ইন্টারনেট সংযোগ ত্রুটি।');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date in Bengali
  const formatBengaliDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const translate = (val: string | number) => 
      String(val).split('').map(char => englishToBanglaMap[char] || char).join('');

    return `${translate(day)} ${month}, ${translate(year)}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-green-primary/10 pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-green-primary/10 rounded-full transition-colors text-text-secondary cursor-pointer"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">
              কৃষি তথ্য ভান্ডার
            </h1>
            <p className="text-text-secondary text-sm font-semibold">
              কৃষি সম্প্রসারণ অধিদপ্তর (DAE) ও পরমাণু কৃষি গবেষণা ইনস্টিটিউট (BINA) এর নোটিশ বোর্ড এবং সর্বশেষ খবর।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end">
          <button
            onClick={handleSyncArticles}
            disabled={syncing}
            className="px-4 py-2.5 bg-green-primary hover:bg-green-soft text-soft-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'আপডেট হচ্ছে...' : 'নোটিশ বোর্ড সিঙ্ক করুন'}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className={`p-4 rounded-xl border text-sm font-bold text-center animate-fade-in ${
          syncMessage.includes('সফল') 
            ? 'bg-green-500/10 border-green-500/30 text-green-700' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-700'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="নিউজ বা আর্টিকেলের বিষয় দিয়ে সার্চ করুন..."
          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-green-primary/20 bg-soft-white focus:outline-none focus:ring-2 focus:ring-green-primary text-text-primary text-sm shadow-sm"
        />
        <Search className="absolute left-3.5 top-4 w-4.5 h-4.5 text-text-secondary/60" />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-reveal scroll-reveal-grid">
        {loading ? (
          <div className="col-span-full text-center py-20 text-text-secondary">
            তথ্য ভান্ডার লোড হচ্ছে...
          </div>
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map(art => (
            <div 
              key={art.id}
              onClick={() => setActiveArticle(art)}
              className="glass-card p-6 cursor-pointer hover:border-green-primary/30 transition-all flex flex-col justify-between h-64 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                    art.source_site === 'dae' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-800'
                  }`}>
                    {art.source_site === 'dae' ? 'কৃষি অধিদপ্তর (DAE)' : 'পরমাণু কৃষি (BINA)'}
                  </span>
                  
                  <span className="flex items-center gap-1 text-[10px] text-text-secondary font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatBengaliDate(art.publish_date)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-text-primary group-hover:text-green-primary transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                  {art.content}
                </p>
              </div>

              <div className="text-xs font-bold text-green-primary group-hover:underline pt-4 border-t border-green-primary/5 flex items-center gap-1">
                বিস্তারিত পড়তে ক্লিক করুন →
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-text-secondary">
            দুঃখিত, কোনো আর্টিকেল বা নোটিশ পাওয়া যায়নি।
          </div>
        )}
      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">আর্টিকেল বা কোনো নির্দিষ্ট রোগবালাই নিয়ে আরও তথ্য চান?</h4>
          <p className="text-xs text-text-secondary font-bold">গাছের ডাক্তারকে সরাসরি প্রশ্ন লিখে পাঠান এবং সাথে সাথে সমাধান পান।</p>
        </div>
        <button 
          onClick={() => router.push('/chat')}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারকে প্রশ্ন করুন →
        </button>
      </div>

      {/* Details Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-2xl bg-soft-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative border border-green-primary/10">
            {/* Close Button */}
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute right-4 top-4 p-2 hover:bg-green-primary/10 rounded-full transition-colors cursor-pointer text-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Source and Date Header */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-text-secondary border-b border-green-primary/5 pb-4 pr-8">
              <span className={`px-2.5 py-1 rounded-full border ${
                activeArticle.source_site === 'dae' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-800'
              }`}>
                {activeArticle.source_site === 'dae' ? 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE)' : 'পরমাণু কৃষি গবেষণা ইনস্টিটিউট (BINA)'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-green-primary" />
                প্রকাশকাল: {formatBengaliDate(activeArticle.publish_date)}
              </span>
            </div>

            {/* Title & Body */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-text-primary leading-snug">
                {activeArticle.title}
              </h2>
              <div className="space-y-2 mt-4 text-text-primary">
                {renderFormattedContent(activeArticle.content)}
              </div>
            </div>

            {/* Link Footer */}
            <div className="pt-6 border-t border-green-primary/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <span className="text-xs font-bold text-text-secondary">
                উৎস: {activeArticle.source_site === 'dae' ? 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE)' : 'পরমাণু কৃষি গবেষণা ইনস্টিটিউট (BINA)'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveArticle(null);
                    router.push(`/chat?q=${encodeURIComponent(`${activeArticle.title} সম্পর্কে আরও বলুন`)}`);
                  }}
                  className="px-5 py-3 bg-green-primary hover:bg-green-soft text-soft-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer text-center"
                >
                  গাছের ডাক্তারের পরামর্শ নিন
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-3 border border-green-primary/20 text-green-primary hover:bg-green-primary/5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



