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

const formatMarkdown = (text: any) => {
  if (!text) return '';
  const cleanText = Array.isArray(text) ? text.join('\n') : String(text);
  return cleanText.split('\n').map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={lineIdx} className="mb-1 leading-relaxed text-xs md:text-sm">
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIdx} className="font-extrabold text-green-primary">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
};

const translateToBanglaDigits = (num: number | string): string => {
  const englishToBanglaMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.'
  };
  return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
};

const downloadPrescription = async (result: any, imgUrl: string | null) => {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;
  const element = document.getElementById('leaf-prescription-pdf');
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // high quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    const fileName = `Prescription-${result.crop}-${result.disease.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('পিডিএফ ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
  }
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
        if (data.result && data.result.is_valid === false) {
          alert(data.result.error_message || 'এটি কোনো গাছ, লতাপাতা বা ফসলের ছবি নয়। দয়া করে আক্রান্ত ফসলের একটি স্পষ্ট ছবি আপলোড করুন।');
        } else {
          setScannerResult(data.result);
        }
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

      <div className={scannerResult ? "grid grid-cols-1 lg:grid-cols-5 gap-8" : "max-w-2xl mx-auto"}>
        {/* Camera / Upload Panel (Left 2 Columns) */}
        <div className={scannerResult ? "lg:col-span-2 space-y-4 flex flex-col justify-start" : "w-full space-y-4 flex flex-col justify-start"}>
          
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
                    className="px-6 py-2.5 bg-green-primary text-white font-extrabold text-xs md:text-sm rounded-full shadow-lg hover:bg-[#153526] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    ছবি তুলুন
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-red-600 text-white font-extrabold text-xs rounded-full shadow-lg hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-xs font-bold gap-3">
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
                    className="w-full py-3 bg-green-primary text-white font-bold text-xs md:text-sm rounded-xl hover:bg-[#153526] shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
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
                className="flex-1 py-3 bg-green-primary hover:bg-[#153526] text-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all duration-300"
              >
                <Cpu className="w-4 h-4" />
                গাছের ডাক্তারকে দেখান
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center active:scale-95 transition-all duration-300"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {scanning && (
            <div className="p-5 border border-green-primary/15 bg-white rounded-2xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
              <Cpu className="w-8 h-8 text-green-primary animate-spin" />
              <div>
                <h4 className="font-bold text-text-primary text-sm">রোগ নির্ণয় করা হচ্ছে...</h4>
                <p className="text-xs text-text-secondary mt-0.5 font-semibold">
                  গাছের এআই ডাক্তার পাতাটি নিবিড়ভাবে বিশ্লেষণ করছেন। অনুগ্রহ করে অপেক্ষা করুন...
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Diagnostic Output Report (Right 3 Columns) - Only visible when result is ready */}
        {scannerResult && (
          <div className="lg:col-span-3">
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
                    <div className="p-5 border-t border-green-primary/5 text-text-primary bg-white animate-fade-in">
                      {formatMarkdown(scannerResult.symptoms)}
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
                    <div className="p-5 border-t border-green-primary/10 text-text-primary bg-white animate-fade-in">
                      {formatMarkdown(scannerResult.treatment_organic)}
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
                    <div className="p-5 border-t border-amber-500/15 text-text-primary bg-white animate-fade-in">
                      {formatMarkdown(scannerResult.treatment_chemical)}
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
                      <div className="p-5 border-t border-orange-500/15 text-text-primary bg-white animate-fade-in">
                        {formatMarkdown(scannerResult.preventive_measures)}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Reset/New Scan/Download Button */}
              <div className="pt-4 border-t border-green-primary/10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
                  <button
                    type="button"
                    onClick={clearImage}
                    className="px-5 py-3 bg-green-primary hover:bg-[#153526] text-white text-xs md:text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-md text-center active:scale-95 duration-300"
                  >
                    নতুন পাতা পরীক্ষা করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPrescription(scannerResult, imgUrl)}
                    className="px-5 py-3 bg-[#1B4332] hover:bg-[#0F2F1D] text-white text-xs md:text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-md text-center active:scale-95 duration-300"
                  >
                    প্রেসক্রিপশন ডাউনলোড করুন
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/chat?q=${encodeURIComponent(`${scannerResult.crop} এর ${scannerResult.disease} রোগের ব্যাপারে আরও সমাধান বলুন`)}`);
                  }}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#1B4332]/10 to-[#B79400]/10 hover:from-[#1B4332]/15 hover:to-[#B79400]/15 border border-[#1B4332]/20 rounded-2xl transition-all text-xs font-black text-[#1B4332] shadow-sm hover:shadow-md cursor-pointer group shrink-0 duration-300 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span className="flex items-center gap-1.5">💬 গাছের ডাক্তারের সাথে সরাসরি কথা বলুন</span>
                  <ArrowRight className="w-4 h-4 text-[#1B4332] transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Hidden PDF template for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div 
          id="leaf-prescription-pdf" 
          style={{
            width: '794px', 
            minHeight: '1123px', 
            padding: '50px', 
            boxSizing: 'border-box', 
            backgroundColor: '#FFFFFF',
            color: '#1F2937', 
            fontFamily: "'Hind Siliguri', sans-serif",
            position: 'relative',
            border: '8px double #1B4332'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1B4332', paddingBottom: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="গাছের ডাক্তার লোগো" 
                style={{ width: '55px', height: '55px', objectFit: 'contain' }}
              />
              <div>
                <h1 style={{ color: '#1B4332', margin: '0 0 3px 0', fontSize: '24px', fontWeight: 'bold' }}>
                  গাছের ডাক্তার (Gacher Doctor)
                </h1>
                <p style={{ margin: 0, fontSize: '11px', color: '#40916C', fontWeight: '600' }}>
                  ডিজিটাল শস্য রোগবালাই সনাক্তকরণ ও সমাধান প্রেসক্রিপশন
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#4B5563' }}>
              <p style={{ margin: '2px 0' }}><strong>তারিখ:</strong> {translateToBanglaDigits(new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }))}</p>
              <p style={{ margin: '2px 0' }}><strong>রিপোর্ট আইডি:</strong> GD-{translateToBanglaDigits(Math.floor(100000 + Math.random() * 900000))}</p>
            </div>
          </div>

          {/* Details Table */}
          <div style={{ backgroundColor: '#E8F5E9', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '6px solid #1B4332' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', fontWeight: 'bold', color: '#1B4332' }}>
              <div>🌾 ফসল: <span style={{ color: '#1F2937' }}>{scannerResult?.crop}</span></div>
              <div>🦠 চিহ্নিত রোগ: <span style={{ color: '#1F2937' }}>{scannerResult?.disease}</span></div>
              <div style={{ gridColumn: 'span 2' }}>🔬 জীবাণু/কারণ: <span style={{ color: '#1F2937' }}>{scannerResult?.cause}</span></div>
            </div>
          </div>

          {/* Grid Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '25px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={imgUrl} 
                  alt="Plant Leaf" 
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #1B4332', marginBottom: '20px' }}
                />
              ) : (
                <div style={{ width: '100%', height: '160px', backgroundColor: '#F3F4F6', borderRadius: '8px', border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9CA3AF', marginBottom: '20px' }}>
                  ছবি সংযুক্ত নেই
                </div>
              )}
              <div style={{ border: '2px dashed #1B4332', padding: '12px', borderRadius: '8px', textAlign: 'center', width: '90%', backgroundColor: '#FFFFFF' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '10px', fontWeight: 'bold', color: '#1B4332' }}>গাছের ডাক্তার দ্বারা অনুমোদিত</p>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1B4332', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 'bold', fontSize: '14px' }}>✓</div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ borderLeft: '2px solid #E8F5E9', paddingLeft: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1B4332', margin: '0 0 5px 0', borderBottom: '1px solid #E8F5E9', paddingBottom: '3px' }}>🔎 চিহ্নিত লক্ষণসমূহ</h3>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>
                  {scannerResult?.symptoms && String(scannerResult.symptoms).split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: '2px 0' }}>• {line.replace(/^\s*[-*•]\s*/, '')}</p>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1B4332', margin: '0 0 5px 0', borderBottom: '1px solid #E8F5E9', paddingBottom: '3px' }}>🌿 জৈবিক ও প্রাকৃতিক দমন সমাধান</h3>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>
                  {scannerResult?.treatment_organic && String(scannerResult.treatment_organic).split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: '2px 0' }}>• {line.replace(/^\s*[-*•]\s*/, '')}</p>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1B4332', margin: '0 0 5px 0', borderBottom: '1px solid #E8F5E9', paddingBottom: '3px' }}>🧪 রাসায়নিক দমন ও সঠিক ডোজ মাত্রা</h3>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>
                  {scannerResult?.treatment_chemical && String(scannerResult.treatment_chemical).split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: '2px 0' }}>• {line.replace(/^\s*[-*•]\s*/, '')}</p>
                  ))}
                </div>
              </div>

              {scannerResult?.preventive_measures && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1B4332', margin: '0 0 5px 0', borderBottom: '1px solid #E8F5E9', paddingBottom: '3px' }}>🛡️ ভবিষ্যৎ প্রতিরোধ ও সুরক্ষা গাইডলাইন</h3>
                  <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>
                    {String(scannerResult.preventive_measures).split('\n').map((line, idx) => (
                      <p key={idx} style={{ margin: '2px 0' }}>• {line.replace(/^\s*[-*•]\s*/, '')}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: '40px', left: '50px', right: '50px', borderTop: '1px solid #E5E7EB', paddingTop: '15px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold', color: '#1B4332' }}>
              কৃষকের পাশে গাছের ডাক্তার — www.gacherdoctor.site
            </p>
            <p style={{ margin: 0, fontSize: '9px', color: '#9CA3AF' }}>
              * এটি একটি এআই ভিত্তিক পরামর্শ রিপোর্ট। ব্যবহারের পূর্বে রাসায়নিক সার ও কীটনাশকের বোতলের নির্দেশিকা ভালভাবে পড়ে নিন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
