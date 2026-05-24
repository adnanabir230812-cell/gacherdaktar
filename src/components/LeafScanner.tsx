'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu,
  CheckCircle,
  AlertCircle,
  Trash2,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

const compressImage = (dataUrl: string, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      resolve(dataUrl); // Fallback to original on error
    };
  });
};

export default function LeafScanner() {
  const router = useRouter();

  // Scanner States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannerResult, setScannerResult] = useState<any | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('symptoms');

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
      setCameraError('আপনার ক্যামেরা সচল করা যায়নি। অনুগ্রহ করে ক্যামেরার পারমিশন দিন অথবা নিচে থাকা ছবি আপলোড করার মাধ্যমটি ব্যবহার করুন।');
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

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        try {
          const compressed = await compressImage(dataUrl);
          setImgUrl(compressed);
        } catch (err) {
          console.error("Compression failed:", err);
          setImgUrl(dataUrl);
        }
        stopCamera();
      }
    }
  };

  // Drag and Drop File Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const compressed = await compressImage(reader.result as string);
            setImgUrl(compressed);
          } catch (err) {
            console.error("Drop compression failed:", err);
            setImgUrl(reader.result as string);
          }
          setScannerResult(null);
          stopCamera();
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setImgUrl(compressed);
        } catch (err) {
          console.error("Upload compression failed:", err);
          setImgUrl(reader.result as string);
        }
        setScannerResult(null);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove current image/reset
  const clearImage = () => {
    setImgUrl(null);
    setScannerResult(null);
    setCameraError(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        alert(data.error || 'গাছের ডাক্তার রোগ নির্ণয় করতে ব্যর্থ হয়েছেন। দয়া করে একটু পরিষ্কার ছবি নিয়ে পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      console.error(err);
      alert('নেটওয়ার্ক সংযোগে সমস্যা। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF8F2] border-2 border-green-primary/15 rounded-3xl p-6 md:p-8 shadow-lg space-y-6">
      
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
      <div className="border-b border-green-primary/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-green-primary uppercase bg-green-primary/10 px-3 py-1 rounded-full">
            গাছের ডাক্তার পাতা স্ক্যানার
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-text-primary mt-2">
            আক্রান্ত পাতার ছবি দিয়ে রোগ নির্ণয়
          </h3>
          <p className="text-xs md:text-sm text-text-secondary font-semibold mt-1">
            ফসলের পাতার একটি স্পষ্ট ছবি দিন। গাছের ডাক্তার তাৎক্ষণিকভাবে স্থানীয় নাম ও প্রতিকারের সমাধান বাতলে দেবে।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Camera / Upload Panel (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-start">
          
          {/* Main interactive area with Drag and Drop */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center p-4 transition-all duration-200 ${
              isDragging 
                ? 'border-green-primary bg-green-primary/5 scale-[1.01]' 
                : 'border-green-primary/20 bg-black/5 hover:border-green-primary/30'
            }`}
          >
            
            {/* Webcam video stream */}
            {isCameraActive && !imgUrl && (
              <div className="w-full h-full relative flex flex-col items-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-80 rounded-2xl object-cover bg-black"
                />
                <div className="absolute bottom-4 flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 bg-green-primary text-soft-white font-extrabold text-xs md:text-sm rounded-full shadow-lg hover:bg-green-soft active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    ছবি তুলুন
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-red-600 text-soft-white font-extrabold text-xs rounded-full shadow-lg hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            )}

            {/* Selected/Captured Image Preview with Scanning overlay & delete button */}
            {imgUrl && (
              <div className="w-full h-full relative flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imgUrl} 
                  alt="Captured Plant Preview" 
                  className="w-full h-80 rounded-2xl object-cover"
                />
                
                {/* Easy Delete Overlay Button */}
                {!scanning && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all active:scale-90 cursor-pointer"
                    title="ছবি মুছে ফেলুন"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                {/* Glowing Laser Scan animation */}
                {scanning && (
                  <div className="absolute inset-0 bg-green-primary/5 rounded-2xl overflow-hidden">
                    <div className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_#22c55e] scanner-laser" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-soft-white text-xs font-bold gap-3">
                      <Cpu className="w-8 h-8 animate-spin text-green-400" />
                      <span className="text-sm font-extrabold tracking-wide">গাছের ডাক্তার রোগ খুঁজছেন...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Standby/Upload State */}
            {!isCameraActive && !imgUrl && (
              <div className="text-center p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-primary/10 rounded-full flex items-center justify-center text-green-primary">
                  <Upload className="w-8 h-8" />
                </div>
                
                <div>
                  <h4 className="font-bold text-text-primary text-sm md:text-base">আক্রান্ত পাতার ছবি এখানে ছাড়ুন</h4>
                  <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold leading-relaxed">
                    সরাসরি ছবি তুলে দিন অথবা আপনার মোবাইল বা কম্পিউটারের গ্যালারি থেকে ড্র্যাগ ও ড্রপ বা সিলেক্ট করে আপলোড করুন।
                  </p>
                </div>
                
                <div className="flex flex-col gap-2.5 w-full max-w-xs pt-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-3 bg-green-primary text-soft-white font-bold text-xs md:text-sm rounded-xl hover:bg-green-soft shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    ক্যামেরা চালু করুন
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-green-primary/10 border border-green-primary/20 text-green-primary font-bold text-xs md:text-sm rounded-xl hover:bg-green-primary/15 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    গ্যালারি থেকে ছবি নিন
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Input elements */}
            <canvas ref={canvasRef} className="hidden" />
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>

          {/* Camera Access Error Message */}
          {cameraError && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Control Buttons */}
          {imgUrl && !scanning && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={runClassification}
                className="flex-1 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                গাছের ডাক্তারকে দেখান
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Diagnostic Output Report (Right 3 Columns) */}
        <div className="lg:col-span-3">
          {scannerResult ? (
            <div className="bg-white border border-green-primary/15 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in relative">
              
              {/* Report Header */}
              <div className="border-b border-green-primary/10 pb-4">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <span className="text-[9px] font-black tracking-wider text-green-primary uppercase bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    গাছের ডাক্তারের প্রেসক্রিপশন রিপোর্ট
                  </span>
                  <span className="text-xs text-text-secondary font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    শতকরা মিল: <span className="text-green-primary font-black">{Math.round(scannerResult.confidence * 100)}%</span>
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-text-primary mt-3 text-green-primary">
                  {scannerResult.disease}
                </h2>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary font-bold mt-2">
                  <span>🌾 <strong>ফসল:</strong> {scannerResult.crop}</span>
                  <span>🦠 <strong>জীবাণু/কারণ:</strong> {scannerResult.cause}</span>
                </div>
              </div>

              {/* Detailed section-by-section Solutions in Collapsible Accordions */}
              <div className="space-y-3">
                
                {/* 1. Visible Symptoms Accordion */}
                <div className="border border-green-primary/10 rounded-2xl overflow-hidden bg-warm-bg/5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleTab('symptoms')}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-text-primary bg-warm-bg/15 hover:bg-warm-bg/25 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">🔎 চিহ্নিত লক্ষণসমূহ</span>
                    <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${activeTab === 'symptoms' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeTab === 'symptoms' && (
                    <div className="p-5 border-t border-green-primary/5 text-xs md:text-sm text-text-primary leading-relaxed whitespace-pre-line bg-white animate-fade-in">
                      {scannerResult.symptoms}
                    </div>
                  )}
                </div>

                {/* 2. Organic Treatment Accordion */}
                <div className="border border-green-primary/10 rounded-2xl overflow-hidden bg-green-primary/5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleTab('organic')}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-green-primary bg-green-primary/10 hover:bg-green-primary/15 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">🌿 ১. জৈবিক ও প্রাকৃতিক দমন সমাধান</span>
                    <ChevronDown className={`w-4 h-4 text-green-primary transition-transform duration-200 ${activeTab === 'organic' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeTab === 'organic' && (
                    <div className="p-5 border-t border-green-primary/10 text-xs md:text-sm text-text-primary leading-relaxed whitespace-pre-line bg-white animate-fade-in">
                      {scannerResult.treatment_organic}
                    </div>
                  )}
                </div>

                {/* 3. Chemical Treatment Accordion */}
                <div className="border border-amber-500/15 rounded-2xl overflow-hidden bg-amber-500/5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleTab('chemical')}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-amber-700 bg-amber-500/10 hover:bg-amber-500/15 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">🧪 ২. রাসায়নিক দমন ও সঠিক ডোজ মাত্রা</span>
                    <ChevronDown className={`w-4 h-4 text-amber-700 transition-transform duration-200 ${activeTab === 'chemical' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeTab === 'chemical' && (
                    <div className="p-5 border-t border-amber-500/15 text-xs md:text-sm text-text-primary leading-relaxed whitespace-pre-line bg-white animate-fade-in font-extrabold">
                      {scannerResult.treatment_chemical}
                    </div>
                  )}
                </div>

                {/* 4. Preventive Guidelines Accordion */}
                {scannerResult.preventive_measures && (
                  <div className="border border-orange-500/15 rounded-2xl overflow-hidden bg-orange-500/5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleTab('preventive')}
                      className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-orange-700 bg-orange-500/10 hover:bg-orange-500/15 transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">🛡️ ৩. ভবিষ্যৎ প্রতিরোধ ও সুরক্ষা গাইডলাইন</span>
                      <ChevronDown className={`w-4 h-4 text-orange-700 transition-transform duration-200 ${activeTab === 'preventive' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeTab === 'preventive' && (
                      <div className="p-5 border-t border-orange-500/15 text-xs md:text-sm text-text-primary leading-relaxed whitespace-pre-line bg-white animate-fade-in">
                        {scannerResult.preventive_measures}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Reset/New Scan Button */}
              <div className="pt-2 border-t border-green-primary/10 flex justify-between items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={clearImage}
                  className="px-5 py-2.5 bg-green-primary hover:bg-green-soft text-soft-white text-xs md:text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  নতুন পাতা পরীক্ষা করুন
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/chat?q=${encodeURIComponent(`${scannerResult.crop} এর ${scannerResult.disease} রোগের ব্যাপারে আরও সমাধান বলুন`)}`);
                  }}
                  className="text-xs text-green-primary font-black hover:underline flex items-center gap-1 cursor-pointer"
                >
                  গাছের ডাক্তারের সাথে কথা বলুন <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[350px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              {scanning ? (
                <div className="flex flex-col items-center space-y-3">
                  <Cpu className="w-12 h-12 text-green-primary animate-spin" />
                  <div>
                    <h4 className="font-bold text-text-primary">পরীক্ষা চলছে</h4>
                    <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold animate-pulse">
                      গাছের ডাক্তার পাতা বিশ্লেষণ করছেন। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <HelpCircle className="w-12 h-12 text-green-primary/40 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-text-primary">পরীক্ষার ফলাফল দেখতে</h4>
                    <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                      বাঁদিকের প্যানেল ব্যবহার করে পাতার একটি স্পষ্ট ছবি তুলুন অথবা আপলোড করুন এবং "গাছের ডাক্তারকে দেখান" বাটনে চাপুন।
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
