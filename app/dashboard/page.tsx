'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; 
import { 
  FiBriefcase, FiUsers, FiActivity, FiTrendingUp, FiArrowRight, FiClock, FiCalendar, FiDatabase, FiLock
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';

export default function DashboardOverview() {
  const { data: session } = useSession(); 
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalJobs: 0, totalUsers: 0, totalViews: 0, totalClicks: 0, ctr: "0.0"
  });
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  // 🔥 STRICT CHECK: Only 'super_admin' gets access
  const isSuperAdmin = (session?.user as any)?.role === 'super_admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!isSuperAdmin) { setLoading(false); return; } // Access Denied Check

        const [jobsRes, usersRes] = await Promise.all([
            fetch('/api/jobs?limit=10000&t=' + Date.now()), 
            fetch('/api/users')
        ]);

        const jobsData = await jobsRes.json();
        const usersData = await usersRes.json();

        if (jobsData.success && usersData.success) {
            const jobs = jobsData.data;
            const users = usersData.data;
            const views = jobs.reduce((acc: number, job: any) => acc + (Number(job.views) || 0), 0);
            const clicks = jobs.reduce((acc: number, job: any) => acc + (Number(job.clicks) || 0), 0);
            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

            setStats({ totalJobs: jobs.length, totalUsers: users.length, totalViews: views, totalClicks: clicks, ctr: ctr });
            setTopJobs([...jobs].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5));
            setRecentJobs(jobs.slice(0, 5));
        }
      } catch (error) { console.error("Dashboard Load Failed", error); }
      setLoading(false);
    };
    if (session) fetchData(); 
  }, [session, isSuperAdmin]);

  return (
    // 🔥 FIX: No padding, No min-h-screen
    <div className="w-full font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm md:text-base">
                <FiCalendar className="text-slate-400"/> Overview of your platform's performance
            </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isSuperAdmin ? (
                <Link href="/admin/api-management">
                    <button className="flex-1 md:flex-none bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-2">
                        <FiDatabase /> API Manager
                    </button>
                </Link>
            ) : (
                <button disabled className="flex-1 md:flex-none bg-gray-100 text-gray-400 border border-gray-200 px-5 py-2.5 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 opacity-60">
                    <FiDatabase /> API Manager <FiLock size={12}/>
                </button>
            )}
            {isSuperAdmin ? (
                <Link href="/dashboard/jobs/create">
                    <button className="flex-1 md:flex-none bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                        <FiBriefcase /> Post New Job
                    </button>
                </Link>
            ) : (
                <button disabled className="flex-1 md:flex-none bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 opacity-70">
                    <FiBriefcase /> Post New Job <FiLock size={12}/>
                </button>
            )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Total Active Jobs" value={stats.totalJobs} icon={<FiBriefcase/>} color="blue" trend={isSuperAdmin ? "+12% this week" : "Restricted"} />
          <KPICard title="Registered Users" value={stats.totalUsers} icon={<FiUsers/>} color="purple" trend={isSuperAdmin ? "New signups today" : "Restricted"} />
          <KPICard title="Total Views" value={stats.totalViews.toLocaleString()} icon={<FiActivity/>} color="indigo" trend={isSuperAdmin ? "Across all posts" : "Restricted"} />
          <KPICard title="Avg. Click Rate" value={`${stats.ctr}%`} icon={<FiTrendingUp/>} color="green" trend={isSuperAdmin ? "Conversion health" : "Restricted"} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><FiBarChart2 className="text-slate-400"/> Top Performing Jobs</h3>
            <div className="h-80 w-full flex items-center justify-center">
                {loading ? <div className="text-slate-400 animate-pulse">Loading Analytics...</div> : !isSuperAdmin ? 
                    <div className="text-center bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 w-full">
                        <div className="text-4xl mb-3 flex justify-center text-slate-300"><FiLock /></div>
                        <p className="text-slate-500 text-sm font-bold">Confidential Data</p>
                    </div> : 
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topJobs} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                            <XAxis type="number" hide /><YAxis dataKey="job_title" type="category" width={180} tick={{fontSize: 12, fill: '#64748b'}} />
                            <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                            <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} /><Bar dataKey="clicks" name="Clicks" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                }
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><FiClock className="text-slate-400"/> Recent Posts</h3>
            <div className="flex-1 overflow-y-visible pr-2 space-y-4">
                {loading ? [1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>) : (!isSuperAdmin || recentJobs.length === 0) ? 
                    <div className="text-center py-10 flex flex-col items-center justify-center h-full text-slate-400">
                        {isSuperAdmin ? "No recent activity." : <><FiLock size={24} className="mb-2 opacity-50"/><span className="text-xs">Restricted</span></>}
                    </div> : recentJobs.map((job) => (
                        <div key={job.job_id || job._id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ${job.source === 'twitter' ? 'bg-black' : 'bg-[#0a66c2]'}`}>{job.source === 'twitter' ? 'X' : 'in'}</div>
                            <div className="flex-1 min-w-0"><h4 className="text-sm font-bold text-slate-800 truncate">{job.job_title}</h4><p className="text-xs text-slate-500 truncate">{job.employer_name}</p></div>
                            <div className="text-right"><span className="block text-xs font-bold text-slate-700">{job.views || 0}</span><span className="text-[10px] text-slate-400 uppercase">Views</span></div>
                        </div>
                    ))
                }
            </div>
            <div className="mt-6 pt-4 border-t border-slate-50">
                <Link href={isSuperAdmin ? "/dashboard/jobs" : "#"} className={`flex items-center justify-center gap-2 text-sm font-bold transition-colors ${isSuperAdmin ? "text-slate-600 hover:text-blue-600" : "text-slate-300 cursor-not-allowed"}`}>View All Jobs <FiArrowRight /></Link>
            </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function KPICard({ title, value, icon, color, trend }: any) {
    const colors: any = { blue: "text-blue-600 bg-blue-50 border-blue-100", purple: "text-purple-600 bg-purple-50 border-purple-100", indigo: "text-indigo-600 bg-indigo-50 border-indigo-100", green: "text-green-600 bg-green-50 border-green-100" };
    return (<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group"><div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150`}><div className={`text-6xl ${colors[color].split(' ')[0]}`}>{icon}</div></div><div className="flex items-start justify-between mb-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div></div><div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p><h3 className="text-3xl font-extrabold text-slate-800">{value}</h3><p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full inline-block ${trend === 'Restricted' ? 'bg-red-400' : 'bg-green-500'}`}></span> {trend}</p></div></div>);
}
function FiBarChart2(props: any) { return <svg {...props} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>; }