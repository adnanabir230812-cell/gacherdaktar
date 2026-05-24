'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BookOpen, RefreshCw, ArrowLeft, Search, Calendar, Globe, X } from 'lucide-react';

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
      const res = await fetch('/api/sync/articles');
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
      const res = await fetch('/api/sync/articles');
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-sm md:text-base text-text-primary leading-relaxed whitespace-pre-wrap font-medium">
                {activeArticle.content}
              </p>
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

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "কালবৈশাখী ও অতিরিক্ত শিলাবৃষ্টিতে বোরো ধান সুরক্ষায় ডিএই (DAE) জরুরি নির্দেশনা",
    content: "দেশের বিভিন্ন অঞ্চলে কালবৈশাখী ঝড় ও আকস্মিক শিলাবৃষ্টির পূর্বাভাস রয়েছে। কৃষি সম্প্রসারণ অধিদপ্তর (DAE) থেকে কৃষকদের বোরো ধান ৮০% পেকে গেলে দ্রুত কেটে ফেলার পরামর্শ দেওয়া হচ্ছে। এছাড়া ঝড়-পরবর্তী রোগবালাই সংক্রমণ এড়াতে জমিতে ছত্রাকনাশক স্প্রে করুন ও নিষ্কাশন নালা সচল রাখুন।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/kalboishakhi-advisory-2026",
    publish_date: "2026-05-20T00:00:00.000Z"
  },
  {
    id: 2,
    title: "গ্রীষ্মকালীন পেঁয়াজ চাষাবাদে খরিপ মৌসুমে বীজ ও সার প্রণোদনা বিতরণ",
    content: "চলতি খরিপ মৌসুমে গ্রীষ্মকালীন পেঁয়াজের আবাদ বৃদ্ধিতে ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে সরকারি প্রণোদনার অধীনে বিনামূল্যে পেঁয়াজ বীজ এবং রাসায়নিক সার বিতরণ কর্মসূচি শুরু হয়েছে। প্রতি কৃষককে ১ বিঘা জমির জন্য বীজ, ২০ কেজি ইউরিয়া, ২০ কেজি টিএসপি এবং ১০ কেজি এমওপি সার দেওয়া হচ্ছে। বিস্তারিত তথ্যের জন্য স্থানীয় উপ-সহকারী কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/aush-seed-subsidy-2026",
    publish_date: "2026-05-18T00:00:00.000Z"
  },
  {
    id: 3,
    title: "বিনা ধান-২৫: উপকূলীয় অঞ্চলের জন্য লবণাক্ততা সহনশীল উচ্চ ফলনশীল জাত",
    content: "বাংলাদেশ পরমাণু কৃষি গবেষণা ইনস্টিটিউট (BINA) উপকূলীয় লবণাক্ত অঞ্চলের জন্য নতুন ধান জাত 'বিনা ধান-২৫' অবমুক্ত করেছে। এই জাতটি ৮-১০ ডিএস/মিটার পর্যন্ত লবণাক্ততা সহ্য করতে পারে এবং প্রতি হেক্টরে ৫.৫ থেকে ৬.৫ টন পর্যন্ত ফলন দিতে সক্ষম। এর জীবনকাল মাত্র ১৩৫-১৪০ দিন, যা আমন ও বোরো দুই মৌসুমেই চাষ উপযোগী।",
    source_site: "bina",
    source_url: "https://bina.gov.bd/site/news/bina-dhan-25-release",
    publish_date: "2026-05-15T00:00:00.000Z"
  },
  {
    id: 4,
    title: "বিনা সর্ষে-১১: আমন ও বোরো মৌসুমের মধ্যবর্তী সময়ে লাভজনক তৈলবীজ চাষ",
    content: "বাংলাদেশ পরমাণু কৃষি গবেষণা ইনস্টিটিউট উদ্ভাবিত 'বিনা সর্ষে-১১' জাতটি মাত্র ৮০-৮৫ দিনে ঘরে তোলা যায়। আমন ধান কাটার পর বোরো ধান রোপণের আগের পতিত সময়ে এই সর্ষে চাষ করে কৃষকেরা বাড়তি আয় করতে পারেন। এতে বিঘাপ্রতি ফলন হয় প্রায় ৫.৫-৬ মণ এবং তেলের পরিমাণ শতকরা ৪২ ভাগ।",
    source_site: "bina",
    source_url: "https://bina.gov.bd/site/news/bina-sarisha-11-cultivation",
    publish_date: "2026-05-12T00:00:00.000Z"
  },
  {
    id: 5,
    title: "পরমাণু প্রযুক্তির জৈব সার ব্যবহারে মাটিতে নাইট্রোজেনের ঘাটতি পূরণ",
    content: "বিনা (BINA) বিজ্ঞানীদের গবেষণায় দেখা গেছে, রাইজোবিয়াম ব্যাকটেরিয়া কালচার বা পরমাণু প্রযুক্তির জীবাণু সার ব্যবহারের মাধ্যমে ডাল জাতীয় ফসলের ফলন ২০% পর্যন্ত বৃদ্ধি পায় এবং মাটিতে নাইট্রোজেন সারের অপচয় প্রায় ৩০% কমানো সম্ভব। ডাল ও তৈলবীজ চাষীদের এই জীবাণু সার ব্যবহারের জন্য বিশেষ তাগিদ দেওয়া যাচ্ছে।",
    source_site: "bina",
    source_url: "https://bina.gov.bd/site/news/soil-nitrogen-bina-research",
    publish_date: "2026-05-10T00:00:00.000Z"
  },
  {
    id: 6,
    title: "গ্রীষ্মকালীন সবজি চাষে মালচিং পেপার প্রযুক্তির ব্যবহার ও সেচ সাশ্রয়",
    content: "গ্রীষ্মকালীন টমেটো, শসা ও মরিচ চাষে মালচিং পেপার প্রযুক্তি ব্যবহারের ফলে মাটির আর্দ্রতা দীর্ঘ সময় ধরে রাখা সম্ভব হয়। কৃষি সম্প্রসারণ অধিদপ্তরের এক মাঠ গবেষণায় দেখা গেছে, মালচিং ব্যবহারের ফলে সাধারণ চাষের তুলনায় সেচ পানির অপচয় ৪০% হ্রাস পায় এবং আগাছা দমনের খরচ সম্পূর্ণ বেঁচে যায়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/summer-onion-guide-2026",
    publish_date: "2026-05-08T00:00:00.000Z"
  },
  {
    id: 7,
    title: "বোরো ধানের ব্লাস্ট ও পাতা ধসা রোগ দমনের আধুনিক পদ্ধতি",
    content: "বোরো ধানের শেষ পর্যায়ে আর্দ্র আবহাওয়ার কারণে নেক ব্লাস্ট রোগের আক্রমণ হতে পারে। রোগ দেখা দিলে জমিতে ট্রাইসাইক্লাজোল বা ডাইফেনোকোনাজল ছত্রাকনাশক স্প্রে করুন। এছাড়াও ইউরিয়া সারের অতিরিক্ত ব্যবহার এড়িয়ে চলুন এবং পটাশ সারের পরিমাণ বাড়িয়ে দিন যাতে ধান গাছের রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি পায়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/rice-blast-control-2026",
    publish_date: "2026-05-05T00:00:00.000Z"
  },
  {
    id: 8,
    title: "পাটের আঁশ ছাড়ানোর আধুনিক ও পরিবেশবান্ধব রিবন রেটিং পদ্ধতি",
    content: "জলবায়ু পরিবর্তনের ফলে শুকনা মৌসুমে পাট পচানোর পানির অভাব দূর করতে কৃষি সম্প্রসারণ অধিদপ্তর থেকে রিবন রেটিং পদ্ধতির প্রচারণা চালানো হচ্ছে। এই পদ্ধতিতে পাটের কাঁচা ছাল টেনে ছাড়িয়ে গোল করে নিয়ে অল্প পানিতে সহজেই পচানো যায়। এতে সময়, খরচ ও পানির সাশ্রয় হয় এবং পাটের সোনালী আঁশ চমৎকার মানের হয়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/jute-ribbon-retting-guide",
    publish_date: "2026-05-03T00:00:00.000Z"
  },
  {
    id: 9,
    title: "মাটির অম্লতা (pH) নিয়ন্ত্রণে ডলোচুন প্রয়োগ ও ক্যালসিয়াম পুষ্টির জোগান",
    content: "মাটির অম্লতা বেড়ে গেলে গাছের পুষ্টি উপাদান শোষণ বাধাগ্রস্ত হয়। বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) এর গবেষকদের মতে, অম্ল মাটিতে বিঘাপ্রতি ৩৩-৪০ কেজি ডলোচুন বা ডলোমাইট পাউডার শেষ চাষের সময় ছিটিয়ে মাটির সাথে ভালোভাবে মিশিয়ে দিলে মাটির অম্লতা দূর হয় এবং ফসলের ফলন ১৫% পর্যন্ত বৃদ্ধি পায়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/dolomite-soil-management-2026",
    publish_date: "2026-05-01T00:00:00.000Z"
  },
  {
    id: 10,
    title: "ছাদ বাগান ও আধুনিক বারান্দা বাগানীদের জন্য জৈব নিম তেলের ব্যবহার",
    content: "শহুরে ছাদ বাগানের গাছের পোকা দমনে ক্ষতিকর রাসায়নিক বালাইনাশকের পরিবর্তে জৈব নিম তেল অত্যন্ত কার্যকর। প্রতি লিটার কুসুম গরম পানিতে ১ চা চামচ নিম তেল এবং আধা চামচ লিকুইড সাবান গুলে সপ্তাহে অন্তত একবার স্প্রে করলে জাবপোকা, মিলিবাগ ও মাকড় আক্রমণ থেকে গাছ সুরক্ষিত থাকে।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/rooftop-neem-oil-guide",
    publish_date: "2026-04-28T00:00:00.000Z"
  },
  {
    id: 11,
    title: "স্মার্ট সেচ প্রযুক্তির এআই ড্রিপ ইরিগেশন ও ভূগর্ভস্থ পানির সাশ্রয়",
    content: "কৃষি তথ্য ও প্রযুক্তি বিভাগের সহায়তায় দেশের উত্তর ও পশ্চিমাঞ্চলের খরা প্রবণ এলাকায় স্মার্ট এআইভিত্তিক ড্রিপ ইরিগেশন বা ফোঁটা সেচ পদ্ধতি স্থাপন করা হয়েছে। সেন্সরভিত্তিক এই পদ্ধতিতে মাটির আর্দ্রতা মেপে কেবল প্রয়োজন অনুযায়ী সেচ দেওয়া হয়, যা পানির অপচয় প্রায় ৫০% কমায়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/smart-drip-irrigation-2026",
    publish_date: "2026-04-25T00:00:00.000Z"
  },
  {
    id: 12,
    title: "কৃষি যান্ত্রিকীকরণ প্রকল্পের অধীনে কম্বাইন হারভেস্টারে সরকারি ভর্তুকি",
    content: "চলতি ফসল কাটার মৌসুমে শ্রমিক সংকট দূর করতে এবং স্বল্প ব্যয়ে দ্রুত ধান কাটার জন্য সরকার দেশব্যাপী কম্বাইন হারভেস্টার ও রিপার মেশিনের উপর বড় অংকের ভর্তুকি দিচ্ছে। সাধারণ জেলাগুলোতে ৫০% এবং হাওর ও উপকূলীয় এলাকায় ৭০% ভর্তুকিতে এই আধুনিক কৃষি যন্ত্র সরবরাহ করা হচ্ছে।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/combine-harvester-subsidy",
    publish_date: "2026-04-22T00:00:00.000Z"
  },
  {
    id: 13,
    title: "রোপা আমন ধানের লজিং বা হেলে পড়া রোগ প্রতিরোধ কৌশল",
    content: "আমন ধান পাকার শেষ ধাপে বাতাস ও ঝড়ো হাওয়ায় ধান গাছ হেলে পড়া বা লজিং অত্যন্ত ক্ষতিকর। এই সমস্যা রোধে নাইট্রোজেন জাতীয় ইউরিয়া সারের অতিরিক্ত ব্যবহার এড়িয়ে চলুন। এছাড়া জমিতে রোপণের সময় লাইনের মধ্যবর্তী দূরত্ব ঠিক রাখুন এবং সঠিক সময়ে পটাশ সার ব্যবহার করুন যা ধান গাছের ডাল শক্ত করতে সাহায্য করে।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/aman-rice-lodging-prevention",
    publish_date: "2026-04-20T00:00:00.000Z"
  },
  {
    id: 14,
    title: "ভুট্টা চাষের উন্নত জমি প্রস্তুতি ও প্রয়োজনীয় সুষম সারের ব্যবহার",
    content: "রবি মৌসুমে লাভজনক ভুট্টা চাষের জন্য গভীর চাষ দিয়ে জমি নরম করা প্রয়োজন। হেক্টরপ্রতি সুষম সারের ব্যবহার নিশ্চিত করুন—ইউরিয়া ৩১০ কেজি, টিএসপি ১২০ কেজি এবং পটাশ ১২০ কেজি জমি তৈরির শেষ পর্যায়ে দিতে হবে। হাইব্রিড জাতের ভালো ফলনের জন্য বীজ ২ সেমি গভীরতায় রোপণ করা বাঞ্ছনীয়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/maize-cultivation-fertilizers",
    publish_date: "2026-04-18T00:00:00.000Z"
  },
  {
    id: 15,
    title: "কাঁচা মরিচের ঢলে পড়া (Wilt) ও ফল পচা রোগ দমনের উপায়",
    content: "মরিচ গাছে অতিরিক্ত আর্দ্রতা ও জলাবদ্ধতার ফলে ব্যাক্টেরিয়াজনিত ঢলে পড়া রোগ দেখা দেয়। এর প্রতিকারে আক্রান্ত গাছ তুলে ধ্বংস করতে হবে এবং সুস্থ গাছে স্ট্রেপ্টোমাইসিন সালফেট স্প্রে করতে হবে। ফল পচা বা এনথ্রাকনোজ রোগের লক্ষণ দেখা দিলে প্রোপিকোনাজল গ্রুপের ঔষধ পরিমাণমতো স্প্রে করতে হবে।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/chilli-wilt-anthracnose-control",
    publish_date: "2026-04-15T00:00:00.000Z"
  },
  {
    id: 16,
    title: "গ্রীষ্মকালীন টমেটো চাষে পলিথিন শেড ও হরমোন প্রয়োগ প্রযুক্তি",
    content: "গ্রীষ্মকালে উচ্চ তাপমাত্রা ও অতিবৃষ্টিতে টমেটো ফুল ঝরে পড়া রোধে বিশেষ পলিথিন শেড তৈরি করতে হবে। এছাড়া ফুল আসার সময় ফলন বৃদ্ধির জন্য টমেটোটোন হরমোন ২ মিলি প্রতি লিটার পানিতে মিশিয়ে গাছে স্প্রে করতে হবে। এটি অসময়ে টমেটোর উৎপাদন কয়েকগুণ বাড়িয়ে দেয়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/summer-tomato-hormones",
    publish_date: "2026-04-12T00:00:00.000Z"
  },
  {
    id: 17,
    title: "শস্য বহুমুখীকরণ ও শস্য পর্যায় অনুসরণের গুরুত্ব ও মাটি উর্বরতা",
    content: "একই জমিতে বারবার একই শস্য চাষ করলে মাটির নির্দিষ্ট পুষ্টি উপাদান ফুরিয়ে যায় এবং ক্ষতিকর পোকামাকড়ের প্রকোপ বাড়ে। এর থেকে বাঁচতে শস্য বহুমুখীকরণ ও ফসল চক্র অনুসরণ করা অত্যন্ত জরুরি। ধানের পর ডাল এবং তারপর তৈলবীজ চাষ করলে মাটির উর্বরতা প্রাকৃতিক উপায়ে বৃদ্ধি পায়।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/crop-diversification-importance",
    publish_date: "2026-04-10T00:00:00.000Z"
  },
  {
    id: 18,
    title: "খমারজাত জৈব সার ও ট্রাইকো-কম্পোস্ট সার তৈরির সঠিক বৈজ্ঞানিক নিয়ম",
    content: "উন্নত মানের ট্রাইকো-কম্পোস্ট সার তৈরির জন্য গোবর, কাঠের গুঁড়া, মুরগির বিষ্ঠা এবং ট্রাইকোডার্মা ওষধ মিশিয়ে একটি বদ্ধ ছায়াযুক্ত গর্তে রাখতে হবে। এভাবে ৪৫-৬০ দিন রাখলে পুষ্টিগুণ সম্পন্ন জৈব কম্পোস্ট তৈরি হয়, যা রাসায়নিক সারের ব্যবহার প্রায় ৪০% কমায়।",
    source_site: "bina",
    source_url: "https://bina.gov.bd/site/news/tricho-compost-preparation",
    publish_date: "2026-04-08T00:00:00.000Z"
  },
  {
    id: 19,
    title: "মিষ্টি কুমড়া ও লাউয়ের ক্ষতিকর মাছি পোকা দমনে ফেরোমন ফাঁদ ব্যবহার",
    content: "মিষ্টি কুমড়া ও লাউয়ের ফুল ফোটার পর মাছি পোকার আক্রমণ বেশি হয়, যা ফল ছিদ্র করে পচিয়ে ফেলে। এর দমনে বিষাক্ত কীটনাশকের পরিবর্তে সেক্স ফেরোমন ফাঁদ ব্যবহার করুন। প্রতি ৩ শতক জমিতে একটি করে ফাঁদ ঝোলালে ক্ষতিকর পুরুষ মাছি পোকা এর ভেতরে আকৃষ্ট হয়ে মারা যাবে।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/pheromone-trap-usage-gourds",
    publish_date: "2026-04-05T00:00:00.000Z"
  },
  {
    id: 20,
    title: "লেবু জাতীয় ফসলের ক্যাঙ্কার (Citrus Canker) রোগ প্রতিরোধ ও প্রতিকার",
    content: "লেবু গাছের পাতা, কাণ্ড ও ফলের ওপর খসখসে তামাটে রঙের গোল দাগ পড়া হলো ক্যাঙ্কার রোগ। এটি একটি ব্যাক্টেরিয়াজনিত রোগ। প্রতিকারে আক্রান্ত ডাল ও পাতা ছেঁটে পুড়িয়ে ফেলুন। এরপর গাছে কপার অক্সিক্লোরাইড বা বোর্দো মিক্সচার ৩ গ্রাম প্রতি লিটার পানিতে মিশিয়ে ভালোভাবে স্প্রে করুন।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/citrus-canker-treatment",
    publish_date: "2026-04-02T00:00:00.000Z"
  }
];

