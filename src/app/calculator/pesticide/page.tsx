'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export default function PesticideCalculator() {
  const router = useRouter();
  const [tankSize, setTankSize] = useState<number>(16); // Default knapsack sprayer size in Litres
  const [dosageRate, setDosageRate] = useState<number | ''>(2); // ml or gm per Litre
  const [totalWaterNeeded, setTotalWaterNeeded] = useState<number | ''>(80); // Litres for overall land
  const [result, setResult] = useState<{
    chemicalPerTank: number;
    totalChemicalNeeded: number;
    tanksNeeded: number;
  } | null>(null);

  // Perform pesticide calculation
  useEffect(() => {
    if (tankSize <= 0 || dosageRate === '' || dosageRate <= 0) {
      setResult(null);
      return;
    }

    const dosage = Number(dosageRate);
    const chemicalPerTank = tankSize * dosage;
    const waterTotal = totalWaterNeeded === '' || totalWaterNeeded <= 0 ? tankSize : Number(totalWaterNeeded);
    const totalChemical = waterTotal * dosage;
    const tanks = Math.ceil(waterTotal / tankSize);

    setResult({
      chemicalPerTank: Math.round(chemicalPerTank * 100) / 100,
      totalChemicalNeeded: Math.round(totalChemical * 100) / 100,
      tanksNeeded: tanks
    });

  }, [tankSize, dosageRate, totalWaterNeeded]);

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
            কীটনাশক ও স্প্রে ডোজ ক্যালকুলেটর
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আপনার স্প্রে ড্রামের ধারণক্ষমতা অনুযায়ী কীটনাশক, ছত্রাকনাশক ও তরল ওষুধের সঠিক মিশ্রণ অনুপাত হিসাব করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Parameters Form (Left Column) */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary border-b border-green-primary/5 pb-2">
            পরামিতি নির্ধারণ করুন
          </h3>

          {/* Tank Size Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">স্প্রে ট্যাঙ্কের সাইজ (ড্রাম):</label>
            <select
              value={tankSize}
              onChange={(e) => setTankSize(Number(e.target.value))}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option value={10}>১০ লিটার (ছোট ট্যাঙ্ক)</option>
              <option value={12}>১২ লিটার</option>
              <option value={16}>১৬ লিটার (স্ট্যান্ডার্ড ন্যাপস্যাক)</option>
              <option value={20}>২০ লিটার (বড় স্প্রেয়ার)</option>
            </select>
          </div>

          {/* Dosage Rate */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">অনুমোদিত ডোজের হার (প্রতি লিটার পানিতে):</label>
            <div className="relative">
              <input
                type="number"
                value={dosageRate}
                onChange={(e) => setDosageRate(e.target.value === '' ? '' : Number(e.target.value))}
                min="0.1"
                step="any"
                placeholder="যেমন: ২.৫ বা ১.৫"
                className="w-full bg-soft-white border border-green-primary/20 rounded-xl pl-4 pr-16 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-text-secondary">মিলি / গ্রাম</span>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">* বালাইনাশক বোতলের গায়ে লিখিত নির্দেশিকা অনুসরণ করুন।</p>
          </div>

          {/* Total Water Needed (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">মোট পানির পরিমাণ (ঐচ্ছিক):</label>
            <div className="relative">
              <input
                type="number"
                value={totalWaterNeeded}
                onChange={(e) => setTotalWaterNeeded(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                placeholder="যেমন: ৮০"
                className="w-full bg-soft-white border border-green-primary/20 rounded-xl pl-4 pr-16 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-text-secondary">লিটার</span>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">পুরো জমিতে স্প্রে করার জন্য প্রয়োজনীয় আনুমানিক পানির পরিমাণ।</p>
          </div>
        </div>

        {/* Calculation Result & Guidelines (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Output stats grid */}
              <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6">
                <h3 className="font-bold text-text-primary mb-4 text-base">📊 প্রয়োজনীয় ডোজের অনুপাত:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Dose Per Tank */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-green-primary/5 space-y-1">
                    <h4 className="font-bold text-text-primary text-xs">প্রতি ট্যাঙ্কে (ড্রাম) ওষুধ</h4>
                    <p className="text-xl font-extrabold text-green-primary">
                      {translateToBanglaDigits(result.chemicalPerTank)} মিলি/গ্রাম
                    </p>
                    <span className="text-[10px] text-text-secondary block font-semibold">
                      {translateToBanglaDigits(tankSize)} লিটার পানির জন্য
                    </span>
                  </div>

                  {/* Total Chemical */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-amber-500/5 space-y-1">
                    <h4 className="font-bold text-text-primary text-xs">মোট ওষুধের পরিমাণ</h4>
                    <p className="text-xl font-extrabold text-amber-700">
                      {translateToBanglaDigits(result.totalChemicalNeeded)} মিলি/গ্রাম
                    </p>
                    <span className="text-[10px] text-text-secondary block font-semibold">
                      {translateToBanglaDigits(totalWaterNeeded || tankSize)} লিটার পানির জন্য
                    </span>
                  </div>

                  {/* Tanks Count */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-slate-500/5 space-y-1">
                    <h4 className="font-bold text-text-primary text-xs">প্রয়োজনীয় ড্রাম সংখ্যা</h4>
                    <p className="text-xl font-extrabold text-slate-700">
                      {translateToBanglaDigits(result.tanksNeeded)} বার (ড্রাম)
                    </p>
                    <span className="text-[10px] text-text-secondary block font-semibold">
                      ট্যাঙ্ক রি-ফিল করতে হবে
                    </span>
                  </div>
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
                  বামদিকের বক্সে আপনার স্প্রেয়ার ড্রামের সাইজ এবং বোতলের গায়ের অনুমোদিত মাত্রাটি লিখুন। সঠিক হিসাব সাথে সাথে প্রস্তুত হয়ে যাবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
