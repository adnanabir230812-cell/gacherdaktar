'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, ShieldCheck, ClipboardList, Info, HelpCircle } from 'lucide-react';

interface RotationPlan {
  crop_name: string;
  season_bn: string;
  ideal_followers: Array<{
    name: string;
    benefits: string;
  }>;
  pest_benefit: string;
  soil_benefit: string;
}

const ROTATION_DATABASE: RotationPlan[] = [
  {
    crop_name: "ব্রি ধান ২৯ (বোরো ধান)",
    season_bn: "রবি - গ্রীষ্ম মৌসুম",
    ideal_followers: [
      { name: "রোপা আমন ধান", benefits: "বোরো ধানের পর রোপা আমন চাষে মাটির আর্দ্রতা এবং অবশিষ্ট পুষ্টি উপাদান নিখুঁতভাবে কাজে লাগানো যায়।" },
      { name: "মুগ ডাল (সবুজ সার)", benefits: "ধান কাটার পর পতিত সময়ে মুগ ডাল চাষ করলে এটি মাটিতে প্রচুর পরিমাণ নাইট্রোজেন যোগ করে।" }
    ],
    pest_benefit: "ধানের মাঝখানে ডাল জাতীয় ফসল চাষ করলে মাজরা পোকা ও পাতার ব্লাস্ট রোগের জীবাণুর বংশবৃদ্ধি চক্র ভেঙে যায়।",
    soil_benefit: "ডাল ফসলের শিকড় বায়ুমন্ডল থেকে নাইট্রোজেন শোষণ করে মাটিতে জমা করে, ফলে পরবর্তী ফসলে ইউরিয়া কম লাগে।"
  },
  {
    crop_name: "আলু (Seed Potato)",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "হাইব্রিড ভুট্টা", benefits: "আলু উত্তোলনের পর উচ্চ পুষ্টি গ্রহণকারী ভুট্টা চাষে আলুর অবশিষ্ট সারের সর্বোচ্চ ব্যবহার হয়।" },
      { name: "তোষা পাট", benefits: "পাটের গভীর শিকড় মাটির নিচের স্তরের পুষ্টি টেনে আনে এবং পাটের পাতা পচে প্রচুর জৈব সার তৈরি করে।" }
    ],
    pest_benefit: "আলুর পর পাট বা তিল চাষ করলে আলুর সাধারণ স্কেব ব্যাকটেরিয়া এবং কৃমি পোকা (Nematode) দমন হয়।",
    soil_benefit: "আলু চাষে মাটি গভীরভাবে আলগা করতে হয়, যা মাটির অক্সিজেন বৃদ্ধি করে ও পরবর্তী ফসলের শিকড় গঠনে সাহায্য করে।"
  },
  {
    crop_name: "দেশি পেঁয়াজ",
    season_bn: "শীতকাল ও গ্রীষ্মকাল",
    ideal_followers: [
      { name: "কাঁচা মরিচ বা বেগুন", benefits: "পেঁয়াজের অগভীর শিকড়ের পর মরিচের মাঝারি শিকড় মাটির পুষ্টি সুষম রাখে।" },
      { name: "তিল (তৈলবীজ)", benefits: "পেঁয়াজ তোলার পর কম সেচ চাহিদার তিল চাষে অতিরিক্ত সার ছাড়াই ভালো ফলন পাওয়া যায়।" }
    ],
    pest_benefit: "পেঁয়াজের ঝাঁঝালো অ্যালিসিন উপাদানের প্রভাবে মাটির ক্ষতিকর রোগজীবাণু ও নিমাটোড বা কৃমি পোকা মারা যায়।",
    soil_benefit: "পেঁয়াজ মাটির অম্লত্বের সমতা বজায় রাখতে সাহায্য করে এবং মাটির উপরিভাগের শক্ত স্তর নরম করে।"
  },
  {
    crop_name: "কাঁচা মরিচ",
    season_bn: "খরিপ ও রবি মৌসুম",
    ideal_followers: [
      { name: "মসুর ডাল বা মুগ ডাল", benefits: "ডাল ফসল চাষে মরিচের ক্ষয়িত নাইট্রোজেন প্রাকৃতিকভাবে ফিরে আসে।" },
      { name: "বারি সরিষা", benefits: "মরিচ তোলার পর দ্রুততম সময়ে সরিষা চাষ করলে জমির সুপ্ত আর্দ্রতার উর্বর ব্যবহার হয়।" }
    ],
    pest_benefit: "মরিচের পর ডাল ফসল চাষ করলে মরিচের ভাইরাস বাহক সাদা মাছি ও থ্রিপস পোকার বংশবৃদ্ধি সম্পূর্ণ ব্যাহত হয়।",
    soil_benefit: "ডাল জাতীয় ফসল মাটির ক্ষয়রোধ করে এবং মাটিতে ফসফরাস ও নাইট্রোজেন সারের কার্যকারিতা বৃদ্ধি করে।"
  },
  {
    crop_name: "হাইব্রিড ভুট্টা",
    season_bn: "রবি ও গ্রীষ্ম মৌসুম",
    ideal_followers: [
      { name: "মুগ ডাল (সবুজ সার)", benefits: "ভুট্টার পর মাটিতে নাইট্রোজেন বাড়াতে মুগ চাষ ও কচি গাছ মাটিতে চাষ দিয়ে মিশিয়ে দেওয়া উত্তম।" },
      { name: "রোপা আমন ধান", benefits: "ভুট্টা কাটার পর বর্ষার শুরুতে আমন ধান রোপণ করলে মাটির পুষ্টি সুষম বণ্টন হয়।" }
    ],
    pest_benefit: "ভুট্টার পর ডাল চাষে ভুট্টার ফল আর্মিওয়ার্ম পোকা ও কান্ড পচা ছত্রাকের বংশবিস্তার চক্র ধ্বংস হয়ে যায়।",
    soil_benefit: "ভুট্টা গাছ উত্তোলনের পর শিকড় মাটিতে পচে জৈব উপাদান বাড়ায় এবং মাটির ভেতরের পানি ধারণ ক্ষমতা বাড়ায়।"
  },
  {
    crop_name: "রোপা আমন ধান",
    season_bn: "বর্ষাকাল (খরিপ-২)",
    ideal_followers: [
      { name: "আলু বা বারি সরিষা", benefits: "আমন ধান কাটার পর মাটিতে আর্দ্রতা থাকতেই দ্রুত আলু বা সরিষা রোপণ করলে কম সেচে ভালো ফলন হয়।" },
      { name: "খেসারি ডাল (রিলে ক্রপিং)", benefits: "ধান কাটার আগে রিলে ক্রপিং হিসেবে খেসারি বীজ ছিটিয়ে দিলে ধান কাটার সাথে সাথে চারা বাড়ে।" }
    ],
    pest_benefit: "আমন ধানের পর সরিষা চাষ করলে ধান পাতার লেদা পোকা ও গন্ধি পোকার জীবাণু সম্পূর্ণ ধ্বংস হয়ে যায়।",
    soil_benefit: "খেসারি ডাল বিনা চাষে মাটিতে নাইট্রোজেন ও ব্যাকটেরিয়া বৃদ্ধি করে মাটির উর্বরতা পুনরুদ্ধার করে।"
  },
  {
    crop_name: "তোষা পাট",
    season_bn: "খরিপ-১ মৌসুম",
    ideal_followers: [
      { name: "রোপা আমন ধান", benefits: "পাট কাটার পর আমন রোপণ করলে পাটের পচে যাওয়া পাতা আমন ধানের সারের চাহিদা অর্ধেক কমিয়ে দেয়।" },
      { name: "বোরো ধান", benefits: "পাটের চাষের পর জমিতে বোরো ধানের চাষ মাটির পুষ্টি স্তর নিয়ন্ত্রণে সাহায্য করে।" }
    ],
    pest_benefit: "পাটের দ্রুত বৃদ্ধির কারণে জমিতে আগাছা জন্মাতে পারেনা, যা ধান ফসলের পোকা ও আগাছা দমন খরচ কমায়।"
    ,
    soil_benefit: "পাটের প্রচুর পাতা জমিতে ঝরে পচে যায়, যা বিঘাপ্রতি প্রায় ২ টন উন্নত মানের জৈব সার মাটিতে সরাসরি যোগ করে।"
  },
  {
    crop_name: "বারি সরিষা",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "বোরো ধান", benefits: "সরিষা কাটার পর বোরো ধান রোপণ করলে সরিষার অবশিষ্টাংশ মাটির রন্ধ্রতা বাড়ায়।" },
      { name: "গ্রীষ্মকালীন মুগ ডাল", benefits: "সরিষার পর মুগ ডাল চাষে মাটির ক্ষয়প্রাপ্ত পুষ্টি উপাদান প্রাকৃতিক উপায়ে পূরণ হয়।" }
    ],
    pest_benefit: "সরিষার শিকড় নিঃসৃত রস ও তেলের অবশিষ্টাংশ মাটির ক্ষতিকারক ছত্রাক ও কৃমির জন্য প্রাকৃতিক প্রতিষেধক হিসেবে কাজ করে।",
    soil_benefit: "সরিষা কাটার পর শিকড় পচে মাটির রন্ধ্রতা বৃদ্ধি করে, যা পরবর্তী বোরো ধানের চারা সহজে কুশি গজাতে সাহায্য করে।"
  },
  {
    crop_name: "বেগুন",
    season_bn: "সারা বছর চাষ উপযোগী",
    ideal_followers: [
      { name: "লাল শাক বা পালং শাক", benefits: "বেগুনের পর স্বল্পমেয়াদী শাক চাষে মাটির উপরিভাগের পুষ্টি পুনরায় সচল হয়।" },
      { name: "ধঞ্চে (সবুজ সার)", benefits: "ধঞ্চে চাষ করে কচি অবস্থায় চাষ দিয়ে মাটিতে মিশিয়ে দিলে মাটির উর্বরতা অনেক বাড়ে।" }
    ],
    pest_benefit: "বেগুনের ডগা ও ফল ছিদ্রকারী পোকার তীব্র আক্রমণ কমাতে বেগুনের পর সবুজ সার ধঞ্চে চাষ করে জমি শোধন করা জরুরি।",
    soil_benefit: "ধঞ্চে জৈব সার হিসেবে পচে মাটির অম্লতা ও ক্ষারত্বের সমতা ফিরিয়ে আনে ও বেগুনের পুষ্টি ঘাটতি পূরণ করে।"
  }
];

export default function CropRotationPage() {
  const router = useRouter();
  const [activePlan, setActivePlan] = useState<RotationPlan | null>(ROTATION_DATABASE[0]);

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
            শস্য পর্যায় ও ফসল চক্র পরিকল্পনাকারী
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            মাটির উর্বরতা রক্ষা ও রোগবালাই প্রাদুর্ভাব কমাতে একই জমিতে পর্যায়ক্রমে ফসল নির্বাচনের বৈজ্ঞানিক নির্দেশিকা।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Current Crops List (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <span className="text-xs font-bold text-text-secondary block mb-2 uppercase tracking-wider">বর্তমানে চাষকৃত ফসল:</span>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {ROTATION_DATABASE.map((plan, idx) => (
              <div
                key={idx}
                onClick={() => setActivePlan(plan)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-32 ${
                  activePlan?.crop_name === plan.crop_name
                    ? 'bg-green-primary/5 border-green-primary shadow-md'
                    : 'bg-soft-white border-green-primary/10 hover:border-green-primary/20 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-text-primary text-sm leading-snug">
                    {plan.crop_name}
                  </h4>
                  <span className="text-[10px] text-text-secondary font-bold uppercase">
                    মৌসুম: {plan.season_bn}
                  </span>
                </div>
                <span className="text-[10px] text-green-primary font-bold">
                  পরবর্তী ফসল সাজেশন দেখুন →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Plan Details (Right 3 Columns) */}
        <div className="lg:col-span-3">
          {activePlan ? (
            <div className="glass-card p-6 md:p-8 space-y-6 border border-green-primary/10 animate-fade-in shadow-sm">
              <div className="border-b border-green-primary/10 pb-4">
                <span className="text-[10px] font-bold tracking-wider text-green-primary uppercase bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                  পরবর্তী ফসলের পরামর্শ
                </span>
                <h3 className="text-xl font-black text-text-primary mt-3">
                  {activePlan.crop_name} এর পর যা চাষ করবেন:
                </h3>
              </div>

              {/* Recommended Follower Crops */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-text-primary text-xs uppercase flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-green-primary" /> আদর্শ চক্রাকার ফসলসমূহ (Ideal Follower Crops):
                </h4>
                
                <div className="space-y-3">
                  {activePlan.ideal_followers.map((f, i) => (
                    <div key={i} className="p-4 rounded-xl border border-green-primary/10 bg-green-primary/5 space-y-1">
                      <span className="font-bold text-green-primary text-sm block">🔹 {f.name}</span>
                      <p className="text-xs text-text-primary leading-relaxed font-medium">{f.benefits}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agronomic Benefits */}
              <div className="space-y-4 pt-4 border-t border-green-primary/5">
                <h4 className="font-extrabold text-text-primary text-xs uppercase flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-green-primary" /> চক্রাকার চাষের কৃষিতাত্ত্বিক উপকারিতা:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Soil health */}
                  <div className="flex gap-2.5 text-xs text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5 font-semibold">
                    <ShieldCheck className="w-5 h-5 text-green-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] text-text-secondary uppercase mb-0.5">মাটির গুণাগুণ বৃদ্ধি:</span>
                      {activePlan.soil_benefit}
                    </div>
                  </div>

                  {/* Pest cycle */}
                  <div className="flex gap-2.5 text-xs text-text-primary bg-white/40 p-4 rounded-xl border border-green-primary/5 font-semibold">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-text-secondary uppercase mb-0.5">বালাই দমন সুবিধা:</span>
                      {activePlan.pest_benefit}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <HelpCircle className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">ফসল চক্র বিবরণী</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বামদিকের তালিকা থেকে আপনার বর্তমান চাষকৃত ফসলের ওপর ক্লিক করুন। মাটি সুরক্ষার জন্য পরবর্তী সঠিক ফসল রোটেশন গাইড চলে আসবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">আপনার জমির জন্য শস্য পর্যায় পরিকল্পনা করতে চান?</h4>
          <p className="text-xs text-text-secondary font-bold">মাটির ধরন ও পূর্বের ফসলের কথা জানিয়ে গাছের ডাক্তারের সাথে সরাসরি চ্যাট করে ফসল চক্র বানিয়ে নিন।</p>
        </div>
        <button 
          onClick={() => {
            const cropName = activePlan?.crop_name || '';
            router.push(`/chat?q=${encodeURIComponent(`${cropName} এর পর কি ফসল পর্যায়ক্রমিকভাবে রোপণ করা লাভজনক হবে?`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>
    </div>
  );
}
