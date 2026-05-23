'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Sprout, Info, Droplets, BookOpen, AlertTriangle, X } from 'lucide-react';
import { Crop, CROPS } from '../api/data';

function CropLibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeCrop, setActiveCrop] = useState<Crop | null>(null);

  // Load crops list
  useEffect(() => {
    setCrops(CROPS);
    const initialCropId = searchParams.get('c');
    if (initialCropId) {
      const crop = CROPS.find(c => c.id === initialCropId);
      if (crop) setActiveCrop(crop);
    }
  }, [searchParams]);

  // Fuzzy search in Bangla/English
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = 
      crop.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientific_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'all' || 
      crop.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'সব ফসল' },
    { id: 'grain', label: 'দানা শস্য' },
    { id: 'vegetable', label: 'শাকসবজি' },
    { id: 'fruit', label: 'ফলমূল' },
    { id: 'spice', label: 'মসলাপাতি' },
    { id: 'commercial', label: 'অর্থকরী ফসল' }
  ];

  const categoryLabels: { [key: string]: string } = {
    grain: 'দানা শস্য',
    vegetable: 'শাকসবজি',
    fruit: 'ফলমূল',
    spice: 'মসলাপাতি',
    commercial: 'অর্থকরী ফসল',
    flower: 'ফুল'
  };

  const translateNumberToBangla = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const getCropIcon = (crop: Crop) => {
    switch (crop.category) {
      case 'grain':
        return <Sprout className="w-7 h-7 text-amber-600" />;
      case 'vegetable':
        return <Sprout className="w-7 h-7 text-emerald-600" />;
      case 'fruit':
        return <Sprout className="w-7 h-7 text-red-500" />;
      case 'spice':
        return <Sprout className="w-7 h-7 text-orange-600" />;
      case 'commercial':
        return <Sprout className="w-7 h-7 text-yellow-600" />;
      case 'flower':
        return <Sprout className="w-7 h-7 text-pink-500" />;
      default:
        return <Sprout className="w-7 h-7 text-green-primary" />;
    }
  };


  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-green-primary/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary flex items-center gap-2">
            🌾 কৃষি ফসল লাইব্রেরি
          </h1>
          <p className="text-text-secondary text-sm">
            বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও ধান গবেষণা ইনস্টিটিউট (BRRI) নির্দেশিকা।
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ফসল খুঁজুন (যেমন: ধান, টমেটো)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-green-primary/20 bg-soft-white focus:outline-none focus:ring-2 focus:ring-green-primary text-text-primary text-sm shadow-sm"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-secondary/60" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-green-primary/5 pb-2 overflow-x-auto">
        {categories.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-green-primary text-soft-white shadow-md'
                : 'bg-green-primary/5 text-text-secondary hover:bg-green-primary/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCrops.map(crop => (
          <div
            key={crop.id}
            onClick={() => setActiveCrop(crop)}
            className="glass-card p-6 cursor-pointer flex flex-col justify-between h-56 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-green-primary/10 rounded-2xl flex items-center justify-center">
                  {getCropIcon(crop)}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-green-primary/10 text-green-primary">
                  {categoryLabels[crop.category] || crop.category}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-green-primary transition-colors">
                  {crop.name_bn}
                </h3>
                <p className="text-xs text-text-secondary italic">{crop.scientific_name}</p>
              </div>
            </div>

            <div className="border-t border-green-primary/5 pt-4 flex justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-blue" />
                সেচ: {crop.water_requirement === 'high' ? 'উচ্চ' : crop.water_requirement === 'medium' ? 'মাঝারি' : 'কম'}
              </span>
              <span className="font-semibold text-green-primary">
                ফলন: {translateNumberToBangla(crop.yield_avg)} টন/হেক্টর
              </span>
            </div>
          </div>
        ))}
        {filteredCrops.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-secondary">
            দুঃখিত, কোনো ফসল পাওয়া যায়নি।
          </div>
        )}
      </div>

      {/* Interactive Detail Modal Drawer */}
      {activeCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-text-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full md:max-w-2xl h-full bg-soft-white shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-green-primary/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-green-primary/10 rounded-2xl flex items-center justify-center">
                    {getCropIcon(activeCrop)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{activeCrop.name_bn}</h2>
                    <p className="text-xs text-text-secondary italic">{activeCrop.scientific_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCrop(null)}
                  className="p-2 hover:bg-green-primary/10 rounded-full transition-colors cursor-pointer text-text-secondary"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Crop Stats Matrix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-green-primary/5 rounded-2xl p-4 text-sm border border-green-primary/10">
                <div>
                  <span className="text-xs text-text-secondary block">মাটি:</span>
                  <span className="font-semibold text-text-primary">{activeCrop.soil_preference.join(', ')}</span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary block">ঋতু:</span>
                  <span className="font-semibold text-text-primary uppercase">{activeCrop.seasons.join(', ')}</span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary block">গড় লাভ:</span>
                  <span className="font-semibold text-green-primary">{translateNumberToBangla(activeCrop.profit_avg.toLocaleString())} ৳/বিঘা</span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary block">সেচ চাহিদা:</span>
                  <span className="font-semibold text-text-primary">
                    {activeCrop.water_requirement === 'high' ? 'উচ্চ' : activeCrop.water_requirement === 'medium' ? 'মাঝারি' : 'কম'}
                  </span>
                </div>
              </div>

              {/* Accordion Guide Sections */}
              <div className="mt-6 space-y-4">
                
                {/* Fertilizer Recommended Guide */}
                <div className="border border-green-primary/10 rounded-xl p-4 bg-white/50">
                  <h3 className="font-bold text-text-primary flex items-center gap-1.5 mb-2">
                    <Info className="w-5 h-5 text-green-primary" />
                    সার প্রয়োগের মাত্রা (বিঘা প্রতি কেজি)
                  </h3>
                  {activeCrop.fertilizers.map((f, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2 text-center text-xs mt-2 bg-warm-bg/40 p-2.5 rounded-lg font-medium text-text-primary">
                      <div>
                        <span className="text-text-secondary block text-[10px]">ইউরিয়া</span>
                        {translateNumberToBangla(f.urea)}
                      </div>
                      <div>
                        <span className="text-text-secondary block text-[10px]">টিএসপি</span>
                        {translateNumberToBangla(f.tsp)}
                      </div>
                      <div>
                        <span className="text-text-secondary block text-[10px]">এমওপি</span>
                        {translateNumberToBangla(f.mop)}
                      </div>
                      <div>
                        <span className="text-text-secondary block text-[10px]">জিপসাম</span>
                        {translateNumberToBangla(f.gypsum)}
                      </div>
                      <div>
                        <span className="text-text-secondary block text-[10px]">দস্তা</span>
                        {translateNumberToBangla(f.zinc)}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      router.push(`/calculator?crop=${activeCrop.id}`);
                      setActiveCrop(null);
                    }}
                    className="mt-3 text-xs font-bold text-green-primary hover:underline"
                  >
                    সার ক্যালকুলেটরে হিসাব করুন →
                  </button>
                </div>

                {/* Cultivation Guide */}
                {activeCrop.cultivation_method_bn && (
                  <div className="border border-green-primary/10 rounded-xl p-4 bg-white/50 space-y-2">
                    <h3 className="font-bold text-text-primary flex items-center gap-1.5 mb-2">
                      <Sprout className="w-5 h-5 text-green-primary" />
                      চাষ পদ্ধতি ও জমি প্রস্তুতকরণ
                    </h3>
                    <p className="text-sm text-text-primary leading-relaxed font-medium">
                      {activeCrop.cultivation_method_bn}
                    </p>
                  </div>
                )}

                {/* Spacing Info */}
                {activeCrop.spacing_info_bn && (
                  <div className="border border-green-primary/10 rounded-xl p-4 bg-white/50 space-y-2">
                    <h3 className="font-bold text-text-primary flex items-center gap-1.5 mb-2">
                      <Info className="w-5 h-5 text-amber-600" />
                      রোপণের দূরত্ব ও গভীরতা
                    </h3>
                    <p className="text-sm text-text-primary leading-relaxed font-medium">
                      {activeCrop.spacing_info_bn}
                    </p>
                  </div>
                )}

                {/* Harvest Duration */}
                {activeCrop.harvest_duration_bn && (
                  <div className="border border-green-primary/10 rounded-xl p-4 bg-white/50 space-y-2">
                    <h3 className="font-bold text-text-primary flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      ফসল সংগ্রহের সময়কাল
                    </h3>
                    <p className="text-sm text-text-primary leading-relaxed font-medium">
                      {activeCrop.harvest_duration_bn}
                    </p>
                  </div>
                )}

                {/* Disease Guidelines */}
                <div className="border border-green-primary/10 rounded-xl p-4 bg-white/50 space-y-4">
                  <h3 className="font-bold text-text-primary flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    সাধারণ রোগবালাই ও সমাধান
                  </h3>
                  {activeCrop.diseases.map((d, idx) => (
                    <div key={idx} className="border-t border-green-primary/5 pt-3 first:border-0 first:pt-0 space-y-2">
                      <h4 className="font-semibold text-text-primary text-sm">
                        🔹 {d.name_bn}
                      </h4>
                      <p className="text-xs text-text-primary">
                        <strong className="text-text-secondary">লক্ষণ:</strong> {d.symptoms}
                      </p>
                      <p className="text-xs text-text-primary">
                        <strong className="text-text-secondary">কারণ:</strong> {d.cause_bn}
                      </p>
                      <p className="text-xs text-text-primary whitespace-pre-line">
                        <strong className="text-text-secondary">প্রতিকার:</strong>\n{d.treatment_bn}
                      </p>
                      <span className="inline-block text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-bold">
                        উৎস: {d.source_org}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-green-primary/10 flex justify-between gap-4">
              <button
                onClick={() => {
                  router.push(`/chat?q=${encodeURIComponent(`${activeCrop.name_bn} চাষের বিস্তারিত ও সঠিক বৈজ্ঞানিক গাইড জানতে চাই`)}`);
                  setActiveCrop(null);
                }}
                className="flex-1 py-3 text-center bg-green-primary hover:bg-green-soft text-soft-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                গাছের ডাক্তারের পরামর্শ নিন 🩺
              </button>
              <button
                onClick={() => setActiveCrop(null)}
                className="px-6 py-3 text-center border border-green-primary/20 text-text-secondary hover:bg-green-primary/5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CropLibrary() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোডিং ফসল লাইব্রেরি...</div>}>
      <CropLibraryContent />
    </Suspense>
  );
}
