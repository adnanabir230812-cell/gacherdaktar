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
  Info
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
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


  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
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
        // Find default or fallback
      })
      .catch(err => console.error(err));
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.lang = 'bn-BD';
        rec.continuous = false;
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onerror = (e: any) => {
          console.error('Speech recognition error', e);
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          if (resultText) {
            setInput(resultText);
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

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
      text: 'আসসালামু আলাইকুম! আমি **গাছের ডাক্তার**।\n\nআমি আপনাকে ফসল চাষাবাদে সারের সঠিক অনুপাত প্রয়োগ, মাটি উর্বর রাখার কৌশল, এবং ফসলের বিভিন্ন রোগবালাই প্রতিকার ও প্রতিরোধের উপায় সম্পর্কে বিস্তারিত বইয়ের মতো করে পরামর্শ দিতে পারি।\n\nআপনার ফসলের যেকোনো সমস্যা নিচে বাংলায় বিস্তারিত লিখুন অথবা কথা বলতে মাইক্রোফোন বাটন ব্যবহার করুন।'
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

  // Text to Speech Function
  const speakText = (text: string, messageId: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (isSpeaking && currentlySpeakingId === messageId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleaned = cleanForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'bn-BD';

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };

      setCurrentlySpeakingId(messageId);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
    }
  };

  // Trigger chatbot request
  const sendMessageToAPI = async (textToSend: string, currentHistory: Message[]) => {
    const userMsgId = 'user-' + Date.now();
    const botMsgId = 'bot-' + Date.now();

    // Prepare message history
    const updatedMessages = [
      ...currentHistory,
      { id: userMsgId, sender: 'user' as const, text: textToSend },
      { id: botMsgId, sender: 'bot' as const, text: '', loading: true }
    ];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: textToSend,
          district: district,
          season: season
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
    const parseBold = (str: string) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          parts.push(str.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-green-primary">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
      }
      return parts.length > 0 ? parts : str;
    };

    return text.split('\n').map((line, idx) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const itemContent = trimmedLine.substring(1).trim();
        return (
          <li key={idx} className="ml-5 list-disc my-1 text-sm md:text-base leading-relaxed">
            {parseBold(itemContent)}
          </li>
        );
      }
      
      return (
        <p key={idx} className="my-1 text-sm md:text-base leading-relaxed">
          {parseBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col z-10 max-w-5xl mx-auto">
      {/* Cinematic Golden Glow Sunlight Background */}
      <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] rounded-full sunlight-glow pointer-events-none z-0" />

      {/* TOP HEADER CONTROLS */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-soft-white/70 backdrop-blur-md p-4 rounded-2xl border border-green-primary/10 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-green-primary/10 rounded-full transition-colors text-text-secondary"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-text-primary text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-primary animate-pulse" />
              গাছের ডাক্তার 🩺
            </h1>
            <p className="text-xs text-text-secondary">ফসল ও গাছের নির্ভরযোগ্য চিকিৎসা ও পরামর্শ কেন্দ্র</p>
          </div>
        </div>

        {/* District and Season selection for localized context */}
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 bg-green-primary/5 px-3 py-1.5 rounded-full border border-green-primary/10">
            <span className="text-text-secondary font-medium">জেলা:</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-transparent border-none text-green-primary font-bold focus:outline-none cursor-pointer"
            >
              {districts.map((d, idx) => (
                <option key={idx} value={d.name_bn} className="text-text-primary">{d.name_bn}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-green-primary/5 px-3 py-1.5 rounded-full border border-green-primary/10">
            <span className="text-text-secondary font-medium">ঋতু:</span>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="bg-transparent border-none text-green-primary font-bold focus:outline-none cursor-pointer"
            >
              <option value="বোরো" className="text-text-primary">বোরো</option>
              <option value="আমন" className="text-text-primary">আমন</option>
              <option value="আউশ" className="text-text-primary">আউশ</option>
              <option value="রবি" className="text-text-primary">রবি</option>
              <option value="খরিপ" className="text-text-primary">খরিপ</option>
            </select>
          </div>
        </div>
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="relative z-10 flex-1 min-h-[400px] max-h-[55vh] overflow-y-auto bg-soft-white/60 border border-green-primary/10 rounded-2xl p-4 md:p-6 mb-4 shadow-inner flex flex-col gap-4">
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

                  {/* Follow-up Questions */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                        <CornerDownRight className="w-3 h-3 text-green-primary" />
                        আপনি চাইলে জিজ্ঞেস করতে পারেন:
                      </p>
                      <div className="flex flex-col gap-1 items-start">
                        {msg.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              sendMessageToAPI(q, messages);
                            }}
                            className="text-xs text-green-primary hover:underline font-medium text-left cursor-pointer"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
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
        <div className="relative z-10 px-4 mb-4">
          <p className="text-xs font-bold text-text-secondary mb-2">সহজে শুরু করতে ক্লিক করুন:</p>
          <div className="flex flex-wrap gap-2">
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

      {/* INPUT FORM AND VOICE CONTROL */}
      <form onSubmit={handleSend} className="relative z-10 bg-soft-white border border-green-primary/10 p-3 rounded-2xl shadow-md flex items-center gap-2">
        {speechSupported ? (
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              isListening 
                ? 'bg-red-500 text-soft-white animate-pulse' 
                : 'bg-green-primary/10 text-green-primary hover:bg-green-primary/20'
            }`}
            title={isListening ? 'শোনা বন্ধ করুন' : 'কথা বলুন (বাংলা)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        ) : (
          <div className="p-3 rounded-full bg-green-primary/5 text-text-secondary/40 cursor-not-allowed" title="ভয়েস ইনপুট সমর্থিত নয়">
            <MicOff className="w-5 h-5" />
          </div>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'শুনছি... বলুন' : 'ফসলের রোগ বা চাষ পদ্ধতি নিয়ে লিখুন...'}
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
      <p className="text-[10px] text-center text-text-secondary/70 mt-2">
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

