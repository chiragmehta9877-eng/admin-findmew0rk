'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { 
  ArrowLeft, Mail, MapPin, Globe, Calendar, Shield, Briefcase, 
  Linkedin, Instagram, Loader2, ExternalLink, Hash, Clock, Target, Navigation
} from 'lucide-react';

// 🔥 CONFIG: Main Website URLs
const LOCAL_URL = "http://localhost:3000";
const NETLIFY_URL = "https://findmew0rk.netlify.app";
const PROD_URL = "https://findmew0rk.com";

// 🔥 AUTO-SELECT LOGIC
const MAIN_SITE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? LOCAL_URL
    : PROD_URL; 

const XLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function UserDetailsPage() {
  const params = useParams(); 
  const id = params?.id; 
  
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if(!id) return; 

    fetch(`/api/admin/users/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
            setUser(data.data);
        } else {
            console.error("Fetch failed:", data.message);
            setErrorMsg(data.message);
        }
        setLoading(false);
      })
      .catch(err => {
          console.error("Network Error:", err);
          setErrorMsg("Network Error");
          setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-teal-600" size={40} />
            <p className="text-slate-500 font-bold">Loading User Profile...</p>
        </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h1>
            <p className="text-red-500 mb-4">{errorMsg}</p>
            <button onClick={() => router.back()} className="text-teal-600 font-bold hover:underline">Go Back</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold mb-8 transition-colors group">
           <div className="p-2 bg-white border border-slate-200 rounded-xl group-hover:border-teal-200 shadow-sm transition-colors">
             <ArrowLeft size={20} /> 
           </div>
           Back to Directory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: Profile Info --- */}
            <div className="lg:col-span-1 space-y-6">
                
                <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm text-center relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-24 ${user.isActive ? 'bg-gradient-to-br from-teal-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-pink-500'}`}></div>
                    
                    <div className="relative z-10">
                        <img 
                            src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=475569&bold=true&size=128`} 
                            alt={user.name} 
                            className="w-32 h-32 rounded-[32px] object-cover mx-auto mb-4 border-4 border-white shadow-lg bg-white"
                        />
                        <h1 className="text-2xl font-black text-slate-900 mb-1">{user.name}</h1>
                        <p className="text-slate-500 font-medium mb-4">{user.headline || "No headline provided"}</p>
                        
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {user.isActive ? 'Active Account' : 'Blocked Account'}
                        </span>

                        <div className="mt-8 space-y-4 text-left bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600"><Mail size={16}/></div>
                                <span className="text-sm font-bold truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600"><Shield size={16}/></div>
                                <span className="text-sm font-bold capitalize">{user.role || 'User'} Role</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Calendar size={16}/></div>
                                <span className="text-sm font-bold">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 mt-6">
                             {user.linkedin ? <a href={user.linkedin} target="_blank" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Linkedin size={20} /></a> : <span className="p-3 bg-slate-50 text-slate-300 rounded-xl"><Linkedin size={20} /></span>}
                             {user.x_handle ? <a href={user.x_handle} target="_blank" className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all"><XLogo className="w-5 h-5" /></a> : <span className="p-3 bg-slate-50 text-slate-300 rounded-xl"><XLogo className="w-5 h-5" /></span>}
                             {user.instagram ? <a href={user.instagram} target="_blank" className="p-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-600 hover:text-white transition-all"><Instagram size={20} /></a> : <span className="p-3 bg-slate-50 text-slate-300 rounded-xl"><Instagram size={20} /></span>}
                        </div>
                    </div>
                </div>

                {/* 2. Tech & Activity Card */}
                <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Globe size={20} className="text-teal-600"/> Tech & Activity</h3>
                    <div className="space-y-5">
                        
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Target size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Job Preference</p>
                                <p className="font-bold text-slate-700">{user.lookingFor || 'Not Specified'}</p>
                            </div>
                        </div>

                        {/* 🔥 Detected Location (Automatic) */}
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Navigation size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detected Location</p>
                                <p className="font-bold text-slate-700">{user.detectedLocation || 'Not Detected'}</p>
                            </div>
                        </div>

                        {/* 🔥 Entered Location (Manual) */}
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><MapPin size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entered Location</p>
                                <p className="font-bold text-slate-700">{user.location || 'Not Entered'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Hash size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IP Address</p>
                                <p className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg w-fit select-all">{user.ip || 'Not Recorded'}</p>
                            </div>
                        </div>

                         <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Clock size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
                                <p className="font-bold text-slate-700">{new Date(user.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Saved Jobs (Bookmarks) --- */}
            <div className="lg:col-span-2 h-full">
                <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm min-h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                                <Briefcase className="text-teal-600" size={28} /> Saved Opportunities
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Jobs bookmarked by this user</p>
                        </div>
                        <span className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl font-bold border border-teal-100">{user.bookmarks?.length || 0} Items</span>
                    </div>

                    {user.bookmarks && user.bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.bookmarks.map((job: any) => {
                                const validId = job.job_id || job._id;
                                
                                const jobLink = job.source === 'twitter' 
                                    ? `${MAIN_SITE_URL}/x-jobs/${validId}` 
                                    : `${MAIN_SITE_URL}/jobs/${validId}`;

                                return (
                                <div key={job._id || Math.random()} className="flex flex-col p-5 border border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-lg transition-all group bg-white relative">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={job.employer_logo || "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg"} 
                                                className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100" 
                                                alt="Logo"
                                                onError={(e) => (e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg")}
                                            />
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{job.job_title || "Untitled Job"}</h4>
                                                <p className="text-xs font-semibold text-slate-500">{job.employer_name || "Unknown Employer"}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${job.source === 'twitter' ? 'bg-black text-white border-black' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                            {job.source || 'Job'}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400">{job.job_city || 'Remote'}</span>
                                        <Link 
                                            href={jobLink} 
                                            target="_blank"
                                            className="text-xs font-bold text-teal-600 flex items-center gap-1 group-hover:underline"
                                        >
                                            View Details <ExternalLink size={12}/>
                                        </Link>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                <Briefcase className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No jobs saved yet</h3>
                            <p className="text-slate-400 font-medium">This user hasn't bookmarked any opportunities.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}