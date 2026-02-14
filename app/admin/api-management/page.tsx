'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Activity, Key, Save, Loader2, CheckCircle, AlertTriangle, 
  Eye, EyeOff, CloudLightning, Info, ArrowLeft, Shield, BarChart3, Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApiManagementPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [newKey, setNewKey] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Fetch Data
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/api-config');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error("Failed to fetch API stats");
    } finally {
      setLoading(false);
    }
  };

  // Sync Logic
  const handleSync = async () => {
    if(!confirm("⚠️ Syncing checks the live quota from RapidAPI (Costs 1 Credit). Continue?")) return;

    setSyncing(true);
    try {
      const res = await fetch('/api/admin/api-config/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        alert("Synced successfully!");
      } else {
        alert("Sync failed. Check API Key.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleUpdateKey = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/api-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newKey })
      });
      if (res.ok) {
        alert("API Key Updated!");
        setNewKey("");
        setShowInput(false);
        handleSync(); 
      } else {
        alert("Failed to update key.");
      }
    } catch (error) {
      alert("Error updating key.");
    } finally {
      setSaving(false);
    }
  };

  // Calculations
  const total = stats?.totalLimit || 500;
  const remaining = stats?.remaining !== undefined ? stats.remaining : 500;
  const used = total - remaining;
  const percentUsed = ((used / total) * 100).toFixed(2);
  
  const isCritical = Number(percentUsed) > 90;
  const isWarning = Number(percentUsed) > 75;
  
  // Professional Colors
  const statusColor = isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600';
  const ringColor = isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500';
  const badgeClass = isCritical 
    ? 'bg-red-50 text-red-700 border-red-200' 
    : isWarning 
      ? 'bg-amber-50 text-amber-700 border-amber-200' 
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-slate-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="text-sm font-medium">Loading API Configuration...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans p-6 md:p-10">
      
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
             <Link href="/dashboard" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
             </Link>
             <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
               API Management
             </h1>
             <p className="text-slate-500 mt-2 text-sm md:text-base max-w-2xl">
               Control your RapidAPI connection settings, monitor real-time usage quotas, and manage security keys.
             </p>
          </div>
          
          <div className="flex gap-3">
            <button 
                onClick={handleSync} 
                disabled={syncing}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-700 px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 text-sm"
            >
               {syncing ? <Loader2 className="animate-spin" size={16} /> : <CloudLightning size={16} />} 
               {syncing ? "Syncing..." : "Sync Quota"}
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: STATS (4 Columns) --- */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Main Usage Card */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <BarChart3 size={20} className="text-slate-600" />
                      </div>
                      <h3 className="font-bold text-slate-800">Usage Metric</h3>
                   </div>
                   <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${badgeClass}`}>
                      {isCritical ? "Critical" : isWarning ? "Warning" : "Healthy"}
                   </span>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                   {/* Ring Chart */}
                   <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                        <circle 
                          className={`${ringColor} progress-ring__circle stroke-current transition-all duration-1000 ease-out`} 
                          strokeWidth="8" 
                          strokeLinecap="round" 
                          cx="50" cy="50" r="40" 
                          fill="transparent" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * Number(percentUsed) / 100)}
                          style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className={`text-2xl font-bold ${statusColor}`}>{percentUsed}%</span>
                         <span className="text-[10px] text-slate-400 uppercase font-bold">Used</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 border-t border-gray-100 pt-4">
                   <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Remaining</p>
                      <p className="text-xl font-bold text-slate-800">{remaining}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Limit</p>
                      <p className="text-xl font-bold text-slate-800">{total}</p>
                   </div>
                </div>
             </div>

             {/* Info Card */}
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info className="text-blue-600 shrink-0" size={18} />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  <strong>Pro Tip:</strong> Usage data updates automatically when your app makes API calls. Use "Sync Quota" only if you suspect a mismatch.
                </p>
             </div>
          </div>

          {/* --- RIGHT: CONFIG (8 Columns) --- */}
          <div className="lg:col-span-8">
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Shield size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">API Credentials</h3>
                        <p className="text-xs text-slate-500">Manage access keys for the Twitter scraper service.</p>
                      </div>
                   </div>
                   <Lock size={16} className="text-slate-300" />
                </div>

                <div className="p-6 md:p-8">
                   
                   {/* Current Key Display */}
                   <div className="mb-8">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Current API Key</label>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-slate-600 flex justify-between items-center">
                            <span>
                              {showKey 
                                ? stats?.apiKey 
                                : (stats?.apiKey ? `sk_live_••••••••••••••••••••••••${stats.apiKey.slice(-4)}` : "No API Key Configured")
                              }
                            </span>
                         </div>
                         <button 
                            onClick={() => setShowKey(!showKey)} 
                            className="p-3 bg-white border border-gray-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 rounded-lg transition-all"
                            title={showKey ? "Hide Key" : "Reveal Key"}
                         >
                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                      </div>
                   </div>

                   {/* Update Section */}
                   <AnimatePresence mode='wait'>
                      {!showInput ? (
                        <motion.div 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                           className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-300"
                        >
                           <p className="text-sm text-slate-500 mb-4">Need to rotate your key? You can update it instantly without redeploying.</p>
                           <button 
                              onClick={() => setShowInput(true)}
                              className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all text-sm"
                           >
                              Change API Key
                           </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-gray-50 p-6 rounded-xl border border-gray-200"
                        >
                            <h4 className="text-sm font-bold text-slate-800 mb-4">Update Configuration</h4>
                            
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">New RapidAPI Key</label>
                            <input 
                              type="text" 
                              value={newKey}
                              onChange={(e) => setNewKey(e.target.value)}
                              placeholder="e.g. 98234892384..."
                              className="w-full p-3 rounded-lg bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all mb-4 font-mono text-sm text-slate-900"
                              autoFocus
                            />
                            
                            <div className="flex gap-3 justify-end">
                              <button 
                                  onClick={() => setShowInput(false)}
                                  className="px-4 py-2 bg-white border border-gray-200 text-slate-600 font-semibold rounded-lg hover:bg-gray-50 text-sm transition-colors"
                              >
                                  Cancel
                              </button>
                              <button 
                                  onClick={handleUpdateKey}
                                  disabled={saving || !newKey}
                                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md text-sm"
                              >
                                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                                  Save Changes
                              </button>
                            </div>
                        </motion.div>
                      )}
                   </AnimatePresence>

                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}