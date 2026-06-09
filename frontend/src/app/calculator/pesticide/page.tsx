'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calculator, AlertTriangle, ShieldCheck, Info, RefreshCw, ChevronDown } from 'lucide-react';


const LOADING_MESSAGES = [
  'আপনার আক্রান্ত ফসলের ধরন ও লক্ষণ বিশ্লেষণ করা হচ্ছে...',
  'নিরাপদ বালাইনাশক প্রয়োগের সঠিক মাত্রা নির্ধারণ করা হচ্ছে...',
  'ড্রাম প্রতি ও পুরো জমির জন্য স্প্রে ডোজ ও পানির অনুপাত হিসাব করা হচ্ছে...',
  'গাছের ডাক্তারের ডেটাবেস থেকে সঠিক প্রয়োগ নিরাপত্তা বিধি প্রস্তুত করা হচ্ছে...'
];

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
  { id: 'mustard', name: 'sరిষা (Mustard)' },
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

export default function PesticideCalculator() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
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

  const [tankSize, setTankSize] = useState<number>(16); // Sprayer size in Litres
  const [pesticideClass, setPesticideClass] = useState<'insecticide' | 'fungicide' | 'herbicide' | 'pgr'>('insecticide');
  const [pesticideForm, setPesticideForm] = useState<'liquid' | 'powder'>('liquid');
  const [severity, setSeverity] = useState<'preventive' | 'mild' | 'severe'>('mild');
  const [landArea, setLandArea] = useState<number>(10); // Land in decimal (শতক) or tree count
  const [calculating, setCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isInputsChanged, setIsInputsChanged] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
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

  // Inline Chat States
  const [inlineChatMessages, setInlineChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [inlineChatInput, setInlineChatInput] = useState('');
  const [inlineChatLoading, setInlineChatLoading] = useState(false);

  const TREE_BASED_CROPS = ['mango', 'jackfruit', 'guava', 'coconut', 'citrus'];
  const isTreeBased = TREE_BASED_CROPS.includes(selectedCrop);

    const handleCalculate = async () => {
    if (tankSize <= 0 || landArea <= 0) {
      alert('দয়া করে সঠিক স্প্রে ট্যাঙ্কের সাইজ ও জমির পরিমাণ দিন।');
      return;
    }

    setCalculating(true);
    setLoadingStep(0);

    const loadingInterval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 450);

    const calculatePromise = new Promise<{
      resultObj: any;
      totalChemical: number;
    }>((resolve) => {
      setTimeout(() => {
        // Determine dosage rate based on Chemical Class and severity (ml or g per Litre)
        let rate = 2.0;
        if (pesticideClass === 'insecticide') {
          if (severity === 'preventive') rate = 0.5;
          else if (severity === 'mild') rate = 1.0;
          else if (severity === 'severe') rate = 1.5;
        } else if (pesticideClass === 'fungicide') {
          if (severity === 'preventive') rate = 1.5;
          else if (severity === 'mild') rate = 2.0;
          else if (severity === 'severe') rate = 2.5;
        } else if (pesticideClass === 'herbicide') {
          if (severity === 'preventive') rate = 4.0;
          else if (severity === 'mild') rate = 6.0;
          else if (severity === 'severe') rate = 8.0;
        } else if (pesticideClass === 'pgr') {
          if (severity === 'preventive') rate = 0.5;
          else if (severity === 'mild') rate = 0.8;
          else if (severity === 'severe') rate = 1.0;
        }

        // Calculate total water volume needed (in Litres)
        let totalWater = 25.0; // default fallback
        if (isTreeBased) {
          totalWater = landArea * 5.0; // 5 Litres of spray mixture per tree canopy
        } else {
          // Land area based. Crop-specific water volume:
          if (selectedCrop === 'rice' || selectedCrop === 'wheat' || selectedCrop === 'maize' || selectedCrop === 'mustard' || selectedCrop === 'lentil') {
            totalWater = landArea * 2.0; // 2.0 Litres per decimal
          } else if (['tomato', 'eggplant', 'cabbage', 'cauliflower', 'cucumber', 'bottle_gourd', 'sweet_gourd'].includes(selectedCrop)) {
            totalWater = landArea * 3.0; // 3.0 Litres per decimal
          } else {
            totalWater = landArea * 2.5; // 2.5 Litres per decimal
          }
        }

        const chemicalPerTank = tankSize * rate;
        const totalChemical = totalWater * rate;
        const tanks = Math.ceil(totalWater / tankSize);

        // 1 teaspoon = 5 ml or 5 gm
        const teaspoonsPerTank = chemicalPerTank / 5;
        const totalTeaspoons = totalChemical / 5;

        // 1 standard cap = 5 ml (only for liquid)
        const capsPerTank = pesticideForm === 'liquid' ? chemicalPerTank / 5 : undefined;
        const totalCaps = pesticideForm === 'liquid' ? totalChemical / 5 : undefined;

        resolve({
          resultObj: {
            dosageRate: rate,
            chemicalPerTank: Math.round(chemicalPerTank * 100) / 100,
            tanksNeeded: tanks,
            totalWaterNeeded: Math.round(totalWater * 100) / 100,
            totalChemicalNeeded: Math.round(totalChemical * 100) / 100,
            teaspoonsPerTank: Math.round(teaspoonsPerTank * 10) / 10,
            capsPerTank: capsPerTank ? Math.round(capsPerTank * 10) / 10 : undefined,
            totalTeaspoons: Math.round(totalTeaspoons * 10) / 10,
            totalCaps: totalCaps ? Math.round(totalCaps * 10) / 10 : undefined,
          },
          totalChemical
        });
      }, 1400); // 1.4s smooth delay
    });

    try {
      const { resultObj, totalChemical } = await calculatePromise;
      setResult(resultObj);

      setInlineChatMessages([
        { 
          sender: 'bot', 
          text: `ভাই শুনুন, এই বালাইনাশক (স্প্রে) ডোজ হিসাবের ওপর আপনার কোনো অতিরিক্ত প্রশ্ন থাকলে দয়া করে বলুন।` 
        }
      ]);

      // Track pesticide calculation event
      try {
        const sessionId = localStorage.getItem("krishisathi_session_id") || "sess_unknown";
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            pageVisited: "/calculator/pesticide",
            action: "pesticide_calc",
            location: localStorage.getItem("krishisathi_user_district") || "Unknown",
            metadata: {
              crop: selectedCrop,
              pesticideClass,
              pesticideForm,
              severity,
              tankSize,
              landArea,
              isTreeBased,
              totalChemicalNeeded: Math.round(totalChemical * 100) / 100,
              tanksNeeded: resultObj.tanksNeeded
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

  // Detect input changes and prompt for recalculating
  useEffect(() => {
    if (hasCalculated) {
      setIsInputsChanged(true);
    }
  }, [tankSize, pesticideClass, pesticideForm, severity, landArea, selectedCrop]);


  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const currentCropName = CROPS_LIST.find(c => c.id === selectedCrop)?.name || '';

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
        { sender: 'user' as const, text: `আমি আমার জমির বালাইনাশক ডোজ হিসাব করেছি। ফসল: ${currentCropName}, ওষুধের ক্যাটাগরি: ${pesticideClass}, ধরন: ${pesticideForm === 'liquid' ? 'তরল' : 'পাউডার'}, আক্রমণের তীব্রতা: ${severity === 'preventive' ? 'প্রতিরোধমূলক' : severity === 'mild' ? 'মাঝারি' : 'তীব্র'}, স্প্রে ট্যাঙ্কের সাইজ: ${tankSize} লিটার, জমির পরিমাণ/গাছের সংখ্যা: ${landArea} ${isTreeBased ? 'টি গাছ' : 'শতক'}।` },
        { sender: 'bot' as const, text: `ভাই শুনুন, আমি আপনার ফসলের জন্য কীটনাশক স্প্রে ডোজের হিসাব নির্ধারণ করে দিয়েছি:
প্রতি ড্রামে প্রয়োজনীয় ওষুধ: ${result.teaspoonsPerTank} চা চামচ ${pesticideForm === 'liquid' && result.capsPerTank ? `(বা ${result.capsPerTank} ছিপি)` : ''}
পুরো জমির জন্য মোট ওষুধ: ${result.totalTeaspoons} চা চামচ ${pesticideForm === 'liquid' && result.totalCaps ? `(বা ${result.totalCaps} ছিপি)` : ''}
প্রয়োজনীয় মোট পানি: ${result.totalWaterNeeded} লিটার
প্রয়োজনীয় ড্রাম সংখ্যা: ${result.tanksNeeded} বার (ড্রাম)

এই বালাইনাশক স্প্রে এর ডোজ বা সঠিক নিয়মে প্রয়োগ সম্পর্কিত কোনো প্রশ্ন থাকলে দয়া করে বলুন।` },
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
          <div ref={dropdownRef} className="relative space-y-2">
            <label className="text-sm font-bold text-text-primary">আক্রান্ত ফসল:</label>
            <div className="relative">
              <input
                type="text"
                value={isCropDropdownOpen ? cropSearchQuery : (CROPS_LIST.find(c => c.id === selectedCrop)?.name || '')}
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
                  const filtered = CROPS_LIST.filter(c => {
                    if (!cropSearchQuery) return true;
                    return c.name.toLowerCase().includes(cropSearchQuery.toLowerCase());
                  });
                  if (filtered.length === 0) {
                    return (
                      <div className="px-4 py-3 text-xs text-text-secondary font-medium">
                        কোনো ফসল খুঁজে পাওয়া যায়নি
                      </div>
                    );
                  }
                  return filtered.map((c) => {
                    const isSelected = selectedCrop === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCrop(c.id);
                          setCropSearchQuery(c.name);
                          setIsCropDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs md:text-sm font-bold transition-colors hover:bg-green-primary/5 flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-green-primary/10 text-green-primary' : 'text-text-primary'
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && <span className="text-green-primary font-bold">✓</span>}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Pesticide Class Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">ওষুধের ক্যাটাগরি (Pesticide Class):</label>
            <select
              value={pesticideClass}
              onChange={(e) => setPesticideClass(e.target.value as any)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer font-bold"
            >
              <option value="insecticide">কীটনাশক (Insecticide - পোকা দমন)</option>
              <option value="fungicide">ছত্রাকনাশক (Fungicide - পচন ও দাগ রোগ দমন)</option>
              <option value="herbicide">আগাছানাশক (Herbicide - ঘাস/আগাছা দমন)</option>
              <option value="pgr">পিজিআর / হরমোন (PGR / Growth Regulator)</option>
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

          {/* Land Area / Tree Count Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">
              {isTreeBased ? 'গাছের সংখ্যা (টি হিসেবে):' : 'জমির পরিমাণ (শতক হিসেবে):'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value === '' ? 0 : Number(e.target.value))}
                min="1"
                placeholder={isTreeBased ? "যেমন: ৫" : "যেমন: ১০"}
                className="w-full bg-soft-white border border-green-primary/20 rounded-xl pl-4 pr-16 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary font-bold"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-text-secondary">
                {isTreeBased ? 'টি গাছ' : 'শতক'}
              </span>
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">
              {isTreeBased 
                ? '* ফল ও বৃক্ষ জাতীয় ফসলের ক্ষেত্রে গাছ প্রতি গড় ৫ লিটার পানি ধরে হিসাব করা হয়েছে।' 
                : '* ৩৩ শতক = ১ বিঘা। ফসলের পাতার ঘনত্ব অনুযায়ী পানির মোট ড্রাম হিসাব করা হয়েছে।'
              }
            </p>
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
                বালাইনাশক ডোজ হিসাব করুন <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Calculation Result & Guidelines (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {calculating ? (
            <div className="h-full min-h-[300px] border border-green-primary/10 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/60 backdrop-blur-md shadow-md">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-green-primary/20 border-t-green-primary animate-spin" />
                <ShieldCheck className="w-6 h-6 text-green-primary absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary">বালাইনাশক ডোজ হিসাব করা হচ্ছে...</h4>
                <div className="inline-block bg-green-primary/10 border border-green-primary/20 text-green-primary text-xs font-black px-4 py-2 rounded-full animate-pulse shadow-sm">
                  ⚡ {LOADING_MESSAGES[loadingStep]}
                </div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2">
                  আপনার আক্রান্ত ফসল ({CROPS_LIST.find(c => c.id === selectedCrop)?.name || ''}) এর জন্য নিরাপদ বালাইনাশক ডোজ ও সঠিক পানির পরিমাণ নির্ধারণ করা হচ্ছে।
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
                        আপনি আক্রান্ত ফসল বা স্প্রে প্যারামিটার পরিবর্তন করেছেন ভাই। নতুন বিবরণ অনুযায়ী ওষুধের ডোজ ও সঠিক পানির অনুপাত আপডেট করতে অনুগ্রহ করে বামের প্যানেল থেকে <strong className="font-extrabold text-green-primary">"বালাইনাশক ডোজ হিসাব করুন"</strong> বোতামে ক্লিক করুন।
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
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
                  <p className="text-amber-800 mb-1">সহজ পরিমাপ নির্দেশিকা:</p>
                  <p>১ চা চামচ = প্রায় ৫ মিলি (তরল ওষুধ) অথবা ৫ গ্রাম (পাউডার ওষুধ)।</p>
                  <p>১ বোতলের ছিপি (ক্যাপ) = প্রায় ৫ মিলি (তরল ওষুধের স্ট্যান্ডার্ড ক্যাপ)।</p>
                  <p className="mt-1 text-text-secondary font-medium">* বালাইনাশক প্রয়োগের পূর্বে সর্বদা বোতলের গায়ে লিখিত নির্দেশনাবলী ভালোভাবে পড়ুন।</p>
                </div>
              </div>

              {isTreeBased && pesticideClass === 'herbicide' && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-text-primary leading-relaxed font-bold">
                    <p className="text-rose-800 mb-1">⚠️ সতর্কবার্তা (Warning):</p>
                    <p className="text-rose-700">ফল বা বৃক্ষ জাতীয় ফসলে সরাসরি আগাছানাশক (Herbicide) স্প্রে করা অত্যন্ত বিপজ্জনক। এটি গাছের শিকড় ও কাণ্ডের মারাত্মক ক্ষতি করতে পারে বা গাছ মেরে ফেলতে পারে। গাছের গোড়া থেকে নির্দিষ্ট দূরত্ব বজায় রেখে এবং শুধুমাত্র অনাকাঙ্ক্ষিত আগাছার উপরেই সাবধানতার সাথে আগাছানাশক প্রয়োগ করুন। প্রয়োজনে স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।</p>
                  </div>
                </div>
              )}

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
                      placeholder="বালাইনাশক বা সঠিক স্প্রে নিয়ে গাছের ডাক্তারকে প্রশ্ন করুন..."
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
                <h4 className="font-bold text-text-primary">বালাইনাশক ডোজ গণনার ফলাফল</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের বক্সে আপনার আক্রান্ত ফসল, কীটনাশকের রূপ, আক্রমণের তীব্রতা ও জমির পরিমাণ সিলেক্ট করে <strong className="font-extrabold text-green-primary">"বালাইনাশক ডোজ হিসাব করুন"</strong> বোতামে ক্লিক করুন। সঠিক স্প্রে ডোজ হিসাব হয়ে যাবে।
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
