'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, ShieldCheck, ClipboardList, Info, HelpCircle } from 'lucide-react';

interface DirectoryItem {
  title: string;
  type: 'subsidy' | 'loan';
  provider: string;
  rate_or_amount: string;
  requirements: string[];
  documents: string[];
  contact: string;
}

const DIRECTORY_DATA: DirectoryItem[] = [
  {
    title: "খরিপ ফসলে সার ও বীজ প্রণোদনা কর্মসূচি",
    type: 'subsidy',
    provider: "কৃষি সম্প্রসারণ অধিদপ্তর (DAE) ও কৃষি মন্ত্রণালয়",
    rate_or_amount: "১০০% ভর্তুকি (সম্পূর্ণ বিনামূল্যে বীজ ও সার বিতরণ)",
    requirements: [
      "আবেদনকারীকে অবশ্যই একজন ক্ষুদ্র বা প্রান্তিক কৃষক হতে হবে।",
      "সর্বোচ্চ ১ বিঘা জমির আবাদের জন্য প্রণোদনা দেওয়া হবে।",
      "কৃষক নিবন্ধন কার্ড (কৃষি কার্ড) থাকতে হবে।"
    ],
    documents: [
      "জাতীয় পরিচয়পত্র (NID) এর ফটোকপি।",
      "কৃষি কার্ড (কৃষক সহকারী কার্ড)।",
      "১ কপি পাসপোর্ট সাইজ ছবি।"
    ],
    contact: "আপনার নিজ ব্লকের উপ-সহকারী কৃষি কর্মকর্তা (SAAO) অথবা উপজেলা কৃষি অফিস।"
  },
  {
    title: "৪% রেয়াতি সুদে শস্য ও ফসল উৎপাদন ঋণ",
    type: 'loan',
    provider: "বাংলাদেশ কৃষি ব্যাংক (BKB) ও রাজশাহী কৃষি উন্নয়ন ব্যাংক",
    rate_or_amount: "৪% রেয়াতি বা স্বল্প সুদের হার (স্বল্পমেয়াদী ঋণ)",
    requirements: [
      "আবেদনকারীকে প্রকৃত চাষী হতে হবে (নিজে চাষ করেন বা বর্গা চাষী)।",
      "ধান, গম, পেঁয়াজ, ডাল ও তৈলবীজ চাষের জন্য প্রযোজ্য।",
      "কোনো ব্যাংকে খেলাপি ঋণ থাকা যাবে না।"
    ],
    documents: [
      "NID ও পাসপোর্ট সাইজ ছবি।",
      "ভূমির মালিকানা সংক্রান্ত দলিল (খতিয়ান/পর্চা) অথবা বর্গা চাষের চুক্তিপত্র।",
      "কৃষি কার্ড এবং ইউপি চেয়ারম্যানের নাগরিকত্ব সনদ।"
    ],
    contact: "নিকটস্থ বাংলাদেশ কৃষি ব্যাংক (BKB) শাখা অথবা সোনালী/জনতা ব্যাংক শাখা।"
  },
  {
    title: "কৃষি যন্ত্রপাতি ক্রয়ে উন্নয়ন সহায়তা ভর্তুকি",
    type: 'subsidy',
    provider: "কৃষি সম্প্রসারণ অধিদপ্তর (সমন্বিত খামার ব্যবস্থাপনা প্রকল্প)",
    rate_or_amount: "৫০% থেকে ৭০% পর্যন্ত আর্থিক উন্নয়ন সহায়তা (ভর্তুকি)",
    requirements: [
      "কম্বাইন হারভেস্টার, রিপার বা সিডার ক্রয়ের জন্য প্রযোজ্য।",
      "কৃষক সমবায় বা ব্যক্তিগতভাবে বড় জমির মালিক হতে হবে।"
    ],
    documents: [
      "যান্ত্রিক প্রণোদনার আবেদন ফরম (উপজেলা অফিসে প্রাপ্ত)।",
      "কৃষি কার্ড ও NID ফটোকপি।",
      "জমির খতিয়ান ও ব্যাংক হিসাবের বিবরণী।"
    ],
    contact: "উপজেলা কৃষি কর্মকর্তা অথবা জেলা উপ-পরিচালকের কার্যালয় (DAE)।"
  },
  {
    title: "মসলা জাতীয় ফসল চাষাবাদে বিশেষ কৃষি ঋণ",
    type: 'loan',
    provider: "বাংলাদেশ ব্যাংক রিফাইন্যান্স স্কিম (সকল বাণিজ্যিক ব্যাংক)",
    rate_or_amount: "৪% বার্ষিক সরল সুদ",
    requirements: [
      "আদা, হলুদ, পেঁয়াজ, রসুন ও মরিচ চাষের জন্য বিশেষ প্রণোদনা ঋণ।",
      "অন্য কোনো মসলা প্রজেক্টের সাথে যুক্ত থাকতে হবে বা চাষের উপযুক্ত জমি থাকতে হবে।"
    ],
    documents: [
      "চাষী ঘোষণা ফরম ও NID।",
      "জমির পরচা অথবা লিজ চুক্তিপত্র।"
    ],
    contact: "সকল রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক অথবা বেসরকারি তফসিলি ব্যাংক।"
  }
];

export default function LoansDirectory() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'all' | 'subsidy' | 'loan'>('all');
  const [activeItem, setActiveItem] = useState<DirectoryItem | null>(DIRECTORY_DATA[0]);

  React.useEffect(() => {
    if (!activeItem) return;
    try {
      const sessionId = localStorage.getItem("krishisathi_session_id") || "sess_unknown";
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          pageVisited: "/directory/loans",
          action: "loan_check",
          location: localStorage.getItem("krishisathi_user_district") || "Unknown",
          metadata: {
            schemeTitle: activeItem.title,
            schemeProvider: activeItem.provider,
            schemeType: activeItem.type
          }
        })
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  }, [activeItem]);

  const filteredItems = DIRECTORY_DATA.filter(item => 
    selectedType === 'all' || item.type === selectedType
  );

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
            কৃষি অনুদান ও সহজ শর্তে ঋণ গাইড
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            বাংলাদেশ কৃষি ব্যাংক (BKB) ও সরকারের সর্বশেষ ভর্তুকি ও স্বল্প সুদে ঋণ পাওয়ার অফিসিয়াল আবেদন গাইড।
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-green-primary/5 pb-3">
        {(['all', 'subsidy', 'loan'] as const).map(type => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setActiveItem(DIRECTORY_DATA.find(item => type === 'all' || item.type === type) || null);
            }}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              selectedType === type
                ? 'bg-green-primary border-transparent text-soft-white shadow-md'
                : 'bg-soft-white border-green-primary/10 text-text-secondary hover:bg-green-primary/5'
            }`}
          >
            {type === 'all' ? 'সব স্কিম' : type === 'subsidy' ? 'সরকারি প্রণোদনা ও ভর্তুকি' : '৪% রেয়াতি কৃষি ঋণ'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Schemes List (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveItem(item)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-36 ${
                activeItem?.title === item.title
                  ? 'bg-green-primary/5 border-green-primary shadow-md'
                  : 'bg-soft-white border-green-primary/10 hover:border-green-primary/20 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded border w-fit block ${
                  item.type === 'subsidy' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-800'
                }`}>
                  {item.type === 'subsidy' ? 'সরকারি প্রণোদনা' : '৪% কৃষি ঋণ'}
                </span>
                <h4 className="font-bold text-text-primary text-sm leading-snug line-clamp-2">
                  {item.title}
                </h4>
              </div>
              <span className="text-[10px] text-text-secondary font-bold truncate">
                {item.provider.split(' ও ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Selected Details Output (Right 3 Columns) */}
        <div className="lg:col-span-3">
          {activeItem ? (
            <div className="glass-card p-6 md:p-8 space-y-6 border border-green-primary/10 animate-fade-in">
              <div className="border-b border-green-primary/10 pb-4">
                <h3 className="text-xl font-black text-text-primary leading-snug">
                  {activeItem.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1 font-bold">
                  প্রদানকারী সংস্থা: {activeItem.provider}
                </p>
              </div>

              {/* Rates */}
              <div className="bg-green-primary/5 border border-green-primary/10 rounded-2xl p-4 text-sm font-semibold">
                <span className="text-xs text-text-secondary block font-bold">ভর্তুকি হার / সুদের হার:</span>
                <span className="text-base font-extrabold text-green-primary">{activeItem.rate_or_amount}</span>
              </div>

              {/* Requirements & Documents */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-text-primary text-xs uppercase flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-green-primary" /> যোগ্যতার শর্তাবলী:
                  </h4>
                  <ul className="space-y-1.5">
                    {activeItem.requirements.map((req, i) => (
                      <li key={i} className="text-xs text-text-primary pl-4 relative font-medium before:content-['•'] before:absolute before:left-0 before:text-green-primary before:font-bold">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-text-primary text-xs uppercase flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-green-primary" /> প্রয়োজনীয় কাগজপত্র:
                  </h4>
                  <ul className="space-y-1.5">
                    {activeItem.documents.map((doc, i) => (
                      <li key={i} className="text-xs text-text-primary pl-4 relative font-medium before:content-['•'] before:absolute before:left-0 before:text-amber-600 before:font-bold">
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex gap-3 text-xs text-text-primary bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 font-bold leading-relaxed">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-text-secondary uppercase mb-0.5">আবেদনের যোগাযোগের ঠিকানা:</span>
                  {activeItem.contact}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <HelpCircle className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">অনুদান বা ঋণের বিস্তারিত</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের তালিকা থেকে যেকোনো স্কিমের ওপর ক্লিক করুন। আবেদনের যোগ্যতা ও কাগজপত্রের তালিকা এখানে প্রদর্শিত হবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
