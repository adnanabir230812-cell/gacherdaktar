'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Camera, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon, 
  Cpu,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CROPS } from '@/app/api/data';

interface DiagnosticRule {
  crop_id: string;
  part: 'leaf' | 'stem' | 'root' | 'fruit';
  symptom_bn: string;
  disease_bn: string;
  cause_bn: string;
  treatment_bn: string;
  dosage_bn: string;
}

// Heuristic helper to categorize plant parts based on symptoms or disease name
const getDiseasePart = (name: string, symptoms: string): 'leaf' | 'stem' | 'root' | 'fruit' => {
  const text = (name + ' ' + symptoms).toLowerCase();
  if (text.includes('গোড়া') || text.includes('শিকড়') || text.includes('কন্দ') || text.includes('মূল') || text.includes('গোরা') || text.includes('শিকর')) {
    return 'root';
  }
  if (text.includes('কান্ড') || text.includes('কাণ্ড') || text.includes('ডাল') || text.includes('লতা') || text.includes('কান্ড পচা')) {
    return 'stem';
  }
  if (text.includes('ফল') || text.includes('দানা') || text.includes('শীষ') || text.includes('বোল') || text.includes('মুতি') || text.includes('তুলা') || text.includes('শুঁটি') || text.includes('শুটি')) {
    return 'fruit';
  }
  return 'leaf';
};

export default function DiagnosticsPage() {
  const router = useRouter();
  
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'manual' | 'ai'>('manual');
  
  // Manual Selector States
  const [selectedCrop, setSelectedCrop] = useState<string>(CROPS[0]?.id || '1');
  const [selectedPart, setSelectedPart] = useState<'leaf' | 'stem' | 'root' | 'fruit' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeResult, setActiveResult] = useState<DiagnosticRule | null>(null);

  // AI Scanner States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannerResult, setScannerResult] = useState<any | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera on switch or unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, viewMode]);

  // Dynamically map crops from data.ts
  const cropsList = useMemo(() => {
    return CROPS.map(c => ({
      id: c.id,
      name: `${c.name_bn} (${c.name_en || ''})`
    }));
  }, []);

  // Dynamically map all diseases from data.ts CROPS database
  const diagnosticDatabase = useMemo(() => {
    const list: DiagnosticRule[] = [];
    CROPS.forEach(crop => {
      if (crop.diseases && Array.isArray(crop.diseases)) {
        crop.diseases.forEach(d => {
          const part = getDiseasePart(d.name_bn, d.symptoms);
          
          // Try to extract dosage info if mentioned in treatment text
          const dosageMatch = d.treatment_bn.match(/(\d+(?:\.\d+)?\s*(?:গ্রাম|মিলি|কেজি|ফোটা|শতক))/g);
          const dosage_bn = dosageMatch 
            ? `প্রতি লিটার পানিতে বা নির্দেশিকা অনুযায়ী: ${[...new Set(dosageMatch)].join(', ')}`
            : "ওষুধের প্যাকেট বা বোতলের গায়ে লেখা নির্দেশিকা অনুযায়ী প্রয়োগ করুন।";

          list.push({
            crop_id: crop.id,
            part,
            symptom_bn: d.symptoms,
            disease_bn: d.name_bn,
            cause_bn: d.cause_bn,
            treatment_bn: d.treatment_bn + (d.prevention_bn ? `\n\nপ্রতিরোধমূলক ব্যবস্থা:\n${d.prevention_bn}` : ''),
            dosage_bn
          });
        });
      }
    });
    return list;
  }, []);

  const filteredRules = useMemo(() => {
    return diagnosticDatabase.filter(rule => {
      const matchesCrop = rule.crop_id === selectedCrop;
      const matchesPart = selectedPart === 'all' || rule.part === selectedPart;
      const matchesSearch = 
        rule.symptom_bn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        rule.disease_bn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCrop && matchesPart && matchesSearch;
    });
  }, [diagnosticDatabase, selectedCrop, selectedPart, searchQuery]);

  const partLabels = {
    leaf: 'পাতা',
    stem: 'কান্ড ও ডাল',
    root: 'গোড়া ও শিকড়',
    fruit: 'ফল বা শস্যদানা'
  };

  const currentCropName = cropsList.find(c => c.id === selectedCrop)?.name || '';

  // Webcam operations
  const startCamera = async () => {
    setCameraError(null);
    setImgUrl(null);
    setScannerResult(null);
    setIsCameraActive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('ক্যামেরা সচল করা যায়নি। অনুগ্রহ করে ক্যামেরার পারমিশন দিন অথবা ছবি আপলোড ব্যবহার করুন।');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImgUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result as string);
        setScannerResult(null);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const runClassification = async () => {
    if (!imgUrl) return;
    setScanning(true);
    setScannerResult(null);
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imgUrl })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setScannerResult(data.result);
      } else {
        alert(data.error || 'রোগ শনাক্তকরণ ব্যর্থ হয়েছে। দয়া করে পরিষ্কার ছবি নিয়ে পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      console.error(err);
      alert('নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* CSS Animation for Scanner Laser Line */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .scanner-laser {
          animation: scan 2s linear infinite;
        }
      `}</style>

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
            ফসলের রোগবালাই সনাক্তকরণ
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আপনার গাছের পাতার ছবি তুলে অথবা রোগের লক্ষণ সিলেক্ট করে তাত্ক্ষণিকভাবে সঠিক রোগ ও তার বৈজ্ঞানিক সমাধান জেনে নিন।
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-green-primary/10 gap-2">
        <button
          onClick={() => { setViewMode('manual'); stopCamera(); }}
          className={`pb-3 px-4 text-sm font-extrabold transition-all border-b-2 cursor-pointer ${
            viewMode === 'manual'
              ? 'border-green-primary text-green-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          লক্ষণ ভিত্তিক নির্দেশিকা (ম্যানুয়াল)
        </button>
        <button
          onClick={() => { setViewMode('ai'); }}
          className={`pb-3 px-4 text-sm font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'ai'
              ? 'border-green-primary text-green-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          এআই পাতা স্ক্যানার (ফটো সনাক্তকরণ)
        </button>
      </div>

      {/* VIEW MODE 1: MANUAL (OLD VIEW OPTIMIZED) */}
      {viewMode === 'manual' && (
        <div className="space-y-6">
          {/* Select Crop Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 bg-soft-white p-4 rounded-2xl border border-green-primary/10 shadow-sm">
            <label htmlFor="crop-select" className="text-sm font-extrabold text-text-primary shrink-0">
              ফসল নির্বাচন করুন:
            </label>
            <select
              id="crop-select"
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setSelectedPart('all');
                setActiveResult(null);
              }}
              className="flex-1 bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer"
            >
              {cropsList.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Part Filter */}
          <div className="flex flex-wrap gap-2 border-b border-green-primary/5 pb-2">
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-primary/20 bg-soft-white focus:outline-none focus:ring-2 focus:ring-green-primary text-text-primary text-sm shadow-sm font-bold"
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
                    দুঃখিত, {currentCropName} এর জন্য কোনো ম্যাচিং লক্ষণ বা রোগ তথ্য পাওয়া যায়নি।
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
                      <strong>জীবাণু/কারণ:</strong> {activeResult.cause_bn}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3 text-sm text-text-primary bg-green-primary/5 p-4 rounded-xl border border-green-primary/10">
                      <ShieldCheck className="w-5 h-5 text-green-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-green-primary text-xs uppercase mb-1">দমন ও প্রতিকার পদ্ধতি:</h4>
                        <p className="font-medium leading-relaxed whitespace-pre-line text-xs">{activeResult.treatment_bn}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm text-text-primary bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-amber-700 text-xs uppercase mb-1">প্রস্তাবিত মাত্রা (Dosage):</h4>
                        <p className="font-extrabold text-text-primary leading-relaxed text-xs">{activeResult.dosage_bn}</p>
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
      )}

      {/* VIEW MODE 2: AI SCANNER PANEL (NEW FEATURE) */}
      {viewMode === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
          {/* Camera / Upload Section (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-primary" />
              ছবি ইনপুট
            </h3>

            {/* Main Interactive Stream/Preview Area */}
            <div className="relative border-2 border-dashed border-green-primary/20 rounded-3xl overflow-hidden bg-black/5 min-h-[320px] flex flex-col items-center justify-center p-4">
              
              {/* Webcam view */}
              {isCameraActive && !imgUrl && (
                <div className="w-full h-full relative flex flex-col items-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-80 rounded-2xl object-cover bg-black"
                  />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 px-6 py-2.5 bg-green-primary text-soft-white font-extrabold text-sm rounded-full shadow-lg hover:bg-green-soft active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    ছবি তুলুন
                  </button>
                </div>
              )}

              {/* Photo Preview & Scanning Animation */}
              {imgUrl && (
                <div className="w-full h-full relative flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imgUrl} 
                    alt="Captured Leaf Preview" 
                    className="w-full h-80 rounded-2xl object-cover"
                  />
                  
                  {/* Glowing Laser Scan Bar */}
                  {scanning && (
                    <div className="absolute inset-0 bg-green-primary/5 rounded-2xl overflow-hidden">
                      <div className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_#22c55e] scanner-laser" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-soft-white text-xs font-bold gap-2">
                        <Cpu className="w-5 h-5 animate-spin text-green-400" />
                        স্ক্যান করা হচ্ছে...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Dropzone / Standby Overlay */}
              {!isCameraActive && !imgUrl && (
                <div className="text-center p-8 space-y-4 flex flex-col items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-green-primary/30" />
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">রোগাক্রান্ত পাতার ছবি দিন</h4>
                    <p className="text-xs text-text-secondary max-w-xs mt-1">
                      মোবাইল বা কম্পিউটারের ক্যামেরা দিয়ে সরাসরি ছবি তুলুন অথবা গ্যালারি থেকে পাতার ছবি আপলোড করুন।
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <button
                      onClick={startCamera}
                      className="w-full py-3 bg-green-primary text-soft-white font-bold text-sm rounded-xl hover:bg-green-soft shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      ক্যামেরা চালু করুন
                    </button>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-green-primary/10 border border-green-primary/20 text-green-primary font-bold text-sm rounded-xl hover:bg-green-primary/15 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      গ্যালারি থেকে সিলেক্ট করুন
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden Canvas and File Input */}
              <canvas ref={canvasRef} className="hidden" />
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </div>

            {/* Error messaging */}
            {cameraError && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Scanner Controls (Process / Reset Buttons) */}
            {imgUrl && !scanning && (
              <div className="flex gap-2">
                <button
                  onClick={runClassification}
                  className="flex-1 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  রোগ নির্ণয় করুন
                </button>
                <button
                  onClick={() => {
                    setImgUrl(null);
                    setScannerResult(null);
                    startCamera();
                  }}
                  className="py-3 px-4 bg-green-primary/10 border border-green-primary/20 text-green-primary hover:bg-green-primary/15 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center"
                  title="পুনরায় ছবি তুলুন"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* AI Diagnostic Output / Prescription (Right 3 Columns) */}
          <div className="lg:col-span-3">
            {scannerResult ? (
              <div className="glass-card border-2 border-green-primary/30 p-6 space-y-6 animate-fade-in relative">
                
                {/* Prescription Header */}
                <div className="border-b border-green-primary/10 pb-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold tracking-wider text-green-primary uppercase bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      এআই প্রেসক্রিপশন রিপোর্ট
                    </span>
                    <span className="text-xs text-text-secondary font-bold">
                      নিশ্চয়তা: <span className="text-green-primary font-black">{Math.round(scannerResult.confidence * 100)}%</span>
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-text-primary mt-3 flex items-center gap-2">
                    {scannerResult.disease}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    <strong>আক্রান্ত ফসল:</strong> {scannerResult.crop} | <strong>জীবাণু/কারণ:</strong> {scannerResult.cause}
                  </p>
                </div>

                {/* Grid Solution */}
                <div className="space-y-4">
                  {/* Symptoms */}
                  <div className="text-sm text-text-primary bg-warm-bg/30 p-4 rounded-2xl border border-green-primary/5">
                    <h4 className="font-extrabold text-text-primary text-xs uppercase mb-1.5">চিহ্নিত লক্ষণসমূহ:</h4>
                    <p className="font-medium leading-relaxed whitespace-pre-line">{scannerResult.symptoms}</p>
                  </div>

                  {/* Organic Solution */}
                  <div className="text-sm text-text-primary bg-green-primary/5 p-4 rounded-2xl border border-green-primary/10 flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-green-primary text-xs uppercase mb-1.5">জৈবিক ও প্রাকৃতিক সমাধান:</h4>
                      <p className="font-medium leading-relaxed whitespace-pre-line text-xs">{scannerResult.treatment_organic}</p>
                    </div>
                  </div>

                  {/* Chemical Solution */}
                  <div className="text-sm text-text-primary bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-amber-700 text-xs uppercase mb-1.5">রাসায়নিক প্রতিকার ও মাত্রা (প্যাকেট ডোজ):</h4>
                      <p className="font-extrabold text-text-primary leading-relaxed text-xs whitespace-pre-line">{scannerResult.treatment_chemical}</p>
                    </div>
                  </div>

                  {/* Preventive Guidelines */}
                  {scannerResult.preventive_measures && (
                    <div className="text-sm text-text-primary bg-soil-warm/35 p-4 rounded-2xl border border-soil-brown/10">
                      <h4 className="font-extrabold text-soil-brown text-xs uppercase mb-1.5">সতর্কতা ও প্রতিরোধমূলক ব্যবস্থা:</h4>
                      <p className="font-medium leading-relaxed text-xs whitespace-pre-line">{scannerResult.preventive_measures}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[380px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
                {scanning ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Cpu className="w-12 h-12 text-green-primary animate-spin" />
                    <div>
                      <h4 className="font-bold text-text-primary">পাতা পরীক্ষা করা হচ্ছে</h4>
                      <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold animate-pulse">
                        এআই ডাক্তার পাতার রোগচিহ্ন বিশ্লেষণ করছেন। এতে ৫-১০ সেকেন্ড সময় লাগতে পারে...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <HelpCircle className="w-12 h-12 text-green-primary/40 animate-bounce" />
                    <div>
                      <h4 className="font-bold text-text-primary">রোগ নির্ণয়ের ফলাফল দেখতে</h4>
                      <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                        বাম পাশের প্যানেল ব্যবহার করে পাতার একটি ছবি তুলুন অথবা আপলোড করুন এবং "রোগ নির্ণয় করুন" বাটনে চাপ দিন।
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">ফসলের কোনো নতুন বা অপরিচিত সমস্যা দেখা দিয়েছে?</h4>
          <p className="text-xs text-text-secondary font-bold">লক্ষণ লিখে বা গাছের বর্ণনা দিয়ে সরাসরি এআই ডাক্তারের সাথে চ্যাট করুন ও তাত্ক্ষণিক পরামর্শ পান।</p>
        </div>
        <button 
          onClick={() => {
            const cropName = cropsList.find(c => c.id === selectedCrop)?.name || '';
            router.push(`/chat?q=${encodeURIComponent(`${cropName} গাছের রোগবালাই নিয়ে সাহায্য করুন।`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>
    </div>
  );
}
