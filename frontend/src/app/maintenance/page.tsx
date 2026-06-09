import React from 'react';
import { Sprout, Smartphone, ShieldAlert } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10 px-4">
        
        {/* Animated Badge Header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wide uppercase shadow-inner backdrop-blur-md animate-pulse">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>নিরাপত্তা ও উন্নয়ন আপডেট</span>
        </div>

        {/* Icon Showcase Grid */}
        <div className="flex justify-center items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 relative group">
            <Sprout className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500/50 to-amber-500/50" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/10 relative group animate-bounce">
            <Smartphone className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-amber-200 tracking-tight">
            গাছের ডাক্তার
          </h1>
          <p className="text-emerald-400 font-bold text-lg">
            সাময়িক বিরতি ও নতুন পথচলা
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 text-center">
          
          <div className="text-slate-300 font-semibold text-sm leading-relaxed space-y-4">
            <p className="text-white text-base font-bold">
              প্রিয় কৃষক ভাই ও শুভানুধ্যায়ী,
            </p>
            <p>
              আপনাদের কৃষি সংক্রান্ত সমস্যার আরও সহজ ও দ্রুত সমাধান দিতে <strong className="text-emerald-400">"গাছের ডাক্তার"</strong> এখন মোবাইল অ্যাপ্লিকেশনে রূপান্তর হচ্ছে!
            </p>
            <p>
              আমাদের নতুন ও উন্নত মোবাইল অ্যাপ্লিকেশন তৈরির কাজ দ্রুত গতিতে এগিয়ে চলছে। খুব শীঘ্রই এটি গুগল প্লে স্টোরে উন্মুক্ত করা হবে।
            </p>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/10 rounded-2xl p-4 text-xs text-amber-300/90 leading-relaxed font-bold">
            📢 নিরাপত্তা নোটিশ: অ্যাপ্লিকেশন উন্নয়ন কাজ চলাকালীন এবং ডাটার সর্বোচ্চ নিরাপত্তা জোরদার করার লক্ষ্যে এই ওয়েবসাইটটির পাবলিক কার্যক্রম সাময়িকভাবে বন্ধ রাখা হয়েছে।
          </div>

        </div>

        {/* Footer */}
        <div className="space-y-2 text-xs text-slate-500">
          <p className="font-bold text-slate-400">আপনাদের সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত ও কৃতজ্ঞ।</p>
          <div className="pt-4 text-[10px] text-slate-600 font-mono">
            © ২০২৬ গাছের ডাক্তার • ডেভেলপড বাই আদনান শাহ আবির
          </div>
        </div>

      </div>
    </div>
  );
}
