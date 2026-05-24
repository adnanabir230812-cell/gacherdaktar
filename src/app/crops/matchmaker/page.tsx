'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, HelpCircle, CheckCircle, TrendingUp, Info } from 'lucide-react';

interface Recommendation {
  crop_name: string;
  yield_avg_bn: string;
  profit_avg_bn: string;
  suitability: string;
  reason: string;
}

export default function SoilCropMatchmaker() {
  const router = useRouter();
  const [district, setDistrict] = useState<string>('ঢাকা');
  const [soilType, setSoilType] = useState<string>('loam'); // loam, sandy, clay, red
  const [season, setSeason] = useState<string>('robi'); // robi, kharif1, kharif2
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);

  // Fetch districts for dynamic dropdown
  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setDistrictsList(data))
      .catch(err => console.error(err));
  }, []);

  // Run matching logic
  useEffect(() => {
    let list: Recommendation[] = [];

    if (soilType === 'loam') { // দোআঁশ
      if (season === 'robi') {
        list = [
          { crop_name: "দেশি পেঁয়াজ", yield_avg_bn: "৪.৫ টন/হেক্টর", profit_avg_bn: "৩৫,০০০ ৳/বিঘা", suitability: "শতকরা ৯৫ ভাগ", reason: "দোআঁশ মাটিতে পেঁয়াজের বাল্ব দ্রুত বৃদ্ধি পায় এবং শীতকালীন ঠান্ডা আবহাওয়া পেঁয়াজ উৎপাদনে সর্বোচ্চ সহায়ক।" },
          { crop_name: "আলু (ডায়মন্ড)", yield_avg_bn: "২৫.২ টন/হেক্টর", profit_avg_bn: "২৮,০০০ ৳/বিঘা", suitability: "শতকরা ৯০ ভাগ", reason: "দোআঁশ মাটির আলগা গঠন আলুর টিউমার প্রসারণে অত্যন্ত উপযোগী। সেচ নিষ্কাশন সহজ হওয়ায় রোগবালাই কম হয়।" },
          { crop_name: "সর্ষে (বিনা সর্ষে-১১)", yield_avg_bn: "১.৮ টন/হেক্টর", profit_avg_bn: "১৫,০০০ ৳/বিঘা", suitability: "শতকরা ৮৫ ভাগ", reason: "শীতকালের জন্য আদর্শ মধ্যবর্তী ফসল। উর্বর দোআঁশ মাটিতে কম সেচে সর্ষে চাষ করে ভালো ফলন ও তেল পাওয়া যায়।" }
        ];
      } else if (season === 'kharif1') {
        list = [
          { crop_name: "কাঁচা মরিচ", yield_avg_bn: "৫.২ টন/হেক্টর", profit_avg_bn: "৪৫,০০০ ৳/বিঘা", suitability: "শতকরা ৯০ ভাগ", reason: "গ্রীষ্মকালীন অতিরিক্ত আর্দ্রতায় দোআঁশ মাটিতে মরিচের গাছের বৃদ্ধি দ্রুত হয়। পর্যাপ্ত নিষ্কাশন প্রয়োজন।" },
          { crop_name: "মিষ্টি কুমড়া", yield_avg_bn: "১২.০ টন/হেক্টর", profit_avg_bn: "২০,০০০ ৳/বিঘা", suitability: "শতকরা ৮৫ ভাগ", reason: "দোআঁশ মাটির পুষ্টি উপাদান কুমড়ার লতা ছড়াতে ও ফল পুষ্ট করতে সাহায্য করে।" }
        ];
      } else { // kharif2
        list = [
          { crop_name: "রোপা আমন ধান", yield_avg_bn: "৪.৫ টন/হেক্টর", profit_avg_bn: "১২,০০০ ৳/বিঘা", suitability: "শতকরা ৯৮ ভাগ", reason: "বর্ষাকালীন বৃষ্টির পানি ধরে রাখা ও দোআঁশ মাটির প্রাকৃতিক পুষ্টি আমন ধানের জন্য নিখুঁত পরিবেশ তৈরি করে।" }
        ];
      }
    } else if (soilType === 'sandy') { // বেলে দোআঁশ
      list = [
        { crop_name: "আলু (ডায়মন্ড)", yield_avg_bn: "২৪.০ টন/হেক্টর", profit_avg_bn: "২৬,০০০ ৳/বিঘা", suitability: "শতকরা ৯২ ভাগ", reason: "বেলে দোআঁশ মাটির আলগা গঠন টিউবার গঠনের জন্য চমৎকার। তবে পর্যাপ্ত সেচ ও পটাশ সার প্রয়োজন।" },
        { crop_name: "মিষ্টি আলু", yield_avg_bn: "১৮.৫ টন/হেক্টর", profit_avg_bn: "২২,০০০ ৳/বিঘা", suitability: "শতকরা ৮৮ ভাগ", reason: "বেলে মাটিতে মিষ্টি আলু ভালো বাড়ে। কম উর্বর মাটিতেও এটি চমৎকার ফলন দিতে পারে।" }
      ];
    } else if (soilType === 'clay') { // এটেল
      list = [
        { crop_name: "বোরো ধান (ব্রি ধান ২৯)", yield_avg_bn: "৬.২ টন/হেক্টর", profit_avg_bn: "১৫,০০০ ৳/বিঘা", suitability: "শতকরা ৯৬ ভাগ", reason: "এটেল মাটির পানি ধারণ ক্ষমতা সর্বোচ্চ। বোরো ধান চাষের জন্য কাদা মাটি ও постоян সেচ অপরিহার্য।" },
        { crop_name: "পাট (দেশি)", yield_avg_bn: "৩.০ টন/হেক্টর", profit_avg_bn: "১৮,০০০ ৳/বিঘা", suitability: "শতকরা ৯০ ভাগ", reason: "এটেল ও এটেল-দোআঁশ মাটিতে পাটের আঁশ দীর্ঘ ও মজবুত হয়। জলমগ্নতা সহনশীল।" }
      ];
    } else { // red (লাল মাটি)
      list = [
        { crop_name: "আনারস", yield_avg_bn: "২৪.০ টন/হেক্টর", profit_avg_bn: "৪৫,০০০ ৳/বিঘা", suitability: "শতকরা ৯২ ভাগ", reason: "লাল মাটির অম্লীয় গুণাগুণ ও পাহাড়ি ঢাল আনারস চাষের জন্য সবচেয়ে উপযোগী।" },
        { crop_name: "হলুদ (দেশি)", yield_avg_bn: "৮.৫ টন/হেক্টর", profit_avg_bn: "৩০,০০০ ৳/বিঘা", suitability: "শতকরা ৮৫ ভাগ", reason: "লাল মাটিতে হলুদের ছড়া বড় হয় ও রঙ চমৎকার গাঢ় হয়। দীর্ঘমেয়াদী খরা সহনশীল।" }
      ];
    }

    setRecommendations(list);
  }, [soilType, season, district]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-green-primary/10 pb-6">
        <button 
          onClick={() => router.push('/')}
          className="p-2 hover:bg-green-primary/10 rounded-full transition-colors text-text-secondary cursor-pointer"
          title="ফিরে যান"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            লাভজনক ফসল ম্যাচমেকার (Soil-Crop Matchmaker)
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আপনার অঞ্চলের ভৌগোলিক অবস্থান, মাটির টেক্সচার এবং চাষের মৌসুম অনুযায়ী সবচেয়ে লাভজনক ফসলের বৈজ্ঞানিক পরামর্শ।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Matchmaker Options (Left Column) */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
            জমির তথ্য নির্ধারণ করুন
          </h3>

          {/* District dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">আপনার জেলা:</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              {districtsList.map((d, i) => (
                <option key={i} value={d.name_bn}>{d.name_bn}</option>
              ))}
            </select>
          </div>

          {/* Soil Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">মাটির ধরন (Soil Texture):</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option value="loam">দোআঁশ মাটি (Loam)</option>
              <option value="sandy">বেলে দোআঁশ (Sandy Loam)</option>
              <option value="clay">এটেল মাটি (Clay)</option>
              <option value="red">লাল মাটি (Red/Acidic Soil)</option>
            </select>
          </div>

          {/* Season Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">চাষের মৌসুম (Season):</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option value="robi">রবি মৌসুম (শীতকাল)</option>
              <option value="kharif1">খরিপ-১ (গ্রীষ্মকাল)</option>
              <option value="kharif2">খরিপ-২ (বর্ষাকাল)</option>
            </select>
          </div>
        </div>

        {/* Matchmaker Output List (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
              প্রস্তাবিত লাভজনক ফসলসমূহ:
            </h3>

            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div key={idx} className="glass-card p-6 border border-green-primary/15 hover:border-green-primary/30 transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-green-primary/5 pb-3">
                      <div>
                        <h4 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                          <CheckCircle className="w-5 h-5 text-green-primary" />
                          {rec.crop_name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-black text-green-primary bg-green-500/10 border border-green-500/25 px-3 py-1 rounded-full uppercase w-fit">
                        উপযোগিতা: {rec.suitability}
                      </span>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-green-primary/5 p-3.5 rounded-xl border border-green-primary/10">
                        <span className="text-text-secondary block font-bold">গড় ফলন:</span>
                        <span className="text-sm font-extrabold text-green-primary">{rec.yield_avg_bn}</span>
                      </div>
                      <div className="bg-green-primary/5 p-3.5 rounded-xl border border-green-primary/10">
                        <span className="text-text-secondary block font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-green-primary" /> সম্ভাব্য মুনাফা:
                        </span>
                        <span className="text-sm font-extrabold text-green-primary">{rec.profit_avg_bn}</span>
                      </div>
                    </div>

                    {/* Suitability explanation */}
                    <div className="flex gap-3 text-xs text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5 font-semibold leading-relaxed">
                      <Info className="w-5 h-5 text-green-primary shrink-0" />
                      <div>
                        <span className="block text-[10px] text-text-secondary uppercase mb-0.5">কেন উপযুক্ত (Reasoning):</span>
                        {rec.reason}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-text-secondary font-medium">
                  কোনো ফসল ম্যাচিং করা যায়নি।
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
