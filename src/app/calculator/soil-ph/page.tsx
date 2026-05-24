'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, ShieldCheck, AlertTriangle, Info } from 'lucide-react';

export default function SoilPHCalculator() {
  const router = useRouter();
  const [soilColor, setSoilColor] = useState<string>('black_grey');
  const [weedType, setWeedType] = useState<string>('normal_grass');
  const [cropGrowth, setCropGrowth] = useState<string>('normal_green');
  const [landSize, setLandSize] = useState<number>(1); // default 1 bigha

  const [result, setResult] = useState<{
    status: 'acidic_strong' | 'acidic_mild' | 'optimal' | 'alkaline_mild' | 'alkaline_strong';
    statusText: string;
    estimatedPH: number;
    recommendation: string;
    chemicalName: string;
    dosagePerBigha: number;
    totalDosage: number;
    totalBags: number;
    tips: string[];
  } | null>(null);

  useEffect(() => {
    if (landSize <= 0) {
      setResult(null);
      return;
    }

    // Scoring system to estimate pH
    let acidicPoints = 0;
    let alkalinePoints = 0;
    let normalPoints = 0;

    if (soilColor === 'red_yellow') acidicPoints++;
    else if (soilColor === 'whitish_grey') alkalinePoints++;
    else normalPoints++;

    if (weedType === 'moss_red') acidicPoints++;
    else if (weedType === 'salt_crust') alkalinePoints++;
    else normalPoints++;

    if (cropGrowth === 'purplish') acidicPoints++;
    else if (cropGrowth === 'burnt_tips') alkalinePoints++;
    else normalPoints++;

    let status: 'acidic_strong' | 'acidic_mild' | 'optimal' | 'alkaline_mild' | 'alkaline_strong' = 'optimal';
    let statusText = 'স্বাভাবিক (অপটিমাল)';
    let estimatedPH = 6.8;
    let recommendation = 'মাটি সম্পূর্ণ সুস্থ ও উর্বর। কোনো অম্লত্ব বা ক্ষারত্ব সংশোধনের প্রয়োজন নেই।';
    let chemicalName = 'প্রয়োজন নেই';
    let dosagePerBigha = 0;
    let tips: string[] = [];

    if (acidicPoints >= 2) {
      status = 'acidic_strong';
      statusText = 'তীব্র অম্লীয় বা এসিডিক (Acidic)';
      estimatedPH = 4.8;
      chemicalName = 'ডলোচুন (Dololime)';
      dosagePerBigha = 150; // kg/bigha
      recommendation = `আপনার মাটির লক্ষণগুলো তীব্র অম্লতা নির্দেশ করছে। মাটির উর্বরতা পুনরুদ্ধার ও ফসলের পুষ্টি গ্রহণের ক্ষমতা বাড়াতে ডলোচুন প্রয়োগ করা অত্যন্ত জরুরি।`;
      tips = [
        "ডলোচুন জমি শেষ চাষের সময় মাটির সাথে ভালোভাবে মিশিয়ে দিন এবং হালকা সেচ দিন।",
        "ডলোচুন সার প্রয়োগের কমপক্ষে ১৫ দিন পর অন্য রাসায়নিক সার ও বীজ/চারা রোপণ করবেন।",
        "ইউরিয়া বা অ্যামোনিয়াম জাতীয় অম্ল উৎপাদনকারী রাসায়নিক সারের অতিরিক্ত ব্যবহার কমিয়ে ট্রাইকো-কম্পোস্ট বা গোবর সার বেশি দিন।"
      ];
    } else if (acidicPoints === 1) {
      status = 'acidic_mild';
      statusText = 'মৃদু অম্লীয় (Mildly Acidic)';
      estimatedPH = 5.8;
      chemicalName = 'ডলোচুন (Dololime)';
      dosagePerBigha = 80;
      recommendation = `আপনার মাটি সামান্য অম্লীয়। চারা রোপণের পূর্বে শেষ চাষের সময় হালকা ডলোচুন দিয়ে মাটি সংশোধন করে নেওয়া ভালো।`;
      tips = [
        "শেষ চাষে বিঘাপ্রতি নির্ধারিত ডলোচুন ছিটিয়ে দিন।",
        "মাটির অম্লতা ঠিক রাখতে নিয়মিত সবুজ সার (যেমন ধঞ্চে চাষ) করুন এবং জমিতে জৈব সারের পরিমাণ বৃদ্ধি করুন।"
      ];
    } else if (alkalinePoints >= 2) {
      status = 'alkaline_strong';
      statusText = 'তীব্র ক্ষারীয় বা লবণাক্ত (Saline / Alkaline)';
      estimatedPH = 8.5;
      chemicalName = 'জিপসাম সার (Gypsum)';
      dosagePerBigha = 120;
      recommendation = `আপনার মাটির লক্ষণগুলো তীব্র ক্ষারত্ব বা লবণাক্ততা নির্দেশ করছে। মাটির লবণাক্ততা কমানো ও ফসলের ডালপালা শক্ত করতে জিপসাম সার প্রয়োগের পরামর্শ দেওয়া হচ্ছে।`;
      tips = [
        "জমি তৈরির সময় জিপসাম সার প্রয়োগ করে পর্যাপ্ত পানি দিয়ে জমি ভিজিয়ে রাখুন, যাতে অতিরিক্ত ক্ষার ধুয়ে নিচে চলে যেতে পারে।",
        "লবণাক্ততা দমনে বেশি পরিমাণে কম্পোস্ট বা জৈব সার দিন। ক্ষারীয় মাটিতে দস্তার অভাব দেখা দিতে পারে, তাই দস্তা বা জিংক সার দিতে পারেন।"
      ];
    } else if (alkalinePoints === 1) {
      status = 'alkaline_mild';
      statusText = 'মৃদু ক্ষারীয়/লবণাক্ত (Mildly Alkaline)';
      estimatedPH = 7.6;
      chemicalName = 'জিপসাম সার (Gypsum)';
      dosagePerBigha = 60;
      recommendation = `আপনার মাটিতে সামান্য ক্ষারত্বের লক্ষণ রয়েছে। মাটি নিয়ন্ত্রণে সুষম সারের পাশাপাশি সামান্য জিপসাম প্রয়োগ করা উপকারী হবে।`;
      tips = [
        "জমি চাষের সময় হালকা জিপসাম ও সুষম পটাশ সার ব্যবহার করুন।",
        "পানি নিষ্কাশনের জন্য নালা সচল রাখুন এবং নিয়মিত মাটির স্বাস্থ্য পরীক্ষা করান।"
      ];
    } else {
      status = 'optimal';
      statusText = 'অনুকূল বা স্বাভাবিক (Optimal)';
      estimatedPH = 6.8;
      chemicalName = 'সংশোধন প্রয়োজন নেই';
      dosagePerBigha = 0;
      recommendation = `আপনার মাটি সম্পূর্ণ আদর্শ ও অনুকূল অবস্থায় রয়েছে। এই মাটিতে শস্যের ফলন ভালো হবে এবং সার ব্যবহারের দক্ষতা সর্বোচ্চ থাকবে।`;
      tips = [
        "মাটির উর্বরতা বজায় রাখতে নিয়মিত সবুজ সার ও খামারজাত গোবর বা ট্রাইকো-কম্পোস্ট ব্যবহার করুন।",
        "রাসায়নিক সার সর্বদা কৃষি দপ্তরের অনুমোদিত সুষম মাত্রায় ব্যবহার করুন।"
      ];
    }

    const totalDosage = dosagePerBigha * landSize;
    // 50kg bag calculation
    const totalBags = Math.ceil(totalDosage / 50);

    setResult({
      status,
      statusText,
      estimatedPH,
      recommendation,
      chemicalName,
      dosagePerBigha,
      totalDosage,
      totalBags,
      tips
    });

  }, [soilColor, weedType, cropGrowth, landSize]);

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

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
            মাটির pH ও অম্লত্ব ক্যালকুলেটর
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            ল্যাব টেস্ট ছাড়াই ৩টি সাধারণ পর্যবেক্ষণমূলক প্রশ্নের মাধ্যমে মাটির অম্লতা নির্ধারণ ও সংশোধন হিসাব করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inputs (Left 1 Column) */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
            মাটির লক্ষণ পর্যবেক্ষণ
          </h3>

          {/* Question 1: Soil Color */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">১. মাটির সাধারণ রঙ কেমন?</label>
            <select
              value={soilColor}
              onChange={(e) => setSoilColor(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer font-bold"
            >
              <option value="red_yellow">লাল বা হলদেটে লাল মাটি (অম্লীয় হতে পারে)</option>
              <option value="black_grey">কালো, কালচে বা গাঢ় ধূসর দোআঁশ মাটি (উর্বর)</option>
              <option value="whitish_grey">সাদাটে বা হালকা ধূসর বেলে মাটি (লবণাক্ত/ক্ষারীয় হতে পারে)</option>
            </select>
          </div>

          {/* Question 2: Weed Types */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">২. জমিতে শ্যাওলা বা ঘাসের অবস্থা কেমন?</label>
            <select
              value={weedType}
              onChange={(e) => setWeedType(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer font-bold"
            >
              <option value="moss_red">প্রচুর লালচে শ্যাওলা বা ফার্ন জাতীয় লাল ঘাস গজায়</option>
              <option value="normal_grass">স্বাভাবিক সাধারণ সবুজ ঘাস ও আগাছা গজায়</option>
              <option value="salt_crust">মাটির উপরিভাগে মাঝে মাঝে সাদা লবণের আস্তরণ পড়ে</option>
            </select>
          </div>

          {/* Question 3: Crop Growth */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">৩. ফসলের বৃদ্ধি ও পাতার লক্ষণ কেমন?</label>
            <select
              value={cropGrowth}
              onChange={(e) => setCropGrowth(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer font-bold"
            >
              <option value="purplish">গাছের বৃদ্ধি থমকে যায় ও পাতা বেগুনি বা তামাটে লাল দেখায়</option>
              <option value="normal_green">গাছের বৃদ্ধি স্বাভাবিক এবং পাতা সতেজ সবুজ থাকে</option>
              <option value="burnt_tips">পাতার কিনারা পুড়ে যাওয়ার মতো তামাটে বা শুকনো দেখায়</option>
            </select>
          </div>

          {/* Land Size Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">জমির পরিমাণ (বিঘা হিসেবে):</label>
            <div className="relative">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value === '' ? 0 : Number(e.target.value))}
                min="0.1"
                step="any"
                className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-text-secondary">বিঘা</span>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">নোট: ১ বিঘা = ৩৩ শতক।</p>
          </div>
        </div>

        {/* Output (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Status Indicator Panel */}
              <div className={`p-6 rounded-3xl border-2 flex flex-col justify-between min-h-[160px] animate-fade-in ${
                result.status === 'optimal'
                  ? 'bg-green-primary/5 border-green-primary/20'
                  : result.status.includes('acidic')
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-red-500/5 border-red-500/20'
              }`}>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${
                      result.status === 'optimal'
                        ? 'bg-green-primary/10 border-green-primary/30 text-green-700'
                        : result.status.includes('acidic')
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 font-bold'
                          : 'bg-red-500/10 border-red-500/30 text-red-700 font-bold'
                    }`}>
                      মাটির অবস্থা: {result.statusText}
                    </span>
                    <span className="text-xs font-bold text-text-secondary">
                      আনুমানিক মাটির pH: <strong className="text-text-primary text-sm">{translateToBanglaDigits(result.estimatedPH)}</strong>
                    </span>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-text-primary">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Required Inputs Dosage Bag Display */}
              {result.totalDosage > 0 && (
                <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-text-primary mb-4 text-base">🛍️ প্রয়োজনীয় মাটি সংশোধক সারের পরিমাণ:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-green-primary/5 space-y-1">
                      <h4 className="font-bold text-text-primary text-xs">সংশোধকের নাম</h4>
                      <p className="text-lg font-extrabold text-green-primary">{result.chemicalName}</p>
                    </div>
                    <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-amber-500/5 space-y-1">
                      <h4 className="font-bold text-text-primary text-xs">প্রয়োজনীয় মোট পরিমাণ</h4>
                      <p className="text-xl font-black text-amber-700">{translateToBanglaDigits(result.totalDosage)} কেজি</p>
                      <span className="text-[10px] text-text-secondary block font-bold">
                        ~{translateToBanglaDigits(result.totalBags)} বস্তা (৫০ কেজির বস্তা)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Correctional Tips */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-text-primary flex items-center gap-1.5 border-b border-green-primary/5 pb-2">
                  <ShieldCheck className="w-5 h-5 text-green-primary" />
                  মাটির যত্ন ও উর্বরতা বৃদ্ধির দীর্ঘমেয়াদী পদক্ষেপ:
                </h3>
                <div className="space-y-3">
                  {result.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                      <p className="font-bold leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <Calculator className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">মাটির পর্যবেক্ষণ ভিত্তিক pH ফলাফল</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের বক্সে ৩টি সহজ প্রশ্নের উত্তর দিন ও জমির পরিমাণ লিখুন। মাটির স্বাস্থ্য ও সংশোধক সারের হিসাব সাথে সাথে চলে আসবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">মাটির অম্লত্ব, ক্ষারত্ব বা লবণাক্ততা সমস্যা কীভাবে সমাধান করবেন বুঝতে পারছেন না?</h4>
          <p className="text-xs text-text-secondary font-bold">আপনার মাটির ধরন ও বিস্তারিত লক্ষণ লিখে সরাসরি গাছের ডাক্তারের সাথে পরামর্শ করুন।</p>
        </div>
        <button 
          onClick={() => {
            router.push(`/chat?q=${encodeURIComponent(`মাটির পিএইচ (pH) অম্লত্ব ও ক্ষারত্ব দূর করার উপায় কি?`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>
    </div>
  );
}
