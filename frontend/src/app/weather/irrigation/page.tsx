'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Droplets, CloudRain, AlertTriangle, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';
import { detectUserDistrict } from '@/lib/location';

interface WeatherData {
  district: string;
  temp: number;
  condition: string;
  humidity?: number;
  advice: {
    rain: {
      status: string;
      title: string;
      msg: string;
      actions: string[];
    };
  };
}

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
    
    const parts: (string | React.ReactNode)[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    let partIdx = 0;

    while ((match = regex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanLine.substring(lastIndex, match.index).replace(/\*\*/g, ''));
      }
      parts.push(
        <strong key={partIdx++} className="font-extrabold text-green-primary">
          {match[1].replace(/\*\*/g, '')}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < cleanLine.length) {
      parts.push(cleanLine.substring(lastIndex).replace(/\*\*/g, ''));
    }
    const content = parts.length > 0 ? parts : [cleanLine.replace(/\*\*/g, '')];

    return (
      <p key={lineIdx} className={`mb-1 leading-relaxed text-xs md:text-sm ${isBullet ? 'pl-4 list-item list-disc' : ''}`}>
        {content}
      </p>
    );
  });
};

export default function IrrigationAdvisor() {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
  const [weather, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline Chat States
  const [inlineChatMessages, setInlineChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [inlineChatInput, setInlineChatInput] = useState('');
  const [inlineChatLoading, setInlineChatLoading] = useState(false);

  // Fetch districts
  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
      })
      .catch(err => console.error(err));

    detectUserDistrict('ঢাকা').then(detected => {
      setSelectedDistrict(detected);
    });
  }, []);

  // Fetch weather and advisory
  useEffect(() => {
    setLoading(true);
    fetch(`/api/weather?district=${encodeURIComponent(selectedDistrict)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setWeatherData(data);
          setInlineChatMessages([
            { 
              sender: 'bot', 
              text: `প্রিয় কৃষক ভাই, ${selectedDistrict} জেলার বর্তমান আবহাওয়া ও সেচ সতর্কবার্তা নিয়ে কোনো অতিরিক্ত প্রশ্ন থাকলে দয়া করে বলুন।` 
            }
          ]);
        } else {
          setWeatherData(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setWeatherData(null);
        setLoading(false);
      });
  }, [selectedDistrict]);

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const handleSendInlineChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineChatInput.trim() || !weather || inlineChatLoading) return;

    const userMessageText = inlineChatInput;
    setInlineChatInput('');
    setInlineChatLoading(true);

    const newMessages = [
      ...inlineChatMessages,
      { sender: 'user' as const, text: userMessageText }
    ];
    setInlineChatMessages(newMessages);

    try {
      const actionsStr = weather.advice.rain.actions.join('\n');
      const hiddenHistory = [
        { sender: 'user' as const, text: `আমি আমার এলাকার জন্য সেচ ও আবহাওয়া এডভাইজরি জানতে চাই। জেলা: ${selectedDistrict}।` },
        { sender: 'bot' as const, text: `প্রিয় কৃষক ভাই, আমি আপনার এলাকার জন্য আবহাওয়া উপাত্ত ও সেচ পরামর্শ নিচে নির্ধারণ করে দিয়েছি:
জেলা: ${selectedDistrict}
বর্তমান তাপমাত্রা: ${weather.temp}°C
আবহাওয়ার অবস্থা: ${weather.condition}
বৃষ্টির অবস্থা: ${weather.advice.rain.title}
পরামর্শ: ${weather.advice.rain.msg}

প্রস্তাবিত পদক্ষেপসমূহ:
${actionsStr}

এই আবহাওয়া বা সেচ ব্যবস্থাপনা সম্পর্কিত আপনার কোনো জিজ্ঞাসা থাকলে বলুন।` },
        ...inlineChatMessages.slice(1)
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessageText,
          history: hiddenHistory,
          district: selectedDistrict || "ঢাকা"
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-green-primary/10 pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-green-primary/10 rounded-full transition-colors text-text-secondary cursor-pointer"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">
              স্মার্ট সেচ ও নিষ্কাশন গাইড
            </h1>
            <p className="text-text-secondary text-sm font-semibold">
              লাইভ আবহাওয়া উপাত্ত ও জলবায়ু বিশ্লেষণের উপর ভিত্তি করে ফসলে সেচ বা অতিরিক্ত পানি নিষ্কাশনের পরামর্শ।
            </p>
          </div>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-3 bg-soft-white rounded-2xl px-5 py-3 shadow-sm border border-green-primary/20 self-end">
          <MapPin className="w-5 h-5 text-green-primary" />
          <div className="flex flex-col">
            <span className="text-[9px] text-text-secondary font-bold uppercase">জেলা নির্বাচন করুন:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent border-none text-green-primary font-black text-sm focus:outline-none cursor-pointer pr-6 py-0.5"
            >
              {districts.map((d, idx) => (
                <option key={idx} value={d.name_bn} className="text-text-primary font-medium">{d.name_bn}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Weather Stats */}
        <div className="lg:col-span-1 rounded-3xl p-6 bg-gradient-to-br from-green-primary to-green-soft text-soft-white shadow-md space-y-6 flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <span className="text-[9px] font-bold tracking-wider text-green-primary bg-soft-white px-3 py-1 rounded-full uppercase">
              আবহাওয়া প্যারামিটার
            </span>
            <h3 className="text-2xl font-black">{selectedDistrict} জেলা</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-soft-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : weather ? (
            <div className="space-y-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-black">{translateToBanglaDigits(weather.temp)}</span>
                <span className="text-xl font-bold text-green-primary bg-soft-white/10 px-2 py-0.5 rounded-lg ml-2">°C</span>
              </div>
              <p className="text-sm font-bold bg-soft-white/10 px-3 py-1.5 rounded-xl border border-soft-white/5 w-fit">
                {weather.condition}
              </p>
            </div>
          ) : (
            <p className="text-xs">ডাটা লোড সম্ভব হয়নি।</p>
          )}

          {!loading && weather && (
            <div className="grid grid-cols-2 gap-2 bg-soft-white/10 rounded-2xl p-4 border border-soft-white/15 text-xs shadow-inner">
              <div className="flex flex-col items-center gap-1 text-center border-r border-soft-white/10 pr-1">
                <Droplets className="w-4 h-4 text-soft-white" />
                <span className="text-[9px] text-soft-white/70 font-semibold">আর্দ্রতা</span>
                <span className="font-extrabold text-sm">{translateToBanglaDigits(weather.humidity || 75)}%</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center pl-1">
                <CloudRain className="w-4 h-4 text-soft-white" />
                <span className="text-[9px] text-soft-white/70 font-semibold">বৃষ্টির সম্ভাবনা</span>
                <span className="font-extrabold text-sm">
                  {weather.advice.rain.status === 'high_rain' ? 'উচ্চ' : 'কম'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Advisory Details */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-full min-h-[300px] bg-soft-white/60 border border-green-primary/10 rounded-3xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : weather ? (
            <div className="space-y-6 animate-fade-in">
              {/* Alert Status Card */}
              <div className={`p-6 rounded-3xl border-2 flex flex-col justify-between min-h-[160px] ${
                weather.advice.rain.status === 'high_rain'
                  ? 'bg-red-500/5 border-red-500/20 text-text-primary'
                  : 'bg-green-primary/5 border-green-primary/20 text-text-primary'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${
                      weather.advice.rain.status === 'high_rain'
                        ? 'bg-red-500/10 border-red-500/30 text-red-700'
                        : 'bg-green-primary/10 border-green-primary/30 text-green-700'
                    }`}>
                      {weather.advice.rain.status === 'high_rain' ? 'অতিরিক্ত বৃষ্টি সতর্কবার্তা' : 'সেচ সূচি স্বাভাবিক'}
                    </span>
                  </div>
                  <p className="text-base font-bold leading-relaxed">
                    {weather.advice.rain.msg}
                  </p>
                </div>
              </div>

              {/* Action checklist */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-text-primary flex items-center gap-1.5 border-b border-green-primary/5 pb-2">
                  <ShieldCheck className="w-5 h-5 text-green-primary" />
                  প্রস্তাবিত মাঠ ব্যবস্থাপনা পদক্ষেপ:
                </h3>
                <div className="space-y-3">
                  {weather.advice.rain.actions.map((act, i) => (
                    <div key={i} className="flex gap-3 text-sm text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5">
                      <div className="w-6 h-6 rounded-full bg-green-primary/10 text-green-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {translateToBanglaDigits(i + 1)}
                      </div>
                      <p className="font-bold leading-relaxed">{act}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 💬 Context-Aware Inline Chat Panel */}
              <div className="border-t border-green-primary/10 pt-6 space-y-4">
                <div className="bg-green-primary/5 border border-green-primary/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-primary font-black text-xs md:text-sm uppercase tracking-wider">
                    <span>গাছের ডাক্তারের লাইভ চ্যাট</span>
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
                      placeholder="আবহাওয়া বা মাঠ সেচ নিষ্কাশন নিয়ে প্রশ্ন করুন..."
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
              <HelpCircle className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">সেচ এ্যাডভাইজরি পাওয়া যায়নি</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  অনুগ্রহ করে অন্য একটি জেলা নির্বাচন করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
