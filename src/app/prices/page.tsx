'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Minus, RefreshCw, ArrowLeft, Search } from 'lucide-react';

interface MarketPrice {
  id: number;
  crop_name: string;
  price_range: string;
  trend: 'up' | 'down' | 'stable';
  change_val: string;
  market_date: string;
}

export default function MarketPricesPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  // Fetch prices from database
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('market_date', today);

      if (error) throw error;

      if (data && data.length > 0) {
        setPrices(data);
      } else {
        // If today's prices are not found, fetch the most recent ones
        const { data: recentData, error: recentError } = await supabase
          .from('market_prices')
          .select('*')
          .order('market_date', { ascending: false })
          .limit(10);
          
        if (recentError) throw recentError;
        setPrices(recentData || []);
      }
    } catch (err) {
      console.error("Error fetching market prices:", err);
    } finally {
      setLoading(false);
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
                    <tr key={item.id} className="hover:bg-green-primary/5 transition-colors">
                      <td className="p-4">{item.crop_name}</td>
                      <td className="p-4 text-right font-bold text-green-primary">{item.price_range}</td>
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

        {/* SVG Pricing Analytics Chart (Right 1 Column) */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
              মূল্য সূচক ও তুলনা (কেজি/মণ প্রতি দর)
            </h3>
            <p className="text-xs text-text-secondary">
              আজকের বাজারের সর্বোচ্চ দামের তুলনামূলক চিত্র (উচ্চ কনট্রাস্ট ভিউ):
            </p>
          </div>

          <div className="w-full flex-1 flex items-end gap-3 h-56 pt-6 px-2">
            {!loading && filteredPrices.length > 0 ? (
              filteredPrices.slice(0, 5).map((item, idx) => {
                const prices = parsePrice(item.price_range);
                const maxVal = prices[1] || 1;
                // Height percentage for bar chart scaling
                const heightPercent = Math.max(Math.min((maxVal / maxPriceInList) * 100, 100), 10);
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-full bg-green-primary/5 rounded-t-lg relative h-full flex items-end overflow-hidden border border-green-primary/10">
                      <div 
                        className="w-full bg-gradient-to-t from-green-primary to-green-soft rounded-t-md transition-all duration-700" 
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-text-primary text-soft-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-bold">
                          {translateToBanglaDigits(maxVal)} ৳
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary truncate w-full text-center" title={item.crop_name}>
                      {item.crop_name.split(' ')[0]}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">
                চার্ট লোড সম্ভব নয়
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-green-primary/5 text-[10px] text-text-secondary/70 font-semibold mt-4">
            * কাওরান বাজার আড়তের সর্বোচ্চ মূল্যের ভিত্তিতে চার্টটি ফিল্টার করা হয়েছে।
          </div>
        </div>

      </div>
    </div>
  );
}
