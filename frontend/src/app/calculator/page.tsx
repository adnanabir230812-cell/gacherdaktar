'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator, Sprout, Landmark, ArrowRight, HelpCircle, ClipboardList, RefreshCw, AlertTriangle } from 'lucide-react';
import { Crop, CROPS } from '../api/data';
import { CROP_GUIDELINES_DB } from '../api/cropGuidelines';

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

const LOADING_MESSAGES = [
  'আপনার শস্য ও চাষের বিবরণ বিশ্লেষণ করা হচ্ছে...',
  'DAE গাইডলাইন অনুযায়ী সারের সুনির্দিষ্ট মাত্রা হিসাব করা হচ্ছে...',
  'গাছের ডাক্তারের ডাটাবেজ থেকে মাটির পুষ্টি উপাদান মেলানো হচ্ছে...',
  'প্রিয় কৃষক ভাইয়ের জন্য বিশেষ পরামর্শ ও কিস্তির বিবরণ প্রস্তুত করা হচ্ছে...'
];

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

const formatChatMessageMarkdown = (text: any) => {
  if (!text) return '';
  const cleanText = Array.isArray(text) ? text.join('\n') : String(text);
  return cleanText.split('\n').map((line, lineIdx) => {
    let isBullet = false;
    let cleanLine = line;
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      isBullet = true;
      cleanLine = line.trim().replace(/^[-*•]\s+/, '');
    }
    
    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
    const content = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx} className="font-extrabold text-green-primary">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    return (
      <p key={lineIdx} className={`mb-1 leading-relaxed text-xs md:text-sm ${isBullet ? 'pl-4 list-item list-disc' : ''}`}>
        {content}
      </p>
    );
  });
};

function CalculatorContent() {
  const searchParams = useSearchParams();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('বোরো');
  const [landSize, setLandSize] = useState<number | ''>(1);
  const [landUnit, setLandUnit] = useState('bigha'); // bigha, decimal, or unit
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [personalizedAdvice, setPersonalizedAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isInputsChanged, setIsInputsChanged] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Inline Chat States
  const [inlineChatMessages, setInlineChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [inlineChatInput, setInlineChatInput] = useState('');
  const [inlineChatLoading, setInlineChatLoading] = useState(false);

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
      setIsInputsChanged(true);
    }
  }, [selectedCropId]);

  // Set default season dynamically and reset when crop changes
  useEffect(() => {
    if (!selectedCropId) return;
    const selected = CROPS.find(c => c.id === selectedCropId);
    if (selected) {
      if (selected.seasons && selected.seasons.length > 0) {
        setSelectedSeason(selected.seasons[0]);
      }
      setIsInputsChanged(true);
    }
  }, [selectedCropId]);

  // Set inputs changed when fields change (season, landSize, landUnit)
  useEffect(() => {
    setIsInputsChanged(true);
  }, [selectedSeason, landSize, landUnit]);

  // Handle Calculate button click
  const handleCalculate = async () => {
    if (!selectedCropId || landSize === '' || landSize <= 0) {
      alert('দয়া করে সঠিক ফসল ও জমির পরিমাণ দিন।');
      return;
    }

    setCalculating(true);
    setLoadingAdvice(true);
    setLoadingStep(0);

    const crop = CROPS.find(c => c.id === selectedCropId);
    if (!crop) {
      setCalculating(false);
      setLoadingAdvice(false);
      return;
    }

    let rule = crop.fertilizers.find(f => f.season === selectedSeason);
    if (!rule) rule = crop.fertilizers[0];

    const isFruit = crop.category === 'fruit';
    const density = FRUIT_TREE_DENSITY[crop.id] || 50;

    // Convert land size to bighas (1 bigha = 33 decimals, 1 acre = 100 decimals = 3.0303 bighas)
    const landInBigha = isFruit 
      ? (Number(landSize) / density) 
      : (landUnit === 'decimal' 
          ? (Number(landSize) / 33) 
          : (landUnit === 'acre' 
              ? (Number(landSize) * (100 / 33)) 
              : Number(landSize)));

    const ureaTotal = rule.urea * landInBigha;
    const tspTotal = rule.tsp * landInBigha;
    const mopTotal = rule.mop * landInBigha;
    const gypsumTotal = rule.gypsum * landInBigha;
    const zincTotal = rule.zinc * landInBigha;

    let guidelines: string[] = [];
    let organicManure = '';

    const customRule = CROP_GUIDELINES_DB[crop.id];

    if (isFruit) {
      // Per tree doses
      const ureaPerTree = rule.urea / density;
      const tspPerTree = rule.tsp / density;
      const mopPerTree = rule.mop / density;
      const gypsumPerTree = rule.gypsum / density;
      const zincPerTree = rule.zinc / density;

      const rawSplits = customRule ? customRule.splits : [
        'গাছ প্রতি বার্ষিক ডোজ ২টি সমান কিস্তিতে দিন: ১ম কিস্তি বর্ষার শুরুতে (বৈশাখ-জ্যৈষ্ঠ মাস) এবং ২য় কিস্তি বর্ষার শেষে (আশ্বিন-কার্তিক মাস)।',
        'প্রয়োগ পদ্ধতি: গাছের গোড়া থেকে ১-১.৫ ফুট দূরে বৃত্তাকার নালা কেটে সার মাটির সাথে সার ভালোভাবে মিশিয়ে দিন ও হালকা সেচ দিন।'
      ];

      const fruitCompostMap: { [key: string]: string } = {
        '36': '১৫ কেজি পচা গোবর সার, ৫০০ গ্রাম টিএসপি ও ২০০ গ্রাম জিপসাম', // আম
        '37': '২০ কেজি গোবর সার, ৬০০ গ্রাম টিএসপি ও ২৫০ গ্রাম জিপসাম', // কাঁঠাল
        '38': '১৫ কেজি গোবর সার, ৫০০ গ্রাম টিএসপি ও ২০০ গ্রাম জিপসাম', // লিচু
        '39': '১০ কেজি গোবর সার, ৪০০ গ্রাম টিএসপি ও ১৫০ গ্রাম জিপসাম', // কলা
        '40': '১০ কেজি গোবর সার, ৩০০ গ্রাম টিএসপি ও ১৫০ গ্রাম জিপসাম', // পেয়ারা
        '41': '৮ কেজি গোবর সার, ২৫০ গ্রাম টিএসপি ও ১০০ গ্রাম জিপসাম', // পেঁপে
        '44': '৬ কেজি গোবর সার, ২০০ গ্রাম টিএসপি ও ১০০ গ্রাম জিপসাম', // লেবু
        '45': '২৫ কেজি গোবর সার, ১ কেজি টিএসপি ও ৫০০ গ্রাম জিপসাম' // নারিকেল
      };
      const fruitCompost = fruitCompostMap[crop.id] || '১৫ কেজি পচা গোবর সার, ৫০০ গ্রাম টিএসপি ও ২০০ গ্রাম জিপসাম';

      guidelines = [
        `১. গাছ/গর্ত প্রতি গড় বার্ষিক ডোজ: ইউরিয়া (${formatWeight(ureaPerTree)}), টিএসপি (${formatWeight(tspPerTree)}), এমওপি (${formatWeight(mopPerTree)}), জিপসাম (${formatWeight(gypsumPerTree)}) এবং দস্তা (${formatWeight(zincPerTree)})।`,
        ...rawSplits.map((s, i) => `${translateNumberToBangla(i + 2)}. ${s}`),
        `💡 বিশেষ পরামর্শ: ${customRule?.specialNotes || 'চারা রোপণের ১০-১৫ দিন পূর্বে গর্তের মাটির সাথে প্রয়োজনীয় জৈব সার (গর্ত প্রতি প্রায় ' + fruitCompost + ') ভালোভাবে মিশিয়ে গর্ত ভরাট করে রাখুন।'}`
      ];
    } else {
      if (customRule) {
        const compostKg = Math.round(customRule.compostRate * landInBigha);
        if (compostKg > 0) {
          organicManure = `🌱 জমি তৈরির গোবর সার: জমি শেষ চাষের সময় প্রতি বিঘায় প্রায় ${translateNumberToBangla(compostKg)} কেজি পচা গোবর বা কম্পোস্ট সার মাটির সাথে ভালো করে মিশিয়ে দিন।`;
        }

        const rawSplits = customRule.splits.map(s => {
          return s.replace(/ইউরিয়া সার/g, `ইউরিয়া সার (${formatWeight(ureaTotal)})`)
                  .replace(/ইউরিয়া/g, `ইউরিয়া (${formatWeight(ureaTotal)})`)
                  .replace(/টিএসপি/g, `টিএসপি (${formatWeight(tspTotal)})`)
                  .replace(/এমওপি/g, `এমওপি (${formatWeight(mopTotal)})`)
                  .replace(/জিপসাম/g, `জিপসাম (${formatWeight(gypsumTotal)})`)
                  .replace(/দস্তা/g, `দস্তা (${formatWeight(zincTotal)})`);
        });

        guidelines = customRule.specialNotes 
          ? [...rawSplits, `💡 বিশেষ পরামর্শ: ${customRule.specialNotes}`]
          : rawSplits;
      } else {
        // Fallback based on category
        const compostKg = Math.round(600 * landInBigha);
        organicManure = `🌱 জমি তৈরির গোবর সার: জমি শেষ চাষের সময় প্রতি বিঘায় প্রায় ${translateNumberToBangla(compostKg)} কেজি পচা গোবর বা কম্পোস্ট সার মাটির সাথে ভালো করে মিশিয়ে দিন।`;
        guidelines = [
          `১. ইউরিয়া (${formatWeight(ureaTotal)}) ও এমওপি (${formatWeight(mopTotal)}) সার ৩টি সমান কিস্তিতে উপরি-প্রয়োগ করুন: চারা রোপণের ১০-১৫ দিন পর, ৩০-৩৫ দিন পর (ফুল আসার পূর্বে) এবং ফল সংগ্রহের শুরুতে।`,
          `২. জমি তৈরির সময়: সমস্ত টিএসপি (${formatWeight(tspTotal)}), জিপসাম (${formatWeight(gypsumTotal)}) and দস্তা (${formatWeight(zincTotal)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।`
        ];
      }
    }

    if (organicManure && crop.category !== 'fruit') {
      guidelines.unshift(organicManure);
    }

    // Start loader message cycling
    const loadingInterval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 450);

    // Call API for personalized advisor chat text
    const apiFetchPromise = (async () => {
      try {
        const promptQuery = `আমি আমার জমিতে ${crop.name_bn} চাষ করছি। আমার চাষের বিবরণ:
মৌসুম: ${selectedSeason}
জমির পরিমাপ/গাছের সংখ্যা: ${landSize} ${landUnit === 'decimal' ? 'শতক' : landUnit === 'bigha' ? 'বিঘা' : landUnit === 'acre' ? 'একর' : 'টি'}।
এই চাষের জন্য প্রয়োজনীয় ইউরিয়া, টিএসপি, পটাশ, জিপসাম ও দস্তা সারের প্রয়োগ পদ্ধতি, কোনো বিশেষ মাটির পরামর্শ বা উপরি-প্রয়োগের কিস্তি বিভাজন অত্যন্ত নম্র ও বিনয়ী ভাষায় মানুষের মতো আমাকে সুন্দর করে বুঝিয়ে বলুন।`;

        // AbortController for a 6-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: promptQuery,
            history: [],
            district: localStorage.getItem("krishisathi_user_district") || "ঢাকা"
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await res.json();
        if (res.ok && data.answer_bn) {
          return {
            advice: data.answer_bn,
            chatInit: [
              { 
                sender: 'bot' as const, 
                text: `প্রিয় কৃষক ভাই, আপনার সারের মাত্রা ও প্রয়োগ নিয়ে অতিরিক্ত কোনো জিজ্ঞাসা থাকলে আমাকে বলতে পারেন।` 
              }
            ]
          };
        } else {
          return {
            advice: 'প্রিয় কৃষক ভাই, গাছের ডাক্তারের সাথে সংযোগ করতে কিছুটা সমস্যা হয়েছে। তবে আপনি নিচে উল্লেখিত সারের সরকারি মাত্রা ও প্রয়োগ নির্দেশিকা নিরাপদভাবে অনুসরণ করতে পারেন।',
            chatInit: []
          };
        }
      } catch (err) {
        console.error(err);
        return {
          advice: 'প্রিয় কৃষক ভাই, নেটওয়ার্কের ধীরগতির কারণে গাছের ডাক্তার পরামর্শ লোড করতে পারেনি। আপনি নিচে উল্লেখিত সারের সঠিক পরিমাপ ও প্রয়োগের নিয়মগুলো অনুসরণ করতে পারেন।',
          chatInit: []
        };
      }
    })();

    // Minimum delay promise of 1400ms for a smooth visual experience
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1400));

    try {
      const [apiResult] = await Promise.all([apiFetchPromise, delayPromise]);
      
      // Update everything in one unified state update!
      setResult({
        urea: ureaTotal,
        tsp: tspTotal,
        mop: mopTotal,
        gypsum: gypsumTotal,
        zinc: zincTotal,
        guidelines
      });
      setPersonalizedAdvice(apiResult.advice);
      if (apiResult.chatInit.length > 0) {
        setInlineChatMessages(apiResult.chatInit);
      } else {
        setInlineChatMessages([]);
      }
      setIsInputsChanged(false);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(loadingInterval);
      setCalculating(false);
      setLoadingAdvice(false);
    }
  };

  const handleSendInlineChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineChatInput.trim() || !result || inlineChatLoading) return;

    const userMessageText = inlineChatInput;
    setInlineChatInput('');
    setInlineChatLoading(true);

    const newMessages = [
      ...inlineChatMessages,
      { sender: 'user' as const, text: userMessageText }
    ];
    setInlineChatMessages(newMessages);

    try {
      const crop = CROPS.find(c => c.id === selectedCropId);
      const hiddenHistory = [
        { sender: 'user' as const, text: `আমি আমার জমির জন্য সার হিসাব করেছি। ফসল: ${crop?.name_bn || ''}, মৌসুম: ${selectedSeason}, জমির পরিমাণ: ${landSize} ${landUnit === 'decimal' ? 'শতক' : landUnit === 'bigha' ? 'বিঘা' : landUnit === 'acre' ? 'একর' : 'টি'}।` },
        { sender: 'bot' as const, text: `প্রিয় কৃষক ভাই, আমি আপনার জমির জন্য সারের হিসাব ও প্রয়োগের কিস্তি নির্ধারণ করে দিয়েছি:
ইউরিয়া: ${formatWeight(result.urea)}
টিএসপি: ${formatWeight(result.tsp)}
এমওপি: ${formatWeight(result.mop)}
জিপসাম: ${formatWeight(result.gypsum)}
দস্তা (Zinc): ${formatWeight(result.zinc)}

সার প্রয়োগের নির্দেশাবলী:
${result.guidelines.join('\n')}

এই সারের মাত্রা বা প্রয়োগ নিয়ে আপনার কোনো জিজ্ঞাসা থাকলে নির্দ্বিধায় বলুন।` },
        ...inlineChatMessages.slice(1)
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessageText,
          history: hiddenHistory,
          district: localStorage.getItem("krishisathi_user_district") || "ঢাকা"
        })
      });

      const data = await res.json();
      if (res.ok && data.answer_bn) {
        setInlineChatMessages([
          ...newMessages,
          { sender: 'bot', text: data.answer_bn }
        ]);
      } else {
        setInlineChatMessages([
          ...newMessages,
          { sender: 'bot', text: 'দুঃখিত, উত্তর তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setInlineChatMessages([
        ...newMessages,
        { sender: 'bot', text: 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট চেক করে আবার চেষ্টা করুন।' }
      ]);
    } finally {
      setInlineChatLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="border-b border-green-primary/10 pb-6">
        <h1 className="text-3xl font-extrabold text-text-primary flex items-center gap-2">
          🧪 স্মার্ট সার ক্যালকুলেটর
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
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold"
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
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold"
            >
              {crop?.seasons && crop.seasons.length > 0 ? (
                crop.seasons.map(season => (
                  <option key={season} value={season}>{season} (মৌসুম)</option>
                ))
              ) : (
                <option value="রবি">রবি (রবি মৌসুম)</option>
              )}
            </select>
          </div>

          {/* Land Size Input / Tree Count Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">
              {isFruit ? 'গাছ বা গর্তের সংখ্যা:' : 'জমির পরিমাণ:'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                step="any"
                className="flex-1 min-w-0 bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold"
              />
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="bg-soft-white border border-green-primary/20 rounded-xl px-3 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary shrink-0 cursor-pointer font-bold"
                disabled={isFruit}
              >
                {isFruit ? (
                  <option value="unit">টি</option>
                ) : (
                  <>
                    <option value="decimal">শতক</option>
                    <option value="bigha">বিঘা</option>
                    <option value="acre">একর</option>
                  </>
                )}
              </select>
            </div>
            <p className="text-[10px] text-text-secondary">
              {isFruit ? 'নোট: গাছ বা প্রস্তুতকৃত গর্তের মোট সংখ্যা লিখুন।' : 'নোট: ১ বিঘা = ৩৩ শতক।'}
            </p>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={calculating || loadingAdvice}
            className="w-full py-3.5 bg-green-primary hover:bg-[#153526] active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            {(calculating || loadingAdvice) ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                হিসাব করা হচ্ছে...
              </>
            ) : (
              <>
                সারের হিসেব করুন <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Calculator Output Display */}
        <div className="lg:col-span-2 space-y-6">
          {calculating ? (
            <div className="h-full min-h-[350px] border border-green-primary/15 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-5 bg-soft-white/70 backdrop-blur-md shadow-lg">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-green-primary/25 border-t-green-primary animate-spin" />
                <Sprout className="w-8 h-8 text-green-primary absolute animate-bounce" />
              </div>
              <div className="space-y-3">
                <h4 className="font-extrabold text-text-primary text-base md:text-lg">সার সুপারিশ ও ডাক্তারী পরামর্শ মেলানো হচ্ছে</h4>
                <div className="inline-block bg-green-primary/10 border border-green-primary/20 text-green-primary text-xs md:text-sm font-black px-4 py-2 rounded-full animate-pulse shadow-sm">
                  ⚡ {LOADING_MESSAGES[loadingStep]}
                </div>
                <p className="text-[11px] md:text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">
                  প্রিয় কৃষক ভাইয়ের ফসল ({crop?.name_bn || ''}) এর সারের সরকারি মাত্রা এবং গাছের ডাক্তারের ব্যক্তিগত পরামর্শ একত্রিত করে সম্পূর্ণ প্রেসক্রিপশন লোড করা হচ্ছে।
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-fade-in relative">
              {/* inputs changed overlay */}
              {isInputsChanged && (
                <div className="absolute inset-0 bg-soft-white/80 backdrop-blur-[3px] z-20 flex flex-col items-center justify-center p-6 text-center rounded-3xl border-2 border-dashed border-amber-500/20 shadow-md">
                  <div className="bg-[#FAF8F2] border-2 border-[#B79400]/25 text-[#B79400] rounded-2xl p-6 max-w-sm shadow-xl flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 text-xl font-bold">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-text-primary text-sm md:text-base">চাষের বিবরণ পরিবর্তন করা হয়েছে</h4>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-semibold">
                        আপনি ফসল, মৌসুম বা জমির সাইজ পরিবর্তন করেছেন ভাই। নতুন বিবরণ অনুযায়ী সারের মাত্রা ও ডাক্তারের ব্যক্তিগত পরামর্শ আপডেট করতে অনুগ্রহ করে বামের প্যানেল থেকে **'সারের হিসেব করুন'** বোতামে ক্লিক করুন।
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 👨‍🌾 AI Doctor Personalized Advice Card */}
              <div className="bg-[#FAF8F2] border-2 border-[#B79400]/25 rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#E5B83B] to-[#B79400]" />
                
                <h3 className="font-bold text-text-primary mb-3 text-base flex items-center gap-2">
                  <span>👨‍🌾</span> গাছের ডাক্তারের ব্যক্তিগত পরামর্শ:
                </h3>
                
                {loadingAdvice ? (
                  <div className="space-y-3 animate-pulse py-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : (
                  <div className="text-text-primary text-xs md:text-sm leading-relaxed whitespace-pre-line font-bold">
                    {formatChatMessageMarkdown(personalizedAdvice)}
                  </div>
                )}
              </div>

              {/* Bags Visual Layout */}
              <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6">
                <h3 className="font-bold text-text-primary mb-4 text-base">🛍️ প্রয়োজনীয় সারের বস্তা ও পরিমাপ:</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Urea Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-green-primary/5 space-y-3 flex flex-col justify-between items-center shadow-sm">
                    <div className="w-16 h-20 relative overflow-hidden rounded-lg shadow-sm border border-green-primary/10">
                      <img 
                        src="/images/fertilizers/urea.png" 
                        alt="ইউরিয়া সার" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-xs">ইউরিয়া</h4>
                      <p className="text-sm font-extrabold text-green-primary mt-1">{formatWeight(result.urea)}</p>
                      <span className="text-[9px] text-text-secondary block mt-1">
                        ~{translateNumberToBangla((result.urea / 50).toFixed(1))} বস্তা (৫০ কেজি)
                      </span>
                    </div>
                  </div>

                  {/* TSP Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-soil-brown/5 space-y-3 flex flex-col justify-between items-center shadow-sm">
                    <div className="w-16 h-20 relative overflow-hidden rounded-lg shadow-sm border border-[#B79400]/10">
                      <img 
                        src="/images/fertilizers/tsp.png" 
                        alt="টিএসপি সার" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-xs">টিএসপি</h4>
                      <p className="text-sm font-extrabold text-soil-brown mt-1">{formatWeight(result.tsp)}</p>
                      <span className="text-[9px] text-text-secondary block mt-1">
                        ~{translateNumberToBangla((result.tsp / 50).toFixed(1))} বস্তা
                      </span>
                    </div>
                  </div>

                  {/* MOP Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-orange-500/5 space-y-3 flex flex-col justify-between items-center shadow-sm">
                    <div className="w-16 h-20 relative overflow-hidden rounded-lg shadow-sm border border-orange-500/10">
                      <img 
                        src="/images/fertilizers/mop.png" 
                        alt="এমওপি পটাশ সার" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-xs">এমওপি (পটাশ)</h4>
                      <p className="text-sm font-extrabold text-orange-600 mt-1">{formatWeight(result.mop)}</p>
                      <span className="text-[9px] text-text-secondary block mt-1">
                        ~{translateNumberToBangla((result.mop / 50).toFixed(1))} বস্তা
                      </span>
                    </div>
                  </div>

                  {/* Gypsum Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-slate-500/5 space-y-3 flex flex-col justify-between items-center shadow-sm">
                    <div className="w-16 h-20 relative overflow-hidden rounded-lg shadow-sm border border-slate-500/10">
                      <img 
                        src="/images/fertilizers/gypsum.png" 
                        alt="জিপসাম সার" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-xs">জিপসাম</h4>
                      <p className="text-sm font-extrabold text-slate-600 mt-1">{formatWeight(result.gypsum)}</p>
                      <span className="text-[9px] text-text-secondary block mt-1">
                        ~{translateNumberToBangla((result.gypsum / 50).toFixed(1))} বস্তা
                      </span>
                    </div>
                  </div>

                  {/* Zinc Bag */}
                  <div className="border border-green-primary/10 rounded-2xl p-4 text-center bg-sky-500/5 space-y-3 flex flex-col justify-between items-center shadow-sm">
                    <div className="w-16 h-20 relative overflow-hidden rounded-lg shadow-sm border border-sky-500/10">
                      <img 
                        src="/images/fertilizers/zinc.png" 
                        alt="দস্তা সার" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-xs">দস্তা (Zinc)</h4>
                      <p className="text-sm font-extrabold text-sky-600 mt-1">{formatWeight(result.zinc)}</p>
                      <span className="text-[9px] text-text-secondary block mt-1">
                        ~{translateNumberToBangla((result.zinc / 50).toFixed(1))} বস্তা
                      </span>
                    </div>
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

              {/* 💬 Context-Aware Inline Chat Panel */}
              <div className="border-t border-green-primary/10 pt-6 space-y-4">
                <div className="bg-green-primary/5 border border-green-primary/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-primary font-black text-xs md:text-sm uppercase tracking-wider">
                    <span>💬 গাছের ডাক্তারের লাইভ চ্যাট</span>
                  </div>
                  
                  {/* Messages Stream */}
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs md:text-sm">
                    {inlineChatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 font-semibold leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-green-primary text-white rounded-br-none'
                              : 'bg-white border border-green-primary/10 text-text-primary rounded-bl-none shadow-sm'
                          }`}
                        >
                          {formatChatMessageMarkdown(msg.text)}
                        </div>
                      </div>
                    ))}
                    
                    {inlineChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-green-primary/10 rounded-2xl rounded-bl-none px-4 py-2.5 text-text-secondary flex items-center gap-2 shadow-sm font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-primary animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-green-primary animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-green-primary animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input Form */}
                  <form onSubmit={handleSendInlineChatMessage} className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      value={inlineChatInput}
                      onChange={(e) => setInlineChatInput(e.target.value)}
                      placeholder="সার প্রয়োগ বা মাত্রা নিয়ে গাছের ডাক্তারকে প্রশ্ন করুন..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-green-primary/20 bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-green-primary font-bold text-xs md:text-sm shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={inlineChatLoading || !inlineChatInput.trim()}
                      className="px-4 py-2.5 bg-green-primary hover:bg-[#153526] disabled:opacity-50 text-white font-extrabold text-xs md:text-sm rounded-xl cursor-pointer transition-all duration-200 w-full sm:w-auto"
                    >
                      পাঠান
                    </button>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <Calculator className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">সার পরিমাপের ফলাফল দেখতে প্রস্তুত</h4>
                <p className="text-xs text-text-secondary max-w-sm mt-1">
                  বামেদিকের প্যানেলে আপনার ফসল, মৌসুম ও জমির সাইজ সিলেক্ট করে **'সারের হিসেব করুন'** বোতামে ক্লিক করুন। গাছের ডাক্তার সুনির্দিষ্ট সারের হিসাব এবং প্রফেশনাল পরামর্শ তৈরি করে দেবে।
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
    <Suspense fallback={<div className="text-center py-20 font-bold">লোডিং সার ক্যালকুলেটর...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
