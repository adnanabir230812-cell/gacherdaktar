'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

const CROPS_LIST = [
  { id: 'rice', name: 'ধান (Rice)' },
  { id: 'wheat', name: 'গম (Wheat)' },
  { id: 'potato', name: 'আলু (Potato)' },
  { id: 'onion', name: 'পেঁয়াজ (Onion)' },
  { id: 'chilli', name: 'মরিচ (Chilli)' },
  { id: 'tomato', name: 'টমেটো (Tomato)' },
  { id: 'eggplant', name: 'বেগুন (Eggplant)' },
  { id: 'garlic', name: 'রসুন (Garlic)' },
  { id: 'ginger', name: 'আদা (Ginger)' },
  { id: 'turmeric', name: 'হলুদ (Turmeric)' },
  { id: 'mustard', name: 'সরিষা (Mustard)' },
  { id: 'maize', name: 'ভুট্টা (Maize)' },
  { id: 'jute', name: 'পাট (Jute)' },
  { id: 'mango', name: 'আম (Mango)' },
  { id: 'banana', name: 'কলা (Banana)' },
  { id: 'papaya', name: 'পেঁপে (Papaya)' },
  { id: 'jackfruit', name: 'কাঁঠাল (Jackfruit)' },
  { id: 'guava', name: 'পেয়ারা (Guava)' },
  { id: 'coconut', name: 'নারকেল (Coconut)' },
  { id: 'citrus', name: 'লেবু (Lemon)' },
  { id: 'cucumber', name: 'শসা (Cucumber)' },
  { id: 'sweet_gourd', name: 'মিষ্টি কুমড়া (Sweet Gourd)' },
  { id: 'bottle_gourd', name: 'লাউ (Bottle Gourd)' },
  { id: 'okra', name: 'ঢ্যাঁড়শ (Okra)' },
  { id: 'cabbage', name: 'বাঁধাকপি (Cabbage)' },
  { id: 'cauliflower', name: 'ফুলকপি (Cauliflower)' },
  { id: 'radish', name: 'মূলা (Radish)' },
  { id: 'carrot', name: 'গাজর (Carrot)' },
  { id: 'betel_leaf', name: 'পান (Betel Leaf)' },
  { id: 'pineapple', name: 'আনারস (Pineapple)' },
  { id: 'lentil', name: 'মসুর ডাল (Lentil)' },
  { id: 'spinach', name: 'পালং শাক (Spinach)' },
];

export default function PesticideCalculator() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [tankSize, setTankSize] = useState<number>(16); // Sprayer size in Litres
  const [pesticideForm, setPesticideForm] = useState<'liquid' | 'powder'>('liquid');
  const [severity, setSeverity] = useState<'preventive' | 'mild' | 'severe'>('mild');
  const [landArea, setLandArea] = useState<number>(10); // Land in decimal (শতক)
  
  const [result, setResult] = useState<{
    dosageRate: number; // per Litre
    chemicalPerTank: number;
    tanksNeeded: number;
    totalWaterNeeded: number;
    totalChemicalNeeded: number;
    teaspoonsPerTank: number;
    capsPerTank?: number;
    totalTeaspoons: number;
    totalCaps?: number;
  } | null>(null);

  useEffect(() => {
    if (tankSize <= 0 || landArea <= 0) {
      setResult(null);
      return;
    }

    // Determine dosage rate based on form and severity
    let rate = 2.0; // default ml or gm per Litre
    if (pesticideForm === 'liquid') {
      if (severity === 'preventive') rate = 1.5;
      else if (severity === 'mild') rate = 2.5;
      else if (severity === 'severe') rate = 4.0;
    } else {
      if (severity === 'preventive') rate = 1.0;
      else if (severity === 'mild') rate = 2.0;
      else if (severity === 'severe') rate = 3.0;
    }

    const totalWater = landArea * 2.5; // 2.5 Litres per decimal
    const chemicalPerTank = tankSize * rate;
    const totalChemical = totalWater * rate;
    const tanks = Math.ceil(totalWater / tankSize);

    // 1 teaspoon = 5 ml or 5 gm
    const teaspoonsPerTank = chemicalPerTank / 5;
    const totalTeaspoons = totalChemical / 5;

    // 1 standard cap = 5 ml (only for liquid)
    const capsPerTank = pesticideForm === 'liquid' ? chemicalPerTank / 5 : undefined;
    const totalCaps = pesticideForm === 'liquid' ? totalChemical / 5 : undefined;

    setResult({
      dosageRate: rate,
      chemicalPerTank: Math.round(chemicalPerTank * 100) / 100,
      tanksNeeded: tanks,
      totalWaterNeeded: Math.round(totalWater * 100) / 100,
      totalChemicalNeeded: Math.round(totalChemical * 100) / 100,
      teaspoonsPerTank: Math.round(teaspoonsPerTank * 10) / 10,
      capsPerTank: capsPerTank ? Math.round(capsPerTank * 10) / 10 : undefined,
      totalTeaspoons: Math.round(totalTeaspoons * 10) / 10,
      totalCaps: totalCaps ? Math.round(totalCaps * 10) / 10 : undefined,
    });

  }, [tankSize, pesticideForm, severity, landArea]);

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const currentCropName = CROPS_LIST.find(c => c.id === selectedCrop)?.name || '';

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
            কীটনাশক ও স্প্রে ডোজ ক্যালকুলেটর
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            ফসলের ধরন, ওষুধের রূপ ও আক্রমণের তীব্রতা অনুযায়ী সহজ দেশী পরিমাপে (চা চামচ ও ছিপি) স্প্রে ডোজ হিসাব করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Parameters Form (Left Column) */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
            পরামিতি নির্ধারণ করুন
          </h3>

          {/* Crop Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">আক্রান্ত ফসল:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer font-bold"
            >
              {CROPS_LIST.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pesticide Form */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">কীটনাশকের ধরন (Form):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPesticideForm('liquid')}
                className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  pesticideForm === 'liquid'
                    ? 'bg-green-primary/10 border-green-primary text-green-primary'
                    : 'bg-soft-white border-green-primary/10 text-text-secondary hover:bg-green-primary/5'
                }`}
              >
                তরল (Liquid)
              </button>
              <button
                type="button"
                onClick={() => setPesticideForm('powder')}
                className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  pesticideForm === 'powder'
                    ? 'bg-green-primary/10 border-green-primary text-green-primary'
                    : 'bg-soft-white border-green-primary/10 text-text-secondary hover:bg-green-primary/5'
                }`}
              >
                পাউডার (Powder)
              </button>
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">আক্রমণের তীব্রতা:</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold cursor-pointer"
            >
              <option value="preventive">প্রতিরোধমূলক (আক্রমণের পূর্বে / আভাস পেলে)</option>
              <option value="mild">মাঝারি আক্রমণ (অল্প লক্ষণ দেখা দিলে)</option>
              <option value="severe">তীব্র আক্রমণ (অতি আক্রমণ ও ক্ষতি হলে)</option>
            </select>
          </div>

          {/* Tank Size Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">স্প্রে ট্যাঙ্কের সাইজ (ড্রাম):</label>
            <select
              value={tankSize}
              onChange={(e) => setTankSize(Number(e.target.value))}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold cursor-pointer"
            >
              <option value={10}>১০ লিটার (ছোট ট্যাঙ্ক)</option>
              <option value={12}>১২ লিটার</option>
              <option value={16}>১৬ লিটার (স্ট্যান্ডার্ড ন্যাপস্যাক)</option>
              <option value={20}>২০ লিটার (বড় স্প্রেয়ার)</option>
            </select>
          </div>

          {/* Land Area */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">জমির পরিমাণ (শতক হিসেবে):</label>
            <div className="relative">
              <input
                type="number"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value === '' ? 0 : Number(e.target.value))}
                min="1"
                placeholder="যেমন: ১০"
                className="w-full bg-soft-white border border-green-primary/20 rounded-xl pl-4 pr-16 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-text-secondary">শতক</span>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">* ৩৩ শতক = ১ বিঘা।</p>
          </div>
        </div>

        {/* Calculation Result & Guidelines (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Output stats grid */}
              <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-text-primary mb-4 text-base">📊 প্রয়োজনীয় ওষুধের পরিমাণ (সহজ মাপে):</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dose Per Tank */}
                  <div className="border border-green-primary/10 rounded-2xl p-5 text-center bg-green-primary/5 space-y-2">
                    <h4 className="font-extrabold text-text-primary text-xs">প্রতি ট্যাঙ্কে (ড্রাম) ওষুধ লাগবে</h4>
                    
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-green-primary">
                        {translateToBanglaDigits(result.teaspoonsPerTank)} চা চামচ
                      </p>
                      {pesticideForm === 'liquid' && result.capsPerTank !== undefined && (
                        <p className="text-lg font-bold text-green-primary/80">
                          অথবা {translateToBanglaDigits(result.capsPerTank)} ছিপি (ক্যাপ)
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] text-text-secondary block font-bold pt-2 border-t border-green-primary/10">
                      উচ্চ সুক্ষ্মতায়: {translateToBanglaDigits(result.chemicalPerTank)} {pesticideForm === 'liquid' ? 'মিলি' : 'গ্রাম'} ({translateToBanglaDigits(tankSize)} লিটার ড্রামের জন্য)
                    </span>
                  </div>

                  {/* Total Chemical */}
                  <div className="border border-green-primary/10 rounded-2xl p-5 text-center bg-amber-500/5 space-y-2">
                    <h4 className="font-extrabold text-text-primary text-xs">পুরো জমির জন্য মোট প্রয়োজন</h4>
                    
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-amber-700">
                        {translateToBanglaDigits(result.totalTeaspoons)} চা চামচ
                      </p>
                      {pesticideForm === 'liquid' && result.totalCaps !== undefined && (
                        <p className="text-lg font-bold text-amber-700/80">
                          অথবা {translateToBanglaDigits(result.totalCaps)} ছিপি (ক্যাপ)
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] text-text-secondary block font-bold pt-2 border-t border-amber-500/10">
                      মোট ওষুধ: {translateToBanglaDigits(result.totalChemicalNeeded)} {pesticideForm === 'liquid' ? 'মিলি' : 'গ্রাম'} ({translateToBanglaDigits(result.totalWaterNeeded)} লিটার পানির জন্য)
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-500/5 rounded-2xl flex justify-between items-center text-xs font-bold text-text-secondary">
                  <span>প্রয়োজনীয় ড্রাম বা স্প্রে সংখ্যা:</span>
                  <span className="text-slate-700 text-sm font-black">{translateToBanglaDigits(result.tanksNeeded)} বার (ড্রাম)</span>
                </div>
              </div>

              {/* Conversion note */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-text-primary leading-relaxed font-bold">
                  <p className="text-amber-800 mb-1">কৃষক পরিমাপ নির্দেশিকা:</p>
                  <p>১ চা চামচ = প্রায় ৫ মিলি (তরল ওষুধ) অথবা ৫ গ্রাম (পাউডার ওষুধ)।</p>
                  <p>১ বোতলের ছিপি (ক্যাপ) = প্রায় ৫ মিলি (তরল ওষুধের স্ট্যান্ডার্ড ক্যাপ)।</p>
                  <p className="mt-1 text-text-secondary font-medium">* বালাইনাশক প্রয়োগের পূর্বে সর্বদা বোতলের গায়ে লিখিত নির্দেশনাবলী ভালোভাবে পড়ুন।</p>
                </div>
              </div>

              {/* Safety Steps Guide */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-text-primary flex items-center gap-1.5 border-b border-green-primary/5 pb-2">
                  <ShieldCheck className="w-5 h-5 text-green-primary" />
                  বালাইনাশক স্প্রে করার কৃষি নিরাপত্তা নির্দেশিকা:
                </h3>
                <div className="space-y-3">
                  {[
                    "১. রোদের তীব্রতা বেশি থাকলে বা বাতাস বেশি থাকলে স্প্রে করবেন না। সকালের মিষ্টি রোদে অথবা বিকেলে স্প্রে করা সবচেয়ে উপযুক্ত সময়।",
                    "২. স্প্রে করার সময় বাতাসের অনুকূলে (যেদিকে বাতাস বয়) দাঁড়িয়ে স্প্রে করুন, যাতে বালাইনাশকের কণা আপনার শরীরে না লাগে।",
                    "৩. তরল রাসায়নিক পরিমাপ করার সময় অবশ্যই মুখের মাস্ক ও প্লাস্টিকের গ্লাভস ব্যবহার করুন এবং খালি হাতে তরল স্পর্শ করবেন না।",
                    "৪. স্প্রে শেষ করার সাথে সাথে ভালো সাবান ও পরিষ্কার পানি দিয়ে হাত-মুখ ও কাপড় ধুয়ে ফেলুন। ওষুধের খালি বোতলটি মাটিতে পুঁতে ফেলুন।"
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                      <p className="font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <Calculator className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">বালাইনাশক ডোজ গণনার ফলাফল</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের বক্সে আপনার আক্রান্ত ফসল, কীটনাশকের রূপ, আক্রমণের তীব্রতা ও জমির পরিমাণ সিলেক্ট করুন। সঠিক স্প্রে ডোজ হিসাব হয়ে যাবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">কীটনাশকের সঠিক বাণিজ্যিক নাম বা অনুমোদিত ডোজ নিয়ে দ্বিধায় আছেন?</h4>
          <p className="text-xs text-text-secondary font-bold">আপনার ফসলের নাম ও সমস্যাটি লিখে সরাসরি গাছের ডাক্তারকে জিজ্ঞাসা করুন এবং তাত্ক্ষণিক সমাধান পান।</p>
        </div>
        <button 
          onClick={() => {
            router.push(`/chat?q=${encodeURIComponent(`${currentCropName} ফসলে বালাইনাশক ব্যবহারের সঠিক নিয়ম ও ডোজ কত?`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>
    </div>
  );
}
