'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // 🔥 Import useSession
import { useRouter } from 'next/navigation'; // 🔥 Import useRouter
import { RefreshCw, Zap, Terminal, ArrowLeft, CheckCircle, Server, Globe, Activity, Lock, Search } from 'lucide-react';

// 🔥 SERVER CONFIGURATION
const SERVERS = [
  { name: "Live Prod", url: "https://findmew0rk.com", type: "prod" },
  { name: "Localhost (Auto)", url: "", type: "dev" }, 
  { name: "Test Env", url: "https://findmew0rk.netlify.app", type: "test" },
];

// 🔥 MASTER CATEGORIES
const MAIN_CATEGORIES = [
  { name: "IT & Software", value: "software" },
  { name: "Finance & Accounting", value: "finance" },
  { name: "Business & Management", value: "management" },
  { name: "Human Resources", value: "hr" },
  { name: "Sales & Marketing", value: "marketing" },
  { name: "ESG & Sustainability", value: "esg" },
  { name: "E-Commerce", value: "commerce" },
  { name: "Design & Architecture", value: "design" },
  { name: "Research & Analytics", value: "research" },
  { name: "Operations & Admin", value: "other" },
  { name: "Internships", value: "internship" },
  { name: "Freelance", value: "freelance" },
];

// 🔥 KEYWORDS DATABASE
const KEYWORD_DB: Record<string, string[]> = {
  software: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer', 'Node.js Developer', 'Python Developer', 'Java Developer', 'DevOps Engineer', 'Cloud Architect', 'Data Scientist', 'Machine Learning Engineer', 'Cybersecurity Analyst', 'QA Engineer', 'Mobile App Developer', 'Flutter Developer', 'Golang Developer', 'Rust Developer', 'Blockchain Developer', 'Web3 Developer'],
  finance: ['Financial Analyst', 'Accountant', 'Chartered Accountant', 'Investment Banker', 'Tax Consultant', 'Internal Auditor', 'Finance Manager', 'Risk Analyst', 'Portfolio Manager', 'Credit Analyst', 'Equity Research', 'FP&A Analyst'],
  management: ['Product Manager', 'Project Manager', 'Business Analyst', 'Operations Manager', 'Strategy Consultant', 'Management Consultant', 'Program Manager', 'Scrum Master', 'Chief of Staff', 'General Manager', 'Business Operations'],
  hr: ['HR Manager', 'Technical Recruiter', 'Talent Acquisition', 'HR Business Partner', 'HR Generalist', 'People Operations', 'Learning and Development', 'Compensation and Benefits', 'Employee Relations', 'HRIS Analyst'],
  marketing: ['Digital Marketing Manager', 'SEO Specialist', 'Content Marketing', 'Social Media Manager', 'Growth Hacker', 'Brand Manager', 'Performance Marketing', 'Product Marketing Manager', 'Email Marketing', 'Copywriter'],
  esg: ['ESG Analyst', 'Sustainability Manager', 'Climate Risk Analyst', 'Carbon Analyst', 'Net Zero Manager', 'CSR Manager', 'Environmental Consultant', 'Green Finance', 'Sustainable Supply Chain', 'Energy Transition'],
  commerce: ['E-commerce Manager', 'Shopify Developer', 'Marketplace Manager', 'Amazon FBA', 'Dropshipping', 'DTC Manager', 'E-commerce Operations', 'Online Merchandiser'],
  design: ['Graphic Designer', 'UI/UX Designer', 'Product Designer', 'Art Director', 'Motion Graphics', 'Architect', 'Interior Designer', '3D Artist', 'Visual Designer'],
  research: ['Market Research Analyst', 'Data Analyst', 'Economist', 'Policy Analyst', 'User Researcher', 'Clinical Research', 'Quantitative Analyst', 'Research Scientist'],
  other: ['Executive Assistant', 'Office Manager', 'Customer Support', 'Legal Counsel', 'Supply Chain Manager', 'Logistics Coordinator', 'Procurement Manager', 'Operations Executive'],
  
  // 🔥 UPDATED INTERNSHIP KEYWORDS
  internship: [
    'IT & Software Intern', 
    'Finance & Accounting Intern', 
    'Business & Management Intern', 
    'Human Resources Intern', 
    'Sales & Marketing Intern', 
    'ESG & Sustainability Intern', 
    'E-Commerce Intern', 
    'Design & Architecture Intern', 
    'Research & Analytics Intern', 
    'Other Internships'
  ],
  
  freelance: ['Freelance Developer', 'Freelance Writer', 'Freelance Designer', 'Virtual Assistant', 'Freelance Video Editor', 'Freelance Translator', 'Upwork', 'Fiverr']
};

export default function AdminJobControl() {
  const { data: session, status } = useSession(); // 🔥 Get Session
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [selectedServerUrl, setSelectedServerUrl] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("software");
  const [selectedKeyword, setSelectedKeyword] = useState<string>(""); 

  const logsEndRef = useRef<HTMLDivElement>(null);

  // 🔥 0. AUTH CHECK (Only Super Admin)
  useEffect(() => {
    if (status === 'loading') return;
    
    // Redirect if not authenticated or not a super_admin
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'super_admin') {
      router.push('/dashboard'); 
    }
  }, [session, status, router]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    setSelectedKeyword(""); 
  }, [selectedCategory]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // --- 🔥 SMART FETCH FUNCTION ---
  const handleFetch = async (count: number) => {
    if(loading) return;

    const baseUrl = selectedServerUrl || window.location.origin;
    
    const catName = MAIN_CATEGORIES.find(c => c.value === selectedCategory)?.name || selectedCategory;
    const serverName = SERVERS.find(s => s.url === selectedServerUrl)?.name || "Current Browser";

    const searchBase = selectedKeyword || catName;
    const finalQuery = `${searchBase} hiring`;

    setLoading(true);
    addLog(`------------------------------------------------`);
    addLog(`[${new Date().toLocaleTimeString()}] 🚀 INIT: Starting Fetch Sequence`);
    addLog(`[${new Date().toLocaleTimeString()}] 📡 Target: ${baseUrl} (${serverName})`);
    addLog(`[${new Date().toLocaleTimeString()}] 📂 Category: ${catName}`);
    addLog(`[${new Date().toLocaleTimeString()}] 🔍 Optimization: Appending "hiring" to query`);
    addLog(`[${new Date().toLocaleTimeString()}] 🎯 Final Query: "${finalQuery}"`);
    addLog(`[${new Date().toLocaleTimeString()}] 🔢 Limit: ${count} posts`);

    try {
      let apiUrl = `${baseUrl}/api/jobs?source=twitter&refresh=true&limit=${count}&category=${selectedCategory}`;
      apiUrl += `&query=${encodeURIComponent(finalQuery)}`;

      console.log("Fetching:", apiUrl);

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Check API path.");
      }

      const data = await res.json();

      if (res.ok && data.success) {
        addLog(`[${new Date().toLocaleTimeString()}] ✅ SUCCESS!`);
        addLog(`   ➜ 📥 Found: ${data.data?.length || 0} posts`);
        if(data.added !== undefined) addLog(`   ➜ 💾 Saved: ${data.added} new jobs`);
        addLog(`   ➜ 🏁 Status: 200 OK`);
      } else {
        addLog(`[${new Date().toLocaleTimeString()}] ❌ API ERROR: ${data.error || 'Unknown Error'}`);
      }
    } catch (error: any) {
      addLog(`[${new Date().toLocaleTimeString()}] 💀 NETWORK ERROR: ${error.message}`);
      addLog(`   ➜ Hint: Is the server running? Check Console (F12) for details.`);
    } finally {
      setLoading(false);
      addLog(`[${new Date().toLocaleTimeString()}] 💤 IDLE`);
    }
  };

  // 🔥 Show Loading State while checking permissions
  if (status === 'loading' || (session?.user as any)?.role !== 'super_admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] text-slate-500 font-bold">
            <Lock className="mr-2" /> Checking Permissions...
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
                <Link href="/" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-slate-600 shrink-0">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        Job Controller <Lock size={16} className="text-slate-400"/>
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm">Admin Control Panel for Intelligent Scraping</p>
                </div>
            </div>

            <div className="self-start md:self-auto flex items-center gap-2 md:gap-3 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-200 shadow-sm">
               <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
               <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide ${loading ? 'text-amber-600' : 'text-emerald-600'}`}>
                   {loading ? 'SCRAPING X...' : 'SYSTEM READY'}
               </span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
            {/* --- LEFT: CONTROLS --- */}
            <div className="lg:col-span-2 space-y-6">
            
                {/* 1. SERVER */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={18} className="text-blue-600" />
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Server</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {SERVERS.map((server) => (
                            <button
                                key={server.name}
                                onClick={() => setSelectedServerUrl(server.url)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border text-left ${
                                    selectedServerUrl === server.url
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                                }`}
                            >
                                <Server size={16} className={selectedServerUrl === server.url ? "text-teal-400" : "text-slate-400"} />
                                <div>
                                    <p className="truncate">{server.name}</p>
                                    <p className="text-[10px] opacity-60 truncate">{server.url || "Auto-Detect"}</p>
                                </div>
                                {selectedServerUrl === server.url && <CheckCircle size={16} className="ml-auto text-teal-400" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. FETCH CONFIG */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><Zap size={20} /></div>
                        <h2 className="text-lg font-bold text-slate-800">Scraper Configuration</h2>
                    </div>

                    {/* Category Grid */}
                    <div className="mb-6">
                        <label className="block text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">1. Select Domain</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {MAIN_CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`relative px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left ${
                                selectedCategory === cat.value 
                                ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                                : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100'
                                }`}
                            >
                                {cat.name}
                            </button>
                            ))}
                        </div>
                    </div>

                    {/* Sub-Keyword Selector */}
                    <div className="mb-8">
                        <label className="block text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">2. Target Specific Niche (Optional)</label>
                        <div className="relative">
                            <select 
                                value={selectedKeyword} 
                                onChange={(e) => setSelectedKeyword(e.target.value)}
                                className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 pr-10"
                            >
                                <option value="">Draft Mode (Fetch Generic "{MAIN_CATEGORIES.find(c => c.value === selectedCategory)?.name}")</option>
                                {KEYWORD_DB[selectedCategory]?.map((kw) => (
                                    <option key={kw} value={kw}>{kw}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                <Search size={16} />
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">
                            *Selecting a niche helps finding exact matches. Leaving it empty fetches broader results.
                        </p>
                    </div>

                    <div className="h-px w-full bg-gray-100 my-6"></div>

                    {/* Execute Buttons */}
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">3. Execute Fetch</label>
                        <div className="grid grid-cols-3 gap-3">
                            {/* 🔥 UPDATED LIMIT BUTTONS TO INCLUDE 10000 */}
                            {[10, 50, 100].map((count) => (
                                <button 
                                    key={count}
                                    onClick={() => handleFetch(count)}
                                    disabled={loading}
                                    className="group bg-white border-2 border-gray-200 hover:border-teal-500 disabled:opacity-50 text-slate-700 font-bold py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                                >
                                    <RefreshCw size={18} className={`text-slate-400 group-hover:text-teal-600 ${loading ? "animate-spin" : ""}`} />
                                    <span className="text-xs">Fetch <span className="text-teal-600">+{count}</span></span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT: LOGS --- */}
            <div className="lg:col-span-1 flex flex-col">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col h-[500px] lg:h-auto lg:flex-1 sticky top-6">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <Terminal size={16} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Logs</span>
                        </div>
                        <button onClick={() => setLogs([])} className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded">CLEAR</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto font-mono text-[11px] md:text-xs space-y-2 scrollbar-thin scrollbar-thumb-slate-700 pr-1">
                        {logs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic opacity-50">
                                <Activity className="mb-2 w-5 h-5" />
                                <span>Waiting for input...</span>
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="break-words border-l-2 border-slate-800 pl-2 py-0.5">
                                <span className={
                                    log.includes("SUCCESS") ? "text-emerald-400" : 
                                    log.includes("ERROR") ? "text-red-400" : 
                                    log.includes("INIT") ? "text-sky-400" :
                                    log.includes("Saved") ? "text-amber-400" :
                                    "text-slate-400"
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