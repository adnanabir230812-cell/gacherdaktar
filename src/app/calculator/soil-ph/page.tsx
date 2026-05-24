'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Info,
  Camera,
  Upload,
  Cpu,
  AlertCircle,
  Trash2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  MapPin,
  Droplet
} from 'lucide-react';

const DISTRICTS = [
  // ঢাকা বিভাগ (Dhaka Division)
  "ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "নরসিংদী", "টাঙ্গাইল", "মানিকগঞ্জ", "মুন্সিগঞ্জ", "ফরিদপুর", "গোপালগঞ্জ", "মাদারীপুর", "শরীয়তপুর", "রাজবাড়ী",
  
  // রাজশাহী বিভাগ (Rajshahi Division)
  "রাজশাহী", "বগুড়া", "পাবনা", "নাটোর", "নওগাঁ", "জয়পুরহাট", "সিরাজগঞ্জ", "চাঁপাইনবাবগঞ্জ",
  
  // খুলনা বিভাগ (Khulna Division)
  "খুলনা", "যশোর", "ঝিনাইদহ", "সাতক্ষীরা", "বাগেরহাট", "কুষ্টিয়া", "মাগুরা", "নড়াইল", "চুয়াডাঙ্গা", "মেহেরপুর",
  
  // ময়মনসিংহ বিভাগ (Mymensingh Division)
  "ময়মনসিংহ", "শেরপুর", "নেত্রকোনা", "জামালপুর",
  
  // সিলেট বিভাগ (Sylhet Division)
  "সিলেট", "সুনামগঞ্জ", "হবিগঞ্জ", "মৌলভীবাজার",
  
  // চট্টগ্রাম বিভাগ (Chittagong Division)
  "চট্টগ্রাম", "কুমিল্লা", "নোয়াখালী", "ফেনী", "কক্সবাজার", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "লক্ষ্মীপুর", "রাঙ্গামাটি", "বান্দরবান", "খাগড়াছড়ি",
  
  // রংপুর বিভাগ (Rangpur Division)
  "রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "লালমনিরহাট", "নীলফামারী", "ঠাকুরগাঁও", "পঞ্চগড়",
  
  // বরিশাল বিভাগ (Barisal Division)
  "বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা", "ঝালকাঠি"
];

// Image Compression Helper
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

// Markdown Formatter Helper
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

const getPhStatusBangla = (ph: number) => {
  if (ph < 5.5) return 'তীব্র অম্লীয় (Strongly Acidic)';
  if (ph < 6.5) return 'মৃদু অম্লীয় (Mildly Acidic)';
  if (ph <= 7.5) return 'স্বাভাবিক/অপটিমাল (Neutral / Optimal)';
  if (ph <= 8.5) return 'মৃদু ক্ষারীয় (Mildly Alkaline)';
  return 'তীব্র ক্ষারীয় (Strongly Alkaline)';
};

// Soil Prescription Download Helper
const downloadSoilPrescription = (result: any, imgUrl: string | null, locationStr: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const currentDate = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedDate = translateToBanglaDigits(currentDate);

  const cleanBullets = (text: any) => {
    if (!text) return '';
    const lines = Array.isArray(text) ? text : String(text).split('\n');
    return lines.map((line: string) => {
      let clean = line.replace(/^\s*[-*•]\s*/, '').trim();
      clean = clean.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return `<li style="margin-bottom: 8px;">${clean}</li>`;
    }).join('');
  };

  const contentHtml = `
    <div class="prescription-header">
      <div class="header-main">
        <h1>গাছের ডাক্তার (Gacher Doctor)</h1>
        <p class="subtitle">ডিজিটাল মৃত্তিকা (মাটি) পরীক্ষা ও সমাধান প্রেসক্রিপশন</p>
      </div>
      <div class="header-meta">
        <p><strong>তারিখ:</strong> ${formattedDate}</p>
        <p><strong>আইডি:</strong> GD-${Math.floor(100000 + Math.random() * 900000)}</p>
      </div>
    </div>
    
    <div class="prescription-body">
      <div class="info-row">
        <div class="info-cell"><strong>মাটির ধরন:</strong> ${result.soil_type}</div>
        <div class="info-cell"><strong>পরীক্ষার স্থান (জেলা):</strong> ${locationStr}</div>
      </div>
      <div class="info-row" style="margin-top: -10px;">
        <div class="info-cell"><strong>আনুমানিক pH মান:</strong> ${translateToBanglaDigits(result.estimated_ph)}</div>
        <div class="info-cell"><strong>মাটির অবস্থা:</strong> ${getPhStatusBangla(result.estimated_ph)}</div>
      </div>

      <div class="layout-grid">
        <div class="left-col">
          ${imgUrl ? `<img src="${imgUrl}" class="prescription-image" alt="Soil Sample" />` : '<div class="no-img">ছবি সংযুক্ত নেই</div>'}
          <div class="prescription-stamp">
            <p>গাছের ডাক্তার দ্বারা অনুমোদিত</p>
            <div class="stamp-circle">✓</div>
          </div>
        </div>
        <div class="right-col">
          <div class="section">
            <div class="section-title">🔎 মাটির কণার গঠন ও বৈশিষ্ট্য</div>
            <div class="section-content">${result.color_texture.replace(/\n/g, '<br>')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">🌾 চাষের উপযোগী লাভজনক ফসলসমূহ</div>
            <ul class="section-content">${cleanBullets(result.suitable_crops)}</ul>
          </div>
          
          <div class="section">
            <div class="section-title">🌿 জৈব সার ও প্রাকৃতিক উর্বরতা বৃদ্ধি গাইড</div>
            <ul class="section-content">${cleanBullets(result.organic_advice)}</ul>
          </div>

          <div class="section">
            <div class="section-title">🧪 অম্লত্ব/ক্ষারত্ব সংশোধন হিসাব ও সার সুপারিশ</div>
            <ul class="section-content">${cleanBullets(result.chemical_advice)}</ul>
          </div>

          ${result.preventive_measures ? `
          <div class="section">
            <div class="section-title">🛡️ মাটি ক্ষয় রোধ ও দীর্ঘমেয়াদী উর্বরতা পরামর্শ</div>
            <ul class="section-content">${cleanBullets(result.preventive_measures)}</ul>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.write(`
    <html>
      <head>
        <title>প্রেসক্রিপশন - গাছের ডাক্তার</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Hind Siliguri', sans-serif;
            color: #1b3a2b;
            background: #ffffff;
            margin: 0;
            padding: 20px;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .prescription-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #2e7d32;
            padding: 25px;
            border-radius: 12px;
            background: #fafbf9;
          }

          .prescription-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px double #2e7d32;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }

          .header-main h1 {
            color: #2e7d32;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }

          .header-main .subtitle {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #4a6b54;
            font-weight: 600;
          }

          .header-meta {
            text-align: right;
            font-size: 12px;
            color: #4a6b54;
          }

          .header-meta p {
            margin: 2px 0;
          }

          .info-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            background: #e8f5e9;
            padding: 10px 12px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
            border-left: 5px solid #2e7d32;
          }

          .info-cell strong {
            color: #2e7d32;
          }

          .layout-grid {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 20px;
          }

          .left-col {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .prescription-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #2e7d32;
            margin-bottom: 15px;
          }

          .no-img {
            width: 100%;
            height: 150px;
            background: #eee;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #777;
            margin-bottom: 15px;
            border: 2px dashed #ccc;
          }

          .prescription-stamp {
            text-align: center;
            border: 2px dashed #2e7d32;
            padding: 8px;
            border-radius: 8px;
            width: 80%;
            background: #ffffff;
          }

          .prescription-stamp p {
            margin: 0 0 4px 0;
            font-size: 10px;
            font-weight: bold;
            color: #2e7d32;
          }

          .stamp-circle {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #2e7d32;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            font-weight: bold;
            font-size: 12px;
          }

          .right-col {
            border-left: 2px solid #e8f5e9;
            padding-left: 20px;
          }

          .section {
            margin-bottom: 15px;
          }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #2e7d32;
            margin-bottom: 6px;
            border-bottom: 1px solid #e8f5e9;
            padding-bottom: 4px;
          }

          .section-content {
            font-size: 12.5px;
            color: #333333;
            margin: 0;
            padding-left: 15px;
          }

          .prescription-footer {
            margin-top: 25px;
            border-top: 1px solid #e0e0e0;
            padding-top: 12px;
            text-align: center;
            font-size: 11px;
            color: #4a6b54;
            font-weight: bold;
          }

          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .prescription-container {
              border: none;
              padding: 0;
              background: #ffffff;
            }
            .info-row {
              background: #f1f8e9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .section-title {
              border-bottom-color: #f1f8e9 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="prescription-container">
          ${contentHtml}
          <div class="prescription-footer">
            কৃষকের পাশে গাছের ডাক্তার — www.gacherdoctor.site
          </div>
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 400);
};

export default function SoilPHCalculator() {
  const router = useRouter();

  // ==================== SCANNER STATES ====================
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('ময়মনসিংহ');
  const [scanning, setScanning] = useState(false);
  const [scannerResult, setScannerResult] = useState<any | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('type');

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

  // Webcam actions
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

  const clearImage = () => {
    setImgUrl(null);
    setScannerResult(null);
    setCameraError(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const runSoilClassification = async () => {
    if (!imgUrl) return;
    setScanning(true);
    setScannerResult(null);
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          image: imgUrl,
          type: 'soil',
          location: location
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setScannerResult(data.result);
      } else {
        alert(data.error || 'গাছের ডাক্তার মাটি পরীক্ষা করতে ব্যর্থ হয়েছেন। দয়া করে একটু পরিষ্কার ছবি নিয়ে পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      console.error(err);
      alert('নেটওয়ার্ক সংযোগে সমস্যা। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।');
    } finally {
      setScanning(false);
    }
  };

  const getPhIndicatorPosition = (ph: number) => {
    const minPh = 4.0;
    const maxPh = 9.0;
    const pct = ((ph - minPh) / (maxPh - minPh)) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
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
            মাটি পরীক্ষা ও সংশোধক গাইড
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            মাটির ছবি ও আপনার এলাকা নির্বাচন করুন। গাছের ডাক্তার মাটির ধরন, আনুমানিক pH এবং সার সংশোধনের হিসাব বলে দেবে।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Input Panel (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-start">
          
          {/* Location Selector */}
          <div className="space-y-2">
            <label className="text-sm font-black text-text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-green-primary" />
              আপনার জেলা নির্বাচন করুন:
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer font-bold"
            >
              {DISTRICTS.map((dist, idx) => (
                <option key={idx} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Interactive Image Area */}
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

            {/* Photo Preview & Scanning Laser Overlay */}
            {imgUrl && (
              <div className="w-full h-full relative flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imgUrl} 
                  alt="Soil Sample Preview" 
                  className="w-full h-80 rounded-2xl object-cover"
                />
                
                {/* Easy Delete Overlay */}
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

                {/* Laser Scanning Animation */}
                {scanning && (
                  <div className="absolute inset-0 bg-green-primary/5 rounded-2xl overflow-hidden">
                    <div className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_#22c55e] scanner-laser" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-soft-white text-xs font-bold gap-3">
                      <Cpu className="w-8 h-8 animate-spin text-green-400" />
                      <span className="text-sm font-extrabold tracking-wide">গাছের ডাক্তার মাটি পরীক্ষা করছেন...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Standby/Upload Option */}
            {!isCameraActive && !imgUrl && (
              <div className="text-center p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-primary/10 rounded-full flex items-center justify-center text-green-primary">
                  <Upload className="w-8 h-8" />
                </div>
                
                <div>
                  <h4 className="font-bold text-text-primary text-sm md:text-base">মাটির নমুনা ছবি এখানে ছাড়ুন</h4>
                  <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold leading-relaxed">
                    মাটির রৌদ্রোজ্জ্বল ছবি সরাসরি তুলুন অথবা গ্যালারি থেকে ড্র্যাগ অ্যান্ড ড্রপ করে আপলোড করুন।
                  </p>
                </div>
                
                <div className="flex flex-col gap-2.5 w-full max-w-xs pt-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-3 bg-green-primary text-soft-white font-bold text-xs md:text-sm rounded-xl hover:bg-green-soft shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    ক্যামেরা দিয়ে ছবি তুলুন
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-green-primary/10 border border-green-primary/20 text-green-primary font-bold text-xs md:text-sm rounded-xl hover:bg-green-primary/15 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    গ্যালারি থেকে সিলেক্ট করুন
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>

          {/* Camera Access Error Alert */}
          {cameraError && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Action Buttons */}
          {imgUrl && !scanning && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={runSoilClassification}
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

        {/* Diagnostic Soil Report Output (Right 3 Columns) */}
        <div className="lg:col-span-3">
          {scannerResult ? (
            <div className="bg-white border border-green-primary/15 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
              
              {/* Report Header */}
              <div className="border-b border-green-primary/10 pb-4">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <span className="text-[9px] font-black tracking-wider text-green-primary uppercase bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    গাছের ডাক্তারের মাটি পরীক্ষা রিপোর্ট
                  </span>
                  <span className="text-xs text-text-secondary font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    পরীক্ষার স্থান: <span className="text-green-primary font-black">{location}</span>
                  </span>
                </div>

                <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-green-primary">
                      {scannerResult.soil_type}
                    </h2>
                    <p className="text-xs text-text-secondary font-bold mt-1">
                      নির্ণীত মাটির ধরণ ও সংশোধক গাইডলাইন
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 bg-green-primary/5 border border-green-primary/10 rounded-2xl px-4 py-3 shrink-0">
                    <Droplet className="w-5 h-5 text-green-primary animate-pulse" />
                    <div>
                      <div className="text-[10px] font-black text-text-secondary uppercase">আনুমানিক pH মান</div>
                      <div className="text-lg font-black text-text-primary">{translateToBanglaDigits(scannerResult.estimated_ph)}</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Colorful pH Gauge Bar */}
                <div className="mt-6 border border-green-primary/5 bg-warm-bg/30 p-4 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
                    <span>তীব্র অম্লীয় (pH ৪)</span>
                    <span className="text-green-primary font-black bg-green-primary/10 px-2 py-0.5 rounded-md">
                      {getPhStatusBangla(scannerResult.estimated_ph)}
                    </span>
                    <span>তীব্র ক্ষারীয় (pH ৯)</span>
                  </div>

                  <div className="relative w-full h-4 bg-gradient-to-r from-red-500 via-amber-400 via-green-500 via-blue-400 to-violet-600 rounded-full mt-3">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white border-2 border-green-primary rounded-full shadow-lg flex items-center justify-center transition-all duration-500"
                      style={{ left: `calc(${getPhIndicatorPosition(scannerResult.estimated_ph)}% - 14px)` }}
                    >
                      <span className="text-[10px] font-black text-green-primary">{translateToBanglaDigits(scannerResult.estimated_ph)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Accordion Tabs */}
              <div className="space-y-3">
                
                {/* 1. Soil Texture & Features */}
                <div className="border border-green-primary/10 rounded-2xl overflow-hidden bg-warm-bg/5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === 'type' ? null : 'type')}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-text-primary bg-warm-bg/15 hover:bg-warm-bg/25 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">🔍 মাটির কণার গঠন ও বৈশিষ্ট্য</span>
                    <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${activeAccordion === 'type' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'type' && (
                    <div className="p-5 border-t border-green-primary/5 text-text-primary bg-white animate-fade-in">
                      {formatMarkdown(scannerResult.color_texture)}
                    </div>
                  )}
                </div>

                {/* 2. Suitable Crops */}
                <div className="border border-green-primary/10 rounded-2xl overflow-hidden bg-green-primary/5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === 'crops' ? null : 'crops')}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-green-primary bg-green-primary/10 hover:bg-green-primary/15 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">🌾 ১. চাষের উপযোগী লাভজনক ফসলসমূহ</span>
                    <ChevronDown className={`w-4 h-4 text-green-primary transition-transform duration-200 ${activeAccordion === 'crops' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'crops' && (
                    <div className="p-5 border-t border-green-primary/10 text-text-primary bg-white animate-fade-in">
                      {formatMarkdown(scannerResult.suitable_crops)}
                    </div>
                  )}
                </div>

                {/* 3. Organic Advice */}
                <div className="border border-emerald-600/15 rounded-2xl overflow-hidden bg-emerald-500/5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === 'organic' ? null : 'organic')}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/15 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">🌿 ২. জৈব সার ও প্রাকৃতিক উর্বরতা বৃদ্ধি</span>
                    <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${activeAccordion === 'organic' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'organic' && (
                    <div className="p-5 border-t border-emerald-500/15 text-text-primary bg-white animate-fade-in">
                      {formatMarkdown(scannerResult.organic_advice)}
                    </div>
                  )}
                </div>

                {/* 4. Chemical / Correction Advice */}
                <div className="border border-amber-500/15 rounded-2xl overflow-hidden bg-amber-500/5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === 'chemical' ? null : 'chemical')}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-amber-700 bg-amber-500/10 hover:bg-amber-500/15 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">🧪 ৩. অম্লত্ব/ক্ষারত্ব সংশোধন ও সুষম সার</span>
                    <ChevronDown className={`w-4 h-4 text-amber-700 transition-transform duration-200 ${activeAccordion === 'chemical' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'chemical' && (
                    <div className="p-5 border-t border-amber-500/15 text-text-primary bg-white animate-fade-in">
                      {formatMarkdown(scannerResult.chemical_advice)}
                    </div>
                  )}
                </div>

                {/* 5. Long-term Preventive / Soil Health */}
                {scannerResult.preventive_measures && (
                  <div className="border border-orange-500/15 rounded-2xl overflow-hidden bg-orange-500/5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(activeAccordion === 'preventive' ? null : 'preventive')}
                      className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-sm text-orange-700 bg-orange-500/10 hover:bg-orange-500/15 transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">🛡️ ৪. মাটি সংরক্ষণ ও দীর্ঘমেয়াদী যত্ন</span>
                      <ChevronDown className={`w-4 h-4 text-orange-700 transition-transform duration-200 ${activeAccordion === 'preventive' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeAccordion === 'preventive' && (
                      <div className="p-5 border-t border-orange-500/15 text-text-primary bg-white animate-fade-in">
                        {formatMarkdown(scannerResult.preventive_measures)}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Reset/New Scan/Download Buttons */}
              <div className="pt-4 border-t border-green-primary/10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
                  <button
                    type="button"
                    onClick={clearImage}
                    className="px-5 py-3 bg-green-primary hover:bg-green-soft text-soft-white text-xs md:text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-md text-center"
                  >
                    নতুন মাটি পরীক্ষা করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSoilPrescription(scannerResult, imgUrl, location)}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-soft-white text-xs md:text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-md text-center"
                  >
                    প্রেসক্রিপশন ডাউনলোড করুন
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/chat?q=${encodeURIComponent(`${location} জেলায় আমার মাটির ধরণ ${scannerResult.soil_type} এবং আনুমানিক pH মান ${scannerResult.estimated_ph}। এটি সংশোধন করতে পরামর্শ দিন`)}`);
                  }}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-green-primary/10 to-amber-500/10 hover:from-green-primary/15 hover:to-amber-500/15 border border-green-primary/20 rounded-2xl transition-all text-xs font-black text-green-primary shadow-sm hover:shadow-md cursor-pointer group shrink-0"
                >
                  <span className="flex items-center gap-1.5">💬 মাটির স্বাস্থ্য নিয়ে কথা বলুন</span>
                  <ArrowRight className="w-4 h-4 text-green-primary transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[350px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              {scanning ? (
                <div className="flex flex-col items-center space-y-3">
                  <Cpu className="w-12 h-12 text-green-primary animate-spin" />
                  <div>
                    <h4 className="font-bold text-text-primary">মাটি পরীক্ষা চলছে</h4>
                    <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold animate-pulse">
                      গাছের ডাক্তার মাটির গঠন ও pH বিশ্লেষণ করছেন। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Info className="w-12 h-12 text-green-primary/40 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-text-primary">মাটি পরীক্ষার ফলাফল দেখতে</h4>
                    <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                      বামদিকের জেলা সিলেক্ট করে মাটির একটি পরিষ্কার ও রোদেলা ছবি তুলুন অথবা আপলোড করুন এবং "গাছের ডাক্তারকে দেখান" বাটনে চাপুন।
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">মাটির অম্লত্ব, ক্ষারত্ব বা লবণাক্ততা সমস্যা কীভাবে সমাধান করবেন বুঝতে পারছেন না?</h4>
          <p className="text-xs text-text-secondary font-bold">আপনার মাটির ধরন ও বিস্তারিত লক্ষণ লিখে সরাসরি গাছের ডাক্তারের সাথে পরামর্শ করুন।</p>
        </div>
        <button 
          onClick={() => {
            router.push(`/chat?q=${encodeURIComponent(`মাটির পিএইচ (pH) অম্লত্ব ও ক্ষারত্ব দূর করার উপায় কি?`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>

    </div>
  );
}
