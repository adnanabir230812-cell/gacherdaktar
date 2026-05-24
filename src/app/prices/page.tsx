'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Minus, RefreshCw, ArrowLeft, Search, MapPin, Inbox, Info, BarChart2, Activity } from 'lucide-react';

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
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

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
        setSelectedCrop(data[0].crop_name);
      } else {
        // If today's prices are not found, fetch the most recent ones
        const recentQuery = supabase
          .from('market_prices')
          .select('*')
          .order('market_date', { ascending: false })
          .limit(10);
          
        const { data: recentData, error: recentError } = (await withTimeout(recentQuery as any, 2500)) as any;
        
        if (recentError) throw recentError;
        
        if (recentData && recentData.length > 0) {
          setPrices(recentData);
          setSelectedCrop(recentData[0].crop_name);
        } else {
          setPrices(FALLBACK_PRICES);
          setSelectedCrop(FALLBACK_PRICES[0].crop_name);
          handleAutoSync(); // Trigger background sync if completely empty
        }
      }
    } catch (err) {
      console.error("Error fetching market prices:", err);
      setPrices(FALLBACK_PRICES);
      setSelectedCrop(FALLBACK_PRICES[0].crop_name);
    } finally {
      setLoading(false);
    }
  };

  // Background auto-sync if DB is empty
  const handleAutoSync = async () => {
    try {
      const res = await fetch('/api/sync/prices');
      const data = await res.json();
      if (data.success) {
        const today = new Date().toISOString().split('T')[0];
        const dbQuery = supabase.from('market_prices').select('*').eq('market_date', today);
        const { data: dbData } = (await withTimeout(dbQuery as any, 2000)) as any;
        if (dbData && dbData.length > 0) {
          setPrices(dbData);
          setSelectedCrop(dbData[0].crop_name);
        }
      }
    } catch (e) {
      console.warn("Background auto-sync failed:", e);
    }
  };



  // Trigger scraper endpoint to fetch latest live prices
  const handleSyncPrices = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/sync/prices');
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

  // Get max price across all crops for chart scaling
  const maxPriceInList = Math.max(...filteredPrices.map(p => parsePrice(p.price_range)[1]), 100);

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
          </div>
        </div>

        <div className="flex items-center gap-2 self-end">
          <button
            onClick={handleSyncPrices}
            disabled={syncing}
            className="px-4 py-2.5 bg-green-primary hover:bg-green-soft text-soft-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'আপডেট হচ্ছে...' : 'লাইভ বাজার দর আপডেট'}
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

      {/* Main Grid: Left is table, Right is visual SVG chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Prices Table (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
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
                    <td colSpan={3} className="text-center py-12 text-text-secondary">
                      লোডিং বাজার দর...
                    </td>
                  </tr>
                ) : filteredPrices.length > 0 ? (
                  filteredPrices.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedCrop(item.crop_name)}
                      className={`cursor-pointer transition-colors ${
                        selectedCrop === item.crop_name 
                          ? 'bg-green-primary/10 hover:bg-green-primary/15 border-l-4 border-green-primary' 
                          : 'hover:bg-green-primary/5'
                      }`}
                    >
                      <td className="p-4 font-bold">{item.crop_name}</td>
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
                  ))
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

        {/* Selected Crop Analysis Panel (Right 1 Column) */}
        <div className="lg:col-span-1 glass-card p-6 space-y-6 flex flex-col justify-between border-2 border-green-primary/10 shadow-lg">
          {(() => {
            const currentSelectedPrice = filteredPrices.find(p => p.crop_name === selectedCrop) || filteredPrices[0];
            
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

            if (!currentSelectedPrice) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-secondary">
                  <Inbox className="w-12 h-12 text-green-primary/30 mb-2" />
                  <p className="text-sm font-semibold">কোনো ফসল সিলেক্ট করা নেই। বাম পাশের তালিকার যেকোনো ফসলে ক্লিক করুন।</p>
                </div>
              );
            }

            const analysis = getAnalysis(currentSelectedPrice.crop_name, currentSelectedPrice.price_range);
            const history = analysis.history;
            const minH = Math.min(...history);
            const maxH = Math.max(...history);
            const rangeH = maxH - minH || 1;
            const chartPoints = history.map((val, index) => {
              const x = 35 + (index / 6) * 210;
              const y = 80 - ((val - minH) / rangeH) * 55 + 10;
              return { x, y, val };
            });
            const lineChartD = `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;

            return (
              <>
                <div className="space-y-4">
                  {/* Crop Title & Badge */}
                  <div className="border-b border-green-primary/10 pb-3 flex items-center justify-between">
                    <h3 className="font-extrabold text-xl text-text-primary">
                      {currentSelectedPrice.crop_name}
                    </h3>
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

                  {/* Market Information Table */}
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

                  {/* Descriptive Market Logic */}
                  <div className="text-xs leading-relaxed text-text-secondary font-medium bg-soft-white p-4 rounded-xl border border-green-primary/5">
                    <strong className="text-text-primary block mb-1">বাজার বিশ্লেষণ ও পূর্বাভাস:</strong>
                    {analysis.reason}
                  </div>
                </div>

                {/* SVG 7-Day Line Chart */}
                <div className="space-y-2 pt-2 border-t border-green-primary/5">
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-green-primary" /> ৭ দিনের পাইকারি দরের প্রবণতা
                  </h4>
                  
                  <div className="w-full h-32 pt-2 bg-soft-white rounded-xl border border-green-primary/5 p-2 flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 280 100">
                      {/* Grid Lines */}
                      <line x1="35" y1="10" x2="245" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="35" y1="37.5" x2="245" y2="37.5" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="35" y1="65" x2="245" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="35" y1="90" x2="245" y2="90" stroke="#e2e8f0" strokeWidth="1" />

                      {/* Y labels */}
                      <text x="5" y="14" className="text-[7px] fill-text-secondary font-black">উচ্চ: {translateToBanglaDigits(maxH)}</text>
                      <text x="5" y="93" className="text-[7px] fill-text-secondary font-black">নিম্ন: {translateToBanglaDigits(minH)}</text>

                      {/* X labels */}
                      <text x="30" y="99" className="text-[6px] fill-text-secondary/70 font-black">৭ দিন আগে</text>
                      <text x="235" y="99" className="text-[6px] fill-text-secondary/70 font-black">আজ</text>

                      {/* Chart Path */}
                      <path 
                        d={lineChartD} 
                        fill="none" 
                        stroke="#16a34a" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

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
                            {translateToBanglaDigits(p.val)}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

      </div>
    </div>
  );
}

const FALLBACK_PRICES: MarketPrice[] = [
  { id: 1, crop_name: 'ব্রি ধান ২৯ (ধান)', price_range: '১,২৮০ - ১,৩৫০ ৳ / মণ', trend: 'up', change_val: '১২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 2, crop_name: 'আলু (ডায়মন্ড)', price_range: '২৮ - ৩২ ৳ / কেজি', trend: 'down', change_val: '১ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 3, crop_name: 'দেশি পেঁয়াজ', price_range: '৬৫ - ৭০ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 4, crop_name: 'কাঁচা মরিচ', price_range: '৮০ - ৯০ ৳ / কেজি', trend: 'up', change_val: '১০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 5, crop_name: 'দেশি রসুন', price_range: '১২০ - ১৩৫ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 6, crop_name: 'আদা (দেশি)', price_range: '১৮০ - ২০০ ৳ / কেজি', trend: 'up', change_val: '৮ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 7, crop_name: 'বেগুন (গোল)', price_range: '৪০ - ৪৮ ৳ / কেজি', trend: 'down', change_val: '৩ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 8, crop_name: 'টমেটো (লাল)', price_range: '৩৫ - ৪২ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 9, crop_name: 'মিষ্টি কুমড়া', price_range: '২৫ - ৩০ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 10, crop_name: 'লাল শাক', price_range: '১৫ - ২০ ৳ / আঁটি', trend: 'down', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 11, crop_name: 'পটল', price_range: '৩৫ - ৪০ ৳ / কেজি', trend: 'down', change_val: '৩ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 12, crop_name: 'মুগ ডাল (উন্নত)', price_range: '১৩৫ - ১৪৫ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] }
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
    sourceRegion: "নওগাঁ, দিনাজপুর",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৪০ - ৪৫ ৳ / কেজি",
    advisory: "ধীরে ধীরে বিক্রি করুন",
    advisoryType: "hold",
    reason: "নতুন ধান বাজারে আসার কারণে দাম বর্তমানে স্থিতিশীল। মজুত ধরে রাখলে ভবিষ্যতে ভালো লাভ হতে পারে।",
    history: [1220, 1240, 1260, 1250, 1280, 1300, 1315]
  },
  "আলু (ডায়মন্ড)": {
    sourceRegion: "মুন্সিগঞ্জ, বগুড়া",
    supplyLevel: "উচ্চ",
    retailForecast: "৩৫ - ৩৮ ৳ / কেজি",
    advisory: "দ্রুত বাজারে সরবরাহ করুন",
    advisoryType: "sell",
    reason: "কোল্ড স্টোরেজ থেকে পর্যাপ্ত সরবরাহ থাকায় দাম কমার সম্ভাবনা রয়েছে। দ্রুত বিক্রি করা লাভজনক হবে।",
    history: [34, 33, 32, 31, 31, 30, 30]
  },
  "দেশি পেঁয়াজ": {
    sourceRegion: "পাবনা, ফরিদপুর",
    supplyLevel: "স্বল্প",
    retailForecast: "৮০ - ৮৫ ৳ / কেজি",
    advisory: "মজুত ধরে রাখুন",
    advisoryType: "hold",
    reason: "বাজারে আমদানি কম থাকায় পেঁয়াজের বাজার ঊর্ধ্বমুখী। আগামী সপ্তাহে দাম আরও ৫-১০ টাকা বাড়তে পারে।",
    history: [58, 60, 62, 65, 66, 68, 67]
  },
  "কাঁচা মরিচ": {
    sourceRegion: "বগুড়া, কুষ্টিয়া",
    supplyLevel: "স্বল্প",
    retailForecast: "১২০ - ১৪০ ৳ / কেজি",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "বৃষ্টির কারণে কাঁচা মরিচের সরবরাহ হ্রাস পাওয়ায় দাম রেকর্ড পর্যায়ে উঠেছে। চড়া দামে এখনই বিক্রি করে দিন।",
    history: [65, 70, 75, 80, 85, 82, 85]
  },
  "দেশি রসুন": {
    sourceRegion: "নাটোর, রাজবাড়ী",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "১৪০ - ১৫৫ ৳ / কেজি",
    advisory: "বাজার পর্যবেক্ষণ",
    advisoryType: "monitor",
    reason: "বাজারের চাহিদা ও যোগান সমান থাকায় দাম স্থির রয়েছে। পরবর্তী দামের গতিবিধি দেখে সিদ্ধান্ত নিন।",
    history: [120, 122, 125, 125, 128, 127, 127]
  },
  "রসুন (দেশি)": {
    sourceRegion: "নাটোর, রাজবাড়ী",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "১৪০ - ১৫৫ ৳ / কেজি",
    advisory: "বাজার পর্যবেক্ষণ",
    advisoryType: "monitor",
    reason: "বাজারের চাহিদা ও যোগান সমান থাকায় দাম স্থির রয়েছে। পরবর্তী দামের গতিবিধি দেখে সিদ্ধান্ত নিন।",
    history: [120, 122, 125, 125, 128, 127, 127]
  },
  "আদা (দেশি)": {
    sourceRegion: "পার্বত্য চট্টগ্রাম, ঝিনাইদহ",
    supplyLevel: "স্বল্প",
    retailForecast: "২২০ - ২৪০ ৳ / কেজি",
    advisory: "মজুত ধরে রাখুন",
    advisoryType: "hold",
    reason: "আমদানি খরচ বাড়ার কারণে বাজারে দেশি আদার ঘাটতি রয়েছে। দাম আরও বৃদ্ধি পাওয়ার সম্ভাবনা প্রবল।",
    history: [170, 175, 180, 182, 185, 188, 190]
  },
  "বেগুন (গোল)": {
    sourceRegion: "যশোর, জামালপুর",
    supplyLevel: "উচ্চ",
    retailForecast: "৫৫ - ৬০ ৳ / কেজি",
    advisory: "নিয়মিত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "বাজারে প্রচুর নতুন বেগুন আসায় সরবরাহ বেড়েছে। চড়া রোদ থাকলে বা পচন রোধে দ্রুত বিক্রি করাই শ্রেয়।",
    history: [48, 46, 45, 43, 44, 44, 44]
  },
  "টমেটো (লাল)": {
    sourceRegion: "রাজশাহী, পঞ্চগড়",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৫০ - ৫৫ ৳ / কেজি",
    advisory: "পরিমিত বিক্রি করুন",
    advisoryType: "monitor",
    reason: "গ্রীষ্মকালীন টমেটোর ভালো ফলন ও কোল্ড চেইন না থাকায় কাছাকাছি বাজারগুলোতে সরবরাহ স্বাভাবিক রয়েছে।",
    history: [42, 40, 39, 38, 38, 38, 38]
  },
  "মিষ্টি কুমড়া": {
    sourceRegion: "রংপুর, রাজবাড়ী",
    supplyLevel: "উচ্চ",
    retailForecast: "৩৫ - ৪০ ৳ / কেজি",
    advisory: "বাজার পর্যবেক্ষণ",
    advisoryType: "monitor",
    reason: "মিষ্টি কুমড়া দীর্ঘসময় ঘরে রাখা যায় বিধায় তাড়াহুড়া না করে বাজারদর অনুযায়ী ধীরে ধীরে বিক্রি করতে পারেন।",
    history: [28, 28, 27, 27, 27, 27, 27]
  },
  "লাল শাক": {
    sourceRegion: "নরসিংদী, সাভার",
    supplyLevel: "উচ্চ",
    retailForecast: "২০ - ২৫ ৳ / আঁটি",
    advisory: "সকাল সকাল বিক্রি করুন",
    advisoryType: "sell",
    reason: "শাক জাতীয় ফসল দ্রুত পচে যায়। তাই ভোরে সংগ্রহ করে আড়তে তাজা অবস্থায় বিক্রি করে ফেলা উত্তম।",
    history: [20, 19, 18, 18, 17, 17, 17]
  },
  "পটল": {
    sourceRegion: "যশোর, কুষ্টিয়া",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৪৫ - ৫০ ৳ / কেজি",
    advisory: "নিয়মিত সরবরাহ করুন",
    advisoryType: "sell",
    reason: "পাবনা ও কুষ্টিয়ার বাজারে পটলের প্রচুর আমদানি হচ্ছে। নিয়মিতভাবে সরবরাহ করে দামের সুফল নিন।",
    history: [40, 39, 38, 37, 37, 37, 37]
  },
  "মুগ ডাল (উন্নত)": {
    sourceRegion: "পটুয়াখালী, ভোলা",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "১৫০ - ১৬০ ৳ / কেজি",
    advisory: "ধীরে ধীরে বিক্রি করুন",
    advisoryType: "hold",
    reason: "ডাল সংরক্ষণযোগ্য হওয়ায় বাজার ঊর্ধ্বমুখী হওয়ার সুযোগ নিতে পারেন। আগামী মাসে চাহিদা বৃদ্ধির সম্ভাবনা রয়েছে।",
    history: [136, 138, 140, 140, 140, 140, 140]
  }
};


