'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Lock,
  Globe,
  Layout,
  Monitor
} from 'lucide-react';

interface EnvStatus {
    production: boolean;
    netlify: boolean;
    localhost: boolean;
    [key: string]: boolean; 
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 1. Initial State
  const [envStatus, setEnvStatus] = useState<EnvStatus>({
      production: false,
      netlify: false,
      localhost: false
  });

  // Helper: Show Notification
  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // 2. Fetch Settings & Security Check
  useEffect(() => {
    if (status === 'loading') return;

    // 🔒 SECURITY GATE: Only Super Admin
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'super_admin') {
        router.push('/dashboard'); // Redirect unauthorized users
        return;
    }
    
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings', { cache: 'no-store' });
            const data = await res.json();

            if (data.success && data.status) {
                setEnvStatus(prev => ({ ...prev, ...data.status }));
            }
        } catch (err) {
            console.error("❌ Fetch Error:", err);
            showNotification('error', 'Failed to load system settings');
        } finally {
            setLoading(false);
        }
    };

    fetchSettings();
  }, [status, session, router]);

  // 3. Toggle Logic
  const toggleEnvironment = async (key: string) => {
      const currentVal = envStatus[key];
      const newState = !currentVal; 

      setEnvStatus(prev => ({ ...prev, [key]: newState }));

      try {
          const res = await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ environment: key, isEnabled: newState })
          });

          const responseData = await res.json();

          if (!res.ok || !responseData.success) {
              throw new Error(responseData.error || "Server failed");
          }
          
          showNotification(
            newState ? 'error' : 'success', 
            `${key.toUpperCase()} is now ${newState ? 'UNDER MAINTENANCE 🛑' : 'LIVE 🟢'}`
          );

      } catch (error) {
          console.error("❌ Save Failed:", error);
          showNotification('error', 'Failed to save setting. Reverting...');
          setEnvStatus(prev => ({ ...prev, [key]: currentVal })); 
      }
  };

  // 🟡 RENDER: LOADING / AUTH CHECK
  if (status === 'loading' || loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-slate-500 font-medium">Authenticating & Loading Settings...</p>
            </div>
        </div>
    );
  }

  // 🟢 RENDER: DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
       
       {/* Toast Notification */}
       {notification && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right z-50 ${
          notification.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
          <div>
              <p className="font-bold text-sm">{notification.type === 'success' ? 'System Live' : 'Maintenance Alert'}</p>
              <p className="text-xs opacity-90">{notification.text}</p>
          </div>
        </div>
      )}

       <div className="max-w-5xl mx-auto">
           {/* Header Section */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
               <div>
                   <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-full tracking-wider">Admin Control</span>
                       <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> System Active
                       </span>
                   </div>
                   <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                       <Shield className="text-indigo-600" size={36} /> 
                       Command Center
                   </h1>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* LEFT COL: Main Controls (Spans 2 columns) */}
               <div className="lg:col-span-2 space-y-8">
                   
                   {/* Environment Control Card */}
                   <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                       <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                           <div>
                               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                   <Server className="text-slate-400" size={20} />
                                   Environment Status
                               </h3>
                               <p className="text-sm text-slate-500 mt-1">Toggle switches to enable/disable Maintenance Mode.</p>
                           </div>
                       </div>
                       
                       <div className="divide-y divide-slate-100">
                           {[
                               { id: 'production', label: 'Production', sub: 'findmew0rk.com', icon: Globe },
                               { id: 'netlify', label: 'Staging Server', sub: 'netlify.app', icon: Layout },
                               { id: 'localhost', label: 'Local Development', sub: 'localhost:3000', icon: Monitor },
                           ].map((env) => (
                               <div key={env.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                   <div className="flex items-center gap-4">
                                       <div className={`p-3 rounded-2xl ${envStatus[env.id] ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                           <env.icon size={24} />
                                       </div>
                                       <div>
                                           <p className="font-bold text-lg text-slate-800">{env.label}</p>
                                           <span className="text-xs text-slate-400 font-mono">
                                               {env.sub}
                                           </span>
                                       </div>
                                   </div>

                                   <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto bg-slate-100 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                           <div className="text-right">
                                               <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
                                               <p className={`text-sm font-bold ${envStatus[env.id] ? 'text-red-600' : 'text-green-600'}`}>
                                                   {envStatus[env.id] ? 'MAINTENANCE' : 'LIVE'}
                                               </p>
                                           </div>
                                           
                                           <button 
                                               onClick={() => toggleEnvironment(env.id)}
                                               className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
                                                   envStatus[env.id] ? 'bg-red-500' : 'bg-slate-300'
                                               }`}
                                           >
                                               <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                                   envStatus[env.id] ? 'translate-x-7' : 'translate-x-1'
                                               }`} />
                                           </button>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>

               {/* RIGHT COL: Admin Note */}
               <div className="space-y-6">
                   <div className="bg-slate-900 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                           <AlertTriangle size={100} />
                       </div>
                       <h4 className="font-bold text-white mb-2 relative z-10">Admin Note</h4>
                       <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
                           <strong className="text-white">Red Toggle (ON):</strong> Site is in Maintenance Mode (Users see "Upgrading" screen).
                           <br/><br/>
                           <strong className="text-white">Grey Toggle (OFF):</strong> Site is LIVE (Users can access everything).
                           <br/><br/>
                           Changes reflect immediately.
                       </p>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
}