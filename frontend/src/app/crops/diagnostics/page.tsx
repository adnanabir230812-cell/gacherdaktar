'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LeafScanner from '@/components/LeafScanner';

export default function DiagnosticsPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-green-primary/10 pb-4">
        <button 
          onClick={() => router.push('/')}
          className="p-2 hover:bg-green-primary/10 rounded-full transition-colors text-text-secondary cursor-pointer"
          title="ফিরে যান"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            গাছের ডাক্তার রোগ সনাক্তকরণ
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আক্রান্ত পাতার ছবি তুলে গাছের ডাক্তারের সাহায্যে রোগবালাই সনাক্ত করুন ও বিস্তারিত প্রতিকার পান।
          </p>
        </div>
      </div>

      <div className="animate-fade-in">
        <LeafScanner />
      </div>
    </div>
  );
}
