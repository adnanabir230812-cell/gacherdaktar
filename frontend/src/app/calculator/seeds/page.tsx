'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, ShieldCheck, ClipboardList, Info, RefreshCw, AlertTriangle, ChevronDown } from 'lucide-react';

const LOADING_MESSAGES = [
  'আপনার ফসলের জাত ও বীজ বপন নির্দেশিকা বিশ্লেষণ করা হচ্ছে...',
  'জমির পরিমাপ অনুযায়ী বীজের সঠিক ওজন গণনা করা হচ্ছে...',
  'বারি (BARI) ও ব্রি (BRRI) গাইডলাইন অনুযায়ী আদর্শ রোপণ দূরত্ব নির্ধারণ করা হচ্ছে...',
  'গাছের ডাক্তারের ডাটাবেস থেকে বীজ শোধন নিয়ম প্রস্তুত করা হচ্ছে...'
];

interface CropSeedData {
  id: string;
  name_bn: string;
  seed_rate_per_bigha_kg: number; // kg per bigha (33 decimals)
  spacing_bn: string;
  depth_bn: string;
  sowing_method_bn: string;
  treatment_bn: string;
  line_sowing_bn: string;
}

const SEED_DATABASE: CropSeedData[] = [
  {
    id: 'rice_transplant',
    name_bn: "রোপা ধান (Transplant Rice)",
    seed_rate_per_bigha_kg: 5.5,
    spacing_bn: "২০ সেমি × ১৫ সেমি (সারি থেকে সারি এবং চারা থেকে চারা)",
    depth_bn: "২ - ৩ সেমি গভীরতা বীজতলার জন্য",
    sowing_method_bn: "বীজতলায় চারা তৈরি করে ২৫-৩০ দিন বয়সের কচি চারা জমিতে মূল রোপণ করুন। লাইন সোজা করে রোপণ করলে আলো ও বাতাস চলাচল সহজ হয় এবং ফলন বাড়ে।",
    treatment_bn: "বীজ বপনের পূর্বে প্রতি কেজি ধানের বীজের জন্য ২ গ্রাম কার্বেন্ডাজিম বা প্রোভ্যাক্স মিশিয়ে বীজ শোধন করুন। এতে বাকানি ও চারা ঝলসানো রোগ প্রতিরোধ হয়।",
    line_sowing_bn: "লাইন সোজা করে রোপণ করলে নিড়ানি যন্ত্র (Weeder) সহজে ব্যবহার করা যায়, যা আগাছা দমনের খরচ ৪০% কমায়।"
  },
  {
    id: 'potato',
    name_bn: "আলু (Seed Potato)",
    seed_rate_per_bigha_kg: 200,
    spacing_bn: "৬০ সেমি × ২৫ সেমি (সারি থেকে সারি এবং আলু থেকে আলু)",
    depth_bn: "৮ - ১০ সেমি গভীরতা",
    sowing_method_bn: "আস্ত বা কাটা বীজ আলু চোখ উপরের দিকে রেখে রোপণ করুন। লাইন করে রোপণ করলে সেচ ও কুদাল দিয়ে সার প্রয়োগ অত্যন্ত সহজ হয়।",
    treatment_bn: "বীজ আলু কাটার পর কাটা অংশে ম্যানকোজেব বা কার্বেন্ডাজিম পাউডার মেখে ছায়ায় শুকিয়ে নিন। এতে মাটির ভেতরের ছত্রাকজনিত পচন প্রতিরোধ হয়।",
    line_sowing_bn: "সারি করে রোপণ করলে আলুর ওপরে মাটির স্তূপ (Earthing up) দেওয়া সহজ হয়, যা ফলন ২০-৩০% বাড়িয়ে দেয়।"
  },
  {
    id: 'onion',
    name_bn: "পেঁয়াজ (Onion Seed)",
    seed_rate_per_bigha_kg: 1.2,
    spacing_bn: "১৫ সেমি × ১০ সেমি (সারি থেকে সারি এবং পেঁয়াজ থেকে পেঁয়াজ)",
    depth_bn: "১ - ১.৫ সেমি গভীরতা বীজতলায়",
    sowing_method_bn: "বীজতলায় চারা তৈরি করে মূল জমিতে রোপণ করতে হবে। সারি করে রোপণ করলে পেঁয়াজের কন্দ বড় হওয়ার জন্য পর্যাপ্ত পুষ্টি ও জায়গা পায়।",
    treatment_bn: "বীজ বপনের পূর্বে রোদে ভালোভাবে শুকিয়ে নিন এবং কার্বেন্ডাজিম দিয়ে শোধন করুন যাতে চারা পচা রোগ (Damping off) না হয়।",
    line_sowing_bn: "সারি পদ্ধতিতে চারা রোপণ করলে পেঁয়াজের গোড়ায় জলাবদ্ধতা এড়ানো যায় এবং প্রতিটি পেঁয়াজ সম আকৃতির হয়।"
  },
  {
    id: 'wheat',
    name_bn: "গম (Wheat)",
    seed_rate_per_bigha_kg: 16,
    spacing_bn: "২০ সেমি (সারি থেকে সারি)",
    depth_bn: "৩ - ৫ সেমি গভীরতা",
    sowing_method_bn: "সারিতে বীজ বোনা সবচেয়ে ভালো, মাটির আর্দ্রতা দেখে রোপণ করুন। সারি করে বপন করলে গাছ সমানভাবে আলো-বাতাস পায় ও ঝড়ে হেলে পড়ে না।",
    treatment_bn: "বপনের পূর্বে প্রোভ্যাক্স বা কার্বেন্ডাজিম জাতীয় ছত্রাকনাশক প্রতি কেজি বীজে ২.৫ গ্রাম মিশিয়ে শোধন করুন। এটি গমের ব্লাস্ট ও লুজ স্মাট রোগ প্রতিরোধ করে।",
    line_sowing_bn: "ছিটিয়ে বোনার চেয়ে সারিতে গম বপন করলে বীজের অপচয় কমে এবং বিঘাপ্রতি ফলন ১৫% পর্যন্ত বৃদ্ধি পায়।"
  },
  {
    id: 'maize',
    name_bn: "ভুট্টা (Hybrid Maize)",
    seed_rate_per_bigha_kg: 2.5,
    spacing_bn: "৬০ সেমি × ২৫ সেমি (একক চারা)",
    depth_bn: "৩ - ৪ সেমি গভীরতা",
    sowing_method_bn: "প্রতি গর্তে একটি করে পুষ্ট বীজ বপন করতে হবে। লাইন বা সারিতে বপন করলে ভুট্টা গাছের পরাগায়ন ও মোচা বড় হওয়ার পরিবেশ তৈরি হয়।",
    treatment_bn: "বীজ বপনের পূর্বে থাইরাম বা মেটালাক্সিল দিয়ে বীজ শোধন করুন যাতে কান্ড পচা ও গোড়া পচা রোগ এড়ানো সম্ভব হয়।",
    line_sowing_bn: "সারিবদ্ধভাবে ভুট্টা লাগালে গাছের লাইনের মাঝে নিড়ানি দেওয়া ও সেচের নালা তৈরি করা অত্যন্ত সহজ হয়।"
  },
  {
    id: 'mustard',
    name_bn: "সরিষা (Mustard)",
    seed_rate_per_bigha_kg: 1.5,
    spacing_bn: "৩০ সেমি (সারি থেকে সারি)",
    depth_bn: "২ - ৩ সেমি গভীরতা",
    sowing_method_bn: "সারিতে বীজ বপন করলে সরিষার ফলন বাড়ে, আগাছা পরিষ্কার করা যায় ও জাবপোকা দমন সহজ হয়। মাটির জো দেখে বপন করা ভালো।",
    treatment_bn: "আইপ্রোডিয়ন বা রোভরাল ছত্রাকনাশক দিয়ে বীজ শোধন করুন। এতে সরিষার পাতা ঝলসানো রোগ (Alternaria Blight) থেকে রেহাই পাওয়া যায়।",
    line_sowing_bn: "সারি করে বুনলে জাবপোকা ও অন্যান্য ক্ষতিকারক পোকার বিস্তার দ্রুত শনাক্ত ও স্প্রে করা সহজ হয়।"
  },
  {
    id: 'jute',
    name_bn: "পাট (Jute)",
    seed_rate_per_bigha_kg: 1.0,
    spacing_bn: "৩০ সেমি × ৭-১০ সেমি (সারি থেকে সারি এবং গাছ থেকে গাছ)",
    depth_bn: "১.৫ - ২.০ সেমি গভীরতা",
    sowing_method_bn: "সারি বা লাইনে বপন করলে পাটের আঁশ সমান লম্বা ও উন্নত মানের হয় এবং পরবর্তীতে রিবন রেটিং করা অত্যন্ত সহজ হয়।",
    treatment_bn: "প্রতি কেজি পাটের বীজে ২ গ্রাম কার্বেন্ডাজিম মিশিয়ে বীজ শোধন করুন। এতে পাটের কান্ড পচা ও শুকনা ক্ষত রোগ প্রতিরোধ হবে।",
    line_sowing_bn: "লাইন সোজা করে পাট বুনলে অতি ঘন চারা সহজে তুলে পাতলা (Thinning) করা যায় এবং আঁশের মান সোনালী হয়।"
  },
  {
    id: 'chilli',
    name_bn: "মরিচ (Chilli)",
    seed_rate_per_bigha_kg: 0.2,
    spacing_bn: "৫০ সেমি × ৪০ সেমি (সারি থেকে সারি এবং গাছ থেকে গাছ)",
    depth_bn: "১.০ সেমি গভীরতা বীজতলার জন্য",
    sowing_method_bn: "বীজতলায় চারা উৎপাদন করে ৩০-৩৫ দিনের সুস্থ চারা মূল জমিতে সারি করে রোপণ করুন। এতে প্রতিটি মরিচ গাছে সমান আলো-বাতাস লাগে ও শাখা ভালো গজায়।",
    treatment_bn: "বীজতলায় বীজ বপনের আগে থাইরাম বা ট্রাইকোডার্মা দিয়ে বীজ শোধন করুন। চারা রোপণের পূর্বে গোড়া ছত্রাকনাশক পানিতে ৫ মিনিট ভিজিয়ে শোধন করুন।",
    line_sowing_bn: "সারি করে মরিচ লাগালে মাটিতে মালচিং পেপার বিছানো সহজ হয়, যা সেচ খরচ ৫০% সাশ্রয় ও আগাছা সম্পূর্ণ নিয়ন্ত্রণ করে।"
  },
  {
    id: 'tomato',
    name_bn: "টমেটো (Tomato)",
    seed_rate_per_bigha_kg: 0.15,
    spacing_bn: "৬০ সেমি × ৪০ সেমি (সারি থেকে সারি এবং গাছ থেকে গাছ)",
    depth_bn: "১.০ সেমি গভীরতা বীজতলার জন্য",
    sowing_method_bn: "চারা তৈরি করে ২৫-৩০ দিনের কচি চারা মূল জমিতে মাদা (গর্ত) তৈরি করে রোপণ করুন। সারি করে চাষ ও মাচায় বেঁধে দিলে ফল পচা ও রোগ বালাই কমে।",
    treatment_bn: "বীজ বপনের পূর্বে বীজ শোধন করার পাশাপাশি চারা রোপণের পূর্বে চারার গোড়া কার্বেন্ডাজিম তরল মিক্সে ভিজিয়ে শোধন করে নিন।",
    line_sowing_bn: "সারিবদ্ধভাবে টমেটো গাছ রোপণ করলে বাঁশের খুঁটি (Staking) দেওয়া ও ফল সংগ্রহের কাজ সহজ ও নিখুঁত হয়।"
  },
  {
    id: 'lentil',
    name_bn: "মসুর ডাল (Lentil)",
    seed_rate_per_bigha_kg: 4.5,
    spacing_bn: "২৫ সেমি (সারি থেকে সারি)",
    depth_bn: "৩ - ৪ সেমি গভীরতা",
    sowing_method_bn: "সারিতে বপন করলে আগাছা দমন ও সেচ দেওয়া সহজ হয়। বীজ বপনের আগে রাইজোবিয়াম ব্যাকটেরিয়া কালচার দিয়ে শোধন করা অত্যন্ত গুরুত্বপূর্ণ।",
    treatment_bn: "প্রতি কেজি মসুর বীজে ২ গ্রাম কার্বেন্ডাজিম বা প্রোভ্যাক্স মিশিয়ে শোধন করুন। এতে শিকড় পচা ও ঢলে পড়া রোগ প্রতিরোধ হয়।",
    line_sowing_bn: "বীজ শোধনের পর রাইজোবিয়াম ব্যাকটেরিয়া মিশিয়ে সারিতে বপন করলে শিকড়ে নাইট্রোজেন গুটি তৈরি বাড়ে এবং ইউরিয়া সার ছাড়াই ফলন ৩০% বৃদ্ধি পায়।"
  }
];

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

export default function SeedCalculator() {
  const router = useRouter();
  const [selectedCropId, setSelectedCropId] = useState<string>('rice_transplant');
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);
  const [cropSearchQuery, setCropSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCropDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [landSize, setLandSize] = useState<number>(1);
  const [landUnit, setLandUnit] = useState<string>('bigha'); // bigha or decimal
  const [result, setResult] = useState<{
    cropName: string;
    totalSeedWeight: number;
    spacing: string;
    depth: string;
    method: string;
    treatment: string;
    lineSowing: string;
  } | null>(null);

  // Inline Chat States
  const [inlineChatMessages, setInlineChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [inlineChatInput, setInlineChatInput] = useState('');
  const [inlineChatLoading, setInlineChatLoading] = useState(false);

  const [calculating, setCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isInputsChanged, setIsInputsChanged] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleCalculate = async () => {
    if (landSize <= 0) {
      alert('দয়া করে সঠিক জমির পরিমাণ দিন।');
      return;
    }

    setCalculating(true);
    setLoadingStep(0);

    const loadingInterval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 450);

    const calculatePromise = new Promise<{
      resultObj: any;
      totalWeight: number;
      crop: CropSeedData;
    }>((resolve, reject) => {
      setTimeout(() => {
        const crop = SEED_DATABASE.find(c => c.id === selectedCropId);
        if (!crop) {
          reject(new Error('Crop not found'));
          return;
        }

        // 1 bigha = 33 decimals, 1 acre = 100 decimals = 3.0303 bighas
        const landInBigha = landUnit === 'decimal' 
          ? (Number(landSize) / 33) 
          : (landUnit === 'acre' 
              ? (Number(landSize) * (100 / 33)) 
              : Number(landSize));
        const totalWeight = crop.seed_rate_per_bigha_kg * landInBigha;

        resolve({
          resultObj: {
            cropName: crop.name_bn,
            totalSeedWeight: totalWeight, // Keep full precision
            spacing: crop.spacing_bn,
            depth: crop.depth_bn,
            method: crop.sowing_method_bn,
            treatment: crop.treatment_bn,
            lineSowing: crop.line_sowing_bn
          },
          totalWeight,
          crop
        });
      }, 1400); // 1.4s smooth delay
    });

    try {
      const { resultObj, totalWeight, crop } = await calculatePromise;
      setResult(resultObj);

      setInlineChatMessages([
        { 
          sender: 'bot', 
          text: `প্রিয় কৃষক ভাই, এই বীজ বপন ও শোধনের হিসাবের ওপর আপনার কোনো অতিরিক্ত প্রশ্ন থাকলে দয়া করে বলুন।` 
        }
      ]);

      // Track seed calculation event
      try {
        const sessionId = localStorage.getItem("krishisathi_session_id") || "sess_unknown";
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            pageVisited: "/calculator/seeds",
            action: "seed_calc",
            location: localStorage.getItem("krishisathi_user_district") || "Unknown",
            metadata: {
              cropId: selectedCropId,
              cropName: crop.name_bn,
              landSize: landSize,
              landUnit: landUnit,
              totalSeedWeight: Math.round(totalWeight * 100) / 100
            }
          })
        });
      } catch (err) {
        console.error("Tracking error:", err);
      }

      setIsInputsChanged(false);
      setHasCalculated(true);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(loadingInterval);
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (hasCalculated) {
      setIsInputsChanged(true);
    }
  }, [selectedCropId, landSize, landUnit]);

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const formatSeedWeight = (weightInKg: number): string => {
    if (weightInKg < 1) {
      const grams = Math.round(weightInKg * 1000);
      return `${translateToBanglaDigits(grams)} গ্রাম`;
    } else {
      const kg = Math.floor(weightInKg);
      const grams = Math.round((weightInKg - kg) * 1000);
      if (grams === 0) {
        return `${translateToBanglaDigits(kg)} কেজি`;
      }
      return `${translateToBanglaDigits(kg)} কেজি ${translateToBanglaDigits(grams)} গ্রাম`;
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
      const hiddenHistory = [
        { sender: 'user' as const, text: `আমি আমার জমির জন্য বীজ বপনের প্রয়োজনীয় ওজন ও গাইডলাইন হিসাব করেছি। ফসল: ${result.cropName}, জমির পরিমাণ: ${landSize} ${landUnit === 'bigha' ? 'বিঘা' : landUnit === 'decimal' ? 'শতক' : 'একর'}।` },
        { sender: 'bot' as const, text: `প্রিয় কৃষক ভাই, আমি আপনার জমির জন্য বীজ ও চারা বপনের হিসাব নির্ধারণ করে দিয়েছি:
প্রয়োজনীয় বীজ: ${formatSeedWeight(result.totalSeedWeight)}
আদর্শ রোপণ দূরত্ব (Spacing): ${result.spacing}
বপনের গভীরতা (Depth): ${result.depth}
বপন ও রোপণ পদ্ধতি: ${result.method}
বীজ শোধন নির্দেশিকা: ${result.treatment}
সারিবদ্ধ চাষের উপকারিতা: ${result.lineSowing}

এই বীজ শোধন, বপন পদ্ধতি বা দূরত্ব নিয়ে আপনার যেকোনো জিজ্ঞাসা থাকলে নির্দ্বিধায় বলুন।` },
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
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
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
            আপনার জমির পরিমাপ অনুযায়ী প্রয়োজনীয় বীজের সঠিক ওজন এবং আদর্শ রোপণ দূরত্ব, গভীরতা ও বীজ শোধন নিয়ম গণনা করুন।
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
          <div ref={dropdownRef} className="relative space-y-2">
            <label className="text-sm font-bold text-text-primary">ফসল নির্বাচন করুন:</label>
            <div className="relative">
              <input
                type="text"
                value={isCropDropdownOpen ? cropSearchQuery : (SEED_DATABASE.find(c => c.id === selectedCropId)?.name_bn || '')}
                onFocus={(e) => {
                  setIsCropDropdownOpen(true);
                  setCropSearchQuery('');
                }}
                onChange={(e) => {
                  setCropSearchQuery(e.target.value);
                  setIsCropDropdownOpen(true);
                }}
                placeholder="ফসলের নাম লিখুন..."
                className="w-full bg-soft-white border border-green-primary/20 rounded-xl pl-4 pr-10 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold shadow-sm cursor-pointer"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
                  className="p-1 hover:bg-gray-100 rounded-full text-text-secondary hover:text-green-primary transition-colors cursor-pointer"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCropDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Dropdown List Overlay */}
            {isCropDropdownOpen && (
              <div className="absolute z-30 w-full mt-1 bg-white border border-green-primary/15 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-green-primary/5">
                {(() => {
                  const filtered = SEED_DATABASE.filter(c => {
                    if (!cropSearchQuery) return true;
                    return c.name_bn.toLowerCase().includes(cropSearchQuery.toLowerCase());
                  });
                  if (filtered.length === 0) {
                    return (
                      <div className="px-4 py-3 text-xs text-text-secondary font-medium">
                        কোনো ফসল খুঁজে পাওয়া যায়নি
                      </div>
                    );
                  }
                  return filtered.map((c) => {
                    const isSelected = selectedCropId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCropId(c.id);
                          setCropSearchQuery(c.name_bn);
                          setIsCropDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs md:text-sm font-bold transition-colors hover:bg-green-primary/5 flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-green-primary/10 text-green-primary' : 'text-text-primary'
                        }`}
                      >
                        <span>{c.name_bn}</span>
                        {isSelected && <span className="text-green-primary font-bold">✓</span>}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Land Size Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">জমির পরিমাণ:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value === '' ? 0 : Number(e.target.value))}
                min="0.1"
                step="any"
                className="flex-1 min-w-0 bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold"
              />
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="bg-soft-white border border-green-primary/20 rounded-xl px-3 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold cursor-pointer shrink-0"
              >
                <option value="decimal">শতক</option>
                <option value="bigha">বিঘা</option>
                <option value="acre">একর</option>
              </select>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">নোট: ১ বিঘা = ৩৩ শতক।</p>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full py-3.5 bg-green-primary hover:bg-[#153526] active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            {calculating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                হিসাব করা হচ্ছে...
              </>
            ) : (
              <>
                বীজের পরিমাপ হিসাব করুন <Calculator className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Calculation Result (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {calculating ? (
            <div className="h-full min-h-[300px] border border-green-primary/10 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/60 backdrop-blur-md shadow-md">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-green-primary/20 border-t-green-primary animate-spin" />
                <ShieldCheck className="w-6 h-6 text-green-primary absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary">বীজ পরিমাপের হিসাব করা হচ্ছে...</h4>
                <div className="inline-block bg-green-primary/10 border border-green-primary/20 text-green-primary text-xs font-black px-4 py-2 rounded-full animate-pulse shadow-sm">
                  ⚡ {LOADING_MESSAGES[loadingStep]}
                </div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2">
                  আপনার নির্বাচিত ফসল ({SEED_DATABASE.find(c => c.id === selectedCropId)?.name_bn || ''}) এর জন্য বীজ বপনের আদর্শ মাত্রা ও শোধন বিধি নির্ধারণ করা হচ্ছে।
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 relative">
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
                        আপনি ফসল বা জমির পরিমাপ পরিবর্তন করেছেন ভাই। নতুন বিবরণ অনুযায়ী বীজ গণনার তথ্য আপডেট করতে অনুগ্রহ করে বামের প্যানেল থেকে <strong className="font-extrabold text-green-primary">"বীজের পরিমাপ হিসাব করুন"</strong> বোতামে ক্লিক করুন।
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Seed Weight Card */}
              <div className="bg-soft-white border border-green-primary/10 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-text-primary mb-4 text-base">📊 বীজ গণনার ফলাফল:</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="border border-green-primary/10 rounded-2xl p-6 text-center bg-green-primary/5 space-y-1">
                    <h4 className="font-bold text-text-primary text-xs">প্রয়োজনীয় বীজের মোট ওজন</h4>
                    <p className="text-3xl font-black text-green-primary">
                      {formatSeedWeight(result.totalSeedWeight)}
                    </p>
                    <span className="text-xs text-text-secondary block font-bold">
                      {result.cropName} এর জন্য ({translateToBanglaDigits(landSize)} {landUnit === 'bigha' ? 'বিঘা' : landUnit === 'decimal' ? 'শতক' : 'একর'} জমি)
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
                      <h4 className="font-extrabold text-green-primary text-xs uppercase mb-1">আদর্শ রোপণ দূরত্ব (Spacing):</h4>
                      <p className="font-medium leading-relaxed">{result.spacing}</p>
                    </div>
                  </div>
                  {/* Depth */}
                  <div className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                    <div>
                      <h4 className="font-extrabold text-amber-700 text-xs uppercase mb-1">বপনের গভীরতা (Depth):</h4>
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
                  {/* Treatment */}
                  <div className="flex gap-3 text-sm text-text-primary bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    <div>
                      <h4 className="font-extrabold text-emerald-800 text-xs uppercase mb-1">বীজ শোধন নির্দেশিকা (Seed Treatment):</h4>
                      <p className="font-bold leading-relaxed text-emerald-950">{result.treatment}</p>
                    </div>
                  </div>
                  {/* Line Sowing Benefits */}
                  <div className="flex gap-3 text-sm text-text-primary bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
                    <div>
                      <h4 className="font-extrabold text-indigo-800 text-xs uppercase mb-1">লাইন বা সারিবদ্ধ চাষের উপকারিতা:</h4>
                      <p className="font-bold leading-relaxed text-indigo-950">{result.lineSowing}</p>
                    </div>
                  </div>
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
                      placeholder="বীজ শোধন, বপন বা আদর্শ দূরত্ব নিয়ে প্রশ্ন করুন..."
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
                <h4 className="font-bold text-text-primary">বীজ পরিমাপের ফলাফল দেখতে</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের বক্সে আপনার টার্গেট ফসল ও জমির পরিমাপ নির্বাচন করুন এবং <strong className="font-extrabold text-green-primary">"বীজের পরিমাপ হিসাব করুন"</strong> বোতামে ক্লিক করুন। বপনের বিস্তারিত ম্যাট্রিক্স তৈরি হয়ে যাবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">বীজ শোধন বা নির্দিষ্ট জাতের বপন সময় নিয়ে কোনো প্রশ্ন আছে?</h4>
          <p className="text-xs text-text-secondary font-bold">আপনার ফসলের বীজ সংক্রান্ত যেকোনো জিজ্ঞাসা সরাসরি গাছের ডাক্তারকে লিখে পাঠান।</p>
        </div>
        <button 
          onClick={() => {
            const cropName = SEED_DATABASE.find(c => c.id === selectedCropId)?.name_bn || '';
            router.push(`/chat?q=${encodeURIComponent(`${cropName} বীজের রোগবালাই শোধন ও বপন গাইড নিয়ে বিস্তারিত জানতে চাই।`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>
    </div>
  );
}
