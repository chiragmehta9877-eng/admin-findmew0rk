'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { RefreshCw, Zap, Terminal, ArrowLeft, CheckCircle, Server, Globe, Activity } from 'lucide-react';

// 🔥 SERVER CONFIGURATION
const SERVERS = [
  { name: "Localhost", url: "http://localhost:3000", type: "dev" },
  { name: "Live Prod", url: "https://findmew0rk.com", type: "prod" }, // Apna URL dalein
  { name: "Test Env", url: "https://findmew0rk.netlify.app", type: "test" },
];

const categories = [
  { name: "Software Engineer", value: "Developer" },
  { name: "Data Science & AI", value: "Data" },
  { name: "Internships", value: "internship" },
  { name: "Freelance", value: "freelance" },
  { name: "All Jobs", value: "job" }
];

export default function AdminJobControl() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState("Developer");
  const [selectedServerUrl, setSelectedServerUrl] = useState(SERVERS[0].url);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom whenever logs update
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // --- MANUAL FETCH FUNCTION ---
  const handleFetch = async (count: number) => {
    const catName = categories.find(c => c.value === selectedCategoryValue)?.name;
    const serverName = SERVERS.find(s => s.url === selectedServerUrl)?.name;

    setLoading(true);
    addLog(`[${new Date().toLocaleTimeString()}] 📡 Connecting to: ${serverName}...`);
    addLog(`[${new Date().toLocaleTimeString()}] ⏳ Fetching ${count} jobs for '${catName}'...`);

    try {
      const res = await fetch(`${selectedServerUrl}/api/jobs?category=${selectedCategoryValue}&refresh=true&limit=${count}`);
      const data = await res.json();

      if (data.success) {
        addLog(`[${new Date().toLocaleTimeString()}] ✅ Success!`);
        addLog(`   ➜ Added: ${data.added}`);
        addLog(`   ➜ Total: ${data.total}`);
      } else {
        addLog(`[${new Date().toLocaleTimeString()}] ❌ API Error: ${data.error}`);
      }
    } catch (error) {
      addLog(`[${new Date().toLocaleTimeString()}] ❌ Network Error. Is ${serverName} running?`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* 🔥 HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
                <Link href="/dashboard" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-slate-600 shrink-0">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Job Controller</h1>
                    <p className="text-slate-500 text-xs md:text-sm flex items-center gap-1">
                       Target: <span className="font-bold text-teal-600 truncate max-w-[150px] md:max-w-none">{SERVERS.find(s => s.url === selectedServerUrl)?.name}</span>
                    </p>
                </div>
            </div>

            {/* Status Badge */}
            <div className="self-start md:self-auto flex items-center gap-2 md:gap-3 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-200 shadow-sm">
               <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
               <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wide">{loading ? 'PROCESSING...' : 'SYSTEM READY'}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
            {/* --- LEFT COLUMN: CONTROLS --- */}
            <div className="lg:col-span-2 space-y-6">
            
                {/* 1. SERVER SELECTION */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={18} className="text-blue-600" />
                        <h2 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Select Target Server</h2>
                    </div>
                    {/* Mobile: 1 Col, Desktop: 3 Cols */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {SERVERS.map((server) => (
                            <button
                                key={server.url}
                                onClick={() => setSelectedServerUrl(server.url)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border text-left ${
                                    selectedServerUrl === server.url
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-200'
                                    : 'bg-white border-gray-200 text-slate-600 hover:border-slate-300 hover:bg-gray-50'
                                }`}
                            >
                                <Server size={16} className={`shrink-0 ${selectedServerUrl === server.url ? "text-teal-400" : "text-slate-400"}`} />
                                <div className="min-w-0">
                                    <p className="truncate">{server.name}</p>
                                    <p className={`text-[10px] font-normal truncate max-w-full ${selectedServerUrl === server.url ? "text-slate-400" : "text-slate-400"}`}>{server.url}</p>
                                </div>
                                {selectedServerUrl === server.url && <CheckCircle size={16} className="ml-auto text-teal-400 shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. FETCH CONTROLS */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 relative overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Fetch Configuration</h2>
                    </div>

                    {/* Category Selection */}
                    <div className="mb-8">
                        <label className="block text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">Target Category</label>
                        {/* Mobile: 2 Cols, Desktop: 3 Cols */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                            {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategoryValue(cat.value)}
                                className={`relative px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 border text-left ${
                                selectedCategoryValue === cat.value 
                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/20' 
                                : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100'
                                }`}
                            >
                                {cat.name}
                                {selectedCategoryValue === cat.value && (
                                    <CheckCircle size={14} className="absolute top-2 right-2 md:top-3 md:right-3 text-white/80" />
                                )}
                            </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-100 my-4 md:my-8"></div>

                    {/* Action Buttons */}
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">Execute Fetch</label>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            {[10, 20, 30].map((count) => (
                                <button 
                                    key={count}
                                    onClick={() => handleFetch(count)}
                                    disabled={loading}
                                    className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold py-3 md:py-4 rounded-xl flex flex-col items-center justify-center gap-1 md:gap-2 transition-all active:scale-95"
                                >
                                    <RefreshCw size={18} className={`text-slate-400 group-hover:text-teal-600 transition-colors ${loading ? "animate-spin" : ""}`} />
                                    <span className="text-xs md:text-sm">Fetch <span className="text-teal-600">+{count}</span></span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: LOGS (Mobile Fixed) --- */}
            {/* 🔥 FIX: Mobile par h-full hata diya, taaki wo collapse na ho */}
            <div className="lg:col-span-1 space-y-6 flex flex-col lg:h-full">
                
                {/* Logs Console */}
                {/* 🔥 FIX: Mobile ke liye h-[400px] fix kar di */}
                <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 md:p-5 shadow-lg flex flex-col h-[400px] lg:h-auto lg:flex-1 lg:min-h-[500px]">
                    
                    {/* Console Header */}
                    <div className="flex items-center justify-between mb-2 md:mb-4 border-b border-slate-700 pb-2 md:pb-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <Terminal size={16} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Logs</span>
                        </div>
                        <button 
                            onClick={() => setLogs([])} 
                            className="text-[10px] text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                        >
                            CLEAR
                        </button>
                    </div>
                    
                    {/* Console Output Area */}
                    <div className="flex-1 overflow-y-auto font-mono text-[11px] md:text-xs space-y-1.5 md:space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent pr-1">
                        
                        {logs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic opacity-60">
                                <Activity className="mb-2 w-5 h-5" />
                                <span>Ready for action...</span>
                            </div>
                        )}

                        {logs.map((log, i) => (
                            <div key={i} className="break-words break-all border-l-2 border-slate-700 pl-2 py-0.5 leading-relaxed">
                                <span className={
                                    log.includes("Success") || log.includes("New") ? "text-emerald-400 font-medium" : 
                                    log.includes("Error") ? "text-red-400 font-bold" : 
                                    log.includes("Fetching") ? "text-blue-400" : 
                                    log.includes("Connecting") ? "text-yellow-200/70" :
                                    "text-slate-300"
                                }>
                                    {log}
                                </span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}