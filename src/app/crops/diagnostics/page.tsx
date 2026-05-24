'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DiagnosticRule {
  crop_id: string;
  part: 'leaf' | 'stem' | 'root' | 'fruit';
  symptom_bn: string;
  disease_bn: string;
  cause_bn: string;
  treatment_bn: string;
  dosage_bn: string;
}

const DIAGNOSTIC_DATABASE: DiagnosticRule[] = [
  // Rice Diseases
  {
    crop_id: 'rice',
    part: 'leaf',
    symptom_bn: "পাতায় চোখাকৃতি বা উপবৃত্তাকার বাদামী দাগ এবং কেন্দ্র ধূসর বর্ণ ধারণ করা",
    disease_bn: "ধানের ব্লাস্ট রোগ (Blast Disease)",
    cause_bn: "পাইরিকুলারিয়া অরাইজি নামক ছত্রাক",
    treatment_bn: "ক্ষেতের পানি ধরে রাখতে হবে। নাইট্রোজেন সারের অতিরিক্ত প্রয়োগ বন্ধ করতে হবে। রোগ দেখা দিলে ট্রাইসাইক্লাজোল বা ডাইফেনোকোনাজল গ্রুপের ছত্রাকনাশক স্প্রে করুন।",
    dosage_bn: "বিঘাপ্রতি ৮০ গ্রাম অথবা প্রতি লিটার পানিতে ০.৮ গ্রাম।"
  },
  {
    crop_id: 'rice',
    part: 'leaf',
    symptom_bn: "পাতার ডগা বা কিনারা থেকে ঢেউখেলানো হলুদাভ বাদামী দাগ শুরু হয়ে নিচের দিকে নেমে আসা",
    disease_bn: "ব্যাকটেরিয়াজনিত পাতা ধসা রোগ (Bacterial Leaf Blight)",
    cause_bn: "জ্যান্থোমোনাস অরাইজি ব্যাকটেরিয়া",
    treatment_bn: "ঝড়-বৃষ্টির পর জমিতে কোনো নাইট্রোজেন সার দেওয়া যাবে না। বিঘাপ্রতি অতিরিক্ত ৫ কেজি পটাশ প্রয়োগ করুন। কপসিন বা থিওভিট স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম থিওভিট মিশিয়ে স্প্রে করুন।"
  },
  {
    crop_id: 'rice',
    part: 'stem',
    symptom_bn: "পানির স্তরের কাছে ধানের খাপে ডিম্বাকৃতি বা ডোরাকাটা ধূসর দাগ এবং কান্ড পচে যাওয়া",
    disease_bn: "ধানের খাপ পচা রোগ (Sheath Rot)",
    cause_bn: "ছত্রাকজনিত সংক্রমণ",
    treatment_bn: "গাছ পাতলা করে রোপণ করতে হবে। আক্রান্ত কান্ড সরিয়ে পুড়িয়ে ফেলুন। কার্বেন্ডাজিম বা প্রোপিকোনাজল গ্রুপের ওষুধ স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ১ মিলি লিকুইড কার্বেন্ডাজিম মিশিয়ে স্প্রে করতে হবে।"
  },
  // Tomato Diseases
  {
    crop_id: 'tomato',
    part: 'leaf',
    symptom_bn: "নিচের পাতায় চক্রাকার বা গোল গোল গাঢ় বাদামী দাগ এবং কান্ডে কালো দাগ পড়া",
    disease_bn: "টমেটোর আগাম ধসা রোগ (Early Blight)",
    cause_bn: "অলটারনারিয়া সোলানি ছত্রাক",
    treatment_bn: "আক্রান্ত পাতা ও ডাল ছেঁটে পুড়িয়ে ফেলুন। মাটির গোড়ায় মালচিং পেপার ব্যবহার করুন। ম্যানকোজেব বা মেটালাক্সিল গ্রুপের ছত্রাকনাশক স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম ম্যানকোজেব পাউডার মিশিয়ে স্প্রে করতে হবে।"
  },
  {
    crop_id: 'tomato',
    part: 'fruit',
    symptom_bn: "টমেটো ফলের নিচের অংশে বা বোঁটার চারধারে কালো পানি-ভেজা স্পট পড়ে চামড়ার মতো শক্ত হওয়া",
    disease_bn: "ফলের গোড়া পচা রোগ (Blossom End Rot)",
    cause_bn: "ক্যালসিয়ামের অভাব এবং অনিয়মিত সেচ",
    treatment_bn: "নিয়মিত সেচ দিতে হবে এবং মাটিতে অতিরিক্ত নাইট্রোজেন সার দেওয়া বন্ধ করতে হবে। ক্যালসিয়াম সমৃদ্ধ জিপসাম সার মাটিতে মেশাতে হবে।",
    dosage_bn: "প্রতি লিটার পানিতে ৫ গ্রাম ক্যালসিয়াম ক্লোরাইড মিশিয়ে গাছে স্প্রে করুন।"
  },
  // Potato Diseases
  {
    crop_id: 'potato',
    part: 'leaf',
    symptom_bn: "পাতার ডগায় বা কিনারায় পানি-ভেজা দাগ যা কুয়াশাচ্ছন্ন আবহাওয়ায় দ্রুত কালো বর্ণ নিয়ে পুরো গাছ পচিয়ে দেয়",
    disease_bn: "আলুর নাবি ধসা রোগ (Late Blight)",
    cause_bn: "ফাইটোফথোরা ইনফেসট্যান্স ছত্রাক",
    treatment_bn: "কুয়াশাচ্ছন্ন আবহাওয়ায় আগাম প্রতিরোধক হিসেবে ম্যানকোজেব স্প্রে করুন। রোগ দেখা দিলে সিকিউর বা মেটালাক্সিল গ্রুপের ছত্রাকনাশক ৭ দিন পর পর স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২.৫ গ্রাম মেটালাক্সিল মিশিয়ে ৭ দিন পর পর স্প্রে করুন।"
  },
  {
    crop_id: 'potato',
    part: 'root',
    symptom_bn: "আলুর গায়ে কালো বা কালচে খসখসে ক্ষতের সৃষ্টি হওয়া এবং আলু কাটলে ভেতরে কালো দাগ দেখা যাওয়া",
    disease_bn: "আলুর সাধারণ স্কেব রোগ (Common Scab)",
    cause_bn: "স্ট্রেপ্টোমাইসিস ব্যাকটেরিয়া",
    treatment_bn: "ক্ষারীয় মাটিতে এটি বেশি হয়। আলু রোপণের সময় মাটিতে অতিরিক্ত চুন দেওয়া বন্ধ রাখুন। বীজ আলু শোধন করে রোপণ করুন।",
    dosage_bn: "বীজ আলু রোপণের পূর্বে ১% ফরমালিন সলিউশন দিয়ে ২০ মিনিট শোধন করুন।"
  }
];

export default function DiagnosticsPage() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [selectedPart, setSelectedPart] = useState<'leaf' | 'stem' | 'root' | 'fruit' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeResult, setActiveResult] = useState<DiagnosticRule | null>(null);

  const filteredRules = DIAGNOSTIC_DATABASE.filter(rule => {
    const matchesCrop = rule.crop_id === selectedCrop;
    const matchesPart = selectedPart === 'all' || rule.part === selectedPart;
    const matchesSearch = rule.symptom_bn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rule.disease_bn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesPart && matchesSearch;
  });

  const partLabels = {
    leaf: 'পাতা',
    stem: 'কান্ড ও ডাল',
    root: 'গোড়া ও শিকড়',
    fruit: 'ফল বা শস্যদানা'
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
            ফসলের রোগ নির্ণয় নির্দেশিকা
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আপনার আক্রান্ত ফসলের স্থান ও লক্ষণ সিলেক্ট করে রোগ শনাক্ত করুন এবং BARI/BRRI নির্দেশিত বৈজ্ঞানিক ডোজ জেনে নিন।
          </p>
        </div>
      </div>

      {/* Select Crop Tabs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: 'rice', name: 'ধান চাষ' },
          { id: 'tomato', name: 'টমেটো চাষ' },
          { id: 'potato', name: 'আলু চাষ' }
        ].map(crop => (
          <button
            key={crop.id}
            onClick={() => {
              setSelectedCrop(crop.id);
              setSelectedPart('all');
              setActiveResult(null);
            }}
            className={`py-3.5 rounded-xl font-bold text-sm border text-center transition-all cursor-pointer ${
              selectedCrop === crop.id
                ? 'bg-green-primary border-transparent text-soft-white shadow-md'
                : 'bg-soft-white border-green-primary/10 text-text-primary hover:bg-green-primary/5'
            }`}
          >
            {crop.name}
          </button>
        ))}
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
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-primary/20 bg-soft-white focus:outline-none focus:ring-2 focus:ring-green-primary text-text-primary text-sm shadow-sm"
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
                দুঃখিত, কোনো ম্যাচিং লক্ষণ পাওয়া যায়নি।
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
    </div>
  );
}
