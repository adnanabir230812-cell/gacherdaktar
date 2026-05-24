'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, ShieldCheck, AlertTriangle, Info } from 'lucide-react';

export default function SoilPHCalculator() {
  const router = useRouter();
  const [phValue, setPhValue] = useState<number | ''>(5.5);
  const [crop, setCrop] = useState<string>('rice');
  const [landSize, setLandSize] = useState<number | ''>(1); // default 1 bigha
  const [result, setResult] = useState<{
    status: 'acidic' | 'alkaline' | 'optimal';
    statusText: string;
    recommendation: string;
    chemicalName: string;
    dosage: number;
    tips: string[];
  } | null>(null);

  useEffect(() => {
    if (phValue === '' || phValue <= 0 || phValue > 14 || landSize === '' || landSize <= 0) {
      setResult(null);
      return;
    }

    const ph = Number(phValue);
    const size = Number(landSize);
    let status: 'acidic' | 'alkaline' | 'optimal' = 'optimal';
    let statusText = 'স্বাভাবিক (অপটিমাল)';
    let recommendation = 'মাটি সম্পূর্ণ সুস্থ ও উর্বর। কোনো অম্লত্ব বা ক্ষারত্ব সংশোধনের প্রয়োজন নেই।';
    let chemicalName = 'প্রয়োজন নেই';
    let dosage = 0;
    let tips: string[] = [];

    // Soil diagnostic logic
    if (ph < 5.8) {
      status = 'acidic';
      statusText = 'অতিরিক্ত অম্লীয় বা এসিডিক (Acidic)';
      chemicalName = 'ডলোচুন (Dololime)';
      dosage = size * 130; // 130kg per bigha to correct acidic soil
      recommendation = `মাটির অম্লতা সংশোধন করতে প্রতি বিঘা (৩৩ শতক) জমিতে ডলোচুন প্রয়োগ করতে হবে।`;
      tips = [
        "ডলোচুন সার প্রয়োগের কমপক্ষে ১৫ দিন পর অন্য সার ও বীজ রোপণ করতে হবে।",
        "জমি শেষ চাষের সময় মাটির সাথে ডলোচুন ভালো করে মিশিয়ে দিন এবং হালকা সেচ দিন।",
        "রাসায়নিক সার হিসেবে ইউরিয়া সারের অতিরিক্ত ব্যবহার হ্রাস করুন এবং বেশি করে জৈব কম্পোস্ট প্রয়োগ করুন।"
      ];
    } else if (ph > 7.5) {
      status = 'alkaline';
      statusText = 'অতিরিক্ত ক্ষারীয় বা অ্যালকালাইন (Alkaline)';
      chemicalName = 'জিপসাম সার (Gypsum)';
      dosage = size * 100; // 100kg per bigha to correct alkaline soil
      recommendation = `মাটির অতিরিক্ত ক্ষারত্ব বা লবণাক্ততা কমাতে জিপসাম ও জৈব সার প্রয়োগের পরামর্শ দেওয়া যাচ্ছে।`;
      tips = [
        "জিপসাম প্রয়োগের সাথে সাথে জমিতে পর্যাপ্ত পরিমাণ জৈব সার ও তরল কম্পোস্ট ব্যবহার করুন।",
        "ক্ষারীয় মাটিতে লোহার ও দস্তার অভাব দেখা দিতে পারে, তাই বিঘাপ্রতি ৩ কেজি জিংক সালফেট ও ২ কেজি আয়রন সালফেট প্রয়োগ করুন।",
        "নিয়মিত পানি নিষ্কাশনের ব্যবস্থা রাখুন যাতে মাটির ক্ষার ধুয়ে চলে যেতে পারে।"
      ];
    } else {
      status = 'optimal';
      statusText = 'অনুকূল বা অপটিমাল (Optimal)';
      chemicalName = 'সংশোধন প্রয়োজন নেই';
      dosage = 0;
      recommendation = `মাটি সম্পূর্ণ আদর্শ অবস্থায় রয়েছে। এই মাটিতে শস্যের পুষ্টি ও সার গ্রহণ ক্ষমতা সর্বোচ্চ থাকবে।`;
      tips = [
        "মাটির উর্বরতা ধরে রাখতে নিয়মিত সুষম সার (ইউরিয়া, টিএসপি ও পটাশ) প্রয়োগ করুন।",
        "প্রতি বছর চাষাবাদের পর মাটিতে পর্যাপ্ত পরিমাণে খামারজাত গোবর বা ট্রাইকো-কম্পোস্ট ব্যবহার করুন।"
      ];
    }

    setResult({
      status,
      statusText,
      recommendation,
      chemicalName,
      dosage,
      tips
    });

  }, [phValue, crop, landSize]);

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
            আপনার মাটির অম্লত্ব বা ক্ষারত্ব (pH) এবং জমির পরিমাণ অনুযায়ী মাটির স্বাস্থ্য সংশোধনের জন্য চুন বা জিপসামের হিসাব।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inputs (Left 1 Column) */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
            মাটির বিবরণ দিন
          </h3>

          {/* Soil pH Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">মাটির pH মান (0 - 14):</label>
            <input
              type="number"
              value={phValue}
              onChange={(e) => setPhValue(e.target.value === '' ? '' : Number(e.target.value))}
              min="0.1"
              max="14"
              step="any"
              placeholder="যেমন: ৫.৮"
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
            <p className="text-[10px] text-text-secondary font-semibold">* ক্ষার পরীক্ষা কিট বা স্থানীয় ল্যাব থেকে মাটির pH পরীক্ষা করে নিন।</p>
          </div>

          {/* Land Size Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">জমির পরিমাণ (বিঘা):</label>
            <div className="relative">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value === '' ? '' : Number(e.target.value))}
                min="0.1"
                step="any"
                className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-text-secondary">বিঘা</span>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">নোট: ১ বিঘা = ৩৩ শতক।</p>
          </div>

          {/* Target Crop Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">অভিপ্রেত ফসল:</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option value="rice">ধান (বোরো/আমন)</option>
              <option value="potato">আলু</option>
              <option value="tomato">টমেটো</option>
              <option value="onion">পেঁয়াজ</option>
            </select>
          </div>
        </div>

        {/* Output (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Status Indicator Panel */}
              <div className={`p-6 rounded-3xl border-2 flex flex-col justify-between min-h-[160px] ${
                result.status === 'optimal'
                  ? 'bg-green-primary/5 border-green-primary/20'
                  : result.status === 'acidic'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-red-500/5 border-red-500/20'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${
                      result.status === 'optimal'
                        ? 'bg-green-primary/10 border-green-primary/30 text-green-700'
                        : result.status === 'acidic'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 font-bold'
                          : 'bg-red-500/10 border-red-500/30 text-red-700 font-bold'
                    }`}>
                      মাটির অবস্থা: {result.statusText}
                    </span>
                  </div>
                  <p className="text-base font-bold leading-relaxed text-text-primary">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Required Inputs Dosage Bag Display */}
              {result.dosage > 0 && (
                <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6">
                  <h3 className="font-bold text-text-primary mb-4 text-base">🛍️ প্রয়োজনীয় মাটি সংশোধক সারের পরিমাণ:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-green-primary/5 space-y-1">
                      <h4 className="font-bold text-text-primary text-xs">সংশোধকের নাম</h4>
                      <p className="text-lg font-extrabold text-green-primary">{result.chemicalName}</p>
                    </div>
                    <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-amber-500/5 space-y-1">
                      <h4 className="font-bold text-text-primary text-xs">মোট পরিমাণ</h4>
                      <p className="text-lg font-extrabold text-amber-700">{translateToBanglaDigits(result.dosage)} কেজি</p>
                      <span className="text-[10px] text-text-secondary block font-bold">
                        ~{translateToBanglaDigits(Math.ceil(result.dosage / 50))} বস্তা (50kg)
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
                <h4 className="font-bold text-text-primary">মাটির pH গণনার ফলাফল</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের প্যানেলে আপনার মাটির pH রিডিং ও জমির পরিমাপ বসিয়ে দিন। সয়েল কারেকশন এর সঠিক হিসাব চলে আসবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
