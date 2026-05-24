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
  TrendingUp,
  MapPin,
  CheckCircle,
  Coins,
  AlertTriangle,
  Sunrise,
  Sunset,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import LeafScanner from '@/components/LeafScanner';

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

export default function Home() {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeWeatherTab, setActiveWeatherTab] = useState<'all' | 'rain' | 'disease' | 'spray' | 'soil' | 'harvest'>('all');

  // Prompt suggestions
  const promptChips = [
    "ধানের পাতা হলুদ কেন?",
    "বোরো ধানের সারের পরিমাণ",
    "ভারী বৃষ্টি হলে কি করণীয়?",
    "টমেটোর নাবি ধসা রোগ",
    "আদা ও হলুদের সঠিক চাষ পদ্ধতি"
  ];

  // Fetch districts list
  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch weather data for selected district
  useEffect(() => {
    setLoadingWeather(true);
    fetch(`/api/weather?district=${encodeURIComponent(selectedDistrict)}`)
      .then(res => {
        if (!res.ok) {
          console.error('Weather API returned non-ok status');
          return { error: true };
        }
        return res.json();
      })
      .then(data => {
        if (!data.error) {
          setWeather(data);
        } else {
          setWeather(null);
        }
        setLoadingWeather(false);
      })
      .catch(err => {
        console.error(err);
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

  return (
    <div className="relative min-h-screen space-y-16 pb-16">
      
      {/* 🌾 RUSTIC AGRICULTURAL HERO HEADER */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-green-primary/30 min-h-[500px] flex items-center bg-gradient-to-b from-green-950 to-green-900">
        
        {/* Background Image with warm golden sunset overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform hover:scale-[1.01]" 
          style={{ backgroundImage: `url('/hero_paddy_field.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-primary/95 via-green-primary/80 to-amber-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F2] via-transparent to-transparent" />
        
        {/* Decorative swaying rice/wheat icons in the corners */}
        <div className="absolute left-6 bottom-16 opacity-10 pointer-events-none sway-animation hidden md:block">
          <Sprout className="w-48 h-48 text-sunlight" />
        </div>
        <div className="absolute right-12 top-10 opacity-15 pointer-events-none sway-animation hidden md:block" style={{ animationDelay: '1.5s' }}>
          <Sprout className="w-36 h-36 text-green-light" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-8 md:p-14 max-w-4xl space-y-6 text-soft-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunlight/25 border-2 border-sunlight/50 text-sunlight text-xs md:text-sm font-bold backdrop-blur-md shadow-md animate-pulse">
            🌾 প্রযুক্তি ও উর্বর মাটির মহামিলন
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] text-soft-white">
            বাংলাদেশের সর্বপ্রথম <br />
            সমন্বিত <span className="text-sunlight drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">ডিজিটাল কৃষি সেবা</span>
          </h1>
          
          <p className="text-sm md:text-lg text-soft-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-2xl font-bold leading-relaxed">
            মাঠের যেকোনো সমস্যার তাৎক্ষণিক সমাধান এখন আপনার হাতের মুঠোয়। প্রতিটি জেলার জন্য বিশেষ আবহাওয়া পরামর্শ, সারের সঠিক হিসাব এবং গাছের যেকোনো রোগবালাইয়ের নির্ভুল সমাধান নিয়ে আপনার পাশে আছে গাছের ডাক্তার।
          </p>

          {/* Interactive Chat Input Area */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="ফসলের বা চাষের যেকোনো সমস্যা বাংলায় লিখুন (যেমন: ধানের ব্লাস্ট রোগ)..."
                className="w-full px-6 py-4 rounded-2xl border-2 border-sunlight/30 bg-soft-white text-text-primary focus:outline-none focus:ring-4 focus:ring-sunlight focus:border-transparent shadow-2xl placeholder-text-secondary/70 font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sunlight to-amber-500 hover:from-yellow-400 hover:to-amber-600 text-foreground font-black flex items-center justify-center gap-2 shadow-xl hover:shadow-[0_0_20px_rgba(255,213,79,0.4)] transition-all transform hover:scale-[1.03] cursor-pointer border border-amber-600/30"
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
      <section className="space-y-8 bg-gradient-to-r from-green-primary/5 via-amber-500/5 to-green-primary/5 p-8 rounded-3xl border-2 border-green-primary/10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-green-primary/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-green-primary font-black text-sm mb-1 uppercase tracking-wider">
                <CloudSun className="w-5 h-5 text-amber-500" /> লাইভ আবহাওয়া ও কৃষি বালাই সতর্কবার্তা
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-text-primary">আবহাওয়া পূর্বাভাস ও কৃষি নির্দেশিকা</h2>
            <p className="text-sm md:text-base text-text-secondary font-medium">আপনার জেলার লাইভ আবহাওয়া অনুযায়ী ফসলের সেচ, রোগবালাই ঝুঁকি ও ফসল কাটার উপযোগী সময়</p>
          </div>
          
          {/* District Selector */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-soft-white to-amber-50 rounded-2xl px-5 py-3 shadow-md border-2 border-green-primary/20">
            <MapPin className="w-5 h-5 text-green-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary font-bold uppercase">জেলা নির্বাচন করুন:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent border-none text-green-primary font-black text-base md:text-lg focus:outline-none cursor-pointer pr-6 py-0.5"
              >
                {districts.map((d, idx) => (
                  <option key={idx} value={d.name_bn} className="text-text-primary font-medium">{d.name_bn}</option>
                ))}
              </select>
            </div>
          </div>
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
                সব পরামর্শ (৫টি মাত্রা)
              </button>
              <button 
                onClick={() => setActiveWeatherTab('rain')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'rain' 
                    ? 'bg-sky-700 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-sky-50'
                }`}
              >
                🌧️ সেচ ও বৃষ্টি
              </button>
              <button 
                onClick={() => setActiveWeatherTab('disease')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'disease' 
                    ? 'bg-red-700 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-red-50'
                }`}
              >
                🦠 বালাই সংক্রমণ
              </button>
              <button 
                onClick={() => setActiveWeatherTab('spray')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'spray' 
                    ? 'bg-green-700 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-green-50'
                }`}
              >
                💨 স্প্রে সময়
              </button>
              <button 
                onClick={() => setActiveWeatherTab('soil')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'soil' 
                    ? 'bg-amber-800 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-amber-50'
                }`}
              >
                🌱 মাটির তাপমাত্রা
              </button>
              <button 
                onClick={() => setActiveWeatherTab('harvest')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  activeWeatherTab === 'harvest' 
                    ? 'bg-yellow-600 text-soft-white shadow-md border-transparent' 
                    : 'bg-soft-white text-text-secondary border-green-primary/10 hover:bg-yellow-50'
                }`}
              >
                🌾 ফসল সংগ্রহ
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
                          {weather.advice.rain.status === 'high_rain' ? '⚠️ অতিরিক্ত বৃষ্টি সতর্কবার্তা' : '✅ স্বাভাবিক সেচ সূচি'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.rain.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">করোনার চাষাবাদ পদক্ষেপ:</p>
                        <ul className="space-y-2">
                          {weather.advice.rain.actions.map((act, i) => (
                            <li key={i} className="flex gap-2 text-sm text-text-primary font-medium">
                              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
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
                          {weather.advice.disease_risk.status === 'danger' ? '⚠️ উচ্চ সংক্রমণ ঝুঁকি' : '✅ কম বালাই ঝুঁকি'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.disease_risk.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">বালাই দমন আগাম পদক্ষেপ:</p>
                        <ul className="space-y-2">
                          {weather.advice.disease_risk.actions.map((act, i) => (
                            <li key={i} className="flex gap-2 text-sm text-text-primary font-medium">
                              <CheckCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
                          {weather.advice.spray_window.status === 'unsuitable' ? '⚠️ স্প্রে স্থগিত রাখুন' : '✅ স্প্রে করার অনুকূল দিন'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.spray_window.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">স্প্রে করার জন্য নির্দেশনা:</p>
                        <ul className="space-y-2">
                          {weather.advice.spray_window.actions.map((act, i) => (
                            <li key={i} className="flex gap-2 text-sm text-text-primary font-medium">
                              <CheckCircle className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
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
                          {weather.advice.soil.status === 'hot' ? '⚠️ উচ্চ তাপমাত্রা' : weather.advice.soil.status === 'cold' ? '⚠️ নিম্ন তাপমাত্রা' : '✅ অনুকূল মাটি উষ্ণতা'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.soil.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">মাটি পরিচর্যার পদক্ষেপ:</p>
                        <ul className="space-y-2">
                          {weather.advice.soil.actions.map((act, i) => (
                            <li key={i} className="flex gap-2 text-sm text-text-primary font-medium">
                              <CheckCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
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
                          {weather.advice.harvest.status === 'wait' ? '⚠️ ফসল কাটা বন্ধ রাখুন' : '✅ ফসল কাটার চমৎকার সময়'}
                        </span>
                      </div>
                      <p className="text-base font-bold text-text-primary">
                        {weather.advice.harvest.msg}
                      </p>
                      
                      <div className="space-y-2 pt-2 border-t border-green-primary/5">
                        <p className="text-xs font-black text-text-secondary uppercase">সংগ্রহ ও প্রক্রিয়াকরণ নির্দেশনা:</p>
                        <ul className="space-y-2">
                          {weather.advice.harvest.actions.map((act, i) => (
                            <li key={i} className="flex gap-2 text-sm text-text-primary font-medium">
                              <CheckCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
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
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Portlet 1: Bangla Crop Calendar */}
        <div className="gold-card p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] text-amber-500/5 pointer-events-none sway-animation">
            <Calendar className="w-48 h-48" />
          </div>
          
          <div className="border-b-2 border-amber-500/20 pb-4">
            <div className="inline-flex items-center gap-1 text-amber-700 font-black text-xs mb-1 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
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
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="font-bold leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portlet 2: Live Wholesale Market Prices */}
        <div className="agri-glass p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] text-green-primary/5 pointer-events-none">
            <Coins className="w-48 h-48" />
          </div>

          <div className="border-b-2 border-green-primary/20 pb-4">
            <div className="inline-flex items-center gap-1 text-green-700 font-black text-xs mb-1 uppercase tracking-wider bg-green-500/10 px-2.5 py-1 rounded-md">
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
      <section className="space-y-6">
        <div className="border-b-2 border-green-primary/10 pb-4">
          <div className="inline-flex items-center gap-1.5 text-green-primary font-black text-sm mb-1 uppercase tracking-wider">
            <Compass className="w-5 h-5" /> স্মার্ট চাষাবাদ প্রযুক্তি টুলস
          </div>
          <h2 className="text-3xl font-black text-text-primary">গাছের ডাক্তার ইন্টারেক্টিভ ফিচারসমূহ</h2>
          <p className="text-sm text-text-secondary font-medium">সহজতম মোবাইল ফ্রেন্ডলি ইন্টারফেস এবং সমৃদ্ধ ইউজার অভিজ্ঞতা</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Feature 1: Gacher Doctor */}
          <div 
            onClick={() => router.push('/chat')}
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  গাছের ডাক্তার <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  ফসলের বই <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  সারের হিসাব-নিকাশ <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  পাইকারি বাজার দর <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  কৃষি তথ্য ভান্ডার <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  রোগ নির্ণয় নির্দেশিকা <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  কীটনাশক প্রয়োগের হিসাব <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  সেচ দেওয়ার সঠিক নিয়ম <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Thermometer className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  মাটি পরীক্ষা ও চিকিৎসা <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  বীজ ও চারার পরিমাণ <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  কৃষি ঋণ ও অনুদান <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  পর্যায়ক্রমে ফসল চাষ <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
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
            className="agri-glass p-6 cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px] col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-4"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-primary/10 text-green-primary rounded-xl flex items-center justify-center group-hover:bg-green-primary group-hover:text-soft-white transition-all duration-300">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5 group-hover:text-green-primary transition-colors">
                  লাভজনক ফসল নির্বাচন <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-bold">
                  আপনার জেলা, মাটির গঠন ও চলতি আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ লাভজনক ফসল নির্বাচনের গাইড।
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-green-primary group-hover:underline flex items-center gap-1 pt-4 uppercase tracking-wider">
              ফসল নির্বাচন করুন →
            </div>
          </div>

        </div>
      </section>

      {/* 🌾 SEASONAL CROP RECOMMENDATION MATRIX */}
      <section className="bg-soft-white/90 rounded-3xl border-2 border-green-primary/10 p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Soft sun glow inside crop section */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sunlight/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-green-primary/10 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-green-primary font-black text-xs mb-1 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> উচ্চ ফলনশীল লাভজনক ফসল
            </div>
            <h2 className="text-3xl font-black text-text-primary">আদর্শ মৌসুমি লাভজনক ফসলসমূহ</h2>
            <p className="text-sm text-text-secondary font-semibold">আপনার খামারে চাষ উপযোগী উচ্চ লাভজনক জাতসমূহ</p>
          </div>
          <button 
            onClick={() => router.push('/crops')}
            className="px-6 py-3 rounded-full bg-green-primary text-soft-white text-xs font-black hover:bg-green-soft hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-green-700/20"
          >
            সব ফসল দেখুন <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Crop 1 */}
          <div className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-warm-bg/30 space-y-4 hover:shadow-lg transition-all">
            <span className="text-5xl block">🌾</span>
            <div>
              <h4 className="font-black text-xl text-text-primary">ধান (বোরো)</h4>
              <p className="text-xs text-text-secondary font-bold">Oryza sativa | বোরো-রবি মৌসুম</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-green-primary/5">
              <div>
                <span className="text-text-secondary block font-bold">গড় ফলন:</span>
                <p className="font-black text-text-primary text-base">৬.২ টন/হেক্টর</p>
              </div>
              <div>
                <span className="text-text-secondary block font-bold">সম্ভাব্য লাভ:</span>
                <p className="font-black text-green-primary text-base">১২,০০০ ৳/বিঘা</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/crops?c=1')}
              className="w-full text-center py-2.5 bg-green-primary/10 text-green-primary rounded-xl text-xs font-black hover:bg-green-primary hover:text-soft-white transition-all cursor-pointer"
            >
              বিস্তারিত গাইড
            </button>
          </div>

          {/* Crop 2 */}
          <div className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-warm-bg/30 space-y-4 hover:shadow-lg transition-all">
            <span className="text-5xl block">🍍</span>
            <div>
              <h4 className="font-black text-xl text-text-primary">আনারস</h4>
              <p className="text-xs text-text-secondary font-bold">Ananas comosus | সারা বছর</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-green-primary/5">
              <div>
                <span className="text-text-secondary block font-bold">গড় ফলন:</span>
                <p className="font-black text-text-primary text-base">২৪.০ টন/হেক্টর</p>
              </div>
              <div>
                <span className="text-text-secondary block font-bold">সম্ভাব্য লাভ:</span>
                <p className="font-black text-green-primary text-base">২৬,০০০ ৳/বিঘা</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/crops')}
              className="w-full text-center py-2.5 bg-green-primary/10 text-green-primary rounded-xl text-xs font-black hover:bg-green-primary hover:text-soft-white transition-all cursor-pointer"
            >
              বিস্তারিত গাইড
            </button>
          </div>

          {/* Crop 3 */}
          <div className="border border-green-primary/10 hover:border-green-primary/30 rounded-2xl p-6 bg-warm-bg/30 space-y-4 hover:shadow-lg transition-all">
            <span className="text-5xl block">🍃</span>
            <div>
              <h4 className="font-black text-xl text-text-primary">পান (Betel Leaf)</h4>
              <p className="text-xs text-text-secondary font-bold">Piper betle | অর্থকরী / বারোমাসি</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-green-primary/5">
              <div>
                <span className="text-text-secondary block font-bold">গড় ফলন:</span>
                <p className="font-black text-text-primary text-base">১০.০ টন/হেক্টর</p>
              </div>
              <div>
                <span className="text-text-secondary block font-bold">সম্ভাব্য লাভ:</span>
                <p className="font-black text-green-primary text-base">৪৫,০০০ ৳/বিঘা</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/crops')}
              className="w-full text-center py-2.5 bg-green-primary/10 text-green-primary rounded-xl text-xs font-black hover:bg-green-primary hover:text-soft-white transition-all cursor-pointer"
            >
              বিস্তারিত গাইড
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
