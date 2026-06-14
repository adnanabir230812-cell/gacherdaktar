'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Sprout, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Calculator, 
  User,
  HelpCircle,
  CornerDownRight,
  Info,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { detectUserDistrict } from '@/lib/location';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  image?: string;
  sources?: string[];
  confidence?: number;
  followUpQuestions?: string[];
  actionSuggestions?: Array<{
    label: string;
    action: string;
    params: any;
  }>;
  loading?: boolean;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (dataUrl: string, maxWidth: number = 600, maxHeight: number = 600, quality: number = 0.7): Promise<string> => {
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
      img.onerror = () => resolve(dataUrl);
    });
  };

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setAttachedImage(compressed);
        } catch (err) {
          setAttachedImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [district, setDistrict] = useState('');
  const [season, setSeason] = useState('বোরো');
  const [districts, setDistricts] = useState<any[]>([]);
  
  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Speech Synthesis States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Suggested Prompts
  const welcomeSuggestions = [
    { text: "ধানের পাতা হলুদ কেন?", label: "পাতা হলুদ" },
    { text: "বোরো ধানের সারের পরিমাণ", label: "বোরো সার" },
    { text: "টমেটোর নাবি ধসা রোগ", label: "টমেটো রোগ" },
    { text: "আলু চাষের সেচ পদ্ধতি", label: "আলুর সেচ" }
  ];

  // Fetch districts list
  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Lock body scroll, hide footer, and optimize main padding while the chat page is active
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Lock body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.height = '100dvh';
    
    let originalBodyPaddingBottom = '';
    if (isMobile) {
      originalBodyPaddingBottom = document.body.style.paddingBottom;
      document.body.style.setProperty('padding-bottom', '0px', 'important');
    }

    // Hide footer
    const footer = document.querySelector('footer');
    let originalFooterDisplay = '';
    if (footer) {
      originalFooterDisplay = footer.style.display;
      footer.style.display = 'none';
    }

    // Forcefully hide top developer banner and sticky header on mobile
    const banner = document.getElementById('developer-attribution-banner');
    const header = document.querySelector('header');
    let originalBannerDisplay = '';
    let originalHeaderDisplay = '';

    if (isMobile) {
      if (banner) {
        originalBannerDisplay = banner.style.display;
        banner.style.setProperty('display', 'none', 'important');
      }
      if (header) {
        originalHeaderDisplay = header.style.display;
        header.style.setProperty('display', 'none', 'important');
      }
    }

    // Shrink main padding to maximize vertical chat space
    const main = document.querySelector('main');
    let originalMainPadding = '';
    let originalMainMargin = '';
    let originalMainMaxWidth = '';
    let originalMainWidth = '';
    let originalMainPaddingTop = '';
    let originalMainPaddingBottom = '';
    let originalMainMarginBottom = '';
    
    if (main) {
      if (isMobile) {
        originalMainPadding = main.style.padding;
        originalMainMargin = main.style.margin;
        originalMainMaxWidth = main.style.maxWidth;
        originalMainWidth = main.style.width;

        main.style.setProperty('padding', '0px', 'important');
        main.style.setProperty('margin', '0px', 'important');
        main.style.setProperty('max-width', '100%', 'important');
        main.style.setProperty('width', '100%', 'important');
      } else {
        originalMainPaddingTop = main.style.paddingTop;
        originalMainPaddingBottom = main.style.paddingBottom;
        originalMainMarginBottom = main.style.marginBottom;

        main.style.paddingTop = '0.5rem';
        main.style.paddingBottom = '0.5rem';
        main.style.marginBottom = '0px';
      }
    }

    return () => {
      // Restore styles when unmounting chat
      document.body.style.overflow = '';
      document.body.style.height = '';
      if (isMobile) {
        document.body.style.paddingBottom = originalBodyPaddingBottom;
      }
      if (footer) {
        footer.style.display = originalFooterDisplay;
      }
      if (banner && isMobile) {
        banner.style.display = originalBannerDisplay;
      }
      if (header && isMobile) {
        header.style.display = originalHeaderDisplay;
      }
      if (main) {
        if (isMobile) {
          main.style.padding = originalMainPadding;
          main.style.margin = originalMainMargin;
          main.style.maxWidth = originalMainMaxWidth;
          main.style.width = originalMainWidth;
        } else {
          main.style.paddingTop = originalMainPaddingTop;
          main.style.paddingBottom = originalMainPaddingBottom;
          main.style.marginBottom = originalMainMarginBottom;
        }
      }
    };
  }, []);

  // Initialize Speech Recognition Support Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  // Helper to start recognition dynamically
  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    } catch (e) {
      console.error(e);
    }

    const rec = new SpeechRecognition();
    rec.lang = 'bn-BD';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setIsListening(false);
      if (e.error === 'not-allowed') {
        alert('ভয়েস ইনপুট দেওয়ার জন্য অনুগ্রহ করে আপনার ব্রাউজারের অ্যাড্রেস বারের বামে থাকা লক (Lock) আইকনে ক্লিক করে মাইক্রোফোন পারমিশনটি (Microphone Permission) Allow বা অন করে দিন।');
      } else if (e.error === 'service-not-allowed') {
        alert('আপনার ব্রাউজারে স্পিচ সার্ভিস অনুমতি নেই। অনুগ্রহ করে গুগল ক্রোম বা সাফারি ব্রাউজার ব্যবহার করুন।');
      } else if (e.error === 'audio-capture') {
        alert('আপনার ডিভাইসে কোনো সচল মাইক্রোফোন খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সংযোগটি চেক করুন।');
      }
    };

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (text) {
        setInput(text);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  // Automatically scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial query from search params
  useEffect(() => {
    // Add custom welcome message
    const welcomeMsg: Message = {
      id: 'welcome',
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! আমি **গাছের ডাক্তার**।\n\nআমি আপনাকে ফসল চাষাবাদে সারের সঠিক অনুপাত প্রয়োগ, মাটি উর্বর রাখার কৌশল, এবং ফসলের বিভিন্ন রোগবালাই প্রতিকার ও প্রতিরোধের উপায় সম্পর্কে বিস্তারিত বইয়ের মতো করে পরামর্শ দিতে পারি।\n\nআপনার ফসলের যেকোনো সমস্যা নিচে বাংলায় বিস্তারিত লিখুন।'
    };
    
    if (initialQuery) {
      setMessages([
        welcomeMsg,
        { id: 'init-user', sender: 'user', text: initialQuery }
      ]);
      sendMessageToAPI(initialQuery, [welcomeMsg]);
    } else {
      setMessages([welcomeMsg]);
    }
  }, [initialQuery]);


  // Clean markdown style tags before speaking
  const cleanForSpeech = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
      .replace(/\*(.*?)\*/g, '$1') // remove italic
      .replace(/[`#_\-]/g, '') // remove code, headers, bullets
      .replace(/[\n\r]+/g, ' । ') // replace newlines with strong pauses
      .trim();
  };

  // Text to Speech Function using backend TTS API
  const speakText = (text: string, messageId: string) => {
    if (isSpeaking && currentlySpeakingId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setCurrentlySpeakingId(null);

    try {
      const cleaned = cleanForSpeech(text);
      setCurrentlySpeakingId(messageId);
      setIsSpeaking(true); // Shows playing indicator

      const audioUrl = `/api/tts?text=${encodeURIComponent(cleaned)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setCurrentlySpeakingId(messageId);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };

      audio.onerror = (err) => {
        console.error('Audio playback error:', err);
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };

      audio.play();
    } catch (err) {
      console.error('Speech synthesis failed:', err);
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    } else {
      setInput('');
      startListening();
    }
  };

  // Trigger chatbot request
  const sendMessageToAPI = async (textToSend: string, currentHistory: Message[]) => {
    const userMsgId = 'user-' + Date.now();
    const botMsgId = 'bot-' + Date.now();

    const imageToSend = attachedImage;
    setAttachedImage(null);

    // Prepare message history
    const updatedMessages = [
      ...currentHistory,
      { id: userMsgId, sender: 'user' as const, text: textToSend, image: imageToSend || undefined },
      { id: botMsgId, sender: 'bot' as const, text: '', loading: true }
    ];
    setMessages(updatedMessages);

    // Filter and format history for the API
    const chatHistory = currentHistory
      .filter(m => m.id !== 'welcome' && !m.loading)
      .map(m => ({
        sender: m.sender,
        text: m.text
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: textToSend,
          history: chatHistory,
          district: district || undefined,
          season: season,
          image: imageToSend || undefined
        })
      });

      let data: any = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`সার্ভার থেকে ত্রুটিপূর্ণ রেসপন্স পাওয়া গেছে (স্ট্যাটাস কোড: ${response.status})`);
      }

      if (response.ok && data && !data.error) {
        setMessages(prev => prev.map(m => {
          if (m.id === botMsgId) {
            return {
              id: botMsgId,
              sender: 'bot',
              text: data.answer_bn || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।',
              sources: data.sources || [],
              confidence: data.confidence,
              followUpQuestions: data.follow_up_questions || [],
              actionSuggestions: data.action_suggestions || [],
              loading: false
            };
          }
          return m;
        }));
      } else {
        throw new Error(data.message || data.error || `সার্ভার ত্রুটি (স্ট্যাটাস কোড: ${response.status})`);
      }

    } catch (error: any) {
      console.error(error);
      let errorMsg = 'দুঃখিত, ইন্টারনেট সংযোগ না থাকায় বা সার্ভার সমস্যার কারণে গাছের ডাক্তারের লাইভ সেবা এই মুহূর্তে সচল নেই। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ সচল করে আবার চেষ্টা করুন।';
      if (error && error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch failed')) {
          errorMsg = 'দুঃখিত, আপনার ইন্টারনেট সংযোগে সমস্যা হচ্ছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।';
        } else {
          errorMsg = `ত্রুটি: ${error.message}`;
        }
      }
      setMessages(prev => prev.map(m => {
        if (m.id === botMsgId) {
          return {
            id: botMsgId,
            sender: 'bot',
            text: errorMsg,
            sources: ['নেটওয়ার্ক বা সার্ভার ত্রুটি'],
            loading: false
          };
        }
        return m;
      }));
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setInput('');
    sendMessageToAPI(text, messages);
  };

  // Handler for action buttons inside bot messages
  const handleActionClick = (actionObj: { action: string; label: string; params?: any }) => {
    if (actionObj.action === 'open_fertilizer_calc') {
      router.push('/calculator');
    } else if (actionObj.action === 'open_crops') {
      router.push('/crops');
    }
  };

  // Helper to render markdown-like lists and bold texts in Bangla
  const formatMessageText = (text: string) => {
    if (!text) return '';
    const cleanText = String(text);
    return cleanText.split('\n').map((line, lineIdx) => {
      let cleanLine = line.trim();
      let isBullet = false;

      if ((cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || cleanLine.startsWith('• ')) && !cleanLine.startsWith('**')) {
        isBullet = true;
        cleanLine = cleanLine.replace(/^[-*•]\s+/, '');
      }

      if (cleanLine.startsWith('#')) {
        cleanLine = cleanLine.replace(/^#+\s*/, '');
      }

      const parts: (string | React.ReactNode)[] = [];
      const regex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;
      let partIdx = 0;

      while ((match = regex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index).replace(/\*\*/g, '').replace(/\*/g, ''));
        }
        parts.push(
          <strong key={partIdx++} className="font-extrabold text-green-primary">
            {match[1].replace(/\*\*/g, '').replace(/\*/g, '')}
          </strong>
        );
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex).replace(/\*\*/g, '').replace(/\*/g, ''));
      }
      const content = parts.length > 0 ? parts : [cleanLine.replace(/\*\*/g, '').replace(/\*/g, '')];

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-5 list-disc my-1 text-sm md:text-base leading-relaxed">
            {content}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="my-1 text-sm md:text-base leading-relaxed">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="chat-page-wrapper relative h-[calc(100dvh-64px)] md:h-[calc(100vh-160px)] flex flex-col z-10 max-w-5xl mx-auto overflow-hidden px-2 md:px-4 py-2">
      {/* Mobile viewport alignment style overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          #developer-attribution-banner {
            display: none !important;
          }
          header {
            display: none !important;
          }
          main {
            padding: 0px !important;
            margin: 0px !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          html, body {
            padding: 0px !important;
            margin: 0px !important;
            overflow: hidden !important;
            height: 100dvh !important;
          }
          .chat-page-wrapper {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 100dvh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            padding: 8px 8px 12px 8px !important;
            background: #FAF8F2 !important;
            z-index: 9999 !important;
          }
        }
      `}} />

      {/* Cinematic Golden Glow Sunlight Background */}
      <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] rounded-full sunlight-glow pointer-events-none z-0" />

      {/* TOP HEADER CONTROLS */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-4 bg-soft-white/70 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-green-primary/10 mb-2 md:mb-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-green-primary/10 rounded-full transition-colors text-text-secondary"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-text-primary text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-primary animate-pulse" />
              গাছের ডাক্তার
            </h1>
            <p className="text-[10px] md:text-xs text-text-secondary">ফসল ও গাছের নির্ভরযোগ্য চিকিৎসা ও পরামর্শ কেন্দ্র</p>
          </div>
        </div>

      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="relative z-10 flex-1 overflow-y-auto bg-soft-white/60 border border-green-primary/10 rounded-2xl p-3 md:p-6 mb-2 md:mb-4 shadow-inner flex flex-col gap-3 md:gap-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-soft-white font-bold text-xs ${
              msg.sender === 'user' ? 'bg-soil-brown' : 'bg-green-primary'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2">
              <div className={`p-4 rounded-2xl shadow-sm text-text-primary ${
                msg.sender === 'user' 
                  ? 'bg-soil-warm/60 border border-soil-brown/10 rounded-tr-none' 
                  : 'bg-soft-white border border-green-primary/10 rounded-tl-none'
              }`}>
                {msg.loading ? (
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-sm text-text-secondary animate-pulse">গাছের ডাক্তার ভাবছেন</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {msg.image && (
                      <div className="mb-2 max-w-xs overflow-hidden rounded-xl border border-green-primary/10 bg-black/5 shadow-sm">
                        <img src={msg.image} alt="সংযুক্ত ছবি" className="max-h-48 object-contain w-full" />
                      </div>
                    )}
                    {formatMessageText(msg.text)}

                    {/* Text To Speech Control */}
                    {msg.sender === 'bot' && msg.id !== 'welcome' && (
                      <div className="flex justify-end pt-2 border-t border-green-primary/5">
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                            currentlySpeakingId === msg.id 
                              ? 'bg-green-primary text-soft-white scale-105' 
                              : 'bg-green-primary/10 text-green-primary hover:bg-green-primary/20'
                          }`}
                        >
                          {currentlySpeakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              পজ করুন
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              পড়ুন (ভয়েস)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bot Meta Information: Sources & Confidence & Action buttons */}
              {!msg.loading && msg.sender === 'bot' && (
                <div className="px-2 space-y-2">
                  {/* Action Suggestions */}
                  {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.actionSuggestions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-primary/10 border border-green-primary/20 text-xs font-bold text-green-primary hover:bg-green-primary hover:text-soft-white hover:border-transparent transition-all cursor-pointer shadow-sm"
                        >
                          {act.action === 'open_fertilizer_calc' ? <Calculator className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sources display */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[10px] text-text-secondary">
                      <span className="font-bold flex items-center gap-0.5"><Info className="w-3 h-3 text-green-primary" /> তথ্যসূত্র:</span>
                      {msg.sources.map((src, i) => (
                        <span key={i} className="bg-green-primary/5 border border-green-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}


                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK CHIPS SUGGESTIONS (only shown initially or when there's only welcome message) */}
      {messages.length === 1 && (
        <div className="relative z-10 px-2 md:px-4 mb-2 md:mb-4 shrink-0">
          <p className="text-[11px] md:text-xs font-bold text-text-secondary mb-1.5 md:mb-2">সহজে শুরু করতে ক্লিক করুন:</p>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {welcomeSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sendMessageToAPI(item.text, messages);
                }}
                className="px-3.5 py-2 rounded-full text-xs font-bold bg-green-primary/5 hover:bg-green-primary/15 border border-green-primary/10 text-green-primary transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Attachment Preview */}
      {attachedImage && (
        <div className="relative z-10 mx-2 mb-2 p-2 bg-soft-white border border-green-primary/10 rounded-xl flex items-center gap-3 w-max max-w-xs shadow-sm animate-fade-in shrink-0">
          <img src={attachedImage} alt="সংযুক্ত ছবি প্রিভিউ" className="w-12 h-12 rounded-lg object-cover border border-green-primary/10" />
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-[10px] font-bold text-green-primary truncate">ছবি সংযুক্ত করা হয়েছে</p>
            <p className="text-[9px] text-text-secondary truncate">পোস্টের সাথে ডাক্তার যাচাই করবে</p>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="absolute top-1 right-1 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors cursor-pointer"
            title="ছবি বাদ দিন"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* INPUT FORM AND VOICE CONTROL */}
      <form onSubmit={handleSend} className="relative z-10 bg-soft-white border border-green-primary/10 p-2 md:p-3 rounded-2xl shadow-md flex items-center gap-2 shrink-0">
        {/* Hidden Image Input */}
        <input
          type="file"
          accept="image/*"
          ref={chatFileInputRef}
          onChange={handleChatImageUpload}
          className="hidden"
        />

        {/* Image Upload Trigger Button */}
        <button
          type="button"
          onClick={() => chatFileInputRef.current?.click()}
          className="p-3 rounded-full bg-green-primary/10 text-green-primary hover:bg-green-primary/20 transition-all cursor-pointer shrink-0"
          title="ছবি যুক্ত করুন"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ফসলের রোগ বা চাষ পদ্ধতি নিয়ে লিখুন..."
          className="flex-1 px-4 py-3 rounded-xl border border-green-primary/10 bg-warm-bg/20 focus:outline-none focus:ring-1 focus:ring-green-primary text-sm md:text-base text-text-primary placeholder-text-secondary/60"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className={`p-3 rounded-full transition-all flex items-center justify-center ${
            input.trim() 
              ? 'bg-green-primary hover:bg-green-soft text-soft-white cursor-pointer shadow-md' 
              : 'bg-green-primary/5 text-text-secondary/30 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Info Footnote */}
      <p className="text-[9px] md:text-[10px] text-center text-text-secondary/70 mt-1 md:mt-2">
        গাছের ডাক্তার বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) ও বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) নির্দেশিকা অনুযায়ী পরামর্শ দিয়ে থাকেন।
      </p>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

