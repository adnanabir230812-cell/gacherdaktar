'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sprout, 
  CloudSun, 
  Calculator, 
  HelpCircle, 
  ArrowRight, 
  MessageSquare, 
  Wind, 
  Droplets,
  Thermometer,
  ShieldAlert,
  Calendar,
  Compass,
  ArrowUpRight,
  MapPin,
  CheckCircle,
  Coins,
  AlertTriangle,
  Sunrise,
  Sunset,
  BookOpen,
  RefreshCw,
  X,
  ChevronDown,
  Search
} from 'lucide-react';
import LeafScanner from '@/components/LeafScanner';
import { detectUserDistrict } from '@/lib/location';

interface AdvisoryDetail {
  status: string;
  title: string;
  msg: string;
  actions: string[];
}

interface WeatherData {
  district: string;
  temp: number;
  condition: string;
  wind_speed: number;
  humidity?: number;
  soil_temp?: number;
  daily?: {
    dates: string[];
    temp_max: number[];
    temp_min: number[];
    precipitation: number[];
  };
  advice: {
    rain: AdvisoryDetail;
    disease_risk: AdvisoryDetail;
    spray_window: AdvisoryDetail;
    soil: AdvisoryDetail;
    harvest: AdvisoryDetail;
  };
  is_fallback?: boolean;
}

const MARKET_PRICES = [
  { crop: "ব্রি ধান ২৯ (ধান)", price: "১,২৫০ - ১,৩৫০ ৳ / মণ", change: "up", changeVal: "+১৫ ৳" },
  { crop: "আলু (ডায়মন্ড)", price: "২৮ - ৩২ ৳ / কেজি", change: "down", changeVal: "-২ ৳" },
  { crop: "দেশি পেঁয়াজ", price: "৬৫ - ৭০ ৳ / কেজি", change: "up", changeVal: "+৫ ৳" },
  { crop: "কাঁচা মরিচ", price: "৮০ - ৯০ ৳ / কেজি", change: "up", changeVal: "+১২ ৳" },
  { crop: "মিষ্টি কুমড়া", price: "২৫ - ৩০ ৳ / কেজি", change: "stable", changeVal: "০ ৳" },
  { crop: "পান পাতা (Betel Leaf)", price: "১৪০ - ১৬০ ৳ / বিড়া", change: "up", changeVal: "+৮ ৳" }
];

const AGRI_CALENDAR = {
  season_bn: "গ্রীষ্ম-বর্ষা কাল",
  month_bn: "জ্যৈষ্ঠ - আষাঢ়",
  tips: [
    "আউশ ধানের ক্ষেতের আগাছা পরিষ্কার করুন এবং শেষ কিস্তির সার উপরি-প্রয়োগ করুন।",
    "রোপা আমন ধানের বীজতলা তৈরির কাজ শুরু করে দিন। নিষ্কাশনযুক্ত উঁচু জমি নির্বাচন করুন।",
    "আদা ও হলুদের জমিতে গোড়ার মাটি আলগা করে দিন এবং পানি নিষ্কাশনের ব্যবস্থা রাখুন।",
    "শাকসবজি যেমন চালকুমড়া, ঝিঙা ও চিচিঙ্গার মাচা তৈরি করুন এবং হালকা সেচ দিন।"
  ]
};

const translateNumberToBangla = (num: number | string): string => {
  const englishToBanglaMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.', ',': ','
  };
  return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
};

const GREGORIAN_MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

interface BanglaDateResult {
  day: number;
  month: string;
  year: number;
}

function getBanglaDateInfo(d: Date): BanglaDateResult {
  const gYear = d.getFullYear();
  const gMonth = d.getMonth() + 1; // 1-indexed (1: Jan, 12: Dec)
  const gDate = d.getDate();

  let bDay = 1;
  let bMonth = '';
  let bYear = gYear - 593; // Default for post-April 14

  // Check if leap year
  const isLeapYear = (gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0);

  if (gMonth === 1) { // Jan
    if (gDate < 15) {
      bMonth = 'পৌষ';
      bDay = gDate + 16;
      bYear = gYear - 594;
    } else {
      bMonth = 'মাঘ';
      bDay = gDate - 14;
      bYear = gYear - 594;
    }
  } else if (gMonth === 2) { // Feb
    if (gDate < 14) {
      bMonth = 'মাঘ';
      bDay = gDate + 17;
      bYear = gYear - 594;
    } else {
      bMonth = 'ফাল্গুন';
      bDay = gDate - 13;
      bYear = gYear - 594;
    }
  } else if (gMonth === 3) { // Mar
    if (gDate < 16) {
      bMonth = 'ফাল্গুন';
      bDay = gDate + 15;
      bYear = gYear - 594;
    } else {
      bMonth = 'চৈত্র';
      bDay = gDate - 15;
      bYear = gYear - 594;
    }
  } else if (gMonth === 4) { // Apr
    if (gDate < 14) {
      bMonth = 'চৈত্র';
      bDay = gDate + 15;
      bYear = gYear - 594;
    } else {
      bMonth = 'বৈশাখ';
      bDay = gDate - 13;
      bYear = gYear - 593;
    }
  } else if (gMonth === 5) { // May
    if (gDate < 15) {
      bMonth = 'বৈশাখ';
      bDay = gDate + 17;
      bYear = gYear - 593;
    } else {
      bMonth = 'জ্যৈষ্ঠ';
      bDay = gDate - 14;
      bYear = gYear - 593;
    }
  } else if (gMonth === 6) { // Jun
    if (gDate < 15) {
      bMonth = 'জ্যৈষ্ঠ';
      bDay = gDate + 17;
      bYear = gYear - 593;
    } else {
      bMonth = 'আষাঢ়';
      bDay = gDate - 14;
      bYear = gYear - 593;
    }
  } else if (gMonth === 7) { // Jul
    if (gDate < 16) {
      bMonth = 'আষাঢ়';
      bDay = gDate + 16;
      bYear = gYear - 593;
    } else {
      bMonth = 'শ্রাবণ';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 8) { // Aug
    if (gDate < 16) {
      bMonth = 'শ্রাবণ';
      bDay = gDate + 16;
      bYear = gYear - 593;
    } else {
      bMonth = 'ভাদ্র';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 9) { // Sep
    if (gDate < 16) {
      bMonth = 'ভাদ্র';
      bDay = gDate + 16;
      bYear = gYear - 593;
    } else {
      bMonth = 'আশ্বিন';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 10) { // Oct
    if (gDate < 17) {
      bMonth = 'আশ্বিন';
      bDay = gDate + 15;
      bYear = gYear - 593;
    } else {
      bMonth = 'কার্তিক';
      bDay = gDate - 16;
      bYear = gYear - 593;
    }
  } else if (gMonth === 11) { // Nov
    if (gDate < 16) {
      bMonth = 'কার্তিক';
      bDay = gDate + 14;
      bYear = gYear - 593;
    } else {
      bMonth = 'অগ্রহায়ণ';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 12) { // Dec
    if (gDate < 16) {
      bMonth = 'অগ্রহায়ণ';
      bDay = gDate + 15;
      bYear = gYear - 593;
    } else {
      bMonth = 'পৌষ';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  }

  return { day: bDay, month: bMonth, year: bYear };
}

export default function Home() {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeWeatherTab, setActiveWeatherTab] = useState<'all' | 'rain' | 'disease' | 'spray' | 'soil' | 'harvest'>('all');
  const [marqueeDatePrefix, setMarqueeDatePrefix] = useState('');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Prompt suggestions
  const promptChips = [
    "ধানের পাতা হলুদ কেন?",
    "বোরো ধানের সারের পরিমাণ",
    "ভারী বৃষ্টি হলে কি করণীয়?",
    "টমেটোর নাবি ধসা রোগ",
    "আদা ও হলুদের সঠিক চাষ পদ্ধতি"
  ];

  // Fetch districts list and manage district selection on entry
  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error(err));

    const storedDistrict = localStorage.getItem("krishisathi_user_district");

    if (storedDistrict) {
      setSelectedDistrict(storedDistrict);
    } else {
      setShowDistrictModal(true);
      detectUserDistrict('ঢাকা').then(detected => {
        setSelectedDistrict(detected);
      });
    }

    // Calculate and set dynamic date prefix on mount
    const now = new Date();
    const engDay = translateNumberToBangla(now.getDate());
    const engMonth = GREGORIAN_MONTHS_BN[now.getMonth()];
    const engYear = translateNumberToBangla(now.getFullYear());
    const englishDateString = `${engDay} ${engMonth}, ${engYear}`;
    
    const banglaDate = getBanglaDateInfo(now);
    const bgDayStr = translateNumberToBangla(banglaDate.day);
    const bgYearStr = translateNumberToBangla(banglaDate.year);
    const banglaDateString = `${bgDayStr} ${banglaDate.month} ${bgYearStr}`;
    
    setMarqueeDatePrefix(`আজ: ${englishDateString} (${banglaDateString}) | `);
  }, []);

  // Fetch weather data for selected district
  useEffect(() => {
    setLoadingWeather(true);
    const url = `/api/weather?district=${encodeURIComponent(selectedDistrict)}`;

    fetch(url, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          console.error('Weather API returned non-ok status');
          return { error: true };
        }
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setWeather(data);
        } else {
          setWeather(null);
        }
        setLoadingWeather(false);
      })
      .catch(err => {
        console.error('Fetch weather failed', err);
        setWeather(null);
        setLoadingWeather(false);
      });
  }, [selectedDistrict]);

  const handleChipClick = (chip: string) => {
    router.push(`/chat?q=${encodeURIComponent(chip)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      router.push(`/chat?q=${encodeURIComponent(chatInput)}`);
    }
  };

  // Helper to color-code alert status badges
  const getAlertBadgeStyles = (status: string) => {
    switch (status) {
      case 'high_rain':
      case 'danger':
      case 'unsuitable':
      case 'wait':
        return 'bg-red-500/10 border-red-500/30 text-red-700 font-bold';
      case 'hot':
      case 'cold':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700 font-bold';
      default:
        return 'bg-green-500/10 border-green-500/30 text-green-700 font-bold';
    }
  };

  const getCountrywideSummary = (isNight: boolean) => {
    const now = new Date();
    const month = now.getMonth(); // 0 is January, 4 is May, 5 is June
    if (month >= 10 || month <= 1) { // Nov, Dec, Jan, Feb (Winter)
      return isNight 
        ? "কুয়াশা বৃদ্ধি পাবে ও মৃদু ঠাণ্ডা পড়তে পারে এবং আগামীকালও একই আবহাওয়া বিরাজ করতে পারে। রবি শস্যের চারা রক্ষা করতে রাতে বীজতলা পলিথিন দিয়ে ঢেকে রাখুন।"
        : "কুয়াশাচ্ছন্ন আবহাওয়া ও মৃদু ঠাণ্ডা পরিবেশ বিরাজ করতে পারে। রবি শস্যের চারা রক্ষা করতে রাতে বীজতলা পলিথিন দিয়ে ঢেকে রাখুন এবং কুয়াশাজনিত বালাই দমনে বালাইনাশক স্প্রে করতে পারেন।";
    } else if (month >= 2 && month <= 4) { // Mar, Apr, May (Summer/Pre-monsoon)
      return isNight
        ? "ভ্যাপসা গরম কমতে পারে এবং আগামীকাল তীব্র রোদ ও গরম পড়ার সম্ভাবনা রয়েছে। কালবৈশাখী ঝড়ের ঝুঁকি থাকায় সন্ধ্যার পর মাঠে দীর্ঘক্ষণ অবস্থান করা থেকে বিরত থাকুন।"
        : "তীব্র রোদ ও ভ্যাপসা গরম থাকতে পারে এবং কিছু অঞ্চলে বজ্রবিদ্যুৎসহ ঝড়ো হাওয়া ও কালবৈশাখী ঝড়ের সম্ভাবনা রয়েছে। খরা পরিস্থিতি নিয়ন্ত্রণে নিয়মিত সেচ দিন এবং ঝড়ের সময় মাঠে অবস্থান করা থেকে বিরত থাকুন।";
    } else { // Jun, Jul, Aug, Sep, Oct (Monsoon/Rainy)
      return isNight
        ? "হালকা থেকে মাঝারি বৃষ্টি এবং আগামীকালও আকাশ মেঘলাসহ দেশের কোথাও কোথাও মাঝারি থেকে ভারী বৃষ্টিপাতের সম্ভাবনা রয়েছে। নিচু জমির ড্রেনেজ নালাগুলো উন্মুক্ত রাখুন।"
        : "মাঝারি থেকে ভারী বৃষ্টিপাত এবং আকাশ মেঘলা থাকার সম্ভাবনা রয়েছে। নিচু জমিতে অতিরিক্ত পানি জমে ফসল যাতে পচে না যায় সেজন্য পানি নিষ্কাশন নালাগুলো পরিষ্কার ও উন্মুক্ত রাখুন এবং বৃষ্টির সময় কীটনাশক স্প্রে করা বন্ধ রাখুন।";
    }
  };

  const getTickerText = () => {
    // Fallback if client-side date is not loaded yet
    if (!marqueeDatePrefix) {
      return "স্বাগতম প্রিয় কৃষক ভাই! আবহাওয়া ফোরকাস্ট ও নির্দিষ্ট জেলার কৃষি পরামর্শ লোড হচ্ছে...";
    }
    
    // Select greeting & time-based countrywide warning based on current hour
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 18 || hour < 5;
    const countrywideSummary = getCountrywideSummary(isNight);
    
    let timeGreeting = 'স্বাগতম প্রিয় কৃষক ভাই!';
    let timeAdvisory = '';
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'শুভ সকাল কৃষক ভাই!';
      timeAdvisory = 'সকালের শান্ত বাতাসে ফসলে সেচ ও বালাইনাশক স্প্রে করার কাজ সম্পন্ন করুন এবং দুপুরের কড়া রোদে মাঠে কাজ করা থেকে বিরত থাকুন।';
    } else if (hour >= 12 && hour < 18) {
      timeGreeting = 'শুভ অপরাহ্ন কৃষক ভাই!';
      timeAdvisory = 'দুপুরের কড়া রোদে ফসলে সেচ দেওয়া বা সার ছিটানো থেকে বিরত থাকুন। কিছু অঞ্চলে বিকালের দিকে ঝড়-বৃষ্টি ও বজ্রপাতের সম্ভাবনা রয়েছে, তাই সতর্ক থাকুন।';
    } else {
      timeGreeting = 'শুভ রাত্রি কৃষক ভাই!';
      timeAdvisory = 'আজ রাতে দেশের কোথাও কোথাও গুঁড়ি গুঁড়ি বৃষ্টি বা তাপমাত্রা কিছুটা হ্রাস পেতে পারে। রাতের অতিরিক্ত আর্দ্রতার কারণে ছত্রাকের আক্রমণ ঠেকাতে সজাগ থাকুন এবং আগামীকাল সকালের কৃষি কাজের প্রস্তুতি নিন।';
    }
    
    const timeBasedCountrywideText = isNight
      ? `${marqueeDatePrefix}${timeGreeting} আজ রাতে ও আগামীকাল ${countrywideSummary} ${timeAdvisory}`
      : `${marqueeDatePrefix}${timeGreeting} আজ সারাদেশে ${countrywideSummary} ${timeAdvisory}`;
    
    if (loadingWeather) {
      return timeBasedCountrywideText + " (আজকের আবহাওয়া ফোরকাস্ট ও নির্দিষ্ট জেলার কৃষি পরামর্শ লোড হচ্ছে...)";
    }
    if (!weather) {
      return timeBasedCountrywideText + " আজকের কৃষি পরামর্শ: আউশ ধানের ক্ষেতের আগাছা পরিষ্কার করুন এবং রোপা আমন ধানের বীজতলা তৈরির কাজ শুরু করে দিন।";
    }
    
    // Build a dynamic alert message based on district weather
    let weatherAlert = ` [লাইভ আবহাওয়া - ${weather.district} জেলা]: আজকের তাপমাত্রা ${translateNumberToBangla(weather.temp)}°C, অবস্থা: ${weather.condition}। `;
    
    // Add specific recommendations from weather.advice
    const advices = [];
    if (weather.advice.rain && weather.advice.rain.msg) {
      advices.push(weather.advice.rain.msg);
    }
    if (weather.advice.disease_risk && weather.advice.disease_risk.msg) {
      advices.push(weather.advice.disease_risk.msg);
    }
    if (weather.advice.soil && weather.advice.soil.msg) {
      advices.push(weather.advice.soil.msg);
    }
    if (weather.advice.harvest && weather.advice.harvest.msg) {
      advices.push(weather.advice.harvest.msg);
    }
    
    return timeBasedCountrywideText + weatherAlert + advices.join(" ");
  };

  return (
    <div className="relative min-h-screen space-y-10 pb-16">
      
      {/* 🌤️ PREMIUM WEATHER MARQUEE TICKER */}
      <div className="w-full bg-[#1B4332] border-2 border-[#B79400] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-stretch md:items-center min-h-[70px] md:min-h-0 md:h-14">
        {/* Sticky Label with 3D Embossed Metallic Gold effect */}
        <div className="bg-gradient-to-b from-[#E5B83B] via-[#B79400] to-[#8C7000] text-white font-extrabold px-4 py-2 text-xs md:text-sm whitespace-nowrap shrink-0 flex items-center justify-center md:justify-start gap-1.5 relative z-10 shadow-[0_3px_6px_rgba(0,0,0,0.2)] md:shadow-[4px_0_15px_rgba(0,0,0,0.3)] border-b md:border-b-0 md:border-r border-[#1B4332]/30 [text-shadow:0_1.5px_2px_rgba(0,0,0,0.4)]">
          <CloudSun className="w-4.5 h-4.5 text-white filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)] animate-pulse" />
          <span>আবহাওয়া বার্তা</span>
        </div>
        
        {/* Scrolling Marquee Container */}
        <div className="flex-1 overflow-hidden flex items-center min-h-[36px] md:h-full relative bg-gradient-to-r from-[#1B4332] via-[#245e46] to-[#1B4332]">
          {React.createElement(
            'marquee',
            {
              key: selectedDistrict + '_' + (weather ? 'loaded' : 'loading') + '_' + (marqueeDatePrefix ? 'date' : 'nodate') + '_' + (new Date().getHours()),
              scrollamount: '5',
              direction: 'left',
              className: 'w-full font-bold text-soft-white text-xs md:text-sm py-1.5 cursor-default hover:[pointer-events:none]'
            },
            getTickerText()
          )}
        </div>
      </div>

      {/* 🌾 RUSTIC AGRICULTURAL HERO HEADER */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-green-primary/30 min-h-[500px] flex items-center bg-gradient-to-b from-green-950 to-green-900">
        
        {/* Background Image with warm golden sunset overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform hover:scale-[1.01]" 
          style={{ backgroundImage: `url('/hero_paddy_field.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-primary/95 via-green-primary/80 to-amber-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F2] via-transparent to-transparent" />
        
        {/* Hero Content */}
        <div className="relative z-10 p-8 md:p-14 max-w-4xl space-y-6 text-soft-white">

          
          <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] text-soft-white">
            বাংলাদেশের সর্বপ্রথম <br />
            সমন্বিত <span className="text-sunlight drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">ডিজিটাল কৃষি সেবা</span>
          </h1>
          
          <p className="text-sm md:text-lg text-soft-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-2xl font-bold leading-relaxed">
            মাঠের যেকোনো সমস্যার সমন্বিত ডিজিটাল কৃষি সেবা ও তাৎক্ষণিক সমাধান এখন আপনার হাতের মুঠোয়। প্রতিটি জেলার জন্য বিশেষ আবহাওয়া পরামর্শ, সারের সঠিক হিসাব এবং গাছের যেকোনো রোগবালাইয়ের নির্ভুল সমাধান নিয়ে আপনার পাশে আছে গাছের ডাক্তার।
          </p>

          {/* Interactive Chat Input Area */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="ফসলের বা চাষের যেকোনো সমস্যা বাংলায় লিখুন (যেমন: ধানের ব্লাস্ট রোগ)..."
                className="w-full px-6 py-4 rounded-2xl border-2 border-sunlight/20 bg-white/95 text-text-primary focus:outline-none focus:ring-4 focus:ring-green-primary/30 focus:border-transparent shadow-xl placeholder-text-secondary/70 font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl bg-[#1B4332] hover:bg-[#123024] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-green-primary/10 cursor-pointer"
            >
              জিজ্ঞেস করুন <MessageSquare className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Prompt Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs md:text-sm font-bold text-soft-white/90 drop-shadow">যেমন:</span>
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-green-primary/30 hover:bg-soft-white/20 border-2 border-soft-white/30 text-soft-white hover:border-sunlight transition-all cursor-pointer backdrop-blur-md shadow-md"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 🍃 CROP DISEASE LEAF SCANNER FEATURE */}
      <section className="animate-fade-in">
        <LeafScanner />
      </section>

      {/* 🌤️ WEATHER INTELLIGENCE DASHBOARD (MAIN FEATURE) */}
      <section className="space-y-8 bg-gradient-to-r from-green-primary/5 via-amber-500/5 to-green-primary/5 p-8 rounded-3xl border-2 border-green-primary/10 shadow-xl scroll-reveal">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-green-primary/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-green-primary font-black text-sm mb-1 uppercase tracking-wider">
                <CloudSun className="w-5 h-5 text-amber-500" /> লাইভ আবহাওয়া ও কৃষি বালাই সতর্কবার্তা
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-text-primary">আবহাওয়া পূর্বাভাস ও কৃষি নির্দেশিকা</h2>
            <p className="text-sm md:text-base text-text-secondary font-medium">আপনার জেলার লাইভ আবহাওয়া অনুযায়ী ফসলের সেচ, রোগবালাই ঝুঁকি ও ফসল কাটার উপযোগী সময়</p>
          </div>
          
          {/* District Selector */}
          <button
            type="button"
            onClick={() => {
              setShowDistrictModal(true);
            }}
            className="flex items-center gap-3 bg-gradient-to-r from-soft-white to-amber-50 rounded-2xl px-5 py-3 shadow-md border-2 border-green-primary/20 hover:border-green-primary/40 active:scale-95 transition-all text-left cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-green-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary font-bold uppercase">জেলা নির্বাচন করুন:</span>
              <span className="text-green-primary font-black text-base md:text-lg flex items-center gap-1.5 py-0.5">
                {selectedDistrict}
                <ChevronDown className="w-4 h-4 text-green-primary shrink-0" />
              </span>
            </div>
          </button>
        </div>

        {/* 3D Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3D Glassmorphic Weather Panel (Left Column) */}
          <div className="lg:col-span-1 rounded-3xl p-6 bg-gradient-to-br from-green-primary to-green-soft text-soft-white relative overflow-hidden shadow-[0_20px_50px_rgba(46,125,50,0.35)] border-2 border-green-primary/30 flex flex-col justify-between min-h-[440px] group transform hover:scale-[1.01] transition-all">
            
            {/* Top sunlight pulse effect */}
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-sunlight/40 blur-2xl animate-pulse pointer-events-none" />
            
            <div className="space-y-6">
              {/* Badge & City */}
              <div>
                <span className="text-[10px] font-black tracking-widest text-sunlight uppercase bg-soft-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-soft-white/10">
                  লাইভ স্যাটেলাইট পূর্বাভাস
                </span>
                <h3 className="text-3xl font-black mt-3 drop-shadow-md">{selectedDistrict} জেলা</h3>
              </div>

              {/* Centered Graphic and Temp */}
              {loadingWeather ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-10 h-10 border-4 border-sunlight border-t-transparent rounded-full animate-spin" />
                </div>
              ) : weather ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  {/* Weather 3D image in center */}
                  <div className="w-44 h-44 transition-transform duration-500 group-hover:scale-110 pointer-events-none filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)]">
                    <img 
                      src="/weather_3d.png" 
                      alt="আবহাওয়ার চিত্র" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Temperature & Condition */}
                  <div className="text-center space-y-2">
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-6xl font-black tracking-tighter drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]">
                        {translateNumberToBangla(weather.temp)}
                      </span>
                      <span className="text-2xl font-extrabold text-sunlight">°C</span>
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 bg-soft-white/10 px-3 py-1 rounded-full border border-soft-white/5 backdrop-blur-sm text-xs font-bold">
                      <CloudSun className="w-4 h-4 text-sunlight" /> 
                      <span>{weather.condition}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-sm">আবহাওয়া তথ্য লোড সম্ভব হয়নি</p>
                </div>
              )}
            </div>

            {/* Weather Metrics Strip */}
            {!loadingWeather && weather && (
              <div className="relative z-10 grid grid-cols-3 gap-2 bg-soft-white/15 rounded-2xl p-4 border border-soft-white/20 backdrop-blur-md text-xs shadow-inner mt-4">
                <div className="flex flex-col items-center gap-1.5 text-center border-r border-soft-white/15 pr-1">
                  <Wind className="w-4 h-4 text-sunlight" />
                  <span className="text-[9px] text-soft-white/80 font-bold">বায়ুপ্রবাহ</span>
                  <span className="font-black text-sm">{translateNumberToBangla(weather.wind_speed)} km/h</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center border-r border-soft-white/15 px-1">
                  <Droplets className="w-4 h-4 text-sky-blue" />
                  <span className="text-[9px] text-soft-white/80 font-bold">আর্দ্রতা</span>
                  <span className="font-black text-sm">{translateNumberToBangla(weather.humidity || 75)}%</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center pl-1">
                  <Thermometer className="w-4 h-4 text-amber-300" />
                  <span className="text-[9px] text-soft-white/80 font-bold">মাটি তাপমাত্রা</span>
                  <span className="font-black text-sm">{translateNumberToBangla(weather.soil_temp || 26)}°C</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Advisory Panels (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            
            {/* Filter buttons to focus on specific advice */}
            <div className="flex flex-wrap gap-2 border-b border-green-primary/10 pb-3">
              <button 
                onClick={() => setActiveWeatherTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'all' 
                    ? 'bg-green-primary text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-green-primary/5'
                }`}
              >
                সব পরামর্শ
              </button>
              <button 
                onClick={() => setActiveWeatherTab('rain')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'rain' 
                    ? 'bg-sky-700 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-sky-50'
                }`}
              >
                সেচ ও বৃষ্টি
              </button>
              <button 
                onClick={() => setActiveWeatherTab('disease')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'disease' 
                    ? 'bg-red-700 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-red-50'
                }`}
              >
                বালাই সংক্রমণ
              </button>
              <button 
                onClick={() => setActiveWeatherTab('spray')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'spray' 
                    ? 'bg-green-700 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-green-50'
                }`}
              >
                স্প্রে সময়
              </button>
              <button 
                onClick={() => setActiveWeatherTab('soil')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'soil' 
                    ? 'bg-amber-800 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-amber-50'
                }`}
              >
                মাটির তাপমাত্রা
              </button>
              <button 
                onClick={() => setActiveWeatherTab('harvest')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'harvest' 
                    ? 'bg-yellow-600 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-yellow-50'
                }`}
              >
                ফসল সংগ্রহ
              </button>
            </div>

            {loadingWeather ? (
              <div className="flex items-center justify-center h-full bg-soft-white/60 rounded-3xl border border-green-primary/10 min-h-[300px]">
                <div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : weather ? (
              <div className="grid grid-cols-1 gap-6">
                
                {/* 1. Rain Advisory */}
                {(activeWeatherTab === 'all' || activeWeatherTab === 'rain') && (
                  <div className="agri-glass p-6 border-l-8 border-l-sky-500 hover:shadow-xl transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase text-sky-700 tracking-wider flex items-center gap-1.5">
                          <Droplets className="w-5 h-5 text-sky-500" /> {weather.advice.rain.title}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${getAlertBadgeStyles(weather.advice.rain.status)}`}>
                          {weather.advice.rain.status === 'high_rain' ? 'অতিরিক্ত বৃষ্টি সতর্কবার্তা' : 'স্বাভাবিক সেচ সূচি'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.rain.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">করোনার চাষাবাদ পদক্ষেপ:</p>
                        <ul className="space-y-2">
                          {weather.advice.rain.actions.map((act, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-text-primary font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-2" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Pest & Disease Alert */}
                {(activeWeatherTab === 'all' || activeWeatherTab === 'disease') && (
                  <div className="agri-glass p-6 border-l-8 border-l-red-500 hover:shadow-xl transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase text-red-700 tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-5 h-5 text-red-500" /> {weather.advice.disease_risk.title}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${getAlertBadgeStyles(weather.advice.disease_risk.status)}`}>
                          {weather.advice.disease_risk.status === 'danger' ? 'উচ্চ সংক্রমণ ঝুঁকি' : 'কম বালাই ঝুঁকি'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.disease_risk.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">বালাই দমন আগাম পদক্ষেপ:</p>
                        <ul className="space-y-2">
                          {weather.advice.disease_risk.actions.map((act, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-text-primary font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Spray Window */}
                {(activeWeatherTab === 'all' || activeWeatherTab === 'spray') && (
                  <div className="agri-glass p-6 border-l-8 border-l-green-700 hover:shadow-xl transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase text-green-800 tracking-wider flex items-center gap-1.5">
                          <Wind className="w-5 h-5 text-green-700" /> {weather.advice.spray_window.title}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${getAlertBadgeStyles(weather.advice.spray_window.status)}`}>
                          {weather.advice.spray_window.status === 'unsuitable' ? 'স্প্রে স্থগিত রাখুন' : 'স্প্রে করার অনুকূল দিন'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.spray_window.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">স্প্রে করার জন্য নির্দেশনা:</p>
                        <ul className="space-y-2">
                          {weather.advice.spray_window.actions.map((act, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-text-primary font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0 mt-2" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Soil Warmth */}
                {(activeWeatherTab === 'all' || activeWeatherTab === 'soil') && (
                  <div className="agri-glass p-6 border-l-8 border-l-amber-800 hover:shadow-xl transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                          <Thermometer className="w-5 h-5 text-amber-700" /> {weather.advice.soil.title}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${getAlertBadgeStyles(weather.advice.soil.status)}`}>
                          {weather.advice.soil.status === 'hot' ? 'উচ্চ তাপমাত্রা' : weather.advice.soil.status === 'cold' ? 'নিম্ন তাপমাত্রা' : 'অনুকূল মাটি উষ্ণতা'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.soil.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">মাটি পরিচর্যার পদক্ষেপ:</p>
                        <ul className="space-y-2">
                          {weather.advice.soil.actions.map((act, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-text-primary font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Harvesting Window */}
                {(activeWeatherTab === 'all' || activeWeatherTab === 'harvest') && (
                  <div className="agri-glass p-6 border-l-8 border-l-yellow-600 hover:shadow-xl transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase text-yellow-800 tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-5 h-5 text-yellow-600" /> {weather.advice.harvest.title}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${getAlertBadgeStyles(weather.advice.harvest.status)}`}>
                          {weather.advice.harvest.status === 'wait' ? 'ফসল কাটা বন্ধ রাখুন' : 'ফসল কাটার চমৎকার সময়'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.harvest.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">সংগ্রহ ও প্রক্রিয়াকরণ নির্দেশনা:</p>
                        <ul className="space-y-2">
                          {weather.advice.harvest.actions.map((act, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-text-primary font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 shrink-0 mt-2" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <p className="text-sm text-text-secondary">আবহাওয়া লোড সম্পন্ন করা যায়নি।</p>
            )}
          </div>

        </div>
      </section>

      {/* 📊 INTERACTIVE TWIN PORTLET: CROP CALENDAR & MARKET PRICES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-reveal">
        
        {/* Portlet 1: Bangla Crop Calendar */}
        <div className="gold-card p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="border-b-2 border-amber-500/20 pb-4">
            <div className="inline-flex items-center gap-1.5 text-amber-700 font-black text-xs mb-1 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
              <Sunrise className="w-4 h-4 text-amber-600" /> মৌসুমি কৃষি দিনপঞ্জি
            </div>
            <h3 className="text-2xl font-black text-text-primary flex items-center justify-between mt-1">
              <span>চলতি বাংলা ঋতু: {AGRI_CALENDAR.season_bn}</span>
              <span className="text-sm text-green-primary font-black bg-green-500/10 px-3 py-1 rounded-full">{AGRI_CALENDAR.month_bn} মাস</span>
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-text-secondary font-bold">
              জ্যৈষ্ঠ ও আষাঢ় মাসে দেশের কৃষি জলবায়ু অনুযায়ী নিচের খামার কাজগুলো অত্যন্ত জরুরি:
            </p>
            
            <div className="space-y-3">
              {AGRI_CALENDAR.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-3 text-sm text-text-primary bg-white/60 p-4 rounded-2xl border border-amber-500/15">
                  <span className="text-amber-700 font-extrabold text-sm shrink-0 mt-0.5">
                    {translateNumberToBangla(idx + 1)}.
                  </span>
                  <p className="font-bold leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portlet 2: Live Wholesale Market Prices */}
        <div className="agri-glass p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="border-b-2 border-green-primary/20 pb-4">
            <div className="inline-flex items-center gap-1.5 text-green-700 font-black text-xs mb-1 uppercase tracking-wider bg-green-500/10 px-2.5 py-1 rounded-md">
              <Coins className="w-4 h-4 text-green-600" /> বাজার মূল্য মনিটর
            </div>
            <h3 className="text-2xl font-black text-text-primary mt-1">আজকের দেশীয় কৃষি পাইকারি বাজার দর</h3>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-green-primary/10 shadow-sm bg-white/70">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-green-primary/15 text-text-primary font-black border-b border-green-primary/10">
                    <th className="p-3">ফসলের নাম</th>
                    <th className="p-3 text-right">গড় পাইকারি দর</th>
                    <th className="p-3 text-center">বাজার প্রবণতা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-primary/5 font-bold">
                  {MARKET_PRICES.map((item, idx) => (
                    <tr key={idx} className="hover:bg-green-primary/5 transition-colors">
                      <td className="p-3 text-text-primary">{item.crop}</td>
                      <td className="p-3 text-right text-text-primary">{item.price}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] ${
                          item.change === 'up' 
                            ? 'bg-red-100 text-red-700' 
                            : item.change === 'down' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.change === 'up' ? '▲' : item.change === 'down' ? '▼' : '●'} {item.changeVal}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-center text-text-secondary/70 font-semibold">
              * কাওরান বাজার ও স্থানীয় পাইকারি বাজার দর এর গড় হিসাব। প্রতিদিন সকালে আপডেট করা হয়।
            </p>
          </div>
        </div>

      </section>

      {/* 🛠️ HIGHLIGHTED FEATURE MATRIX */}
      <section className="space-y-6 scroll-reveal">
        <div className="border-b-2 border-green-primary/10 pb-4">
          <div className="inline-flex items-center gap-1.5 text-green-primary font-black text-sm mb-1 uppercase tracking-wider">
            <Compass className="w-5 h-5" /> স্মার্ট চাষাবাদ প্রযুক্তি টুলস
          </div>
          <h2 className="text-3xl font-black text-text-primary">গাছের ডাক্তার ইন্টারেক্টিভ ফিচারসমূহ</h2>
          <p className="text-sm text-text-secondary font-medium">সহজতম মোবাইল ফ্রেন্ডলি ইন্টারফেস এবং সমৃদ্ধ ইউজার অভিজ্ঞতা</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 scroll-reveal scroll-reveal-grid">
          
          {/* Feature 1: Gacher Doctor */}
          <div 
            onClick={() => router.push('/chat')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <MessageSquare className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  গাছের ডাক্তার
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  ফসলের রোগবালাই, ছত্রাক সংক্রমণ ও প্রতিকারের জন্য গাছের ডাক্তারের কাছে সরাসরি চ্যাট ও ভয়েস আলোচনা।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              পরামর্শ নিন →
            </div>
          </div>

          {/* Feature 2: Crop Library */}
          <div 
            onClick={() => router.push('/crops')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <BookOpen className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  ফসলের বই
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  ৫২+ টি দেশীয় ফসলের রোপণকাল, জাত ও বালাই ব্যবস্থাপনার পূর্ণাঙ্গ নির্দেশিকা। BARI ও BRRI অনুমোদিত।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              বই পড়ুন →
            </div>
          </div>

          {/* Feature 3: Fertilizer Calc */}
          <div 
            onClick={() => router.push('/calculator')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <Calculator className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  সারের হিসাব-নিকাশ
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  জমির পরিমাপ ও মৌসুম নির্ধারণ করে প্রয়োজনীয় ইউরিয়া, টিএসপি, পটাশ এর সঠিক কেজি ও বস্তার হিসাব।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              হিসাব করুন →
            </div>
          </div>

          {/* Feature 4: Market Prices */}
          <div 
            onClick={() => router.push('/prices')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <Coins className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  পাইকারি বাজার দর
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  কৃষি বিপণন অধিদপ্তর (DAM) থেকে সরাসরি প্রাপ্ত প্রতিদিনের পাইকারি ফসলের দরদাম এবং চার্ট বিশ্লেষণ।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              বাজার দর দেখুন →
            </div>
          </div>

          {/* Feature 5: Information Hub */}
          <div 
            onClick={() => router.push('/articles')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <BookOpen className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  কৃষি তথ্য ভান্ডার
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  DAE এবং BINA নোটিশ বোর্ড থেকে স্বয়ংক্রিয়ভাবে সিঙ্ক হওয়া নতুন নোটিশ, জাত ও বৈজ্ঞানিক নির্দেশিকা।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              তথ্য ভান্ডার দেখুন →
            </div>
          </div>

          {/* Feature 6: Diagnostic Symptom Checker */}
          <div 
            onClick={() => router.push('/crops/diagnostics')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <AlertTriangle className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  রোগ নির্ণয় নির্দেশিকা
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  গাছের আক্রান্ত অঙ্গ ও লক্ষণ ক্লিক করে রোগ শনাক্ত করুন এবং BARI/BRRI অনুমোদিত সঠিক ডোজ জানুন।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              রোগ সনাক্ত করুন →
            </div>
          </div>

          {/* Feature 7: Pesticide Calculator */}
          <div 
            onClick={() => router.push('/calculator/pesticide')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <Calculator className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  কীটনাশক প্রয়োগের হিসাব
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  স্প্রে ড্রামের সাইজ এবং বোতলের নির্দেশিকা অনুযায়ী সঠিক পরিমাণ বালাইনাশক ও পানির অনুপাত গণনা।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              কীটনাশক হিসাব করুন →
            </div>
          </div>

          {/* Feature 8: Irrigation Advisor */}
          <div 
            onClick={() => router.push('/weather/irrigation')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <Droplets className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  সেচ দেওয়ার সঠিক নিয়ম
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  বৃষ্টির পূর্বাভাস ও মাটির আর্দ্রতার উপর ভিত্তি করে জমিতে সেচ প্রদান বা নিষ্কাশনের সতর্কবার্তা।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              সেচ গাইড দেখুন →
            </div>
          </div>

          {/* Feature 9: Soil pH Advisor */}
          <div 
            onClick={() => router.push('/calculator/soil-ph')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <Thermometer className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  মাটি পরীক্ষা ও চিকিৎসা
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  মাটির pH লেভেল অনুযায়ী অম্লত্ব বা ক্ষারত্ব দূর করতে বিঘাপ্রতি ডলোচুন বা জিপসামের পরিমাণ হিসাব।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              মাটি পরীক্ষা করুন →
            </div>
          </div>

          {/* Feature 10: Seed Rate Calculator */}
          <div 
            onClick={() => router.push('/calculator/seeds')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <Sprout className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  বীজ ও চারার পরিমাণ
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  জমির পরিমাপ অনুযায়ী প্রয়োজনীয় বীজের সঠিক ওজন এবং আদর্শ বপন দূরত্ব ও গভীরতার গাইডলাইন।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              বীজের হিসাব করুন →
            </div>
          </div>

          {/* Feature 11: Loans & Subsidies */}
          <div 
            onClick={() => router.push('/directory/loans')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <Coins className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  কৃষি ঋণ ও অনুদান
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  বাংলাদেশ কৃষি ব্যাংকের লোন স্কিম এবং সরকারি বীজ, সার ও যন্ত্রপাতি ক্রয়ে ভর্তুকির আবেদন গাইড।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              লোন গাইড দেখুন →
            </div>
          </div>

          {/* Feature 12: Crop Rotation */}
          <div 
            onClick={() => router.push('/crops/rotation')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div className="space-y-4">
              <RefreshCw className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  পর্যায়ক্রমে ফসল চাষ
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  মাটির নাইট্রোজেন ও উর্বরতা বজায় রাখতে ধানের পর কোন ফসল চাষ করা উচিত তার ফসল চক্র নকশা।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              পরিকল্পনা দেখুন →
            </div>
          </div>

          {/* Feature 13: Soil-Crop Matchmaker */}
          <div 
            onClick={() => router.push('/crops/matchmaker')}
            className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-white/70 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] group col-span-1"
          >
            <div className="space-y-4">
              <Compass className="w-6 h-6 text-green-primary group-hover:text-green-soft transition-colors" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-green-primary transition-colors">
                  লাভজনক ফসল খুঁজুন
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  আপনার জেলা, মাটির গঠন ও চলতি আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ লাভজনক ফসল খোঁজার গাইড।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              লাভজনক ফসল খুঁজুন →
            </div>
          </div>

        </div>
      </section>





      {/* 🗺️ DISTRICT SELECTOR POPUP MODAL */}
      {showDistrictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-green-primary/20 rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl space-y-6 relative transform transition-all duration-300 scale-100">
            
            {/* Top Close Button (X) */}
            <button
              onClick={() => setShowDistrictModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-text-secondary hover:text-red-500 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2 shrink-0">
              <span className="text-[10px] font-black tracking-widest text-green-primary uppercase bg-green-primary/10 px-3 py-1 rounded-full">
                কৃষিসাথী লোকেশন সেটিংস
              </span>
              <h3 className="text-xl md:text-2xl font-black text-text-primary">
                আপনার জেলা নির্বাচন করুন
              </h3>
              <p className="text-xs md:text-sm font-semibold text-text-secondary leading-relaxed">
                আপনার জেলা নির্বাচন করুন, যাতে গাছের ডাক্তার আপনার এলাকার আবহাওয়া এবং মাটির উর্বরতা অনুযায়ী শতভাগ সঠিক ও সুনির্দিষ্ট পরামর্শ দিতে পারে।
              </p>
            </div>

            {/* Search Input Box */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                placeholder="জেলার নাম বাংলায় বা ইংরেজিতে খুঁজুন (যেমন: সাতক্ষীরা / Satkhira)..."
                className="w-full pl-5 pr-12 py-3 rounded-2xl border-2 border-green-primary/20 bg-soft-white text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary focus:border-transparent font-bold text-sm shadow-sm"
              />
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Search className="w-5 h-5 text-green-primary" />
              </div>
            </div>

            {/* Searchable Dropdown Selection List */}
            <div className="flex-1 overflow-y-auto pr-1 border border-green-primary/10 rounded-2xl divide-y divide-gray-100 bg-soft-white/30 shadow-inner">
              {(() => {
                const DIVS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];
                const MAJS = ["সাতক্ষীরা", "যশোর", "বগুড়া", "কুমিল্লা", "পাবনা", "নোয়াখালী", "দিনাজপুর", "টাঙ্গাইল", "ফরিদপুর", "গাজীপুর", "নরসিংদী", "কক্সবাজার", "কুষ্টিয়া", "ঝিনাইদহ", "হবিগঞ্জ", "মৌলভীবাজার", "জামালপুর", "পটুয়াখালী"];
                
                const sorted = [...districts].sort((a, b) => {
                  const idxA = DIVS.includes(a.name_bn) ? 1 : MAJS.includes(a.name_bn) ? 2 : 3;
                  const idxB = DIVS.includes(b.name_bn) ? 1 : MAJS.includes(b.name_bn) ? 2 : 3;
                  if (idxA !== idxB) return idxA - idxB;
                  return a.name_bn.localeCompare(b.name_bn, 'bn');
                });

                const filtered = sorted.filter(d => 
                  modalSearchQuery.trim() === '' || 
                  d.name_bn.toLowerCase().includes(modalSearchQuery.toLowerCase()) || 
                  d.name_en.toLowerCase().includes(modalSearchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs font-bold text-text-secondary">
                      কোনো জেলা খুঁজে পাওয়া যায়নি
                    </div>
                  );
                }

                return filtered.map(d => {
                  const isSelected = selectedDistrict === d.name_bn;
                  return (
                    <button
                      key={d.name_bn}
                      type="button"
                      onClick={() => {
                        setSelectedDistrict(d.name_bn);
                        localStorage.setItem("krishisathi_user_district", d.name_bn);
                        setShowDistrictModal(false);
                      }}
                      className={`w-full px-5 py-3 text-left font-bold text-xs md:text-sm transition-all flex items-center justify-between cursor-pointer border-l-4 ${
                        isSelected
                          ? 'bg-green-primary/10 text-green-primary border-l-green-primary'
                          : 'bg-white hover:bg-green-primary/5 text-text-primary border-l-transparent border-b border-gray-50'
                      }`}
                    >
                      <span>{d.name_bn} ({d.name_en})</span>
                      {isSelected && <span className="text-green-primary font-bold">✓</span>}
                    </button>
                  );
                });
              })()}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
