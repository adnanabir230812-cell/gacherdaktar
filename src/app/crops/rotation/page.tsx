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
    crop_name: "আলু (রবি ফসল)",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "মিষ্টি ভুট্টা বা হাইব্রিড ভুট্টা", benefits: "আলু উত্তোলনের পর উচ্চ পুষ্টি গ্রহণকারী ভুট্টা চাষে আলুর অবশিষ্ট সারের সর্বোচ্চ ব্যবহার হয়।" },
      { name: "পাট (খরিপ-১)", benefits: "পাটের গভীর শিকড় মাটির নিচের স্তরের পুষ্টি টেনে আনে এবং পাটের পাতা পচে প্রচুর জৈব সার তৈরি করে।" }
    ],
    pest_benefit: "আলুর পর পাট বা তিল চাষ করলে আলুর সাধারণ স্কেব ব্যাকটেরিয়া এবং কৃমি পোকা (Nematode) দমন হয়।",
    soil_benefit: "আলু চাষে মাটি আলগা হয়, ফলে পরবর্তী ফসলের শিকড় সহজে ছড়ায় এবং মাটির গঠন উন্নত থাকে।"
  },
  {
    crop_name: "দেশি পেঁয়াজ",
    season_bn: "শীতকাল ও গ্রীষ্মকাল",
    ideal_followers: [
      { name: "কাঁচা মরিচ বা বেগুন", benefits: "পেঁয়াজের অগভীর শিকড়ের পর মরিচের মাঝারি শিকড় মাটির পুষ্টি সুষম রাখে।" },
      { name: "তিল (তৈলবীজ)", benefits: "পেঁয়াজ তোলার পর কম সেচ চাহিদার তিল চাষে অতিরিক্ত সার ছাড়াই ভালো ফলন পাওয়া যায়।" }
    ],
    pest_benefit: "পেঁয়াজের ঝাজালো গন্ধের কারণে মাটির কৃমি পোকা ও ক্ষতিকর ছত্রাকের প্রাদুর্ভাব হ্রাস পায় যা পরবর্তী ফসলের জন্য ভালো।",
    soil_benefit: "পেঁয়াজ মাটির অম্লত্বের সমতা বজায় রাখতে সাহায্য করে এবং মাটির উপরিভাগের শক্ত স্তর নরম করে।"
  }
];

export default function CropRotationPage() {
  const router = useRouter();
  const [activePlan, setActivePlan] = useState<RotationPlan | null>(ROTATION_DATABASE[0]);

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

        {/* Selected Plan Details (Right 3 Columns) */}
        <div className="lg:col-span-3">
          {activePlan ? (
            <div className="glass-card p-6 md:p-8 space-y-6 border border-green-primary/10 animate-fade-in">
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
    </div>
  );
}
