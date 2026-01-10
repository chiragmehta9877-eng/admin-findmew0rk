'use client';
import { useState, useEffect } from 'react';
import { 
  FiTrash2, FiSearch, FiUser, FiShield, FiCheckCircle, FiXCircle, FiRefreshCw, FiPlus 
} from 'react-icons/fi';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FETCH USERS
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // 2. GENERATE FAKE USERS (For Testing)
  const generateFakeUsers = async () => {
    if(!confirm("Create fake test users?")) return;
    await fetch('/api/users', { method: 'POST' });
    fetchUsers();
  };

  useEffect(() => { fetchUsers(); }, []);

  // 3. UPDATE ROLE / STATUS
  const handleUpdate = async (id: string, field: string, value: any) => {
    // Optimistic UI Update (Turant Change dikhana)
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
      setUsers(originalUsers); // Revert on error
    }
  };

  // 4. DELETE USER
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      const res = await fetch('/api/users', { 
        method: 'DELETE',
        body: JSON.stringify({ id })
      });
      if (res.ok) setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FiShield className="text-purple-600"/> User Management
           </h1>
           <p className="text-slate-500 text-sm">Manage access and permissions for {users.length} users.</p>
        </div>

        <div className="flex gap-3">
            {/* Generate Button (Only for testing) */}
            <button onClick={generateFakeUsers} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 text-sm transition-colors flex items-center gap-2">
                <FiPlus /> Seed Fake Users
            </button>
            <button onClick={fetchUsers} className="bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-50 text-slate-600"><FiRefreshCw className={loading ? "animate-spin" : ""}/></button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 relative">
         <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
         <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
         />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-gray-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 pl-6">User Info</th>
                <th className="p-4">Role (Permission)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? ( <tr><td colSpan={5} className="p-10 text-center text-slate-500">Loading users...</td></tr> ) : 
               filteredUsers.length === 0 ? ( <tr><td colSpan={5} className="p-10 text-center text-slate-500">No users found.</td></tr> ) :
               filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/80 transition">
                  
                  {/* Name & Email */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                    </div>
                  </td>

                  {/* Role Dropdown */}
                  <td className="p-4">
                    <select 
                        value={user.role} 
                        onChange={(e) => handleUpdate(user._id, 'role', e.target.value)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all ${
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

                  {/* Status Toggle */}
                  <td className="p-4">
                    <button 
                        onClick={() => handleUpdate(user._id, 'isActive', !user.isActive)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                            user.isActive 
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200" 
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                        }`}
                    >
                        {user.isActive ? <><FiCheckCircle /> Active</> : <><FiXCircle /> Blocked</>}
                    </button>
                  </td>

                  <td className="p-4 text-xs font-mono text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <button onClick={() => handleDelete(user._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}