'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CROPS } from '@/app/api/data';

interface DiagnosticRule {
  crop_id: string;
  part: 'leaf' | 'stem' | 'root' | 'fruit';
  symptom_bn: string;
  disease_bn: string;
  cause_bn: string;
  treatment_bn: string;
  dosage_bn: string;
}

// Heuristic helper to categorize plant parts based on symptoms or disease name
const getDiseasePart = (name: string, symptoms: string): 'leaf' | 'stem' | 'root' | 'fruit' => {
  const text = (name + ' ' + symptoms).toLowerCase();
  if (text.includes('গোড়া') || text.includes('শিকড়') || text.includes('কন্দ') || text.includes('মূল') || text.includes('গোরা') || text.includes('শিকর')) {
    return 'root';
  }
  if (text.includes('কান্ড') || text.includes('কাণ্ড') || text.includes('ডাল') || text.includes('লতা') || text.includes('কান্ড পচা')) {
    return 'stem';
  }
  if (text.includes('ফল') || text.includes('দানা') || text.includes('শীষ') || text.includes('বোল') || text.includes('মুতি') || text.includes('তুলা') || text.includes('শুঁটি') || text.includes('শুটি')) {
    return 'fruit';
  }
  return 'leaf';
};

export default function DiagnosticsPage() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>(CROPS[0]?.id || '1');
  const [selectedPart, setSelectedPart] = useState<'leaf' | 'stem' | 'root' | 'fruit' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeResult, setActiveResult] = useState<DiagnosticRule | null>(null);

  // Dynamically map crops from data.ts
  const cropsList = useMemo(() => {
    return CROPS.map(c => ({
      id: c.id,
      name: `${c.name_bn} (${c.name_en || ''})`
    }));
  }, []);

  // Dynamically map all diseases from data.ts CROPS database
  const diagnosticDatabase = useMemo(() => {
    const list: DiagnosticRule[] = [];
    CROPS.forEach(crop => {
      if (crop.diseases && Array.isArray(crop.diseases)) {
        crop.diseases.forEach(d => {
          const part = getDiseasePart(d.name_bn, d.symptoms);
          
          // Try to extract dosage info if mentioned in treatment text
          const dosageMatch = d.treatment_bn.match(/(\d+(?:\.\d+)?\s*(?:গ্রাম|মিলি|কেজি|ফোটা|শতক))/g);
          const dosage_bn = dosageMatch 
            ? `প্রতি লিটার পানিতে বা নির্দেশিকা অনুযায়ী: ${[...new Set(dosageMatch)].join(', ')}`
            : "ওষুধের প্যাকেট বা বোতলের গায়ে লেখা নির্দেশিকা অনুযায়ী প্রয়োগ করুন।";

          list.push({
            crop_id: crop.id,
            part,
            symptom_bn: d.symptoms,
            disease_bn: d.name_bn,
            cause_bn: d.cause_bn,
            treatment_bn: d.treatment_bn + (d.prevention_bn ? `\n\nপ্রতিরোধমূলক ব্যবস্থা:\n${d.prevention_bn}` : ''),
            dosage_bn
          });
        });
      }
    });
    return list;
  }, []);

  const filteredRules = useMemo(() => {
    return diagnosticDatabase.filter(rule => {
      const matchesCrop = rule.crop_id === selectedCrop;
      const matchesPart = selectedPart === 'all' || rule.part === selectedPart;
      const matchesSearch = 
        rule.symptom_bn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        rule.disease_bn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCrop && matchesPart && matchesSearch;
    });
  }, [diagnosticDatabase, selectedCrop, selectedPart, searchQuery]);

  const partLabels = {
    leaf: 'পাতা',
    stem: 'কান্ড ও ডাল',
    root: 'গোড়া ও শিকড়',
    fruit: 'ফল বা শস্যদানা'
  };

  const currentCropName = cropsList.find(c => c.id === selectedCrop)?.name || '';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
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
            ফসলের রোগ নির্ণয় নির্দেশিকা
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আপনার আক্রান্ত ফসলের স্থান ও লক্ষণ সিলেক্ট করে রোগ শনাক্ত করুন এবং DAE/BARI/BRRI নির্দেশিত বৈজ্ঞানিক ও জৈব প্রতিকার জেনে নিন।
          </p>
        </div>
      </div>

      {/* Select Crop Dropdown (Replaces old tabs for 32 crops) */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-soft-white p-4 rounded-2xl border border-green-primary/10 shadow-sm animate-fade-in">
        <label htmlFor="crop-select" className="text-sm font-extrabold text-text-primary shrink-0">
          ফসল নির্বাচন করুন:
        </label>
        <select
          id="crop-select"
          value={selectedCrop}
          onChange={(e) => {
            setSelectedCrop(e.target.value);
            setSelectedPart('all');
            setActiveResult(null);
          }}
          className="flex-1 bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer"
        >
          {cropsList.map((crop) => (
            <option key={crop.id} value={crop.id}>
              {crop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Part Filter */}
      <div className="flex flex-wrap gap-2 border-b border-green-primary/5 pb-4">
        <span className="text-xs font-bold text-text-secondary self-center mr-2">আক্রান্ত অংশ:</span>
        {(['all', 'leaf', 'stem', 'root', 'fruit'] as const).map(part => (
          <button
            key={part}
            onClick={() => {
              setSelectedPart(part);
              setActiveResult(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              selectedPart === part
                ? 'bg-green-primary/15 border-green-primary text-green-primary shadow-sm'
                : 'bg-soft-white border-green-primary/10 text-text-secondary hover:bg-green-primary/5'
            }`}
          >
            {part === 'all' ? 'সম্পূর্ণ গাছ' : partLabels[part]}
          </button>
        ))}
      </div>

      {/* Symptoms Search and Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Symptoms List (Left 3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="লক্ষণ বা রোগের নাম দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-primary/20 bg-soft-white focus:outline-none focus:ring-2 focus:ring-green-primary text-text-primary text-sm shadow-sm font-bold"
            />
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-secondary/60" />
          </div>

          <div className="space-y-3">
            {filteredRules.length > 0 ? (
              filteredRules.map((rule, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveResult(rule)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex justify-between items-start gap-4 ${
                    activeResult?.disease_bn === rule.disease_bn
                      ? 'bg-green-primary/5 border-green-primary shadow-md'
                      : 'bg-soft-white border-green-primary/10 hover:border-green-primary/20 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-green-primary/10 text-green-primary">
                      {partLabels[rule.part]}
                    </span>
                    <p className="text-sm font-bold text-text-primary leading-relaxed">
                      {rule.symptom_bn}
                    </p>
                  </div>
                  <HelpCircle className="w-5 h-5 text-green-primary shrink-0 mt-0.5" />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-text-secondary font-medium">
                দুঃখিত, {currentCropName} এর জন্য কোনো ম্যাচিং লক্ষণ বা রোগ তথ্য পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis & Solutions Output (Right 2 Columns) */}
        <div className="lg:col-span-2">
          {activeResult ? (
            <div className="glass-card p-6 space-y-6 border-2 border-green-primary/30 animate-fade-in">
              <div className="border-b border-green-primary/10 pb-4">
                <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                  সনাক্তকৃত রোগবালাই
                </span>
                <h3 className="text-xl font-black text-text-primary mt-3">
                  {activeResult.disease_bn}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  <strong>কারণ:</strong> {activeResult.cause_bn}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 text-sm text-text-primary bg-green-primary/5 p-4 rounded-xl border border-green-primary/10">
                  <ShieldCheck className="w-5 h-5 text-green-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-green-primary text-xs uppercase mb-1">অফিশিয়াল দমন ও প্রতিকার পদ্ধতি:</h4>
                    <p className="font-medium leading-relaxed">{activeResult.treatment_bn}</p>
                  </div>
                </div>

                <div className="flex gap-3 text-sm text-text-primary bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-amber-700 text-xs uppercase mb-1">প্রস্তাবিত মাত্রা (Dosage):</h4>
                    <p className="font-extrabold text-text-primary leading-relaxed">{activeResult.dosage_bn}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <HelpCircle className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">রোগ নির্ণয়ের ফলাফল দেখতে</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বাঁদিকের প্যানেল থেকে আপনার ফসলের যেকোনো একটি লক্ষণের ওপর ক্লিক করুন। সঠিক বৈজ্ঞানিক দমন গাইড এখানে ভেসে উঠবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">ফসলের কোনো নতুন বা অপরিচিত সমস্যা দেখা দিয়েছে?</h4>
          <p className="text-xs text-text-secondary font-bold">লক্ষণ লিখে বা গাছের বর্ণনা দিয়ে সরাসরি এআই ডাক্তারের সাথে চ্যাট করুন ও তাত্ক্ষণিক পরামর্শ পান।</p>
        </div>
        <button 
          onClick={() => {
            const cropName = cropsList.find(c => c.id === selectedCrop)?.name || '';
            router.push(`/chat?q=${encodeURIComponent(`${cropName} গাছের রোগবালাই নিয়ে সাহায্য করুন।`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>
    </div>
  );
}
