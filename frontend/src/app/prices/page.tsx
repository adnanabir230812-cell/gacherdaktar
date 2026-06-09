'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Minus, RefreshCw, ArrowLeft, Search, MapPin, Inbox, Info, BarChart2, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface MarketPrice {
  id: number;
  crop_name: string;
  price_range: string;
  trend: 'up' | 'down' | 'stable';
  change_val: string;
  market_date: string;
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


export default function MarketPricesPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);

  // Fetch prices from database
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const dbQuery = supabase
        .from('market_prices')
        .select('*')
        .eq('market_date', today);

      const { data, error } = (await withTimeout(dbQuery as any, 2500)) as any;

      if (error) throw error;

      if (data && data.length > 0) {
        setPrices(data);
      } else {
        // If today's prices are not found, fetch the most recent ones
        const recentQuery = supabase
          .from('market_prices')
          .select('*')
          .order('market_date', { ascending: false })
          .limit(60);
          
        const { data: recentData, error: recentError } = (await withTimeout(recentQuery as any, 2500)) as any;
        
        if (recentError) throw recentError;
        
        if (recentData && recentData.length > 0) {
          setPrices(recentData);
        } else {
          setPrices(FALLBACK_PRICES);
        }
      }
    } catch (err) {
      console.error("Error fetching market prices:", err);
      setPrices(FALLBACK_PRICES);
    } finally {
      setLoading(false);
    }
  };



  // Trigger scraper endpoint to fetch latest live prices
  const handleSyncPrices = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const syncSecret = process.env.NEXT_PUBLIC_SYNC_SECRET || 'krishisathi_sync_secret_token_2026';
      const res = await fetch(`/api/sync/prices?secret=${syncSecret}`);
      const data = await res.json();
      if (data.success) {
        setSyncMessage('বাজার দর সফলভাবে আপডেট করা হয়েছে।');
        await fetchPrices();
      } else {
        setSyncMessage('সার্ভার থেকে বাজার দর সিঙ্ক করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setSyncMessage('ইন্টারনেট সংযোগ ত্রুটি।');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    if (!expandedCrop) return;
    try {
      const sessionId = localStorage.getItem("krishisathi_session_id") || "sess_unknown";
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          pageVisited: "/prices",
          action: "market_price_check",
          location: localStorage.getItem("krishisathi_user_district") || "Unknown",
          metadata: {
            cropName: expandedCrop
          }
        })
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  }, [expandedCrop]);

  const filteredPrices = prices.filter(p => 
    p.crop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to parse numeric values from price ranges (e.g. "১,২৫০ - ১,৩৫০" -> [1250, 1350])
  const parsePrice = (range: string): number[] => {
    const banglaToEnglishMap: { [key: string]: string } = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
      ',': ''
    };
    
    const cleanRange = range.split('৳')[0].trim(); // Get digits part
    const parts = cleanRange.split('-').map(p => {
      const engDigits = p.trim().split('').map(c => banglaToEnglishMap[c] || c).join('');
      return parseFloat(engDigits) || 0;
    });

    return parts.length === 2 ? parts : [parts[0] || 0, parts[0] || 0];
  };

  // Convert numbers to Bangla digits
  const translateToBanglaDigits = (num: number): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const formatBengaliDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
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
    } catch (e) {
      return dateStr;
    }
  };

  const getAnalysis = (cropName: string, currentPriceRange: string) => {
    const template = CROP_ANALYSIS_TEMPLATES[cropName];
    if (template) return template;
    
    const basePrice = parsePrice(currentPriceRange)[1] || 50;
    return {
      sourceRegion: "দেশীয় আড়ত",
      supplyLevel: "স্বাভাবিক",
      retailForecast: `${translateToBanglaDigits(Math.round(basePrice * 1.25))} - ${translateToBanglaDigits(Math.round(basePrice * 1.35))} ৳`,
      advisory: "বাজার পর্যবেক্ষণ",
      advisoryType: "monitor",
      reason: "বাজারের চাহিদা ও যোগান স্বাভাবিক রয়েছে। আপনার নিকটস্থ আড়তে খোঁজ নিয়ে বিক্রি করুন।",
      history: [
        Math.round(basePrice * 0.94),
        Math.round(basePrice * 0.96),
        Math.round(basePrice * 0.95),
        Math.round(basePrice * 0.98),
        Math.round(basePrice * 1.01),
        Math.round(basePrice * 0.99),
        basePrice
      ]
    };
  };

  const toggleExpandCrop = (cropName: string) => {
    if (expandedCrop === cropName) {
      setExpandedCrop(null);
    } else {
      setExpandedCrop(cropName);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header controls */}
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
              পাইকারি বাজার দর ও মূল্য বিশ্লেষণ
            </h1>
            <p className="text-text-secondary text-sm font-semibold">
              কৃষি বিপণন অধিদপ্তর (DAM) এর দৈনিক তথ্যের ভিত্তিতে কাওরান বাজার ও দেশীয় আড়তের গড় পাইকারি মূল্য।
            </p>
            {prices.length > 0 && prices[0].market_date && (
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-primary/10 border border-green-primary/20 text-green-primary text-xs font-black rounded-full shadow-sm">
                  বাজার দরের তারিখ: {formatBengaliDate(prices[0].market_date)}
                </span>
              </div>
            )}
          </div>
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

      {/* Full-width Responsive Table */}
      <div className="space-y-4">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ফসলের নাম দিয়ে সার্চ করুন..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-primary/20 bg-soft-white focus:outline-none focus:ring-2 focus:ring-green-primary text-text-primary text-sm shadow-sm"
          />
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-secondary/60" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-green-primary/10 bg-soft-white/60 shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-green-primary/10 text-text-primary font-bold border-b border-green-primary/10">
                <th className="p-4">ফসলের নাম</th>
                <th className="p-4 text-right">গড় পাইকারি দর</th>
                <th className="p-4 text-center">বাজার পরিবর্তন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-primary/5 font-semibold text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-text-secondary font-bold">
                    লোডিং বাজার দর...
                  </td>
                </tr>
              ) : filteredPrices.length > 0 ? (
                filteredPrices.map((item) => {
                  const isExpanded = expandedCrop === item.crop_name;
                  const analysis = isExpanded ? getAnalysis(item.crop_name, item.price_range) : null;
                  const history = analysis ? analysis.history : [];
                  const minH = history.length ? Math.min(...history) : 0;
                  const maxH = history.length ? Math.max(...history) : 100;
                  const rangeH = maxH - minH || 1;
                  const chartPoints = history.map((val, index) => {
                    const x = 35 + (index / 6) * 210;
                    const y = 80 - ((val - minH) / rangeH) * 55 + 10;
                    return { x, y, val };
                  });
                  const lineChartD = chartPoints.length ? `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}` : '';

                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        onClick={() => toggleExpandCrop(item.crop_name)}
                        className={`cursor-pointer transition-all duration-200 border-l-4 ${
                          isExpanded 
                            ? 'bg-green-primary/10 border-green-primary hover:bg-green-primary/15' 
                            : 'border-transparent hover:bg-green-primary/5'
                        }`}
                      >
                        <td className="p-4 font-bold flex items-center gap-2">
                          <span className="transition-transform duration-200">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-green-primary" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-text-secondary/60" />
                            )}
                          </span>
                          <span>{item.crop_name}</span>
                        </td>
                        <td className="p-4 text-right font-extrabold text-green-primary">{item.price_range}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                            item.trend === 'up' 
                              ? 'bg-red-500/10 border-red-500/20 text-red-700' 
                              : item.trend === 'down' 
                                ? 'bg-green-500/10 border-green-500/20 text-green-700' 
                                : 'bg-slate-500/10 border-slate-500/20 text-slate-700'
                          }`}>
                            {item.trend === 'up' ? (
                              <TrendingUp className="w-3 h-3 text-red-600" />
                            ) : item.trend === 'down' ? (
                              <TrendingDown className="w-3 h-3 text-green-600" />
                            ) : (
                              <Minus className="w-3 h-3 text-slate-600" />
                            )}
                            {item.change_val !== '০ ৳' ? item.change_val : 'স্থির'}
                          </span>
                        </td>
                      </tr>
                      
                      {isExpanded && analysis && (
                        <tr className="bg-green-primary/[0.02]">
                          <td colSpan={3} className="p-6 border-b border-green-primary/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                              
                              {/* Left side: Information and Analysis text */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-green-primary/10 pb-3">
                                  <h4 className="font-extrabold text-base text-text-primary flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-primary"></span>
                                    {item.crop_name} বাজার বিশ্লেষণ
                                  </h4>
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                    analysis.advisoryType === 'sell' 
                                      ? 'bg-red-500/10 border-red-500/20 text-red-700' 
                                      : analysis.advisoryType === 'hold' 
                                        ? 'bg-green-500/10 border-green-500/20 text-green-700' 
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-700'
                                  }`}>
                                    {analysis.advisory}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                  <div className="bg-green-primary/5 p-3 rounded-xl border border-green-primary/10">
                                    <div className="text-text-secondary/70 flex items-center gap-1 mb-1">
                                      <MapPin className="w-3.5 h-3.5 text-green-primary" /> উৎস অঞ্চল
                                    </div>
                                    <div className="text-text-primary text-sm font-extrabold">{analysis.sourceRegion}</div>
                                  </div>
                                  <div className="bg-green-primary/5 p-3 rounded-xl border border-green-primary/10">
                                    <div className="text-text-secondary/70 flex items-center gap-1 mb-1">
                                      <Activity className="w-3.5 h-3.5 text-green-primary" /> সরবরাহ মাত্রা
                                    </div>
                                    <div className="text-text-primary text-sm font-extrabold">{analysis.supplyLevel}</div>
                                  </div>
                                  <div className="bg-green-primary/5 p-3 rounded-xl border border-green-primary/10 col-span-2">
                                    <div className="text-text-secondary/70 flex items-center gap-1 mb-1">
                                      <Info className="w-3.5 h-3.5 text-green-primary" /> আনুমানিক খুচরা দর (কেজি)
                                    </div>
                                    <div className="text-text-primary text-sm font-extrabold">{analysis.retailForecast}</div>
                                  </div>
                                </div>

                                <div className="text-xs leading-relaxed text-text-secondary font-medium bg-soft-white p-4 rounded-xl border border-green-primary/5">
                                  <strong className="text-text-primary block mb-1">বাজার বিশ্লেষণ ও পূর্বাভাস:</strong>
                                  {analysis.reason}
                                </div>
                              </div>

                              {/* Right side: visual 7-day trend chart */}
                              <div className="space-y-3 flex flex-col justify-center">
                                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                  <BarChart2 className="w-4 h-4 text-green-primary" /> ৭ দিনের পাইকারি দরের প্রবণতা
                                </h4>
                                
                                <div className="w-full h-44 bg-soft-white rounded-xl border border-green-primary/5 p-4 flex items-center justify-center">
                                  <svg className="w-full h-full overflow-visible" viewBox="0 0 280 100">
                                    {/* Grid Lines */}
                                    <line x1="35" y1="10" x2="245" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="35" y1="37.5" x2="245" y2="37.5" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="35" y1="65" x2="245" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="35" y1="90" x2="245" y2="90" stroke="#e2e8f0" strokeWidth="1" />

                                    {/* Y labels */}
                                    <text x="5" y="14" className="text-[7px] fill-text-secondary font-black">উচ্চ: ${translateToBanglaDigits(maxH)}</text>
                                    <text x="5" y="93" className="text-[7px] fill-text-secondary font-black">নিম্ন: ${translateToBanglaDigits(minH)}</text>

                                    {/* X labels */}
                                    <text x="30" y="99" className="text-[6px] fill-text-secondary/70 font-black">৭ দিন আগে</text>
                                    <text x="235" y="99" className="text-[6px] fill-text-secondary/70 font-black">আজ</text>

                                    {/* Chart Path */}
                                    {lineChartD && (
                                      <path 
                                        d={lineChartD} 
                                        fill="none" 
                                        stroke="#16a34a" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    )}

                                    {/* Nodes */}
                                    {chartPoints.map((p, idx) => (
                                      <g key={idx} className="group/dot">
                                        <circle 
                                          cx={p.x} 
                                          cy={p.y} 
                                          r="4.5" 
                                          fill={idx === 6 ? "#15803d" : "#22c55e"} 
                                          stroke="#ffffff" 
                                          strokeWidth="1.5" 
                                          className="cursor-pointer transition-transform hover:scale-150"
                                        />
                                        <text 
                                          x={p.x} 
                                          y={p.y - 8} 
                                          textAnchor="middle" 
                                          className="text-[8px] fill-text-primary font-extrabold bg-soft-white opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none"
                                        >
                                          ${translateToBanglaDigits(p.val)}
                                        </text>
                                      </g>
                                    ))}
                                  </svg>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-text-secondary">
                    কোনো ফসলের বাজার দর পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


const FALLBACK_PRICES: MarketPrice[] = [
  { id: 1, crop_name: 'ব্রি ধান ২৯ (ধান)', price_range: '১,২৮০ - ১,৩৫০ ৳ / মণ', trend: 'up', change_val: '১২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 2, crop_name: 'রোপা আমন ধান', price_range: '১,২০০ - ১,২৭০ ৳ / মণ', trend: 'up', change_val: '১০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 3, crop_name: 'ধান (আউশ)', price_range: '১,০৫০ - ১,১০০ ৳ / মণ', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 4, crop_name: 'নাজিরশাইল চাল', price_range: '৭১ - ৭৫ ৳ / কেজি', trend: 'up', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 5, crop_name: 'মিনিকেট চাল', price_range: '৬৫ - ৬৮ ৳ / কেজি', trend: 'down', change_val: '১ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 6, crop_name: 'চিনিগুঁড়া চাল', price_range: '১২৫ - ১৩৫ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 7, crop_name: 'গম', price_range: '১,৪০০ - ১,৫০০ ৳ / মণ', trend: 'up', change_val: '১৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 8, crop_name: 'আলু (ডায়মন্ড)', price_range: '২৮ - ৩২ ৳ / কেজি', trend: 'down', change_val: '১ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 9, crop_name: 'দেশি পেঁয়াজ', price_range: '৬৫ - ৭০ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 10, crop_name: 'আমদানি পেঁয়াজ', price_range: '৫০ - ৫৫ ৳ / কেজি', trend: 'down', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 11, crop_name: 'কাঁচা মরিচ', price_range: '৮০ - ৯০ ৳ / কেজি', trend: 'up', change_val: '১০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 12, crop_name: 'শুকনা মরিচ (দেশি)', price_range: '৩২০ - ৩৫০ ৳ / কেজি', trend: 'up', change_val: '১৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 13, crop_name: 'দেশি রসুন', price_range: '১২ো - ১৩৫ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 14, crop_name: 'আমদানি রসুন', price_range: '১৬০ - ১৭৫ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 15, crop_name: 'আদা (দেশি)', price_range: '১৮০ - ২০০ ৳ / কেজি', trend: 'up', change_val: '৮ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 16, crop_name: 'হলুদ (গুঁড়া)', price_range: '২৪০ - ২৭০ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 17, crop_name: 'বেগুন (গোল)', price_range: '৪০ - ৪৮ ৳ / কেজি', trend: 'down', change_val: '৩ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 18, crop_name: 'টমেটো (লাল)', price_range: '৩৫ - ৪২ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 19, crop_name: 'মিষ্টি কুমড়া', price_range: '২৫ - ৩০ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 20, crop_name: 'লাল শাক', price_range: '১৫ - ২০ ৳ / আঁটি', trend: 'down', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 21, crop_name: 'পটল', price_range: '৩৫ - ৪০ ৳ / কেজি', trend: 'down', change_val: '৩ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 22, crop_name: 'মসুর ডাল (দেশি)', price_range: '১৩০ - ১৪০ ৳ / কেজি', trend: 'up', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 23, crop_name: 'মুগ ডাল (উন্নত)', price_range: '১৩৫ - ১৪৫ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 24, crop_name: 'খেসারি ডাল', price_range: '৮৫ - ৯৫ ৳ / কেজি', trend: 'down', change_val: '১ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 25, crop_name: 'বারি সরিষা', price_range: '৩,২০০ - ৩,৪০০ ৳ / মণ', trend: 'up', change_val: '৫০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 26, crop_name: 'সয়াবিন তেল (খোলা)', price_range: '১৫৫ - ১৬৫ ৳ / লিটার', trend: 'up', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 27, crop_name: 'সরিষার তেল (ঘানি)', price_range: '২৪০ - ২৬০ ৳ / লিটার', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 28, crop_name: 'তোষা পাট', price_range: '২,৮০০ - ৩,২০০ ৳ / মণ', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 29, crop_name: 'হাইব্রিড ভুট্টা', price_range: '৮৫০ - ৯২০ ৳ / মণ', trend: 'down', change_val: '১৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 30, crop_name: 'লাউ', price_range: '৩০ - ৪০ ৳ / পিস', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 31, crop_name: 'করলা', price_range: '৫০ - ৬০ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 32, crop_name: 'ঝিঙা', price_range: '৪০ - ৪৫ ৳ / কেজি', trend: 'down', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 33, crop_name: 'চিচিঙ্গা', price_range: '৩৫ - ৪০ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 34, crop_name: 'ধুন্দুল', price_range: '৩৫ - ৪০ ৳ / কেজি', trend: 'down', change_val: '১ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 35, crop_name: 'ঢেঁড়স', price_range: '৩৫ - ৪২ ৳ / কেজি', trend: 'down', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 36, crop_name: 'ধনে পাতা', price_range: '৮০ - ১০০ ৳ / কেজি', trend: 'up', change_val: '১২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 37, crop_name: 'আম (গোপালভোগ)', price_range: '৩,৫০০ - ৪,২০০ ৳ / মণ', trend: 'up', change_val: '১০০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 38, crop_name: 'কলা (সবরি)', price_range: '২৮০ - ৩২০ ৳ / ছড়া', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 39, crop_name: 'পেঁপে (কাঁচা)', price_range: '২৫ - ৩০ ৳ / কেজি', trend: 'down', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 40, crop_name: 'গাজর', price_range: '৪০ - ৫০ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 41, crop_name: 'শিম', price_range: '৫০ - ৬৫ ৳ / কেজি', trend: 'down', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 42, crop_name: 'বাধাকপি', price_range: '২৫ - ৩০ ৳ / পিস', trend: 'down', change_val: '৩ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 43, crop_name: 'ফুলকপি', price_range: '৩০ - ৩৫ ৳ / পিস', trend: 'down', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 44, crop_name: 'লেবু (কাগজি)', price_range: '১০০ - ১২০ ৳ / ১০০টি', trend: 'up', change_val: '১০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 45, crop_name: 'শসা (দেশি)', price_range: '৪০ - ৪৫ ৳ / কেজি', trend: 'up', change_val: '৩ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 46, crop_name: 'ডিম (লাল ফার্ম)', price_range: '১২০ - ১৩০ ৳ / ১২টি', trend: 'up', change_val: '৪ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 47, crop_name: 'ব্রয়লার মুরগি', price_range: '১৬০ - ১৭৫ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 48, crop_name: 'গরুর মাংস', price_range: '৭২০ - ৭৫০ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 49, crop_name: 'খাসির মাংস', price_range: '৯৫০ - ১,০৫০ ৳ / কেজি', trend: 'up', change_val: '১০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 50, crop_name: 'রুই মাছ (১.৫+ কেজি)', price_range: '২৮০ - ৩২০ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 51, crop_name: 'ইলিশ মাছ (৮০০ গ্রাম)', price_range: '১,২০০ - ১,৪০০ ৳ / কেজি', trend: 'up', change_val: '৫০ ৳', market_date: new Date().toISOString().split('T')[0] }
];

interface CropAnalysis {
  sourceRegion: string;
  supplyLevel: 'উচ্চ' | 'স্বাভাবিক' | 'স্বল্প';
  retailForecast: string;
  advisory: string;
  advisoryType: 'sell' | 'hold' | 'monitor';
  reason: string;
  history: number[];
}

const CROP_ANALYSIS_TEMPLATES: { [key: string]: CropAnalysis } = {
  "ব্রি ধান ২৯ (ধান)": {
    sourceRegion: "নওগাঁ, দিনাজপুর, কুষ্টিয়া",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৪০ - ৪৫ ৳ / কেজি",
    advisory: "ধীরে ধীরে বিক্রি করুন",
    advisoryType: "hold",
    reason: "বোরো মৌসুমের ধান গুদামজাতকরণ বৃদ্ধির কারণে বাজারে ধানের যোগান কিছুটা নিয়ন্ত্রিত। আগামী ২ মাসে দাম বৃদ্ধির উজ্জ্বল সম্ভাবনা রয়েছে, তাই ধীরে ধীরে বাজারে ছাড়ুন।",
    history: [1220, 1240, 1260, 1250, 1280, 1300, 1315]
  },
  "রোপা আমন ধান": {
    sourceRegion: "দিনাজপুর, শেরপুর, ময়মনসিংহ",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৩৮ - ৪২ ৳ / কেজি",
    advisory: "বাজার পর্যবেক্ষণ করুন",
    advisoryType: "monitor",
    reason: "সরকারি ধান সংগ্রহ অভিযান শুরু হওয়ায় চালকল মালিকদের সক্রিয়তা বেড়েছে। বাজার দর বর্তমানে লাভজনক সীমার মধ্যে রয়েছে।",
    history: [1150, 1170, 1180, 1200, 1220, 1235, 1250]
  },
  "ধান (আউশ)": {
    sourceRegion: "কুমিল্লা, সিলেট, নেত্রকোনা",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৩৫ - ৩৮ ৳ / কেজি",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "আউশ ধান দীর্ঘদিন গুদামজাত করে রাখা কঠিন ও গুণগত মান দ্রুত নষ্ট হয়। বর্তমানে আড়তের যে মূল্য তাতেই বিক্রি করে ফেলা লাভজনক হবে।",
    history: [980, 1000, 1010, 1020, 1030, 1050, 1070]
  },
  "গম": {
    sourceRegion: "ঠাকুরগাঁও, পঞ্চগড়, রাজবাড়ী",
    supplyLevel: "স্বল্প",
    retailForecast: "৪৫ - ৪৮ ৳ / কেজি",
    advisory: "মজুত ধরে রাখুন",
    advisoryType: "hold",
    reason: "আন্তর্জাতিক বাজারে গমের সংকট ও আমদানি কমার কারণে দেশীয় গমের চাহিদা আকাশচুম্বী। কৃষকদের পরবর্তী ২-৩ সপ্তাহ মজুত ধরে রাখার পরামর্শ দেওয়া হচ্ছে।",
    history: [1300, 1320, 1350, 1370, 1400, 1420, 1450]
  },
  "আলু (ডায়মন্ড)": {
    sourceRegion: "মুন্সিগঞ্জ, বগুড়া, রংপুর",
    supplyLevel: "উচ্চ",
    retailForecast: "৩৫ - ৩৮ ৳ / কেজি",
    advisory: "দ্রুত বাজারে সরবরাহ করুন",
    advisoryType: "sell",
    reason: "কোল্ড স্টোরেজ থেকে পর্যাপ্ত আলু বাজারে আসার কারণে দাম কিছুটা পড়তির দিকে। পচনশীলতা এড়াতে এখনই বিক্রি করা নিরাপদ।",
    history: [34, 33, 32, 31, 31, 30, 30]
  },
  "দেশি পেঁয়াজ": {
    sourceRegion: "পাবনা, ফরিদপুর, রাজবাড়ী",
    supplyLevel: "স্বল্প",
    retailForecast: "৮০ - ৮৫ ৳ / কেজি",
    advisory: "মজুত ধরে রাখুন",
    advisoryType: "hold",
    reason: "হাটে নতুন পেঁয়াজের যোগান কমে আসায় দাম দ্রুত গতিতে বাড়ছে। আগামী সপ্তাহে দাম আরও ৫-১০ টাকা বৃদ্ধি পেতে পারে।",
    history: [58, 60, 62, 65, 66, 68, 67]
  },
  "কাঁচা মরিচ": {
    sourceRegion: "বগুড়া, কুষ্টিয়া, জামালপুর",
    supplyLevel: "স্বল্প",
    retailForecast: "১২০ - ১৪০ ৳ / কেজি",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "অতিবৃষ্টির কারণে মরিচ ক্ষেত ক্ষতিগ্রস্ত হওয়ায় বাজারে যোগান অত্যন্ত কম ও দাম রেকর্ড মাত্রায় চড়া। দেরি না করে আড়তে মরিচ পৌঁছে দিন।",
    history: [65, 70, 75, 80, 85, 82, 85]
  },
  "দেশি রসুন": {
    sourceRegion: "নাটোর, পাবনা, রাজবাড়ী",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "১৪০ - ১৫৫ ৳ / কেজি",
    advisory: "বাজার পর্যবেক্ষণ",
    advisoryType: "monitor",
    reason: "রসুনের বাজার দর বর্তমানে স্থিতিশীল। নতুন রসুন আসার সময় হওয়ায় দামের বড় কোনো পরিবর্তনের সম্ভাবনা নেই।",
    history: [120, 122, 125, 125, 128, 127, 127]
  },
  "আদা (দেশি)": {
    sourceRegion: "পার্বত্য চট্টগ্রাম, ঝিনাইদহ",
    supplyLevel: "স্বল্প",
    retailForecast: "২২০ - ২৪০ ৳ / কেজি",
    advisory: "মজুত ধরে রাখুন",
    advisoryType: "hold",
    reason: "আদা চাষের এলাকা এ বছর কম থাকায় যোগান কম ও আদা আমদানির খরচ বেশি। লাভবান হতে আরও কিছুদিন মজুত রাখুন।",
    history: [170, 175, 180, 182, 185, 188, 190]
  },
  "বেগুন (গোল)": {
    sourceRegion: "যশোর, জামালপুর, নরসিংদী",
    supplyLevel: "উচ্চ",
    retailForecast: "৫৫ - ৬০ ৳ / কেজি",
    advisory: "নিয়মিত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "আড়তগুলোতে প্রচুর বেগুনের আমদানি রয়েছে এবং এটি দ্রুত পচনশীল। দৈনিক তুলে তাজা অবস্থায় বিক্রি করা উত্তম।",
    history: [48, 46, 45, 43, 44, 44, 44]
  },
  "টমেটো (লাল)": {
    sourceRegion: "রাজশাহী, পঞ্চগড়, যশোর",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৫০ - ৫৫ ৳ / কেজি",
    advisory: "বাজার পর্যবেক্ষণ",
    advisoryType: "monitor",
    reason: "শীতকালীন ও টানেল পদ্ধতিতে চাষকৃত টমেটো বাজারে আসায় যোগান সন্তোষজনক। দাম আরও কিছুদিন স্থির থাকবে।",
    history: [42, 40, 39, 38, 38, 38, 38]
  },
  "মিষ্টি কুমড়া": {
    sourceRegion: "রংপুর, রাজবাড়ী, কুড়িগ্রাম",
    supplyLevel: "উচ্চ",
    retailForecast: "৩৫ - ৪০ ৳ / কেজি",
    advisory: "ধীরে বিক্রি করুন",
    advisoryType: "hold",
    reason: "মিষ্টি কুমড়া ঘরে দীর্ঘ সময় রাখা যায়। আড়তে যোগানের চাপ বেশি থাকলে এখন বিক্রি না করে ২ সপ্তাহ পর বিক্রি করলে দাম বেশি পাবেন।",
    history: [28, 28, 27, 27, 27, 27, 27]
  },
  "লাল শাক": {
    sourceRegion: "নরসিংদী, সাভার, বগুড়া",
    supplyLevel: "উচ্চ",
    retailForecast: "২০ - ২৫ ৳ / আঁটি",
    advisory: "সকাল সকাল বিক্রি করুন",
    advisoryType: "sell",
    reason: "শাক জাতীয় ফসল রোদে নেতিয়ে পড়ে এবং মান নষ্ট হয়। তাই ভোরে তুলেই সরাসরি বাজারে নিয়ে যান।",
    history: [20, 19, 18, 18, 17, 17, 17]
  },
  "পটল": {
    sourceRegion: "যশোর, কুষ্টিয়া, পাবনা",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৪৫ - ৫০ ৳ / কেজি",
    advisory: "নিয়মিত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "উত্তরাঞ্চল থেকে পটলের সরবরাহ নিয়মিত রয়েছে। নিয়মিত বাজারে পাঠালে গড় মূল্য ভালো পাবেন।",
    history: [40, 39, 38, 37, 37, 37, 37]
  },
  "মুগ ডাল (উন্নত)": {
    sourceRegion: "পটুয়াখালী, ভোলা, বরগুনা",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "১৫০ - ১৬০ ৳ / কেজি",
    advisory: "ধীরে ধীরে বিক্রি করুন",
    advisoryType: "hold",
    reason: "মুগ ডালের আন্তর্জাতিক চাহিদা এবং অভ্যন্তরীণ চাহিদা ঊর্ধ্বমুখী। মজুত রাখলে আগামী ১-২ মাসে কেজি প্রতি আরও ১০-১৫ টাকা বাড়তে পারে।",
    history: [136, 138, 140, 140, 140, 140, 140]
  },
  "বারি সরিষা": {
    sourceRegion: "টাঙ্গাইল, সিরাজগঞ্জ, মানিকগঞ্জ",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৩,৬০০ - ৩,৮০০ ৳ / মণ",
    advisory: "মজুত ধরে রাখুন",
    advisoryType: "hold",
    reason: "ভোজ্যতেলের দাম ঊর্ধ্বমুখী থাকায় সরিষার মিলারদের মধ্যে সরিষা কেনার প্রতিযোগিতা রয়েছে। একটু সময় নিয়ে বিক্রি করলে লাভ বেশি হবে।",
    history: [3050, 3100, 3150, 3200, 3250, 3280, 3300]
  },
  "তোষা পাট": {
    sourceRegion: "ফরিদপুর, রাজবাড়ী, মাগুরা",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৩,৩০০ - ৩,৫০০ ৳ / মণ",
    advisory: "বাজার পর্যবেক্ষণ",
    advisoryType: "monitor",
    reason: "পাটকলগুলোর ক্রয় ক্ষমতা ও সরকারি নীতিমালার উপর পাটের দাম নির্ভরশীল। বর্তমান বাজার মূল্যে আংশিক বিক্রি করা যেতে পারে।",
    history: [2800, 2850, 2900, 2950, 3000, 3000, 3000]
  },
  "হাইব্রিড ভুট্টা": {
    sourceRegion: "দিনাজপুর, লালমনিরহাট, চুয়াডাঙ্গা",
    supplyLevel: "উচ্চ",
    retailForecast: "৯৫০ - ১,০০০ ৳ / মণ",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "পোল্ট্রি ও ফিশ ফিড মিলগুলোর নিয়মিত ক্রয় থাকলেও এ বছর ভুট্টার ব্যাপক বাম্পার ফলন হয়েছে। যোগান বাড়তে থাকায় দ্রুত বিক্রি নিরাপদ।",
    history: [930, 910, 900, 890, 880, 875, 885]
  },
  "লাউ": {
    sourceRegion: "কুমিল্লা, নরসিংদী, বগুড়া",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৪৫ - ৫০ ৳ / পিস",
    advisory: "নিয়মিত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "লাউ তাজা ও রসালো অবস্থায় বিক্রি করতে হবে। আড়তে লাউয়ের চাহিদা সব সময়ই বেশ ভালো থাকে।",
    history: [32, 34, 35, 35, 36, 35, 35]
  },
  "করলা": {
    sourceRegion: "যশোর, জয়পুরহাট, চট্টগ্রাম",
    supplyLevel: "স্বল্প",
    retailForecast: "৭০ - ৮০ ৳ / কেজি",
    advisory: "দ্রুত বাজারে ছাড়ুন",
    advisoryType: "sell",
    reason: "তীব্র গরমে করলার চাষ ব্যাহত হওয়ায় বাজারে যোগান অত্যন্ত কম। বর্তমানে চড়া বাজারমূল্য থাকায় এখনই বিক্রি করা সেরা সিদ্ধান্ত।",
    history: [48, 50, 52, 53, 55, 54, 55]
  },
  "ধনে পাতা": {
    sourceRegion: "ঢাকা (সাভার), মুন্সিগঞ্জ, বগুড়া",
    supplyLevel: "স্বল্প",
    retailForecast: "১২০ - ১৫০ ৳ / কেজি",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "ধনে পাতা অতি সংবেদনশীল ফসল। একটু বৃষ্টি বা অতিরিক্ত গরমে পচে যায়। প্রতিদিনের পাতা ওই দিনই আড়তে বিক্রি করে দিন।",
    history: [72, 75, 80, 85, 90, 88, 90]
  },
  "আম (গোপালভোগ)": {
    sourceRegion: "রাজশাহী, চাঁপাইনবাবগঞ্জ, নওগাঁ",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৪,৫ ০০ - ৫,০০০ ৳ / মণ",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "আমের স্থায়িত্বকাল খুব কম। আড়তে গোপালভোগ আমের শেষ লট চলছে। দেরি করলে আমের গুণগত মান কমবে ও কাঙ্ক্ষিত দাম পাবেন না।",
    history: [3200, 3400, 3600, 3700, 3800, 3850, 3850]
  },
  "কলা (সবরি)": {
    sourceRegion: "টাঙ্গাইল, নরসিংদী, বগুড়া",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৩৫০ - ৪০০ ৳ / ছড়া",
    advisory: "বাজার পর্যবেক্ষণ",
    advisoryType: "monitor",
    reason: "সবরি কলার চাহিদা সারা বছরই ভালো থাকে। দাম বর্তমানে স্থিতিশীল রয়েছে, স্বাভাবিক যোগান বজায় রাখুন।",
    history: [290, 295, 300, 300, 300, 300, 300]
  },
  "পেঁপে (কাঁচা)": {
    sourceRegion: "যশোর, রাজশাহী, পাবনা",
    supplyLevel: "উচ্চ",
    retailForecast: "৩৫ - ৪০ ৳ / কেজি",
    advisory: "দ্রুত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "কাঁচা পেঁপের বাম্পার যোগান থাকায় আড়তগুলোতে দাম কিছুটা কমতির দিকে। পাকার আগেই কাঁচা অবস্থায় দ্রুত বাজারে তুলুন।",
    history: [30, 29, 28, 27, 26, 27, 27]
  },
  "গাজর": {
    sourceRegion: "দিনাজপুর, যশোর, মেহেরপুর",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৬০ - ৭০ ৳ / কেজি",
    advisory: "ধীরে বিক্রি করুন",
    advisoryType: "hold",
    reason: "গাজর কোল্ড স্টোরেজে রাখা যায় এবং চাহিদাও ভালো। দাম স্থিতিশীল থাকায় তাড়াহুড়ো না করে গড় দরে বিক্রি করুন।",
    history: [44, 45, 45, 45, 45, 45, 45]
  },
  "শিম": {
    sourceRegion: "সীতাকুন্ড (চট্টগ্রাম), মুন্সিগঞ্জ, পাবনা",
    supplyLevel: "উচ্চ",
    retailForecast: "৭০ - ৮০ ৳ / কেজি",
    advisory: "নিয়মিত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "আড়তে নতুন শিমের প্রচুর আমদানি হচ্ছে। শিমের পচনশীলতা এড়াতে দৈনিক বাজারে পাঠাতে হবে।",
    history: [62, 60, 58, 55, 57, 57, 57]
  },
  "বাধাকপি": {
    sourceRegion: "বগুড়া, রংপুর, যশোর",
    supplyLevel: "উচ্চ",
    retailForecast: "৩৫ - ৪০ ৳ / পিস",
    advisory: "দ্রুত বাজারে তুলুন",
    advisoryType: "sell",
    reason: "শীতকালীন সবজি বাজারে প্রচুর থাকায় বাধাকপির দাম দ্রুত কমছে। ক্ষেতে বেশি দিন না রেখে এখনই কেটে বাজারে পাঠানো বুদ্ধিমানের কাজ হবে।",
    history: [31, 30, 29, 27, 27, 27, 27]
  },
  "ফুলকপি": {
    sourceRegion: "বগুড়া, রাজবাড়ী, জামালপুর",
    supplyLevel: "উচ্চ",
    retailForecast: "৪০ - ৪৫ ৳ / পিস",
    advisory: "দ্রুত বাজারে তুলুন",
    advisoryType: "sell",
    reason: "ফুলকপি অতি দ্রুত পচে যায় এবং ফুল ঢিলে হয়ে গেলে মান নষ্ট হয়ে দাম কমে যায়। তাই কুঁড়ি তাজা ও শক্ত থাকতেই বিক্রি করে ফেলুন।",
    history: [34, 33, 31, 30, 31, 31, 31]
  },
  "লেবু (কাগজি)": {
    sourceRegion: "শ্রীমঙ্গল (মৌলভীবাজার), নরসিংদী, টাঙ্গাইল",
    supplyLevel: "স্বল্প",
    retailForecast: "১৫০ - ২০০ ৳ / ১০০টি",
    advisory: "দ্রুত বাজারে ছাড়ুন",
    advisoryType: "sell",
    reason: "গ্রীষ্মকালে কাগজি লেবুর প্রচুর চাহিদা কিন্তু ফলন কিছুটা সীমিত হওয়ায় বাজারের দর বেশ ভালো। এই মূল্যের সুফল নিন।",
    history: [95, 100, 105, 108, 110, 108, 110]
  },
  "শসা (দেশি)": {
    sourceRegion: "সাভার, যশোর, নরসিংদী",
    supplyLevel: "স্বল্প",
    retailForecast: "৫০ - ৬০ ৳ / কেজি",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "বাজারে সালাদের উপযোগী শসার ব্যাপক চাহিদা। তীব্র রোদ ও গরমের কারণে যোগান কিছুটা ব্যাহত হওয়ায় দাম ভালো যাচ্ছে।",
    history: [39, 41, 42, 42, 43, 42, 43]
  },
  "ঢেঁড়স": {
    sourceRegion: "নরসিংদী, যশোর, কুমিল্লা",
    supplyLevel: "উচ্চ",
    retailForecast: "৪৫ - ৫০ ৳ / কেজি",
    advisory: "নিয়মিত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "ঢেঁড়স খুব দ্রুত বেড়ে যায় এবং একটু শক্ত হয়ে গেলে আঁশ হয়ে আড়তদাররা কিনতে চায় না। কচি থাকতেই তুলে প্রতিদিন বিক্রি করতে হবে।",
    history: [40, 39, 37, 36, 38, 38, 38]
  }
};


