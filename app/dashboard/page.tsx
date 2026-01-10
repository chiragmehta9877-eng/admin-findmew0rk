'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FiBriefcase, FiUsers, FiActivity, FiMousePointer, FiTrendingUp, FiArrowRight, FiClock, FiCalendar
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalViews: 0,
    totalClicks: 0,
    ctr: "0.0"
  });
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel Fetching for Speed
        const [jobsRes, usersRes] = await Promise.all([
            fetch('/api/jobs'),
            fetch('/api/users')
        ]);

        const jobsData = await jobsRes.json();
        const usersData = await usersRes.json();

        if (jobsData.success && usersData.success) {
            const jobs = jobsData.data;
            const users = usersData.data;

            // 1. Calculate Totals
            const views = jobs.reduce((acc: number, job: any) => acc + (job.views || 0), 0);
            const clicks = jobs.reduce((acc: number, job: any) => acc + (job.clicks || 0), 0);
            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

            setStats({
                totalJobs: jobs.length,
                totalUsers: users.length,
                totalViews: views,
                totalClicks: clicks,
                ctr: ctr
            });

            // 2. Get Top 5 Performing Jobs
            const sortedByViews = [...jobs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
            setTopJobs(sortedByViews);

            // 3. Get Recent 5 Jobs
            setRecentJobs(jobs.slice(0, 5));
        }
      } catch (error) {
        console.error("Dashboard Load Failed", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
                <FiCalendar className="text-slate-400"/> Overview of your platform's performance
            </p>
        </div>
        <div className="text-right hidden md:block">
            <Link href="/dashboard/jobs/create">
                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center gap-2">
                    <FiBriefcase /> Post New Job
                </button>
            </Link>
        </div>
      </div>

      {/* --- KPI CARDS (Stats) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Total Active Jobs" 
            value={stats.totalJobs} 
            icon={<FiBriefcase/>} 
            color="blue" 
            trend="+12% this week"
          />
          <KPICard 
            title="Registered Users" 
            value={stats.totalUsers} 
            icon={<FiUsers/>} 
            color="purple" 
            trend="New signups today"
          />
          <KPICard 
            title="Total Views" 
            value={stats.totalViews.toLocaleString()} 
            icon={<FiActivity/>} 
            color="indigo" 
            trend="Across all posts"
          />
          <KPICard 
            title="Avg. Click Rate" 
            value={`${stats.ctr}%`} 
            icon={<FiTrendingUp/>} 
            color="green" 
            trend="Conversion health"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- MAIN CHART: TOP JOBS PERFORMANCE --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                <FiBarChart2 className="text-slate-400"/> Top Performing Jobs
            </h3>
            
            <div className="h-80 w-full">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400 animate-pulse">Loading Analytics...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topJobs} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                            <XAxis type="number" hide />
                            <YAxis dataKey="job_title" type="category" width={150} tick={{fontSize: 12, fill: '#64748b'}} width={180} />
                            <RechartsTooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="clicks" name="Clicks" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>

        {/* --- RECENT ACTIVITY LIST --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <FiClock className="text-slate-400"/> Recent Posts
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>)
                ) : recentJobs.length === 0 ? (
                    <p className="text-slate-400 text-center py-10">No recent activity.</p>
                ) : (
                    recentJobs.map((job) => (
                        <div key={job._id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ${job.source === 'twitter' ? 'bg-black' : 'bg-[#0a66c2]'}`}>
                                {job.source === 'twitter' ? 'X' : 'in'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate">{job.job_title}</h4>
                                <p className="text-xs text-slate-500 truncate">{job.employer_name} • {new Date(job.posted_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs font-bold text-slate-700">{job.views || 0}</span>
                                <span className="text-[10px] text-slate-400 uppercase">Views</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50">
                <Link href="/dashboard/jobs" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                    View All Jobs <FiArrowRight />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}

// ✨ Helper: KPI Card Component
function KPICard({ title, value, icon, color, trend }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        green: "text-green-600 bg-green-50 border-green-100",
    };
    
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150`}>
                {/* Background Icon Decoration */}
                <div className={`text-6xl ${colors[color].split(' ')[0]}`}>{icon}</div>
            </div>
            
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> {trend}
                </p>
            </div>
        </div>
    );
}

// Icon helper
function FiBarChart2(props: any) { return <svg {...props} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>; }