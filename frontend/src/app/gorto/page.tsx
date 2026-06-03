"use client";

import React, { useState, useEffect } from 'react';
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
  Calendar,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface LogEntry {
  id: number;
  crop_name: string;
  disease_name: string;
  confidence: number;
  location: string;
  created_at: string;
}

interface ActivityEntry {
  id: number;
  session_id: string;
  user_agent: string;
  page_visited: string;
  action: string;
  location: string;
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

export default function AdminDashboard() {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [attempts, setAttempts] = useState<AttemptEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [clearing, setClearing] = useState(false);

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
    // Clear cookies by setting maxAge = 0
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
        alert("উপাত্ত সফলভাবে ডিলিট করা হয়েছে।");
        fetchDashboardData();
      } else {
        alert("উপাত্ত ডিলিট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  const downloadCSV = (dataArray: any[], filename: string) => {
    if (dataArray.length === 0) {
      alert("ডাউনলোড করার মতো কোনো উপাত্ত নেই।");
      return;
    }
    const headers = Object.keys(dataArray[0]).join(',');
    const rows = dataArray.map(obj => 
      Object.values(obj).map(val => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-green-950 text-soft-white p-6">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-green-primary w-12 h-12" />
          <p className="text-lg font-semibold animate-pulse">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // 1. Secure Login Page Layout
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-green-950 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-primary to-amber-500" />
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-2">
              <Lock className="text-green-primary w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-soft-white tracking-wide">নিরাপদ অ্যাডমিন প্যানেল</h1>
            <p className="text-sm text-text-muted">থিসিস উপাত্ত সংগ্রহ ও পর্যবেক্ষণ ড্যাশবোর্ড</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-green-primary/80 uppercase tracking-wider block">ইউজারনেম</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-text-muted w-5 h-5" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="অ্যাডমিন ইউজারনেম"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-emerald-500/10 rounded-xl text-soft-white focus:outline-none focus:border-green-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-green-primary/80 uppercase tracking-wider block">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-text-muted w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="অ্যাডমিন পাসওয়ার্ড"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-emerald-500/10 rounded-xl text-soft-white focus:outline-none focus:border-green-primary transition-colors text-sm"
                />
              </div>
            </div>

            {loginError && (
              <div className="flex gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-primary text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-transform text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[10px] text-rose-400/70 border border-rose-500/10 px-3 py-1.5 rounded-full bg-rose-950/10 inline-block">
              ⚠️ সতর্কবার্তা: ভুল লগইন চেষ্টা ৩ বার হলে আইপি ৩০ মিনিটের জন্য লক হবে।
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Dashboard Page Layout
  return (
    <div className="min-h-screen bg-slate-950 text-soft-white p-6 md:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-500/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-primary">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-extrabold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">KrishiSathi Platform Admin</span>
          </div>
          <h1 className="text-3xl font-black text-soft-white tracking-tight">থিসিস অ্যানালিটিক্স ড্যাশবোর্ড</h1>
          <p className="text-sm text-text-muted">বাস্তব ব্যবহারকারী অ্যাক্টিভিটি এবং রোগ নির্ণয় লগ ট্র্যাকিং</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-emerald-500/20 text-green-primary rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
          </button>
        </div>
      </div>

      {/* Loading Status Indicator */}
      {loadingData && !stats && (
        <div className="flex items-center justify-center p-20 bg-slate-900/40 rounded-3xl border border-emerald-500/5">
          <RefreshCw className="animate-spin text-green-primary w-10 h-10" />
        </div>
      )}

      {stats && (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-emerald-500/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors shadow-lg">
              <div className="absolute right-4 top-4 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 text-green-primary">
                <Scan className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">মোট শস্য স্ক্যান</p>
              <h3 className="text-3xl font-black text-soft-white mt-2">{stats.totalScans}</h3>
              <p className="text-xs text-green-primary mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                রোগ নির্ণয় সফল
              </p>
            </div>

            <div className="bg-slate-900/60 border border-emerald-500/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors shadow-lg">
              <div className="absolute right-4 top-4 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/10 text-cyan-400">
                <Eye className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">মোট পেজ ভিউ</p>
              <h3 className="text-3xl font-black text-soft-white mt-2">{stats.totalPageViews}</h3>
              <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                ট্র্যাকার সক্রিয়
              </p>
            </div>

            <div className="bg-slate-900/60 border border-emerald-500/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors shadow-lg">
              <div className="absolute right-4 top-4 bg-amber-500/10 p-3 rounded-xl border border-amber-500/10 text-amber-500">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">সক্রিয় সেশন সংখ্যা</p>
              <h3 className="text-3xl font-black text-soft-white mt-2">{stats.activeSessions}</h3>
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                অ্যানোনিমাস আইডি যুক্ত
              </p>
            </div>

            <div className="bg-slate-900/60 border border-emerald-500/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors shadow-lg">
              <div className="absolute right-4 top-4 bg-purple-500/10 p-3 rounded-xl border border-purple-500/10 text-purple-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">গড় আত্মবিশ্বাস রেট</p>
              <h3 className="text-3xl font-black text-soft-white mt-2">{(Number(stats.averageConfidence) * 100).toFixed(0)}%</h3>
              <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                এআই মডেল ভেরিফাইড
              </p>
            </div>
          </div>

          {/* Visualization Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Crop Scan Distribution */}
            <div className="bg-slate-900/40 border border-emerald-500/10 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                <h3 className="text-lg font-black text-soft-white flex items-center gap-2">
                  <Scan className="text-green-primary w-5 h-5" />
                  শস্য-ভিত্তিক স্ক্যান বিন্যাস
                </h3>
                <span className="text-xs font-bold text-text-muted">মোট শস্য প্রজাতি: {Object.keys(stats.cropCounts).length}টি</span>
              </div>
              
              <div className="space-y-4">
                {Object.keys(stats.cropCounts).length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-10">কোনো শস্য স্ক্যান করার তথ্য নেই।</p>
                ) : (
                  Object.entries(stats.cropCounts).map(([crop, count]) => {
                    const percentage = stats.totalScans > 0 ? (count / stats.totalScans) * 100 : 0;
                    return (
                      <div key={crop} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-soft-white">{crop}</span>
                          <span className="font-black text-green-primary">{count} বার ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-primary rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Page View Analytics */}
            <div className="bg-slate-900/40 border border-emerald-500/10 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
                <h3 className="text-lg font-black text-soft-white flex items-center gap-2">
                  <Eye className="text-cyan-400 w-5 h-5" />
                  মেনু এবং পেজ ভিউ অ্যানালিটিক্স
                </h3>
                <span className="text-xs font-bold text-text-muted">সর্বাধিক ভিজিটেড পাথ</span>
              </div>

              <div className="space-y-4">
                {Object.keys(stats.pageCounts).length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-10">কোনো পেজ ভিজিটের তথ্য নেই।</p>
                ) : (
                  Object.entries(stats.pageCounts).map(([page, count]) => {
                    const percentage = stats.totalPageViews > 0 ? (count / stats.totalPageViews) * 100 : 0;
                    return (
                      <div key={page} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-300 font-mono text-xs">{page}</span>
                          <span className="font-black text-cyan-400">{count} ভিউ ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Tables: 1. Crop Disease Diagnostics Log */}
          <div className="bg-slate-900/40 border border-emerald-500/10 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-500/10 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-soft-white flex items-center gap-2">
                  <Scan className="text-green-primary w-5 h-5" />
                  রোগ নির্ণয়ের সাম্প্রতিক লগসমূহ (Diagnostic Logs)
                </h3>
                <p className="text-xs text-text-muted">কৃষকদের রোগ নির্ণয়ের নিখুঁত উপাত্ত তালিকা</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => downloadCSV(logs, 'krishisathi_diagnostic_logs')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-green-primary border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV ডাউনলোড
                </button>
                <button 
                  onClick={() => handleClearData('diagnostics')}
                  disabled={clearing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ক্লিয়ার লগ
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-emerald-500/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-green-primary border-b border-emerald-500/10">
                  <tr>
                    <th className="p-4">ক্রমিক</th>
                    <th className="p-4">শস্যের নাম</th>
                    <th className="p-4">শনাক্তকৃত রোগ</th>
                    <th className="p-4">কনফিডেন্স</th>
                    <th className="p-4">লোকেশন</th>
                    <th className="p-4">তারিখ ও সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/5 bg-slate-900/20">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-text-muted">কোনো স্ক্যানিং ইতিহাস খুঁজে পাওয়া যায়নি।</td>
                    </tr>
                  ) : (
                    logs.slice(0, 50).map((log, index) => (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 text-xs font-mono text-text-muted">{index + 1}</td>
                        <td className="p-4 font-bold text-soft-white">{log.crop_name}</td>
                        <td className="p-4 text-emerald-400 font-semibold">{log.disease_name}</td>
                        <td className="p-4 text-xs">
                          <span className={`px-2 py-1 rounded-md font-mono ${log.confidence >= 0.85 ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'}`}>
                            {(Number(log.confidence) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-4 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {log.location || 'ঢাকা'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {new Date(log.created_at).toLocaleString('bn-BD')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tables: 2. Visitor Analytics Activity Log */}
          <div className="bg-slate-900/40 border border-emerald-500/10 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-500/10 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-soft-white flex items-center gap-2">
                  <Users className="text-cyan-400 w-5 h-5" />
                  সিস্টেম ব্যবহারকারী অ্যাক্টিভিটি লগ (Usage Analytics)
                </h3>
                <p className="text-xs text-text-muted">ব্যবহারকারীদের ভিজিট সেশন এবং নেভিগেশন ইতিহাস</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => downloadCSV(activities, 'krishisathi_usage_analytics')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV ডাউনলোড
                </button>
                <button 
                  onClick={() => handleClearData('analytics')}
                  disabled={clearing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ক্লিয়ার লগ
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-emerald-500/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-emerald-500/10">
                  <tr>
                    <th className="p-4">সেশন আইডি</th>
                    <th className="p-4">ভিজিটেড পেজ</th>
                    <th className="p-4">ডিভাইস / ইউজার এজেন্ট</th>
                    <th className="p-4">লোকেশন</th>
                    <th className="p-4">তারিখ ও সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/5 bg-slate-900/20">
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-text-muted">কোনো ব্যবহারের তথ্য খুঁজে পাওয়া যায়নি।</td>
                    </tr>
                  ) : (
                    activities.slice(0, 50).map((act) => (
                      <tr key={act.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 text-xs font-mono text-cyan-400">{act.session_id.substring(0, 15)}...</td>
                        <td className="p-4 font-mono text-xs text-soft-white">{act.page_visited}</td>
                        <td className="p-4 text-xs text-text-muted truncate max-w-[200px]" title={act.user_agent}>
                          {act.user_agent}
                        </td>
                        <td className="p-4 text-xs text-text-muted">{act.location || 'Unknown'}</td>
                        <td className="p-4 text-xs font-mono text-text-muted">
                          {new Date(act.created_at).toLocaleString('bn-BD')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tables: 3. Security Login Attempts Log */}
          <div className="bg-slate-900/40 border border-emerald-500/10 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-500/10 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-soft-white flex items-center gap-2">
                  <ShieldAlert className="text-rose-400 w-5 h-5" />
                  সিকিউরিটি লগ এবং লগইন চেষ্টা (Brute-Force Monitor)
                </h3>
                <p className="text-xs text-text-muted">লগইন প্রচেষ্টার রেকর্ড এবং ব্লক স্ট্যাটাস ট্র্যাকার</p>
              </div>

              <button 
                onClick={() => handleClearData('attempts')}
                disabled={clearing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                লগ ডিলিট করুন
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-emerald-500/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-emerald-500/10">
                  <tr>
                    <th className="p-4">আইপি অ্যাড্রেস</th>
                    <th className="p-4">ইনপুট ইউজারনেম</th>
                    <th className="p-4">অবস্থা</th>
                    <th className="p-4">চেষ্টার সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/5 bg-slate-900/20">
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-text-muted">লগইনের কোনো চেষ্টা রেকর্ড করা হয়নি।</td>
                    </tr>
                  ) : (
                    attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-mono text-xs text-soft-white">{att.ip_address}</td>
                        <td className="p-4 text-xs font-mono text-text-muted">{att.username}</td>
                        <td className="p-4 text-xs">
                          <span className={`px-2 py-1 rounded-md font-bold text-[10px] ${att.is_successful ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'}`}>
                            {att.is_successful ? 'সফল লগইন' : 'ব্যর্থ চেষ্টা'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-text-muted">
                          {new Date(att.attempt_time).toLocaleString('bn-BD')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
