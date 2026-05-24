'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, BookOpen, Calculator, TrendingUp, MessageSquare } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/crops', label: 'ফসলের বই', icon: BookOpen },
    { href: '/calculator', label: 'সারের হিসাব-নিকাশ', icon: Calculator },
    { href: '/prices', label: 'পাইকারি বাজার দর', icon: TrendingUp },
    { href: '/articles', label: 'তথ্য ভান্ডার', icon: BookOpen },
  ];

  return (
    <>
      {/* 💻 Main Responsive Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-green-primary/10 bg-soft-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 select-none">
            <img 
              src="/logo.png" 
              alt="গাছের ডাক্তার লোগো" 
              className="w-10 h-10 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <span className="text-2xl font-black text-green-primary tracking-tight">
              গাছের ডাক্তার
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
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
            <Link 
              href="/chat" 
              className="px-5 py-2 text-sm font-bold text-soft-white bg-green-primary hover:bg-green-soft rounded-full shadow-md hover:shadow-lg transition-all"
            >
              গাছের ডাক্তার
            </Link>
          </nav>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link 
              href="/chat"
              className="px-3.5 py-1.5 text-xs font-bold text-soft-white bg-green-primary hover:bg-green-soft rounded-full shadow-sm"
            >
              জিজ্ঞেস করুন
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-green-primary/10 rounded-xl text-text-secondary transition-colors"
              aria-label="মেনু"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Slide-down Drawer Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-green-primary/10 bg-soft-white animate-fade-in shadow-lg">
            <div className="px-4 py-3 flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-green-primary/15 text-green-primary border-l-4 border-green-primary' 
                        : 'text-text-secondary hover:bg-green-primary/5'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/chat"
                onClick={() => setIsOpen(false)}
                className="mt-2 w-full text-center py-3 bg-green-primary hover:bg-green-soft text-soft-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                গাছের ডাক্তার এআই চ্যাট
              </Link>
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

      {/* Spacer to push content above bottom nav on mobile */}
      <div className="md:hidden h-16 w-full" />
    </>
  );
}
