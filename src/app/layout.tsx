import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "গাছের ডাক্তার — বাংলার কৃষকের বিশ্বস্ত ডিজিটাল ফসল বিশেষজ্ঞ",
  description: "ফসল, আবহাওয়া, সার ও চাষাবাদ তথ্য এখন এক জায়গায় — সহজ বাংলায়, আপনার মুঠোফোনে।",
};

import Header from "../components/Header";
import ScrollObserver from "../components/ScrollObserver";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        {/* Google Fonts for Bengali Glyphs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        
        {/* Leaflet CSS for Interactive Farm Mapping */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col pb-16 md:pb-0">
        <ScrollObserver />
        {/* 🌾 Top Developer Attribution Banner */}
        <div className="w-full bg-gradient-to-r from-green-primary via-emerald-800 to-amber-600 text-soft-white text-center py-2 text-xs md:text-sm font-extrabold tracking-wider shadow-md border-b border-amber-400/20 flex items-center justify-center gap-1.5">
          <span>✨</span>
          <span>Developed by <strong className="text-sunlight font-black drop-shadow-sm">Adnan Shah Abir</strong></span>
          <span>✨</span>
        </div>

        <Header />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>

        <footer className="w-full border-t border-green-primary/10 bg-soft-white/50 py-8 mt-12">
          <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between text-xs text-text-secondary gap-6">
            <div className="space-y-1">
              <p>© ২০২৬ গাছের ডাক্তার। সর্বস্বত্ব সংরক্ষিত।</p>
              <p className="text-[11px] font-bold">
                ডিজাইন ও ডেভেলপমেন্ট: <strong className="text-green-primary font-black">Adnan Shah Abir</strong>
              </p>
            </div>
            <div className="flex gap-4">
              <span>জাতীয় কৃষি তথ্য কেন্দ্র: ১৬১২৩</span>
              <span>•</span>
              <span>BRRI ও BARI নির্দেশিকা দ্বারা ভেরিফাইড</span>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
