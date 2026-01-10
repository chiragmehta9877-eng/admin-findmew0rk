'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import { 
  FiSettings, FiAlertTriangle, FiUserPlus, FiPlus, FiSave, FiX, FiLock, FiCheckCircle
} from 'react-icons/fi';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Create User State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  // 1. Fetch Initial Settings
  useEffect(() => {
    // @ts-ignore
    if (session?.user?.role === 'super_admin') {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => { if(data.success) setMaintenanceMode(data.isEnabled); });
    }
  }, [session]);

  // 2. Toggle Maintenance
  const toggleMaintenance = async () => {
      const newState = !maintenanceMode;
      const confirmMsg = newState 
          ? "🚨 DANGER: Are you sure you want to activate MAINTENANCE MODE? Users won't be able to access the site." 
          : "Are you sure you want to make the site LIVE again?";
      
      if(!confirm(confirmMsg)) return;

      setMaintenanceMode(newState); // Optimistic Update
      try {
          await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isEnabled: newState })
          });
      } catch (error) {
          alert("Failed to update settings");
          setMaintenanceMode(!newState); // Revert on error
      }
  };

  // 3. Create User Logic
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
        } else {
            alert("❌ Error: " + data.error);
        }
    } catch (error) { alert("Failed to create user"); }
  };

  // 🔒 ACCESS DENIED VIEW
  // @ts-ignore
  if (session?.user?.role !== 'super_admin') {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] bg-slate-50 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm border border-red-100">
                <FiLock />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Access Denied</h3>
            <p className="text-slate-500 max-w-md mt-2">
                This area is restricted to <strong>Super Admins</strong> only.
            </p>
        </div>
      );
  }

  // ✅ MAIN SETTINGS UI
  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
        
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <FiSettings className="text-slate-400" /> Platform Settings
            </h1>
            <p className="text-slate-500 mt-2">Manage global configurations and administrative access.</p>
        </div>

        <div className="max-w-4xl space-y-6">
            
            {/* 1. MAINTENANCE MODE CARD */}
            <div className={`border rounded-2xl p-8 transition-all shadow-sm ${maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FiAlertTriangle className={maintenanceMode ? "text-red-600" : "text-slate-400"} />
                            Maintenance Mode
                        </h3>
                        <p className="text-sm text-slate-600 mt-2 max-w-lg leading-relaxed">
                            When enabled, the entire public website will show a <strong>"Under Maintenance"</strong> page. 
                            Users will not be able to search or apply for jobs.
                        </p>
                    </div>
                    
                    <button 
                        onClick={toggleMaintenance}
                        className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 ${maintenanceMode ? 'bg-red-600 focus:ring-red-200' : 'bg-slate-300 focus:ring-slate-200'}`}
                    >
                        <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform ${maintenanceMode ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                </div>
                
                {maintenanceMode && (
                    <div className="mt-6 p-3 bg-red-100/50 rounded-lg border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-pulse">
                        <FiAlertTriangle /> WEBSITE IS CURRENTLY OFFLINE FOR USERS
                    </div>
                )}
            </div>

            {/* 2. CREATE USER CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FiUserPlus className="text-purple-600" />
                            Create New Admin/User
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-lg">
                            Manually create an account with <strong>Email & Password</strong> access. 
                            Useful for inviting team members who don't use Google Login.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowCreateUserModal(true)} 
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <FiPlus /> Add User
                    </button>
                </div>
            </div>

        </div>

        {/* MODAL FOR CREATE USER */}
        {showCreateUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-slate-800">Create New User</h3>
                        <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={24}/></button>
                    </div>
                    <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                            <input type="text" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="e.g. John Doe" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                            <input type="email" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="e.g. john@example.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                            <input type="password" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Assign Role</label>
                            <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="user">User (No Admin Access)</option>
                                <option value="admin">Admin (Limited Access)</option>
                                <option value="super_admin">Super Admin (Full Access)</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg shadow-purple-500/20"><FiSave /> Create Account</button>
                    </form>
                </div>
            </div>
        )}

    </div>
  );
}