'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, Filter, Mail, MapPin, 
  Linkedin, Target, ChevronLeft, Loader2, Lock, Unlock, Shield
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const router = useRouter();

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        console.log("Users fetched:", data.data); 
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. 🔥 BLOCK LOGIC (Stops Propagation)
  const handleStatusUpdate = async (e: React.MouseEvent, userId: string, currentStatus: boolean) => {
    e.stopPropagation(); // Prevents card click (Navigation)
    e.preventDefault();
    
    if(!userId) return alert("Error: No User ID found!");

    setUpdatingId(userId);
    
    try {
        const newStatus = !currentStatus;
        const res = await fetch('/api/admin/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isActive: newStatus })
        });

        const data = await res.json();
        if (data.success) {
            // Optimistic UI Update
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: newStatus } : u));
        } else {
            alert(data.message || "Failed to update status");
        }
    } catch (error) {
        console.error(error);
        alert("Network Error");
    } finally {
        setUpdatingId(null);
    }
  };

  // 3. 🔥 NAVIGATION LOGIC
  const handleUserClick = (userId: string) => {
      if(!userId) {
          alert("Error: User ID is undefined.");
          return;
      }
      router.push(`/admin/users/${userId}`);
  };

  // Helper: Get Role Badge
  const getRoleBadge = (role: string) => {
    if(role === 'superadmin' || role === 'super_admin') return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase border border-purple-200">Super Admin</span>;
    if(role === 'admin') return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase border border-indigo-200">Admin</span>;
    return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase border border-slate-200">User</span>;
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'active') return matchesSearch && user.isActive;
    if (statusFilter === 'blocked') return matchesSearch && !user.isActive;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold mb-6 transition-colors">
            <ChevronLeft size={20} /> Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Users size={28} className="text-teal-600"/> User Directory
            </h1>
            
            {/* Filter Buttons */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {(['all', 'active', 'blocked'] as const).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                            statusFilter === filter 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-8">
             <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
             <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-all shadow-sm focus:shadow-md"
             />
        </div>
      </div>

      {/* USERS GRID */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" size={40} /></div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div 
                key={user._id} 
                onClick={() => handleUserClick(user._id)} // 🔥 Navigate on Card Click
                className="bg-white border border-slate-200 rounded-[24px] overflow-hidden hover:shadow-xl hover:border-teal-200 cursor-pointer transition-all duration-300 group flex flex-col relative"
              >
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <img 
                        src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=f1f5f9&color=475569&bold=true`} 
                        alt="Avatar"
                        className="w-20 h-20 rounded-[24px] object-cover border-4 border-slate-50"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    {getRoleBadge(user.role || 'user')}
                  </div>

                  <h3 className="font-bold text-xl text-slate-900 truncate">{user.name || "No Name"}</h3>
                  <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-4 truncate"><Mail size={14} /> {user.email}</p>
                  
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-xl mb-4 w-fit">
                        <MapPin size={14} className="text-teal-600" />
                        <span className="text-xs font-bold truncate">{user.location || "Unknown Location"}</span>
                  </div>
                </div>

                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Saved: {user.bookmarks?.length || 0}
                    </span>
                    
                    <button 
                        onClick={(e) => handleStatusUpdate(e, user._id, user.isActive)}
                        disabled={updatingId === user._id}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all flex items-center gap-2 z-10 ${
                            user.isActive 
                            ? 'text-red-500 bg-white border-red-100 hover:bg-red-500 hover:text-white' 
                            : 'text-green-600 bg-white border-green-100 hover:bg-green-600 hover:text-white'
                        }`}
                    >
                        {updatingId === user._id ? <Loader2 size={12} className="animate-spin" /> : user.isActive ? <Lock size={12}/> : <Unlock size={12}/>}
                        {user.isActive ? 'Block' : 'Unblock'}
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">No users found</h3>
            <p className="text-slate-500">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}