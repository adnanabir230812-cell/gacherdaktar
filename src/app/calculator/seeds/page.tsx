'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, ShieldCheck, ClipboardList, Info } from 'lucide-react';

interface CropSeedData {
  id: string;
  name_bn: string;
  seed_rate_per_bigha_kg: number; // kg per bigha (33 decimals)
  spacing_bn: string;
  depth_bn: string;
  sowing_method_bn: string;
}

const SEED_DATABASE: CropSeedData[] = [
  {
    id: 'rice_transplant',
    name_bn: "রোপা ধান (চারা তৈরি)",
    seed_rate_per_bigha_kg: 5.5,
    spacing_bn: "২০ সেমি × ১৫ সেমি (সারি থেকে সারি এবং চারা থেকে চারা)",
    depth_bn: "২ - ৩ সেমি গভীরতা বীজতলার জন্য",
    sowing_method_bn: "বীজতলায় চারা তৈরি করে ২৫-৩০ দিন বয়সের চারা জমিতে মূল রোপণ করুন।"
  },
  {
    id: 'potato',
    name_bn: "আলু (বীজ আলু)",
    seed_rate_per_bigha_kg: 200,
    spacing_bn: "৬০ সেমি × ২৫ সেমি",
    depth_bn: "৮ - ১০ সেমি গভীরতা",
    sowing_method_bn: "আস্ত বা কাটা বীজ আলু চোখ উপরের দিকে রেখে রোপণ করুন।"
  },
  {
    id: 'onion',
    name_bn: "পেঁয়াজ (বীজ)",
    seed_rate_per_bigha_kg: 1.2,
    spacing_bn: "১৫ সেমি × ১০ সেমি",
    depth_bn: "১ - ১.৫ সেমি গভীরতা",
    sowing_method_bn: "বীজতলায় চারা তৈরি করে মূল জমিতে রোপণ করতে হবে।"
  },
  {
    id: 'wheat',
    name_bn: "গম",
    seed_rate_per_bigha_kg: 16,
    spacing_bn: "২০ সেমি (সারি থেকে সারি)",
    depth_bn: "৩ - ৫ সেমি গভীরতা",
    sowing_method_bn: "সারিতে বীজ বোনা সবচেয়ে ভালো, মাটির আর্দ্রতা দেখে রোপণ করুন।"
  },
  {
    id: 'maize',
    name_bn: "ভুট্টা (হাইব্রিড)",
    seed_rate_per_bigha_kg: 2.5,
    spacing_bn: "৬০ সেমি × ২৫ সেমি (একক চারা)",
    depth_bn: "৩ - ৪ সেমি গভীরতা",
    sowing_method_bn: "প্রতি গর্তে একটি করে পুষ্ট বীজ বপন করতে হবে।"
  }
];

export default function SeedCalculator() {
  const router = useRouter();
  const [selectedCropId, setSelectedCropId] = useState<string>('rice_transplant');
  const [landSize, setLandSize] = useState<number | ''>(1);
  const [landUnit, setLandUnit] = useState<string>('bigha'); // bigha or decimal
  const [result, setResult] = useState<{
    cropName: string;
    totalSeedWeight: number;
    spacing: string;
    depth: string;
    method: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedCropId || landSize === '' || landSize <= 0) {
      setResult(null);
      return;
    }

    const crop = SEED_DATABASE.find(c => c.id === selectedCropId);
    if (!crop) return;

    // 1 bigha = 33 decimals
    const landInBigha = landUnit === 'decimal' ? (Number(landSize) / 33) : Number(landSize);
    const totalWeight = crop.seed_rate_per_bigha_kg * landInBigha;

    setResult({
      cropName: crop.name_bn,
      totalSeedWeight: Math.round(totalWeight * 100) / 100,
      spacing: crop.spacing_bn,
      depth: crop.depth_bn,
      method: crop.sowing_method_bn
    });

  }, [selectedCropId, landSize, landUnit]);

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
            বীজ ও চারা বপন ক্যালকুলেটর
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আপনার জমির পরিমাপ অনুযায়ী প্রয়োজনীয় বীজের সঠিক ওজন এবং আদর্শ রোপণ দূরত্ব ও গভীরতা গণনা করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Inputs (Left Column) */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
            জমির বিবরণ লিখুন
          </h3>

          {/* Crop Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">ফসল নির্বাচন করুন:</label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              {SEED_DATABASE.map(c => (
                <option key={c.id} value={c.id}>{c.name_bn}</option>
              ))}
            </select>
          </div>

          {/* Land Size Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">জমির পরিমাণ:</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value === '' ? '' : Number(e.target.value))}
                min="0.1"
                step="any"
                className="flex-1 bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
              >
                <option value="bigha">বিঘা (Bigha)</option>
                <option value="decimal">শতক (Decimal)</option>
              </select>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">নোট: ১ বিঘা = ৩৩ শতক।</p>
          </div>
        </div>

        {/* Calculation Result (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Seed Weight Card */}
              <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6">
                <h3 className="font-bold text-text-primary mb-4 text-base">📊 বীজ গণনার ফলাফল:</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="border border-green-primary/10 rounded-2xl p-6 text-center bg-green-primary/5 space-y-1">
                    <h4 className="font-bold text-text-primary text-xs">প্রয়োজনীয় বীজের মোট ওজন</h4>
                    <p className="text-3xl font-extrabold text-green-primary">
                      {translateToBanglaDigits(result.totalSeedWeight)} কেজি
                    </p>
                    <span className="text-xs text-text-secondary block font-bold">
                      {result.cropName} এর জন্য ({translateToBanglaDigits(landSize)} {landUnit === 'bigha' ? 'বিঘা' : 'শতক'} জমি)
                    </span>
                  </div>
                </div>
              </div>

              {/* Spacing & Planting Details */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-text-primary flex items-center gap-1.5 border-b border-green-primary/5 pb-2">
                  <ShieldCheck className="w-5 h-5 text-green-primary" />
                  BARI/BRRI রোপণ ও বপন গাইডলাইন:
                </h3>
                <div className="space-y-3">
                  {/* Spacing */}
                  <div className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                    <div>
                      <h4 className="font-extrabold text-green-primary text-xs uppercase mb-1">আদর্শ রোপণ দূরত্ব:</h4>
                      <p className="font-medium leading-relaxed">{result.spacing}</p>
                    </div>
                  </div>
                  {/* Depth */}
                  <div className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                    <div>
                      <h4 className="font-extrabold text-amber-700 text-xs uppercase mb-1">বপনের গভীরতা:</h4>
                      <p className="font-medium leading-relaxed">{result.depth}</p>
                    </div>
                  </div>
                  {/* Method */}
                  <div className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                    <div>
                      <h4 className="font-extrabold text-slate-700 text-xs uppercase mb-1">বপন ও রোপণ পদ্ধতি:</h4>
                      <p className="font-medium leading-relaxed">{result.method}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <Calculator className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">বীজ পরিমাপের ফলাফল দেখতে</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের বক্সে আপনার টার্গেট ফসল ও জমির পরিমাপ নির্বাচন করুন। বপনের বিস্তারিত ম্যাট্রিক্স তৈরি হয়ে যাবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
