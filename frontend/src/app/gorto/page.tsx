"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  User, 
  BarChart3, 
  Eye, 
  Scan, 
  Users, 
  CheckCircle, 
  ShieldAlert, 
  LogOut, 
  RefreshCw, 
  Download, 
  Trash2,
  MapPin,
  MessageSquare,
  Sprout,
  CloudSun,
  Laptop,
  Play,
  Pause,
  X,
  Droplet,
  Shield,
  Coins,
  Wrench,
  Search,
  BookOpen
} from 'lucide-react';

interface LogEntry {
  id: number;
  crop_name: string;
  disease_name: string;
  confidence: number;
  image_url?: string;
  location: string;
  created_at: string;
}

interface ActivityEntry {
  id: number;
  session_id: string;
  user_agent: string;
  ip_address?: string;
  page_visited: string;
  action: string;
  location: string;
  metadata?: any;
  created_at: string;
}

interface AttemptEntry {
  id: number;
  ip_address: string;
  username: string;
  attempt_time: string;
  is_successful: boolean;
}

interface Stats {
  totalScans: number;
  averageConfidence: string;
  totalPageViews: number;
  activeSessions: number;
  cropCounts: Record<string, number>;
  diseaseCounts: Record<string, number>;
  pageCounts: Record<string, number>;
}

type TabType = 
  | 'scans' 
  | 'soil' 
  | 'chats' 
  | 'fertilizer' 
  | 'pesticide' 
  | 'seeds' 
  | 'matchmaker' 
  | 'rotation' 
  | 'prices' 
  | 'loans' 
  | 'weather' 
  | 'pages' 
  | 'security';

export default function AdminDashboard() {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('scans');

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [attempts, setAttempts] = useState<AttemptEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [clearing, setClearing] = useState(false);

  // Lightbox Modal for Scan Images
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Auto Refresh States (60 seconds)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check session cookie on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/data');
        if (res.status === 200) {
          setIsLoggedIn(true);
          fetchDashboardData();
        } else {
          setIsLoggedIn(false);
          setLoadingData(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setLoadingData(false);
      }
    };
    checkSession();
  }, []);

  // Auto-refresh countdown management
  useEffect(() => {
    if (isLoggedIn && autoRefreshEnabled) {
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchDashboardData();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoggedIn, autoRefreshEnabled]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsLoggedIn(true);
        fetchDashboardData();
      } else {
        setLoginError(data.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setLoginError('নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    document.cookie = 'krishisathi_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsLoggedIn(false);
    setStats(null);
    setLogs([]);
    setActivities([]);
    setAttempts([]);
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLogs(data.logs);
        setActivities(data.analytics);
        setAttempts(data.attempts);
      } else if (res.status === 401) {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleClearData = async (target: 'diagnostics' | 'analytics' | 'attempts') => {
    const confirmation = window.confirm(`আপনি কি নিশ্চিতভাবে এই উপাত্তগুলো মুছে ফেলতে চান? এটি আর ফেরত আনা যাবে না।`);
    if (!confirmation) return;

    setClearing(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      if (res.ok) {
        alert("উপাত্ত সফলভাবে মুছে ফেলা হয়েছে।");
        fetchDashboardData();
      } else {
        alert("উপাত্ত মুছতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  // Advanced flattened CSV Downloader
  const downloadCustomCSV = (tab: TabType) => {
    let dataArray: any[] = [];
    let headers: string[] = [];
    let filename = `gacherdoctor_${tab}_logs`;

    if (tab === 'scans') {
      const filtered = logs.filter(l => l.crop_name !== 'মাটি (Soil)' && !l.crop_name.includes('মাটি'));
      headers = ['ID', 'Crop Name', 'Disease Name', 'Confidence Score', 'Location', 'Date Created'];
      dataArray = filtered.map(l => [
        l.id,
        l.crop_name,
        l.disease_name,
        `${(Number(l.confidence) * 100).toFixed(0)}%`,
        l.location || 'Unknown',
        new Date(l.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'soil') {
      const filtered = logs.filter(l => l.crop_name === 'মাটি (Soil)' || l.crop_name.includes('মাটি'));
      headers = ['ID', 'Soil Texture Type', 'Estimated pH', 'Location', 'Date Created'];
      dataArray = filtered.map(l => [
        l.id,
        l.disease_name, // stores soil texture type
        l.confidence, // stores estimated pH in confidence for soil tests
        l.location || 'Unknown',
        new Date(l.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'chats') {
      const filtered = activities.filter(a => a.action === 'chat');
      headers = ['ID', 'Session ID', 'Location', 'User Query', 'Chatbot Response', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.location || 'Unknown',
        a.metadata?.query || 'N/A',
        a.metadata?.response || 'N/A',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'fertilizer') {
      const filtered = activities.filter(a => a.action === 'fertilizer_calc');
      headers = ['ID', 'Session ID', 'Crop Name', 'Land Size (Bigha)', 'Season', 'Urea Dose (kg)', 'TSP Dose (kg)', 'MoP (kg)', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.metadata?.cropName || 'N/A',
        a.metadata?.landSize || '0',
        a.metadata?.season || 'N/A',
        a.metadata?.urea_kg || '0',
        a.metadata?.tsp_kg || '0',
        a.metadata?.mop_kg || '0',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'pesticide') {
      const filtered = activities.filter(a => a.action === 'pesticide_calc');
      headers = ['ID', 'Session ID', 'Crop Name', 'Class', 'Form', 'Severity', 'Tank Size (L)', 'Plot Area', 'Total Chemical Needed', 'Tanks Needed', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.metadata?.crop || 'N/A',
        a.metadata?.pesticideClass || 'N/A',
        a.metadata?.pesticideForm || 'N/A',
        a.metadata?.severity || 'N/A',
        a.metadata?.tankSize || '0',
        a.metadata?.landArea || '0',
        a.metadata?.totalChemicalNeeded || '0',
        a.metadata?.tanksNeeded || '0',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'seeds') {
      const filtered = activities.filter(a => a.action === 'seed_calc');
      headers = ['ID', 'Session ID', 'Crop Name', 'Land Size', 'Unit', 'Seed Weight Required (kg)', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.metadata?.cropName || 'N/A',
        a.metadata?.landSize || '0',
        a.metadata?.landUnit || 'N/A',
        a.metadata?.totalSeedWeight || '0',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'matchmaker') {
      const filtered = activities.filter(a => a.action === 'crop_matchmaker');
      headers = ['ID', 'Session ID', 'Location Selected', 'Soil Type', 'Season', 'Match Count', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.location || 'Unknown',
        a.metadata?.soilType || 'N/A',
        a.metadata?.season || 'N/A',
        a.metadata?.recommendationCount || '0',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'rotation') {
      const filtered = activities.filter(a => a.action === 'crop_rotation');
      headers = ['ID', 'Session ID', 'Location', 'Selected Crop', 'Season', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.location || 'Unknown',
        a.metadata?.cropName || 'N/A',
        a.metadata?.season || 'N/A',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'loans') {
      const filtered = activities.filter(a => a.action === 'loan_check');
      headers = ['ID', 'Session ID', 'Location', 'Scheme Title', 'Provider', 'Type', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.location || 'Unknown',
        a.metadata?.schemeTitle || 'N/A',
        a.metadata?.schemeProvider || 'N/A',
        a.metadata?.schemeType || 'N/A',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'prices') {
      const filtered = activities.filter(a => a.action === 'market_price_check');
      headers = ['ID', 'Session ID', 'Location', 'Crop Name Searched', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.location || 'Unknown',
        a.metadata?.cropName || 'N/A',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'weather') {
      const filtered = activities.filter(a => a.action === 'weather_search');
      headers = ['ID', 'Session ID', 'District Searched', 'Temperature (°C)', 'Weather Condition', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.metadata?.district || 'N/A',
        a.metadata?.temp || 'N/A',
        a.metadata?.condition || 'N/A',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'pages') {
      const filtered = activities.filter(a => a.action === 'visit');
      headers = ['ID', 'Session ID', 'Visited Path', 'IP Address', 'User Agent', 'Date Created'];
      dataArray = filtered.map(a => [
        a.id,
        a.session_id,
        a.page_visited,
        a.ip_address || 'Unknown',
        a.user_agent || 'Unknown',
        new Date(a.created_at).toLocaleString('en-US')
      ]);
    } else if (tab === 'security') {
      headers = ['ID', 'IP Address', 'Username Input', 'Successful Login', 'Date Tried'];
      dataArray = attempts.map(att => [
        att.id,
        att.ip_address,
        att.username,
        att.is_successful ? 'YES' : 'NO',
        new Date(att.attempt_time).toLocaleString('en-US')
      ]);
    }

    if (dataArray.length === 0) {
      alert("ডাউনলোড করার মতো কোনো উপাত্ত নেই।");
      return;
    }

    // Escape and format values for clean CSV parsing
    const csvRows = [
      headers.join(','),
      ...dataArray.map((row: any[]) => 
        row.map((val: any) => {
          const strVal = String(val);
          return `"${strVal.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs for different tabs
  const leafScans = logs.filter(l => l.crop_name !== 'মাটি (Soil)' && !l.crop_name.includes('মাটি'));
  const soilScans = logs.filter(l => l.crop_name === 'মাটি (Soil)' || l.crop_name.includes('মাটি'));
  
  const chatLogs = activities.filter(a => a.action === 'chat');
  const fertilizerLogs = activities.filter(a => a.action === 'fertilizer_calc');
  const pesticideLogs = activities.filter(a => a.action === 'pesticide_calc');
  const seedLogs = activities.filter(a => a.action === 'seed_calc');
  const matchmakerLogs = activities.filter(a => a.action === 'crop_matchmaker');
  const rotationLogs = activities.filter(a => a.action === 'crop_rotation');
  const loanLogs = activities.filter(a => a.action === 'loan_check');
  const priceLogs = activities.filter(a => a.action === 'market_price_check');
  const weatherLogs = activities.filter(a => a.action === 'weather_search');
  const generalPageLogs = activities.filter(a => a.action === 'visit');

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 p-6">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-emerald-600 w-12 h-12" />
          <p className="text-lg font-semibold animate-pulse">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // 1. Secure Login Page Layout
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-100 to-green-50 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full max-w-md bg-white border border-emerald-500/10 rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-500" />
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-2">
              <Lock className="text-emerald-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-wide">নিরাপদ অ্যাডমিন প্যানেল</h1>
            <p className="text-sm text-slate-500 font-semibold">থিসিস অ্যানালিটিক্স ও ব্যবহারকারী লগ ড্যাশবোর্ড</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">ইউজারনেম</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="অ্যাডমিন ইউজারনেম"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="অ্যাডমিন পাসওয়ার্ড"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {loginError && (
              <div className="flex gap-2 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] transition-transform text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[10px] text-rose-500/80 border border-rose-500/10 px-3 py-1.5 rounded-full bg-rose-50 inline-block font-semibold">
              ⚠️ সতর্কবার্তা: ভুল লগইন চেষ্টা ৩ বার হলে আইপি ৩০ মিনিটের জন্য লক হবে।
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Dashboard Page Layout (Premium Light Mode)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 space-y-6">
      
      {/* Lightbox Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 relative shadow-2xl border border-slate-100 animate-fade-in">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden relative bg-slate-50 flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Diagnosed Crop Scan" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Header Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <BarChart3 className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full">KrishiSathi Platform Admin</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">অ্যাডমিন এনালিটিক্স ও ব্যবহারকারী ড্যাশবোর্ড</h1>
          <p className="text-sm text-slate-500 font-semibold">থিসিস গবেষণা পরিসংখ্যান ও প্রতিটি ফিচারের রিয়েল-টাইম ডাটা লগ</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
          {/* Auto Refresh Progress bar */}
          {autoRefreshEnabled && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-2 rounded-xl text-xs font-bold w-full sm:w-auto justify-center">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>প্রতি মিনিটে অটো রিলোড: {countdown} সেকেন্ড</span>
            </div>
          )}

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                autoRefreshEnabled 
                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={autoRefreshEnabled ? "অটো রিলোড বন্ধ করুন" : "অটো রিলোড চালু করুন"}
            >
              {autoRefreshEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {autoRefreshEnabled ? 'পজ' : 'অটো রান'}
            </button>

            <button 
              onClick={fetchDashboardData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              লগআউট
            </button>
          </div>
        </div>
      </div>

      {loadingData && !stats && (
        <div className="flex items-center justify-center p-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <RefreshCw className="animate-spin text-emerald-600 w-10 h-10" />
        </div>
      )}

      {stats && (
        <>
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-sm">
              <div className="absolute right-4 top-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-600">
                <Scan className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">রোগ নির্ণয় স্ক্যান</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{leafScans.length} বার</h3>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                ফসলের রোগ সনাক্ত
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-sm">
              <div className="absolute right-4 top-4 bg-cyan-50 p-3 rounded-xl border border-cyan-100 text-cyan-600">
                <Droplet className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">মাটি ও পিএইচ পরীক্ষা</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{soilScans.length} বার</h3>
              <p className="text-[11px] text-cyan-600 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                মাটি উর্বরতা সংশোধন
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-sm">
              <div className="absolute right-4 top-4 bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-500">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">সক্রিয় সেশন আইডি</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{stats.activeSessions}টি</h3>
              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                অনন্য ব্যবহারকারী ট্র্যাকিং
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-sm">
              <div className="absolute right-4 top-4 bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-600">
                <Eye className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট পেজ ভিউ</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{stats.totalPageViews} ভিউ</h3>
              <p className="text-[11px] text-purple-600 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                ট্র্যাকার সক্রিয় ও সচল
              </p>
            </div>
          </div>

          {/* Visualization Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crop Scan Distribution */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Scan className="text-emerald-600 w-4 h-4" />
                  রোগ নির্ণয় শস্য বিভাজন
                </h3>
                <span className="text-[11px] font-bold text-slate-500">মোট শস্য জাত: {Object.keys(stats.cropCounts).length}টি</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(stats.cropCounts).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 col-span-2">কোনো শস্য স্ক্যান তথ্য নেই।</p>
                ) : (
                  Object.entries(stats.cropCounts).slice(0, 8).map(([crop, count]) => {
                    const percentage = stats.totalScans > 0 ? (count / stats.totalScans) * 100 : 0;
                    return (
                      <div key={crop} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800">{crop}</span>
                          <span className="font-black text-emerald-600">{count} বার ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Platform Feature Usage Statistics (SVG Chart) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="text-amber-500 w-4 h-4" />
                  ফিচার ব্যবহারের হার
                </h3>
                <span className="text-[11px] font-bold text-slate-500">অ্যাক্টিভিটি অ্যানালিটিক্স</span>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                {[
                  { name: 'রোগ নির্ণয় স্ক্যান', count: leafScans.length, color: 'bg-emerald-500' },
                  { name: 'মাটি ও pH পরীক্ষা', count: soilScans.length, color: 'bg-cyan-500' },
                  { name: 'চ্যাটবট কনভারসেশন', count: chatLogs.length, color: 'bg-indigo-500' },
                  { name: 'সার হিসাব গণনা', count: fertilizerLogs.length, color: 'bg-lime-500' },
                  { name: 'কীটনাশক স্প্রে হিসাব', count: pesticideLogs.length, color: 'bg-amber-500' },
                  { name: 'বীজ বপন পরিমাপ', count: seedLogs.length, color: 'bg-teal-500' },
                ].map((item, idx) => {
                  const totalFeatures = leafScans.length + soilScans.length + chatLogs.length + fertilizerLogs.length + pesticideLogs.length + seedLogs.length || 1;
                  const ratio = (item.count / totalFeatures) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-bold text-slate-900">{item.count} বার ({ratio.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${ratio}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Categorized Tab System (Separate features logs) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm border-t-4 border-t-emerald-600">
            {/* Scrollable responsive tab bar */}
            <div className="flex items-center overflow-x-auto gap-2 border-b border-slate-200 pb-3 no-scrollbar">
              {[
                { id: 'scans', label: 'শস্য রোগ সনাক্ত', count: leafScans.length, icon: Scan },
                { id: 'soil', label: 'মাটি পরীক্ষা', count: soilScans.length, icon: Droplet },
                { id: 'chats', label: 'চ্যাটবট', count: chatLogs.length, icon: MessageSquare },
                { id: 'fertilizer', label: 'সার গণনা', count: fertilizerLogs.length, icon: Sprout },
                { id: 'pesticide', label: 'কীটনাশক', count: pesticideLogs.length, icon: Wrench },
                { id: 'seeds', label: 'বীজ বপন', count: seedLogs.length, icon: BookOpen },
                { id: 'matchmaker', label: 'ফসল ম্যাচমেকার', count: matchmakerLogs.length, icon: Sprout },
                { id: 'rotation', label: 'শস্য পর্যায়', count: rotationLogs.length, icon: RefreshCw },
                { id: 'prices', label: 'বাজার দর', count: priceLogs.length, icon: Coins },
                { id: 'loans', label: 'কৃষি ঋণ', count: loanLogs.length, icon: Shield },
                { id: 'weather', label: 'আবহাওয়া ও সেচ', count: weatherLogs.length, icon: CloudSun },
                { id: 'pages', label: 'ভিজিটর পেজ', count: generalPageLogs.length, icon: Laptop },
                { id: 'security', label: 'নিরাপত্তা লগ', count: attempts.length, icon: ShieldAlert },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shrink-0 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Active Tab Log Content */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  বিস্তারিত উপাত্ত রেকর্ড তালিকা
                </h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => downloadCustomCSV(activeTab)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    CSV ডাউনলোড করুন
                  </button>
                  {['scans', 'soil', 'chats', 'fertilizer', 'pesticide', 'seeds', 'matchmaker', 'rotation', 'prices', 'loans', 'weather', 'pages'].includes(activeTab) && (
                    <button 
                      onClick={() => handleClearData(activeTab === 'scans' || activeTab === 'soil' ? 'diagnostics' : 'analytics')}
                      disabled={clearing}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/50 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      ক্লিয়ার লগ
                    </button>
                  )}
                </div>
              </div>

              {/* TAB TABLES */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                
                {/* 1. Crop Leaf Scans */}
                {activeTab === 'scans' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">ছবি</th>
                        <th className="p-4">ফসলের নাম</th>
                        <th className="p-4">শনাক্তকৃত রোগ</th>
                        <th className="p-4">কনফিডেন্স</th>
                        <th className="p-4">লোকেশন / জেলা</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {leafScans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-slate-400">কোনো রোগ নির্ণয়ের ইতিহাস খুঁজে পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        leafScans.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              {log.image_url ? (
                                <div 
                                  onClick={() => setSelectedImage(log.image_url || null)}
                                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in bg-slate-100 shrink-0 relative hover:scale-105 transition-transform"
                                >
                                  <img 
                                    src={log.image_url} 
                                    alt="Scan thumb" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                  <Scan className="w-4 h-4" />
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-bold text-slate-900">{log.crop_name}</td>
                            <td className="p-4 text-emerald-600 font-semibold">{log.disease_name}</td>
                            <td className="p-4 text-xs">
                              <span className={`px-2.5 py-1 rounded-md font-bold ${log.confidence >= 0.85 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {(Number(log.confidence) * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-500 font-semibold">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                {log.location || 'ঢাকা'}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 2. Soil pH Scans */}
                {activeTab === 'soil' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">ছবি</th>
                        <th className="p-4">নির্ণীত মাটির ধরণ</th>
                        <th className="p-4">আনুমানিক pH মান</th>
                        <th className="p-4">অবস্থা</th>
                        <th className="p-4">লোকেশন / জেলা</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {soilScans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-slate-400">কোনো মাটির নমুনা পরীক্ষার ইতিহাস পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        soilScans.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              {log.image_url ? (
                                <div 
                                  onClick={() => setSelectedImage(log.image_url || null)}
                                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in bg-slate-100 shrink-0 relative hover:scale-105 transition-transform"
                                >
                                  <img 
                                    src={log.image_url} 
                                    alt="Soil scan thumb" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                  <Droplet className="w-4 h-4" />
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-bold text-slate-900">{log.disease_name}</td>
                            <td className="p-4 font-mono font-bold text-cyan-600">{Number(log.confidence).toFixed(1)}</td>
                            <td className="p-4 text-xs">
                              <span className={`px-2 py-1 rounded font-bold ${
                                Number(log.confidence) < 6.0 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                  : Number(log.confidence) > 7.5 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'bg-green-50 text-green-700 border border-green-200'
                              }`}>
                                {Number(log.confidence) < 6.0 ? 'অম্লীয় মাটি' : Number(log.confidence) > 7.5 ? 'ক্ষারীয় মাটি' : 'স্বাভাবিক মাটি'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-500 font-semibold">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                {log.location || 'ঢাকা'}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 3. Chatbot conversations */}
                {activeTab === 'chats' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">ছবি</th>
                        <th className="p-4">কৃষকের প্রশ্ন (Farmer Query)</th>
                        <th className="p-4">চ্যাটবটের উত্তর (Response)</th>
                        <th className="p-4">লোকেশন</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {chatLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-400">কোনো চ্যাটবট প্রশ্নোত্তরের বিবরণ পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        chatLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              {log.metadata?.image ? (
                                <div 
                                  onClick={() => setSelectedImage(log.metadata?.image || null)}
                                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in bg-slate-100 shrink-0 relative hover:scale-105 transition-transform"
                                >
                                  <img 
                                    src={log.metadata?.image} 
                                    alt="Chat Image" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-350">
                                  <MessageSquare className="w-4 h-4" />
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-bold text-slate-900 max-w-[220px] truncate" title={log.metadata?.query}>
                              {log.metadata?.query || 'N/A'}
                            </td>
                            <td className="p-4 text-xs text-slate-600 max-w-[320px] truncate" title={log.metadata?.response}>
                              {log.metadata?.response || 'N/A'}
                            </td>
                            <td className="p-4 text-xs text-slate-500 font-semibold">{log.location}</td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 4. Fertilizer calculations */}
                {activeTab === 'fertilizer' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">শস্যের নাম</th>
                        <th className="p-4">জমির পরিমাণ</th>
                        <th className="p-4">মৌসুম</th>
                        <th className="p-4">ইউরিয়া (N)</th>
                        <th className="p-4">টিএসপি (P)</th>
                        <th className="p-4">এমওপি (K)</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {fertilizerLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400">কোনো সার হিসাব গণনার ইতিহাস পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        fertilizerLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{log.metadata?.cropName}</td>
                            <td className="p-4 font-semibold text-slate-700">{log.metadata?.landSize} বিঘা</td>
                            <td className="p-4 text-xs">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md font-bold">
                                {log.metadata?.season}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-800">{log.metadata?.urea_kg} কেজি</td>
                            <td className="p-4 font-mono font-bold text-slate-800">{log.metadata?.tsp_kg} কেজি</td>
                            <td className="p-4 font-mono font-bold text-slate-800">{log.metadata?.mop_kg} কেজি</td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 5. Pesticide Dose Calculator */}
                {activeTab === 'pesticide' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">ফসলের নাম</th>
                        <th className="p-4">ধরণ ও রূপ</th>
                        <th className="p-4">আক্রমণ তীব্রতা</th>
                        <th className="p-4">ট্যাঙ্ক ও জমি</th>
                        <th className="p-4">মোট ওষুধ পরিমাণ</th>
                        <th className="p-4">প্রয়োজনীয় স্প্রে ট্যাঙ্ক</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pesticideLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400">কোনো কীটনাশক ডোজ পরিমাপের লগ পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        pesticideLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{log.metadata?.crop}</td>
                            <td className="p-4 text-xs">
                              <span className="block font-semibold">{log.metadata?.pesticideClass === 'insecticide' ? 'কীটনাশক' : log.metadata?.pesticideClass === 'fungicide' ? 'ছত্রাকনাশক' : log.metadata?.pesticideClass === 'herbicide' ? 'আগাছানাশক' : 'হরমোন (PGR)'}</span>
                              <span className="text-slate-400 font-mono">({log.metadata?.pesticideForm === 'liquid' ? 'তরল' : 'পাউডার'})</span>
                            </td>
                            <td className="p-4 text-xs font-bold text-amber-700">{log.metadata?.severity === 'preventive' ? 'প্রতিরোধমূলক' : log.metadata?.severity === 'mild' ? 'মাঝারি আক্রমণ' : 'তীব্র আক্রমণ'}</td>
                            <td className="p-4 text-xs text-slate-600">
                              <span className="block">ড্রাম: {log.metadata?.tankSize} লিটার</span>
                              <span className="block font-semibold">আবাদ: {log.metadata?.landArea} {log.metadata?.isTreeBased ? 'গাছ' : 'শতক'}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-emerald-600">{log.metadata?.totalChemicalNeeded} {log.metadata?.pesticideForm === 'liquid' ? 'মিলি' : 'গ্রাম'}</td>
                            <td className="p-4 font-mono font-bold text-slate-800">{log.metadata?.tanksNeeded} ড্রাম</td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 6. Seed sowing calculator */}
                {activeTab === 'seeds' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">বীজ / ফসলের জাত</th>
                        <th className="p-4">জমির পরিমাণ</th>
                        <th className="p-4">প্রয়োজনীয় বীজের মোট ওজন</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {seedLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-slate-400">কোনো বীজ বপন পরিমাপের লগ পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        seedLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{log.metadata?.cropName}</td>
                            <td className="p-4 font-semibold text-slate-700">{log.metadata?.landSize} {log.metadata?.landUnit === 'bigha' ? 'বিঘা' : 'শতক'}</td>
                            <td className="p-4 font-mono font-bold text-emerald-600">{log.metadata?.totalSeedWeight} কেজি</td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 7. Crop Matchmaker */}
                {activeTab === 'matchmaker' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">জেলা / এলাকা</th>
                        <th className="p-4">মাটির ধরন</th>
                        <th className="p-4">নির্বাচিত মৌসুম</th>
                        <th className="p-4">ম্যাচিং লাভজনক শস্য সংখ্যা</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {matchmakerLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-400">কোনো ফসল ম্যাচমেকার অনুসন্ধানের লগ পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        matchmakerLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{log.location || 'ঢাকা'}</td>
                            <td className="p-4 text-xs font-semibold text-slate-700">
                              {log.metadata?.soilType === 'loam' ? 'দোআঁশ মাটি' : log.metadata?.soilType === 'sandy' ? 'বেলে দোআঁশ' : log.metadata?.soilType === 'clay' ? 'এটেল মাটি' : 'লাল/অম্লীয় মাটি'}
                            </td>
                            <td className="p-4 text-xs">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                                {log.metadata?.season === 'robi' ? 'রবি (শীতকাল)' : log.metadata?.season === 'kharif1' ? 'খরিপ-১ (গ্রীষ্মকাল)' : 'খরিপ-২ (বর্ষাকাল)'}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-800">{log.metadata?.recommendationCount}টি শস্য</td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 8. Crop Rotation */}
                {activeTab === 'rotation' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">বর্তমানে আবাদকৃত ফসল</th>
                        <th className="p-4">ফসলের মৌসুম</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rotationLogs.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-10 text-center text-slate-400">কোনো শস্য চক্র পর্যালোচনার ইতিহাস পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        rotationLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{log.metadata?.cropName}</td>
                            <td className="p-4 text-xs text-slate-500 font-bold">{log.metadata?.season}</td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 9. Market Prices Check */}
                {activeTab === 'prices' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">অনুসন্ধানকৃত ফসলের নাম</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {priceLogs.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="p-10 text-center text-slate-400">কোনো পাইকারি বাজার মূল্য অনুসন্ধানের বিবরণ পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        priceLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                              <Coins className="w-4 h-4 text-amber-500" />
                              {log.metadata?.cropName}
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 10. Loan Eligibility Checks */}
                {activeTab === 'loans' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">অনুমোদিত স্কিম / টাইটেল</th>
                        <th className="p-4">আবেদন গ্রহণকারী সংস্থা</th>
                        <th className="p-4">টাইপ</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {loanLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-slate-400">কোনো অনুদান বা ঋণ অনুসন্ধান করার ইতিহাস পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        loanLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{log.metadata?.schemeTitle}</td>
                            <td className="p-4 text-xs text-slate-500 font-bold">{log.metadata?.schemeProvider}</td>
                            <td className="p-4 text-xs">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase border ${
                                log.metadata?.schemeType === 'subsidy' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                                  : 'bg-amber-50 text-amber-700 border-amber-150'
                              }`}>
                                {log.metadata?.schemeType === 'subsidy' ? 'প্রণোদনা ভর্তুকি' : '৪% রেয়াতি ঋণ'}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 11. Weather/Irrigation Searches */}
                {activeTab === 'weather' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">অনুসন্ধানকৃত জেলা</th>
                        <th className="p-4">রেকর্ডেড তাপমাত্রা</th>
                        <th className="p-4">আবহাওয়া অবস্থা</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {weatherLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-slate-400">কোনো আবহাওয়া বা সেচ গাইড অনুসন্ধানের ইতিহাস পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        weatherLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900 flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-amber-500" />
                              {log.metadata?.district}
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-800">{log.metadata?.temp}°C</td>
                            <td className="p-4 text-xs">
                              <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-md font-bold">
                                {log.metadata?.condition}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 12. General page visits */}
                {activeTab === 'pages' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">সেশন আইডি</th>
                        <th className="p-4">ভিজিটেড পাথ</th>
                        <th className="p-4">আইপি অ্যাড্রেস</th>
                        <th className="p-4">ডিভাইস / ইউজার এজেন্ট</th>
                        <th className="p-4">তারিখ ও সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {generalPageLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-400">কোনো ভিজিটর পেজ অ্যাক্টিভিটি পাওয়া যায়নি।</td>
                        </tr>
                      ) : (
                        generalPageLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-xs font-mono text-emerald-600">{log.session_id.substring(0, 15)}...</td>
                            <td className="p-4 text-xs font-mono font-semibold text-slate-800">{log.page_visited}</td>
                            <td className="p-4 font-mono text-xs text-slate-500">{log.ip_address}</td>
                            <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate" title={log.user_agent}>
                              {log.user_agent}
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(log.created_at).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 13. Login attempts security */}
                {activeTab === 'security' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-4">আইপি অ্যাড্রেস</th>
                        <th className="p-4">ইনপুট ইউজারনেম</th>
                        <th className="p-4">অবস্থা</th>
                        <th className="p-4">চেষ্টার সময়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {attempts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-slate-400">লগইনের কোনো চেষ্টা রেকর্ড করা হয়নি।</td>
                        </tr>
                      ) : (
                        attempts.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono text-xs text-slate-800">{att.ip_address}</td>
                            <td className="p-4 text-xs font-mono text-slate-500">{att.username}</td>
                            <td className="p-4 text-xs">
                              <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${att.is_successful ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                {att.is_successful ? 'সফল লগইন' : 'ব্যর্থ চেষ্টা'}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">
                              {new Date(att.attempt_time).toLocaleString('bn-BD')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
