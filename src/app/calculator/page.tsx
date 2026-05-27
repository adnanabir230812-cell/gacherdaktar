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
    let organicManure = '';

    if (crop.category !== 'fruit') {
      const compostKg = Math.round(600 * landInBigha);
      organicManure = `🌱 জমি তৈরির গোবর সার: জমি শেষ চাষের সময় প্রতি বিঘায় প্রায় ${translateNumberToBangla(compostKg)} কেজি পচা গোবর বা কম্পোস্ট সার মাটির সাথে ভালো করে মিশিয়ে দিন।`;
    }

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
        `৩. নতুন গর্ত তৈরির সময়: চারা রোপণের ১০-১৫ দিন পূর্বে গর্তের মাটির সাথে সার (বিশেষ করে গোবর ১৫ কেজি, টিএসপি ৫০০ গ্রাম ও জিপসাম ২০০ গ্রাম) ভালোভাবে মিশিয়ে গর্ত ভরাট করে রাখুন।`
      ];
    } else if (crop.id === '1' || crop.id === '2' || crop.id === '3' || crop.name_bn.includes('ধান')) {
      // RICE (ধান) specific guidelines
      guidelines = [
        `১. ইউরিয়া সার (${formatWeight(ureaTotal)}) ৩টি সমান কিস্তিতে উপরি-প্রয়োগ করুন: ১ম কিস্তি চারা রোপণের ১৫-২০ দিন পর (কুশি গজানোর শুরুতে), ২য় কিস্তি ৩০-৩৫ দিন পর (সর্বোচ্চ কুশি গজানো অবস্থায়) এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) এবং দস্তা (${formatWeight(zincTotal)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. এমওপি (পটাশ) সার (${formatWeight(mopTotal)}) ২ কিস্তিতে প্রয়োগ করুন: অর্ধেক জমি তৈরির শেষ চাষের সময় এবং বাকি অর্ধেক ২য় কিস্তি ইউরিয়া দেওয়ার সময় (রোপণের ৩৫ দিন পর)।`
      ];
    } else if (crop.id === '4' || crop.name_bn.includes('গম')) {
      // WHEAT (গম) specific guidelines
      guidelines = [
        `১. ইউরিয়া সার (${formatWeight(ureaTotal)}) ২ কিস্তিতে প্রয়োগ করুন: ২/৩ অংশ (দুই-তৃতীয়াংশ) শেষ চাষের সময় এবং বাকি ১/৩ অংশ প্রথম সেচের সময় (বীজ বপনের ২১-২৫ দিন পর, ক্রাউন রুট বা CRI পর্যায়)।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), এমওপি (${formatWeight(mopTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) এবং দস্তা (${formatWeight(zincTotal)}) সার শেষ চাষের সময় মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. বিশেষ বোরন পরামর্শ: গমের দানা পুষ্ট করতে শেষ চাষের সময় বিঘায় ১.৫ কেজি সলুবোর বোরন সার প্রয়োগ করুন। সেচ দেওয়ার পর জমিতে জো (রস কমলে) আসলে উপরি-প্রয়োগ করুন।`
      ];
    } else if (crop.id === '5' || crop.name_bn.includes('ভুট্টা')) {
      // MAIZE (ভুট্টা) specific guidelines
      guidelines = [
        `১. ইউরিয়া সার (${formatWeight(ureaTotal)}) ৩ কিস্তিতে প্রয়োগ করুন: ১/৩ অংশ শেষ চাষে, ১/৩ অংশ বীজ গজানোর ২৫-৩০ দিন পর (৪-৬ পাতা পর্যায়) এবং বাকি ১/৩ অংশ ৫০-৫৫ দিন পর (১০-১২ পাতা বা ফুল আসার পূর্বে)।`,
        `২. এমওপি (পটাশ) সার (${formatWeight(mopTotal)}) ২ কিস্তিতে প্রয়োগ করুন: অর্ধেক শেষ চাষে এবং বাকি অর্ধেক ৫০-৫৫ দিন পর ইউরিয়ার শেষ কিস্তির সাথে।`,
        `৩. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) এবং দস্তা (${formatWeight(zincTotal)}) সার মাটির সাথে মিশিয়ে দিন। সার দেওয়ার পর গাছের গোড়ায় মাটি তুলে দিন।`
      ];
    } else if (crop.id === '6' || crop.name_bn.includes('আলু')) {
      // POTATO (আলু) specific guidelines
      guidelines = [
        `১. ইউরিয়া (${formatWeight(ureaTotal)}) ও এমওপি (${formatWeight(mopTotal)}) সার ২টি কিস্তিতে প্রয়োগ করুন: অর্ধেক জমি তৈরির শেষ চাষের সময় এবং বাকি অর্ধেক রোপণের ৩০-৩৫ দিন পর গাছের গোড়ায় মাটি তোলার সময় (Earthing up)।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}) এবং জিপসাম (${formatWeight(gypsumTotal)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. বিশেষ গুণগত পরামর্শ: ভালো ফলন ও আলুর খোসা মসৃণ রাখতে শেষ চাষের সময় জিপসামের পাশাপাশি বিঘাপ্রতি ২.৫ কেজি ম্যাগনেসিয়াম সালফেট সার প্রয়োগ করুন।`
      ];
    } else if (crop.category === 'commercial' && (crop.id === '46' || crop.name_bn.includes('পাট'))) {
      // JUTE (পাট) specific guidelines
      guidelines = [
        `১. ইউরিয়া সার (${formatWeight(ureaTotal)}) ২টি কিস্তিতে প্রয়োগ করুন: অর্ধেক শেষ চাষের সময় এবং বাকি অর্ধেক বীজ বপনের ৪০-৪৫ দিন পর (চারা পাতলা করার পর নিড়ানি দেওয়ার সময়)।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}) এবং এমওপি (${formatWeight(mopTotal)}) সার শেষ চাষের সময় মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. বিশেষ পরামর্শ: পাটের আঁশ সোনালী ও লম্বা করতে বীজ লাইনে বপন করুন। পাট কাটার পর পাতাগুলো জমিতে ফেলে পচতে দিন, এটি পরবর্তী আমন ধানের জন্য চমৎকার জৈব সার হিসেবে কাজ করে।`
      ];
    } else if (crop.category === 'commercial' && (crop.id === '47' || crop.name_bn.includes('আখ'))) {
      // SUGARCANE (আখ) specific guidelines
      guidelines = [
        `১. ইউরিয়া (${formatWeight(ureaTotal)}) ও এমওপি (${formatWeight(mopTotal)}) সার ৩টি কিস্তিতে প্রয়োগ করুন: ১ম কিস্তি আখের কুশি আসার শুরুতে (৪০-৪৫ দিন), ২য় কিস্তি ৯০-১০০ দিন পর এবং ৩য় কিস্তি ১৫০-১৬০ দিন পর আখের বাড়ন্ত পর্যায়ে।`,
        `২. রোপণের সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) এবং দস্তা (${formatWeight(zincTotal)}) সার নালা বা খাদের (Trench) মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. বিশেষ পরামর্শ: আখের কান্ড মজবুত ও চিনি বাড়াতে ৩য় কিস্তির পর গোড়ায় ভালোভাবে মাটি তুলে দিয়ে আখের ঝাড় একসাথে বেঁধে দিন।`
      ];
    } else if (crop.id === '34' || crop.id === '35' || (crop.category === 'grain' && (crop.name_bn.includes('ডাল') || crop.name_bn.includes('মসুর') || crop.name_bn.includes('মুগ')))) {
      // PULSES (মসুর, মুগ, খেসারি) specific guidelines
      guidelines = [
        `১. নাইট্রোজেন নিয়ামক: ডাল ফসলের শিকড়ে গুটি থাকায় ইউরিয়া সার খুব কম লাগে। সম্পূর্ণ ইউরিয়া (${formatWeight(ureaTotal)}) শেষ চাষে একবারে দিয়ে দিন, কোনো কিস্তি বা উপরি-প্রয়োগের প্রয়োজন নেই।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), এমওপি (${formatWeight(mopTotal)}) এবং জিপসাম (${formatWeight(gypsumTotal)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. বিশেষ রাইজোবিয়াম পরামর্শ: বীজ বপনের পূর্বে বিঘাপ্রতি ১০০ গ্রাম রাইজোবিয়াম ব্যাকটেরিয়া কালচার বীজের সাথে মিশিয়ে ছায়ায় শুকিয়ে বপন করুন, এতে ইউরিয়া ছাড়াই ফলন ৩০% বৃদ্ধি পাবে।`
      ];
    } else if (crop.id === '30' || crop.name_bn.includes('সরিষা') || crop.name_bn.includes('তিল') || crop.name_bn.includes('সূর্যমুখী')) {
      // OILSEEDS (সরিষা, তিল, সূর্যমুখী) specific guidelines
      guidelines = [
        `১. ইউরিয়া সার (${formatWeight(ureaTotal)}) ২টি কিস্তিতে প্রয়োগ করুন: অর্ধেক শেষ চাষে এবং বাকি অর্ধেক প্রথম সেচ বা ফুল আসার সময় (বপনের ২০-২৫ দিন পর)।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), এমওপি (${formatWeight(mopTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) এবং বোরন সার শেষ চাষে প্রয়োগ করুন।`,
        `৩. বিশেষ তেল ঘনত্ব পরামর্শ: তৈলবীজে সালফারের কাজ করে জিপসাম সার, যা তেলের পরিমাণ ও গন্ধ বাড়ায়। ফুল আসার সময় জাবপোকার আক্রমণ রোধে সরিষা ঘন করে বপন করা যাবে না (১-১.২ কেজি/বিঘা বীজ হারের মধ্যে রাখুন)।`
      ];
    } else if (crop.category === 'spice' && (crop.id === '24' || crop.id === '25' || crop.id === '51' || crop.name_bn.includes('পেঁয়াজ') || crop.name_bn.includes('রসুন'))) {
      // ONION & GARLIC (পেঁয়াজ, রসুন) specific guidelines
      guidelines = [
        `১. ইউরিয়া (${formatWeight(ureaTotal)}) ও এমওপি (${formatWeight(mopTotal)}) সার ২টি সমান কিস্তিতে প্রয়োগ করুন: অর্ধেক জমি তৈরির শেষ চাষের সময় এবং বাকি অর্ধেক চারা/কোয়া রোপণের ২৫-৩০ দিন পর এবং ৫০-৫৫ দিন পর সমান ভাগে দুই দফায়।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}) এবং জিপসাম (${formatWeight(gypsumTotal)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. বিশেষ সংরক্ষণ পরামর্শ: পেঁয়াজ ও রসুনের ঝাঁঝালো স্বাদ ও দীর্ঘ দিন পচন ছাড়া ঘরে রাখার জন্য সালফার সারের ব্যবহার অত্যন্ত গুরুত্বপূর্ণ।`
      ];
    } else {
      // VEGETABLES & SPICES & OTHERS general guidelines
      guidelines = [
        `১. ইউরিয়া (${formatWeight(ureaTotal)}) ও এমওপি (${formatWeight(mopTotal)}) সার ৩টি সমান কিস্তিতে উপরি-প্রয়োগ করুন: চারা রোপণের ১০-১৫ দিন পর, ৩০-৩৫ দিন পর (ফুল আসার পূর্বে) এবং ফল সংগ্রহের শুরুতে।`,
        `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) এবং দস্তা (${formatWeight(zincTotal)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`,
        `৩. ক্যালসিয়াম ও পচন রোগ প্রতিরোধ: বেগুন ও টমেটোর ক্ষেত্রে ফলের নিচে কালো দাগ হওয়া ঠেকাতে জিপসাম এবং শেষ চাষে ডলোমাইট চুন (শতক প্রতি ১.৫ কেজি) প্রয়োগ করুন।`
      ];
    }

    if (organicManure && crop.category !== 'fruit') {
      guidelines.unshift(organicManure);
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
