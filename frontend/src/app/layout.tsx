import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "গাছের ডাক্তার — সমন্বিত ডিজিটাল কৃষি সেবা ও শস্য রোগবালাই সমাধান",
  description: "গাছের ডাক্তার বাংলাদেশের কৃষকের বিশ্বস্ত সমন্বিত ডিজিটাল কৃষি সেবা প্ল্যাটফর্ম। শস্যের রোগবালাই নির্ণয়, লাইভ আবহাওয়া পূর্বাভাস, সার হিসাব ও চাষাবাদের প্রয়োজনীয় নির্দেশিকা জানুন সহজ বাংলায়।",
  keywords: [
    "গাছের ডাক্তার",
    "কৃষি সেবা",
    "ডিজিটাল কৃষি সেবা",
    "শস্য রোগবালাই সমাধান",
    "ফসল বিশেষজ্ঞ",
    "কৃষি পরামর্শ",
    "সার ক্যালকুলেটর",
    "আবহাওয়া ফোরকাস্ট",
    "ফসলের রোগ",
    "কৃষি তথ্য",
    "Gacher Doctor",
    "Krishi Sathi"
  ],
  alternates: {
    canonical: "https://www.gacherdoctor.site",
  },
  openGraph: {
    title: "গাছের ডাক্তার — সমন্বিত ডিজিটাল কৃষি সেবা ও শস্য রোগবালাই সমাধান",
    description: "শস্যের রোগবালাই নির্ণয়, লাইভ আবহাওয়া পূর্বাভাস, সার হিসাব ও চাষাবাদের প্রয়োজনীয় নির্দেশিকা জানুন সহজ বাংলায়।",
    url: "https://www.gacherdoctor.site",
    siteName: "গাছের ডাক্তার",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "গাছের ডাক্তার — সমন্বিত ডিজিটাল কৃষি সেবা",
    description: "শস্যের রোগবালাই নির্ণয়, লাইভ আবহাওয়া পূর্বাভাস, সার হিসাব ও চাষাবাদের প্রয়োজনীয় নির্দেশিকা জানুন সহজ বাংলায়।",
  }
};

import Header from "../components/Header";
import ScrollObserver from "../components/ScrollObserver";
import UserTracker from "../components/UserTracker";

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
        <UserTracker />
        {/* 🌾 Top Developer Attribution Banner */}
        <div id="developer-attribution-banner" className="w-full bg-gradient-to-r from-green-primary via-emerald-800 to-amber-600 text-soft-white text-center py-2 text-xs md:text-sm font-extrabold tracking-wider shadow-md border-b border-amber-400/20 flex items-center justify-center gap-1.5">
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
