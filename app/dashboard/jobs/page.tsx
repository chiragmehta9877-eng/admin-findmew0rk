'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; 
import { 
  FiTrash2, FiExternalLink, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight, 
  FiFilter, FiEdit, FiPlus, FiUser, FiBarChart2, FiX, FiActivity, FiMousePointer, FiPieChart,
  FiShield, FiCheckCircle, FiXCircle, FiBriefcase, FiLock, FiSave 
} from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaLayerGroup } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, Legend 
} from 'recharts';

// 🔥 CONFIG: Live Frontend URL
const FRONTEND_URL = 'https://find-me-work.netlify.app'; 

const ALL_CATEGORIES = [
  { label: "All Categories", value: "All Categories" },
  { label: "ESG & Sustainability", value: "ESG" },
  { label: "Software Engineer", value: "Developer" },
  { label: "Internships & Trainee", value: "Internship" },
  { label: "Product Management", value: "Product" },
  { label: "Data Science & AI", value: "Data" },
  { label: "Business & Sales", value: "Business" },
  { label: "Marketing & Growth", value: "Marketing" }
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
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (error) { console.error("Error fetching jobs:", error); }
    setLoading(false);
  };

  const fixDatabaseLinks = async () => {
    if (!confirm("⚠️ Isse saari purani jobs ke links fix ho jayenge. Kya aap sure hain?")) return;
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
      const res = await fetch('/api/jobs', { method: 'DELETE', body: JSON.stringify({ id }) });
      if (res.ok) setJobs(jobs.filter((job) => job._id !== id));
      else alert("Failed to delete job.");
    } catch (error) { console.error("Delete error:", error); }
  };

  const getJobPageLink = (job: any) => {
    return job.source === 'twitter' 
      ? `${FRONTEND_URL}/twitter-jobs/${job.job_id}` 
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
      await fetch('/api/users', { method: 'PATCH', body: JSON.stringify({ id, [field]: value }) });
    } catch (error) {
      alert("Update failed!");
      setUsers(originalUsers);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete User? Cannot be undone.")) return;
    try {
      const res = await fetch('/api/users', { method: 'DELETE', body: JSON.stringify({ id }) });
      if (res.ok) setUsers(users.filter(u => u._id !== id));
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
    const matchesCategory = filterCategory === 'All Categories' ? true : (job.category === filterCategory);
    return matchesSearch && matchesSource && matchesCategory;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterSource, filterCategory]);

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans relative">
      
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Super Admin Dashboard</h1>
          <p className="text-slate-500 text-xs md:text-sm">Manage Jobs, Analytics & User Permissions</p>
        </div>
        
        {/* TABS - Scrollable on mobile */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('jobs')}
                className={`flex-1 lg:flex-none whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'jobs' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <FiBriefcase /> Manage Jobs
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 lg:flex-none whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-purple-600'}`}
            >
                <FiShield /> Manage Users
            </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 🔥 TAB 1: JOBS MANAGEMENT */}
      {/* ========================================================== */}
      {activeTab === 'jobs' && (
        <>
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col xl:flex-row gap-4 justify-between items-center">
                
                {/* Source Filter - Stacked mobile */}
                <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto overflow-x-auto no-scrollbar">
                    <button onClick={() => setFilterSource('all')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filterSource === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><FaLayerGroup /> All</button>
                    <button onClick={() => setFilterSource('linkedin')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filterSource === 'linkedin' ? 'bg-[#0a66c2] text-white shadow-sm' : 'text-slate-500 hover:text-[#0a66c2]'}`}><FaLinkedin /> LinkedIn</button>
                    <button onClick={() => setFilterSource('twitter')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filterSource === 'twitter' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-black'}`}><FaTwitter /> Twitter</button>
                </div>

                {/* Actions & Search - Wrapped flex */}
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={fixDatabaseLinks} className="flex-1 md:flex-none bg-orange-50 text-orange-600 px-3 py-2 rounded-lg font-bold border border-orange-200 hover:bg-orange-100 text-xs transition-colors whitespace-nowrap">⚠️ Fix Links</button>
                        <Link href="/dashboard/jobs/create" className="flex-1 md:flex-none">
                            <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 font-bold transition-all shadow-lg active:scale-95 text-sm whitespace-nowrap"><FiPlus size={16} /> Post Job</button>
                        </Link>
                    </div>
                    
                    <div className="relative w-full md:w-auto">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full md:w-40 pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none text-sm text-slate-700 font-medium cursor-pointer appearance-none truncate">
                            {ALL_CATEGORIES.map((cat, i) => (<option key={i} value={cat.value}>{cat.label}</option>))}
                        </select>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-56">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none text-sm" />
                        </div>
                        <button onClick={fetchJobs} className="bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-50 text-slate-600"><FiRefreshCw className={loading ? "animate-spin" : ""}/></button>
                    </div>
                </div>
            </div>

            {/* Jobs Table - With Horizontal Scroll */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-gray-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4 pl-6">Title</th>
                            <th className="p-4 text-center">Analytics</th>
                            <th className="p-4">Updated By</th>
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
                            <td className="p-4 pl-6 font-medium text-slate-800 max-w-xs truncate" title={job.job_title}>{job.job_title}</td>
                            <td className="p-4 text-center">
                                <button onClick={() => handleOpenAnalytics(job)} className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors group relative" title="View Real-time Stats"><FiBarChart2 size={18} /></button>
                            </td>
                            <td className="p-4"><span className="flex items-center gap-1 text-slate-500 text-xs font-bold border border-slate-200 bg-slate-50 px-2 py-1 rounded-full w-fit whitespace-nowrap"><FiUser size={12} /> {job.updated_by || 'System'}</span></td>
                            <td className="p-4 max-w-[150px] truncate">{job.employer_name}</td>
                            <td className="p-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${job.source === 'twitter' ? 'bg-black text-white' : 'bg-[#0a66c2] text-white'}`}>{job.source === 'twitter' ? <FaTwitter /> : <FaLinkedin />} {job.source}</span></td>
                            <td className="p-4 text-xs font-mono text-slate-500">{new Date(job.posted_at).toLocaleDateString('en-GB')}</td>
                            <td className="p-4 pr-6 text-right flex justify-end gap-2">
                                <a href={getJobPageLink(job)} target="_blank" className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><FiExternalLink size={16} /></a>
                                <Link href={`/dashboard/jobs/edit/${job._id}`}><button className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><FiEdit size={16} /></button></Link>
                                <button onClick={() => handleDeleteJob(job._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination - Stacked on tiny screens */}
                {!loading && filteredJobs.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-slate-50 gap-4">
                    <span className="text-xs text-slate-500 order-2 sm:order-1">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredJobs.length)}</span>
                    <div className="flex gap-2 order-1 sm:order-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><FiChevronLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><FiChevronRight size={16} /></button>
                    </div>
                </div>
                )}
            </div>
        </>
      )}

      {/* ========================================================== */}
      {/* 🔥 TAB 2: USERS MANAGEMENT (RESTRICTED 🔒) */}
      {/* ========================================================== */}
      {activeTab === 'users' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           {/* @ts-ignore */}
           {session?.user?.role !== 'super_admin' ? (
                <div className="flex flex-col items-center justify-center h-80 md:h-96 text-center bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl md:text-3xl">
                        <FiLock />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800">Access Denied</h3>
                    <p className="text-slate-500 max-w-md mt-2 text-sm md:text-base">
                        This section is restricted to <strong>Super Admins</strong> only. <br/>
                        You do not have permission to manage users.
                    </p>
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
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">{user.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
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

      {/* 🔥 ANALYTICS MODAL - Mobile Friendly */}
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

      {/* 🔥 NEW: CREATE USER MODAL - Mobile Friendly */}
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
  );
}