'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Calculator, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle, 
  Droplets, 
  Thermometer, 
  Sprout, 
  Coins, 
  RefreshCw, 
  Compass, 
  ChevronDown 
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawer/dropdown on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const allServices = [
    { 
      href: '/chat', 
      label: 'ডাক্তারকে জিজ্ঞেস করুন', 
      desc: 'ফসলের রোগ ও চাষাবাদের সরাসরি সমাধান পেতে চ্যাট করুন', 
      icon: MessageSquare 
    },
    { 
      href: '/crops', 
      label: 'ফসলের বই', 
      desc: '৫২+ ফসলের রোপণকাল, জাত ও বালাই গাইড', 
      icon: BookOpen 
    },
    { 
      href: '/crops/diagnostics', 
      label: 'রোগবালাই সনাক্তকরণ', 
      desc: 'আক্রান্ত অংশ ও লক্ষণ দেখে রোগ সনাক্ত করুন', 
      icon: AlertTriangle 
    },
    { 
      href: '/calculator', 
      label: 'সারের পরিমাণ হিসাব', 
      desc: 'জমির মাপ অনুযায়ী সঠিক সারের ডোজ গণনা', 
      icon: Calculator 
    },
    { 
      href: '/calculator/pesticide', 
      label: 'কীটনাশক প্রয়োগের হিসাব', 
      desc: 'বালাইনাশক ও পানির সঠিক মিশ্রণ ও ডোজ হিসাব', 
      icon: Calculator 
    },
    { 
      href: '/calculator/seeds', 
      label: 'বীজ ও চারার পরিমাণ', 
      desc: 'জমির মাপ অনুযায়ী সঠিক পরিমাণ বীজ ও চারা নির্ধারণ', 
      icon: Sprout 
    },
    { 
      href: '/calculator/soil-ph', 
      label: 'মাটি পরীক্ষা ও চিকিৎসা', 
      desc: 'মাটির অম্লতা দূরীকরণে জিপসাম ও ডলোচুন হিসাব', 
      icon: Thermometer 
    },
    { 
      href: '/crops/rotation', 
      label: 'পর্যায়ক্রমে ফসল চাষ', 
      desc: 'জমির উর্বরতা বজায় রাখতে পর্যায়ক্রমে ফসল বোনার নিয়ম', 
      icon: RefreshCw 
    },
    { 
      href: '/crops/matchmaker', 
      label: 'লাভজনক ফসল নির্বাচন', 
      desc: 'জেলা ও মাটি অনুযায়ী কোন ফসল চাষে বেশি লাভ তা দেখুন', 
      icon: Compass 
    },
    { 
      href: '/weather/irrigation', 
      label: 'সেচ দেওয়ার সঠিক নিয়ম', 
      desc: 'বৃষ্টির পূর্বাভাস ও মাটির রস দেখে পানি দেওয়ার নিয়ম', 
      icon: Droplets 
    },
    { 
      href: '/prices', 
      label: 'পাইকারি বাজার দর', 
      desc: 'প্রতিদিনের বাজার দর ও প্রবণতা চার্ট বিশ্লেষণ', 
      icon: TrendingUp 
    },
    { 
      href: '/articles', 
      label: 'কৃষি তথ্য ভান্ডার', 
      desc: 'DAE ও BINA-র নোটিশ ও নির্দেশিকা ভান্ডার', 
      icon: BookOpen 
    },
    { 
      href: '/directory/loans', 
      label: 'কৃষি ঋণ ও অনুদান', 
      desc: 'কৃষি লোন স্কিম এবং সরকারি ভর্তুকি আবেদন', 
      icon: Coins 
    }
  ];

  // Primary short nav links for desktop navigation
  const primaryLinks = [
    { href: '/', label: 'হোম' },
    { href: '/crops', label: 'ফসলের বই' },
    { href: '/calculator', label: 'সারের হিসাব' },
    { href: '/prices', label: 'বাজার দর' },
  ];

  return (
    <>
      {/* 💻 Main Responsive Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-green-primary/10 bg-soft-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-1.5 xs:gap-2.5 min-w-0 select-none">
            <img 
              src="/logo.png" 
              alt="গাছের ডাক্তার লোগো" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0"
              style={{ mixBlendMode: 'multiply' }}
            />
            <span className="text-base xs:text-xl sm:text-2xl font-black text-green-primary tracking-tight truncate">
              গাছের ডাক্তার
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-bold transition-colors ${
                    isActive 
                      ? 'text-green-primary border-b-2 border-green-primary pb-0.5' 
                      : 'text-text-secondary hover:text-green-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Premium Services Dropdown */}
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${
                  isDropdownOpen || pathname.includes('/calculator/') || pathname.includes('/crops/') || pathname.includes('/weather/') || pathname.includes('/directory/') || pathname === '/chat' || pathname === '/articles'
                    ? 'text-green-primary'
                    : 'text-text-secondary hover:text-green-primary'
                }`}
              >
                সকল কৃষি সেবা
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Flyout Card Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-1/2 translate-x-1/2 top-full mt-2 w-[620px] bg-soft-white/98 backdrop-blur-xl border border-green-primary/15 rounded-3xl shadow-2xl p-5 grid grid-cols-2 gap-3 z-50 animate-fade-in">
                  {allServices.map((service) => {
                    const isServiceActive = pathname === service.href;
                    const IconComp = service.icon;
                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        className={`group flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 ${
                          isServiceActive 
                            ? 'bg-green-primary/10 border-l-4 border-green-primary' 
                            : 'hover:bg-green-primary/5'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${
                          isServiceActive
                            ? 'bg-green-primary text-soft-white'
                            : 'bg-green-primary/10 text-green-primary group-hover:bg-green-primary group-hover:text-soft-white'
                        }`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-text-primary group-hover:text-green-primary transition-colors">
                            {service.label}
                          </h4>
                          <p className="text-[10px] text-text-secondary leading-normal font-semibold">
                            {service.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link 
              href="/chat" 
              className="px-5 py-2 text-sm font-bold text-soft-white bg-green-primary hover:bg-green-soft rounded-full shadow-md hover:shadow-lg transition-all"
            >
              গাছের ডাক্তার চ্যাট
            </Link>
          </nav>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <Link 
              href="/chat"
              className="px-2.5 py-1.5 text-[10px] xs:text-xs font-bold text-soft-white bg-green-primary hover:bg-green-soft rounded-full shadow-sm whitespace-nowrap"
            >
              জিজ্ঞেস করুন
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 hover:bg-green-primary/10 rounded-xl text-text-secondary transition-colors"
              aria-label="মেনু"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Slide-down Drawer Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-green-primary/10 bg-soft-white max-h-[calc(100vh-80px)] overflow-y-auto shadow-xl">
            {/* "সকল সেবাসমূহ" Beautiful Sticky Header */}
            <div className="sticky top-0 bg-soft-white/95 backdrop-blur-md px-5 py-3 border-b border-green-primary/5 flex items-center justify-between z-10">
              <span className="text-base font-black text-green-primary flex items-center gap-2">
                <Compass className="w-5 h-5" /> সকল সেবাসমূহ
              </span>
              <span className="text-[10px] bg-green-primary/10 text-green-primary font-black px-2.5 py-0.5 rounded-full">
                ১৩টি সক্রিয় সেবা
              </span>
            </div>

            {/* List of 13 services inside drawer */}
            <div className="px-4 py-4 flex flex-col gap-2.5">
              {allServices.map((service) => {
                const isActive = pathname === service.href;
                const IconComponent = service.icon;
                return (
                  <Link
                    key={service.href}
                    href={service.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-green-primary/15 text-green-primary border-l-4 border-green-primary' 
                        : 'text-text-secondary hover:bg-green-primary/5'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isActive 
                        ? 'bg-green-primary text-soft-white' 
                        : 'bg-green-primary/10 text-green-primary'
                    }`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className={`block text-sm font-black ${isActive ? 'text-green-primary' : 'text-text-primary'}`}>
                        {service.label}
                      </span>
                      <span className="block text-[11px] text-text-secondary/80 leading-normal font-semibold">
                        {service.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* 📱 Sticky Bottom Navigation Bar for Mobile Screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-soft-white/80 backdrop-blur-lg border-t border-green-primary/10 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-2 py-1.5 flex items-center justify-around">
        {/* Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-2xl transition-all ${
            pathname === '/' 
              ? 'text-green-primary font-black scale-105' 
              : 'text-text-secondary'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">হোম</span>
        </Link>

        {/* Crops */}
        <Link 
          href="/crops" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-2xl transition-all ${
            pathname.startsWith('/crops') 
              ? 'text-green-primary font-black scale-105' 
              : 'text-text-secondary'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold">ফসলের বই</span>
        </Link>

        {/* Calculator */}
        <Link 
          href="/calculator" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-2xl transition-all ${
            pathname.startsWith('/calculator') 
              ? 'text-green-primary font-black scale-105' 
              : 'text-text-secondary'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] font-bold">ক্যালকুলেটর</span>
        </Link>

        {/* Prices */}
        <Link 
          href="/prices" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-2xl transition-all ${
            pathname.startsWith('/prices') 
              ? 'text-green-primary font-black scale-105' 
              : 'text-text-secondary'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-bold">বাজার দর</span>
        </Link>

        {/* Chat */}
        <Link 
          href="/chat" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-2xl transition-all ${
            pathname === '/chat' 
              ? 'text-green-primary font-black scale-105' 
              : 'text-text-secondary'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold">জিজ্ঞেস করুন</span>
        </Link>
      </nav>

    </>
  );
}
