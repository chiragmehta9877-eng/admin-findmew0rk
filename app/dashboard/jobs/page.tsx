'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; 
import { 
  FiTrash2, FiExternalLink, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight, 
  FiFilter, FiEdit, FiPlus, FiUser, FiBarChart2, FiX, FiActivity, FiMousePointer, FiPieChart,
  FiShield, FiCheckCircle, FiXCircle, FiBriefcase, FiLock, FiSave, FiLayers, FiGlobe, FiZap 
} from 'react-icons/fi';
import { FaLinkedin, FaTwitter } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

// 🔥 CONFIG: Live Frontend URL
const FRONTEND_URL = 'https://findmew0rk.com'; 

// 🔥 UPDATED CATEGORIES
const ALL_CATEGORIES = [
   { label: "IT & Software", value: "software" },
   { label: "Finance & Accounting", value: "finance" },
   { label: "Business & Management", value: "management" },
   { label: "Human Resources", value: "hr" },
   { label: "Sales & Marketing", value: "marketing" },
   { label: "ESG & Sustainability", value: "esg" },
   { label: "E-Commerce", value: "commerce" },
   { label: "Design & Architecture", value: "design" },
   { label: "Research & Analytics", value: "research" },
   { label: "Internships", value: "internship" },
   { label: "Freelance", value: "freelance" },
   { label: "Others", value: "other" }
];

export default function SuperAdminDashboard() {
  const { data: session } = useSession(); 
  const [activeTab, setActiveTab] = useState('jobs');

  // --- JOBS STATE ---
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobAnalytics, setSelectedJobAnalytics] = useState<any>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterSource, setFilterSource] = useState('all'); 
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- USERS STATE ---
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // 🔥 CREATE USER STATE
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  // ==========================
  // DATA FETCHING & HANDLERS
  // ==========================
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs?limit=10000');
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (error) { console.error("Error fetching jobs:", error); }
    setLoading(false);
  };

  const fixDatabaseLinks = async () => {
    if (!confirm("⚠️ This will fix all the old job links. Are you sure?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/jobs', { method: 'PATCH' });
      const data = await res.json();
      if (data.success) { alert(data.message); fetchJobs(); } else { alert("Error: " + data.error); }
    } catch (error) { alert("Error fixing database"); }
    setLoading(false);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      const res = await fetch('/api/jobs', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id }) 
      });
      if (res.ok) setJobs(jobs.filter((job) => job._id !== id));
      else alert("Failed to delete job.");
    } catch (error) { console.error("Delete error:", error); }
  };

  const getJobPageLink = (job: any) => {
    return job.source === 'twitter' 
      ? `${FRONTEND_URL}/x-jobs/${job.job_id}` 
      : `${FRONTEND_URL}/linkedin-jobs/${job.job_id}`;
  };

  const handleOpenAnalytics = (job: any) => {
    const realViews = job.views || 0;
    const realClicks = job.clicks || 0;
    const rawCtr = realViews > 0 ? (realClicks / realViews) * 100 : 0;
    const ctr = rawCtr.toFixed(1);

    const chartData = [
        { name: 'Views', value: realViews, fill: '#3b82f6' },
        { name: 'Clicks', value: realClicks, fill: '#10b981' }
    ];

    setSelectedJobAnalytics({
        ...job,
        stats: { views: realViews, clicks: realClicks, ctr: ctr, chartData: chartData }
    });
    setShowAnalyticsModal(true);
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) { console.error(error); }
    setUsersLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newUser.name || !newUser.email || !newUser.password) return alert("All fields required");

    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        const data = await res.json();
        if(data.success) {
            alert("✅ User Created Successfully!");
            setShowCreateUserModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } else {
            alert("❌ Error: " + data.error);
        }
    } catch (error) { alert("Failed to create user"); }
  };

  const handleUserUpdate = async (id: string, field: string, value: any) => {
    const originalUsers = [...users];
    setUsers(users.map(u => u._id === id ? { ...u, [field]: value } : u));
    try {
      const res = await fetch('/api/users', { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id, [field]: value }) 
      });
      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      alert("Update failed!");
      setUsers(originalUsers);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete User? Cannot be undone.")) return;
    try {
      const res = await fetch('/api/users', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id }) 
      });
      if (res.ok) setUsers(users.filter(u => u._id !== id));
      else alert("Failed to delete user");
    } catch (error) { alert("Failed to delete"); }
  };

  const seedFakeUsers = async () => {
     if(!confirm("Generate fake test users?")) return;
     await fetch('/api/users', { method: 'POST' });
     fetchUsers();
  };

  useEffect(() => { 
    if (activeTab === 'jobs') fetchJobs(); 
    // @ts-ignore
    if (activeTab === 'users' && session?.user?.role === 'super_admin') fetchUsers();
  }, [activeTab, session]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.updated_by?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filterSource === 'all' ? true : job.source === filterSource;
    
    let matchesCategory = true;
    if (filterCategory !== 'All Categories') {
        const dbCat = (job.category || "").toLowerCase();
        const selectedCatValue = filterCategory;

        const validDbCategories: Record<string, string[]> = {
            'software': ['software', 'developer', 'engineer', 'it', 'tech', 'data', 'ai'],
            'finance': ['finance', 'account', 'banking', 'invest'],
            'management': ['management', 'manager', 'product', 'project', 'business'],
            'hr': ['hr', 'human', 'recruit', 'talent'],
            'marketing': ['marketing', 'sales', 'growth', 'brand'],
            'esg': ['esg', 'sustain', 'climate', 'environment', 'green'],
            'commerce': ['commerce', 'shop', 'amazon', 'logistics'],
            'design': ['design', 'ui', 'ux', 'creative', 'art'],
            'research': ['research', 'analy', 'scientist', 'economist'],
            'internship': ['intern'],
            'freelance': ['freelance'],
            'other': ['other', 'general', 'admin', 'support']
        };

        const allowedCats = validDbCategories[selectedCatValue] || [selectedCatValue];
        matchesCategory = allowedCats.some(cat => dbCat.includes(cat));
    }
        
    return matchesSearch && matchesSource && matchesCategory;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterSource, filterCategory]);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans relative">
      <div className="max-w-7xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">System Overview & Management</p>
        </div>
        
        {/* TABS */}
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
                onClick={() => setActiveTab('jobs')}
                className={`px-5 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-gray-50'}`}
            >
                <FiBriefcase /> Jobs
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-5 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-purple-600 hover:bg-gray-50'}`}
            >
                <FiShield /> Users
            </button>
        </div>
      </div>

      {/* JOBS TAB */}
      {activeTab === 'jobs' && (
        <>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-4 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search jobs, companies..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none text-sm transition-all" 
                    />
                </div>
                <div className="lg:col-span-3 relative">
                    <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-sm text-slate-700 cursor-pointer appearance-none"
                    >
                        <option value="All Categories">All Categories</option>
                        {ALL_CATEGORIES.map((cat, i) => (<option key={i} value={cat.value}>{cat.label}</option>))}
                    </select>
                </div>
                <div className="lg:col-span-2 relative">
                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                        value={filterSource} 
                        onChange={(e) => setFilterSource(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-sm text-slate-700 cursor-pointer appearance-none"
                    >
                        <option value="all">All Sources</option>
                        <option value="manual">Manual / Web</option>
                        <option value="twitter">Twitter (X)</option>
                        <option value="linkedin">LinkedIn</option>
                    </select>
                </div>
                <div className="lg:col-span-3 flex justify-end gap-2">
                    <button onClick={fetchJobs} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600 transition-colors" title="Refresh Data">
                        <FiRefreshCw className={loading ? "animate-spin" : ""}/>
                    </button>
                    <button onClick={fixDatabaseLinks} className="px-3 py-2.5 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 font-bold text-xs transition-colors whitespace-nowrap">
                        Fix Links
                    </button>
                    <Link href="/dashboard/jobs/create" className="flex-1">
                        <button className="w-full h-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 font-bold transition-all shadow-sm text-sm">
                            <FiPlus size={16} /> Post Job
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-gray-200 text-slate-800 font-bold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4 pl-6">Title</th>
                            <th className="p-4 text-center">Stats</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Company</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? ( <tr><td colSpan={7} className="p-10 text-center text-slate-500">Loading jobs...</td></tr>
                        ) : currentJobs.length === 0 ? ( <tr><td colSpan={7} className="p-10 text-center text-slate-500">No jobs found.</td></tr>
                        ) : currentJobs.map((job: any) => (
                            <tr key={job._id} className="hover:bg-slate-50/80 transition duration-150">
                            <td className="p-4 pl-6 font-semibold text-slate-900 max-w-xs truncate" title={job.job_title}>
                                {job.job_title}
                                {job.isSpotlight && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 font-bold">
                                        <FiZap size={8} fill="currentColor" /> SPOTLIGHT
                                    </span>
                                )}
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => handleOpenAnalytics(job)} className="p-1.5 px-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md text-xs font-bold transition-colors">
                                    <FiBarChart2 className="inline mr-1"/> View
                                </button>
                            </td>
                            <td className="p-4"><span className="flex items-center gap-1 text-slate-500 text-xs bg-slate-50 px-2 py-1 rounded-full w-fit whitespace-nowrap border border-slate-100"><FiUser size={12} /> {job.updated_by || 'System'}</span></td>
                            <td className="p-4 max-w-[150px] truncate">{job.employer_name}</td>
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                    job.source === 'twitter' ? 'bg-black text-white border-black' : 
                                    job.source === 'linkedin' ? 'bg-[#0077b5] text-white border-[#0077b5]' : 
                                    'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                    {job.source === 'twitter' && <FaTwitter />} 
                                    {job.source}
                                </span>
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-500">{new Date(job.posted_at).toLocaleDateString('en-GB')}</td>
                            <td className="p-4 pr-6 text-right flex justify-end gap-2">
                                <a href={getJobPageLink(job)} target="_blank" className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"><FiExternalLink size={16} /></a>
                                <Link href={`/dashboard/jobs/edit/${job._id}`}><button className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"><FiEdit size={16} /></button></Link>
                                <button onClick={() => handleDeleteJob(job._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"><FiTrash2 size={16} /></button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredJobs.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-slate-50 gap-4">
                    <span className="text-xs text-slate-500 order-2 sm:order-1">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length}</span>
                    <div className="flex gap-2 order-1 sm:order-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><FiChevronLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><FiChevronRight size={16} /></button>
                    </div>
                </div>
                )}
            </div>
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           {/* @ts-ignore */}
           {session?.user?.role !== 'super_admin' ? (
                <div className="flex flex-col items-center justify-center h-80 md:h-96 text-center bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl md:text-3xl"><FiLock /></div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800">Access Denied</h3>
                    <p className="text-slate-500 max-w-md mt-2 text-sm md:text-base">This section is restricted to <strong>Super Admins</strong> only.</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                        <h2 className="text-lg font-bold text-slate-700">All Registered Users</h2>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => setShowCreateUserModal(true)} className="flex-1 md:flex-none justify-center bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"><FiPlus /> Create User</button>
                            <button onClick={seedFakeUsers} className="flex-1 md:flex-none justify-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-bold hover:bg-purple-200 text-xs flex items-center gap-1"><FiPlus /> Seed Test</button>
                            <button onClick={fetchUsers} className="bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-50 text-slate-600"><FiRefreshCw className={usersLoading ? "animate-spin" : ""} /></button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left text-sm text-slate-600">
                                <thead className="bg-purple-50 border-b border-purple-100 text-purple-900 font-bold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4 pl-6">User Info</th>
                                    <th className="p-4">Role (Permission)</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Joined</th>
                                    <th className="p-4 text-right pr-6">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {usersLoading ? ( <tr><td colSpan={5} className="p-10 text-center text-slate-500">Loading users...</td></tr> ) : 
                                users.length === 0 ? ( <tr><td colSpan={5} className="p-10 text-center text-slate-500">No users found. Click 'Seed Test Data'.</td></tr> ) :
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/80 transition">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            {/* 🔥 FIX: Defensive check for user.name */}
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">{(user.name || "U").charAt(0).toUpperCase()}</div>
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name || "Unknown User"}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleUserUpdate(user._id, 'role', e.target.value)}
                                            className={`px-2 py-1 rounded-md text-xs font-bold border outline-none cursor-pointer ${
                                                user.role === 'super_admin' ? 'bg-red-50 text-red-700 border-red-200' :
                                                user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-slate-100 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleUserUpdate(user._id, 'isActive', !user.isActive)}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                                                user.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                                            }`}
                                        >
                                            {user.isActive ? <><FiCheckCircle /> Active</> : <><FiXCircle /> Blocked</>}
                                        </button>
                                    </td>
                                    <td className="p-4 text-xs font-mono text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedJobAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-white">
                    <div className="overflow-hidden">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap"><FiActivity className="text-purple-600"/> Analytics</h2>
                        <p className="text-xs md:text-sm text-slate-500 mt-1 truncate">{selectedJobAnalytics.job_title}</p>
                    </div>
                    <button onClick={() => setShowAnalyticsModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><FiX size={20}/></button>
                </div>
                <div className="p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-8 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                            <div className="relative"><div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-xs md:text-sm uppercase tracking-wider"><FiActivity /> Total Views</div><div className="text-3xl md:text-4xl font-extrabold text-slate-800">{selectedJobAnalytics.stats.views.toLocaleString()}</div></div>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                            <div className="relative"><div className="flex items-center gap-2 mb-2 text-green-600 font-bold text-xs md:text-sm uppercase tracking-wider"><FiMousePointer /> Apply Clicks</div><div className="text-3xl md:text-4xl font-extrabold text-slate-800">{selectedJobAnalytics.stats.clicks.toLocaleString()}</div></div>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden">
                            <div className="relative"><div className="flex items-center gap-2 mb-2 text-purple-600 font-bold text-xs md:text-sm uppercase tracking-wider"><FiPieChart /> Conversion</div><div className="text-3xl md:text-4xl font-extrabold text-slate-800">{selectedJobAnalytics.stats.ctr}%</div></div>
                        </div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><FiBarChart2 className="text-slate-400"/> Performance</h3>
                        <div className="h-60 md:h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={selectedJobAnalytics.stats.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0"/>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={70} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}/>
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30} fill="#8884d8">
                                        {selectedJobAnalytics.stats.chartData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-slate-800">Create New User</h3>
                    <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={24}/></button>
                </div>
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="John Doe" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input type="email" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="john@example.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input type="password" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Assign Role</label>
                        <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                            <option value="user">User (No Admin Access)</option>
                            <option value="admin">Admin (Limited Access)</option>
                            <option value="super_admin">Super Admin (Full Access)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 mt-4"><FiSave /> Create Account</button>
                </form>
            </div>
        </div>
      )}
      </div>
    </div>
  );
}