'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator, Sprout, Landmark, ArrowRight, HelpCircle, ClipboardList } from 'lucide-react';
import { Crop, CROPS } from '../api/data';

interface CalculationResult {
  urea: number;
  tsp: number;
  mop: number;
  gypsum: number;
  zinc: number;
  guidelines: string[];
}

const FRUIT_TREE_DENSITY: { [key: string]: number } = {
  '36': 20,   // আম (২০টি গাছ/বিঘা)
  '37': 15,   // কাঁঠাল (১৫টি গাছ/বিঘা)
  '38': 15,   // লিচু (১৫টি গাছ/বিঘা)
  '39': 150,  // কলা (১৫০টি গাছ/বিঘা)
  '40': 80,   // পেয়ারা (৮০টি গাছ/বিঘা)
  '41': 60,   // পেঁপে (৬০টি গাছ/বিঘা)
  '42': 1000, // আনারস (১০০০টি গাছ/বিঘা)
  '43': 300,  // তরমুজ (৩০০টি মাদা/বিঘা)
  '44': 100,  // লেবু (১০০টি গাছ/বিঘা)
  '45': 20,   // নারিকেল (২০টি গাছ/বিঘা)
  '52': 15    // লিচু (১৫টি গাছ/বিঘা)
};

const translateNumberToBangla = (num: number | string): string => {
  const englishToBanglaMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.', ',': ','
  };
  return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
};

const formatWeight = (weightInKg: number): string => {
  if (weightInKg < 1) {
    const grams = Math.round(weightInKg * 1000);
    return `${translateNumberToBangla(grams)} গ্রাম`;
  } else {
    const kg = Math.floor(weightInKg);
    const grams = Math.round((weightInKg - kg) * 1000);
    if (grams === 0) {
      return `${translateNumberToBangla(kg)} কেজি`;
    }
    return `${translateNumberToBangla(kg)} কেজি ${translateNumberToBangla(grams)} গ্রাম`;
  }
};

function CalculatorContent() {
  const searchParams = useSearchParams();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('বোরো');
  const [landSize, setLandSize] = useState<number | ''>(1);
  const [landUnit, setLandUnit] = useState('bigha'); // bigha, decimal, or unit
  const [result, setResult] = useState<CalculationResult | null>(null);

  const crop = CROPS.find(c => c.id === selectedCropId);
  const isFruit = crop?.category === 'fruit';

  // Initialize data
  useEffect(() => {
    setCrops(CROPS);
    const cropFromUrl = searchParams.get('crop');
    if (cropFromUrl) {
      setSelectedCropId(cropFromUrl);
    } else if (CROPS.length > 0) {
      setSelectedCropId(CROPS[0].id);
    }
  }, [searchParams]);

  // Adjust unit automatically when crop changes
  useEffect(() => {
    if (!selectedCropId) return;
    const selected = CROPS.find(c => c.id === selectedCropId);
    if (selected) {
      if (selected.category === 'fruit') {
        setLandUnit('unit');
      } else if (landUnit === 'unit') {
        setLandUnit('bigha');
      }
    }
  }, [selectedCropId]);

  // Dynamic calculations
  useEffect(() => {
    if (!selectedCropId || landSize === '' || landSize <= 0) {
      setResult(null);
      return;
    }

    const crop = CROPS.find(c => c.id === selectedCropId);
    if (!crop) return;

    let rule = crop.fertilizers.find(f => f.season === selectedSeason);
    if (!rule) rule = crop.fertilizers[0];

    const isFruit = crop.category === 'fruit';
    const density = FRUIT_TREE_DENSITY[crop.id] || 50;

    // Convert land size to bighas (1 bigha = 33 decimals)
    const landInBigha = isFruit 
      ? (Number(landSize) / density) 
      : (landUnit === 'decimal' ? (Number(landSize) / 33) : Number(landSize));

    const ureaTotal = rule.urea * landInBigha;
    const tspTotal = rule.tsp * landInBigha;
    const mopTotal = rule.mop * landInBigha;
    const gypsumTotal = rule.gypsum * landInBigha;
    const zincTotal = rule.zinc * landInBigha;

    let guidelines: string[];

    if (isFruit) {
      // Per tree doses
      const ureaPerTree = rule.urea / density;
      const tspPerTree = rule.tsp / density;
      const mopPerTree = rule.mop / density;
      const gypsumPerTree = rule.gypsum / density;
      const zincPerTree = rule.zinc / density;

      guidelines = [
        `১. গাছ/গর্ত প্রতি গড় বার্ষিক ডোজ: ইউরিয়া (${formatWeight(ureaPerTree)}), টিএসপি (${formatWeight(tspPerTree)}), এমওপি (${formatWeight(mopPerTree)}), জিপসাম (${formatWeight(gypsumPerTree)}) এবং দস্তা (${formatWeight(zincPerTree)})।`,
        `২. সার প্রয়োগ পদ্ধতি: গাছের গোড়া থেকে ১-১.৫ ফুট দূরে বৃত্তাকার নালা কেটে মাটির সাথে সার ভালোভাবে মিশিয়ে দিন ও হালকা সেচ দিন। বছরে ২ বার (বর্ষার আগে বৈশাখ-জ্যৈষ্ঠ মাসে এবং বর্ষার পরে আশ্বিন-কার্তিক মাসে) সমান কিস্তিতে এই সার প্রয়োগ করুন।`,
        `৩. নতুন গর্ত তৈরির সময়: চারা রোপণের ১০-১৫ দিন পূর্বে গর্তের মাটির সাথে সার ভালোভাবে মিশিয়ে গর্ত ভরাট করে রাখুন।`
      ];
    } else {
      guidelines = [
        `১. ইউরিয়া সার (${formatWeight(ureaTotal)}) ৩টি কিস্তিতে সমানভাগে প্রয়োগ করুন। ১ম কিস্তি চারা রোপণের ১৫ দিন পর, ২য় কিস্তি ৩০ দিন পর এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে দিতে হবে।`,
        `২. জমি শেষ চাষের সময় সমস্ত টিএসপি (${formatWeight(tspTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) এবং দস্তা (${formatWeight(zincTotal)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. এমওপি সার (${formatWeight(mopTotal)}) ২ কিস্তিতে প্রয়োগ করতে হবে: অর্ধেক জমি শেষ চাষের সময় এবং বাকি অর্ধেক চারা রোপণের ৩৫-৪০ দিন পর (২য় বার ইউরিয়া দেওয়ার সময়)।`
      ];
    }

    setResult({
      urea: ureaTotal,
      tsp: tspTotal,
      mop: mopTotal,
      gypsum: gypsumTotal,
      zinc: zincTotal,
      guidelines
    });

  }, [selectedCropId, selectedSeason, landSize, landUnit]);

  return (
    <div className="space-y-8 relative">
      <div className="border-b border-green-primary/10 pb-6">
        <h1 className="text-3xl font-extrabold text-text-primary flex items-center gap-2">
          🧪 スマート সার ক্যালকুলেটর
        </h1>
        <p className="text-text-secondary text-sm">
          আপনার জমির পরিমাপ বা গাছের সংখ্যা অনুযায়ী প্রয়োজনীয় ইউরিয়া, টিএসপি, পটাশ ও জিপসাম সারের সঠিক হিসাব।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-text-primary flex items-center gap-1.5 border-b border-green-primary/5 pb-2">
            <ClipboardList className="w-5 h-5 text-green-primary" />
            {isFruit ? 'বাগানের বিবরণ লিখুন' : 'জমির বিবরণ লিখুন'}
          </h3>

          {/* Crop Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">ফসল নির্বাচন করুন:</label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              {crops.map(c => (
                <option key={c.id} value={c.id}>{c.name_bn}</option>
              ))}
            </select>
          </div>

          {/* Season Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">চাষের মৌসুম:</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option value="বোরো">বোরো (বোরো মৌসুম)</option>
              <option value="আমন">আমন (আমন মৌসুম)</option>
              <option value="আউশ">আউশ (আউশ মৌসুম)</option>
              <option value="রবি">রবি (রবি মৌসুম)</option>
              <option value="খরিপ">খরিপ (খরিপ মৌসুম)</option>
              <option value="শীতকাল">শীতকাল</option>
              <option value="বছরের সব সময়">বছরের সব সময় (বারোমাসি)</option>
            </select>
          </div>

          {/* Land Size Input / Tree Count Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">
              {isFruit ? 'গাছ বা গর্তের সংখ্যা:' : 'জমির পরিমাণ:'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                step="any"
                className="flex-1 min-w-0 bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="bg-soft-white border border-green-primary/20 rounded-xl px-3 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary shrink-0 cursor-pointer"
                disabled={isFruit}
              >
                {isFruit ? (
                  <option value="unit">টি</option>
                ) : (
                  <>
                    <option value="bigha">বিঘা</option>
                    <option value="decimal">শতক</option>
                  </>
                )}
              </select>
            </div>
            <p className="text-[10px] text-text-secondary">
              {isFruit ? 'নোট: গাছ বা প্রস্তুতকৃত গর্তের মোট সংখ্যা লিখুন।' : 'নোট: ১ বিঘা = ৩৩ শতক।'}
            </p>
          </div>
        </div>

        {/* Calculator Output Display */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Bags Visual Layout */}
              <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6">
                <h3 className="font-bold text-text-primary mb-4 text-base">🛍️ প্রয়োজনীয় সারের বস্তা ও পরিমাপ:</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Urea Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-green-primary/5 space-y-2">
                    <span className="text-3xl block">🟢</span>
                    <h4 className="font-bold text-text-primary text-xs">ইউরিয়া</h4>
                    <p className="text-sm font-extrabold text-green-primary">{formatWeight(result.urea)}</p>
                    <span className="text-[9px] text-text-secondary block">
                      ~{translateNumberToBangla((result.urea / 50).toFixed(1))} বস্তা (৫০ কেজি)
                    </span>
                  </div>

                  {/* TSP Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-soil-brown/5 space-y-2">
                    <span className="text-3xl block">🟤</span>
                    <h4 className="font-bold text-text-primary text-xs">টিএসপি</h4>
                    <p className="text-sm font-extrabold text-soil-brown">{formatWeight(result.tsp)}</p>
                    <span className="text-[9px] text-text-secondary block">
                      ~{translateNumberToBangla((result.tsp / 50).toFixed(1))} বস্তা
                    </span>
                  </div>

                  {/* MOP Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-orange-500/5 space-y-2">
                    <span className="text-3xl block">🟠</span>
                    <h4 className="font-bold text-text-primary text-xs">এমওপি (পটাশ)</h4>
                    <p className="text-sm font-extrabold text-orange-600">{formatWeight(result.mop)}</p>
                    <span className="text-[9px] text-text-secondary block">
                      ~{translateNumberToBangla((result.mop / 50).toFixed(1))} বস্তা
                    </span>
                  </div>

                  {/* Gypsum Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-slate-500/5 space-y-2">
                    <span className="text-3xl block">⚪</span>
                    <h4 className="font-bold text-text-primary text-xs">জিপসাম</h4>
                    <p className="text-sm font-extrabold text-slate-600">{formatWeight(result.gypsum)}</p>
                    <span className="text-[9px] text-text-secondary block">
                      ~{translateNumberToBangla((result.gypsum / 50).toFixed(1))} বস্তা
                    </span>
                  </div>

                  {/* Zinc Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-sky-500/5 space-y-2">
                    <span className="text-3xl block">🔵</span>
                    <h4 className="font-bold text-text-primary text-xs">দস্তা (Zinc)</h4>
                    <p className="text-sm font-extrabold text-sky-600">{formatWeight(result.zinc)}</p>
                    <span className="text-[9px] text-text-secondary block">
                      ~{translateNumberToBangla((result.zinc / 50).toFixed(1))} বস্তা
                    </span>
                  </div>
                </div>
              </div>

              {/* Guidelines Steps Timeline */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-text-primary flex items-center gap-1.5">
                  <ClipboardList className="w-5 h-5 text-green-primary" />
                  সার প্রয়োগের সময় ও কিস্তির বিবরণ (DAE গাইডলাইন):
                </h3>
                <div className="space-y-3">
                  {result.guidelines.map((guide, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                      <div className="w-6 h-6 rounded-full bg-green-primary/10 text-green-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p>{guide}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <Calculator className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">সার পরিমাপের ফলাফল দেখতে প্রস্তুত</h4>
                <p className="text-xs text-text-secondary max-w-sm mt-1">
                  বাঁদিকের প্যানেলে আপনার ফসল, মৌসুম ও জমির সাইজ সিলেক্ট করুন। DAE অনুমোদিত সারের ডোজ স্বয়ংক্রিয়ভাবে হিসাব হয়ে যাবে।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FertilizerCalculator() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোডিং সার ক্যালকুলেটর...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
