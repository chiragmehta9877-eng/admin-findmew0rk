'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiLoader, FiPlusCircle } from 'react-icons/fi';

export default function CreateJob() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    job_title: '',
    employer_name: '',
    category: 'General',
    source: 'linkedin', 
    apply_link: '',
    text: '' 
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // 🔥 FIX: 'updated_by' bhejna padega tabhi System ki jagah Admin aayega
      const payload = {
        ...formData,
        updated_by: 'Admin' // <--- Yahan apna naam ya 'Admin' likho
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("🎉 New Job Created Successfully!");
        router.push('/dashboard/jobs'); 
        router.refresh();
      } else {
        alert("Failed to create job.");
      }
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
        <FiArrowLeft /> Back to Jobs
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FiPlusCircle size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Post a New Job</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Job Title *</label>
              <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} placeholder="e.g. Senior React Developer" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company Name *</label>
              <input type="text" name="employer_name" value={formData.employer_name} onChange={handleChange} placeholder="e.g. Google" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="ESG">ESG & Sustainability</option>
                  <option value="Developer">Software Engineer</option>
                  <option value="Internship">Internships</option>
                  <option value="Product">Product Management</option>
                  <option value="Data">Data Science & AI</option>
                  <option value="Business">Business & Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="General">General/Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Source Label</label>
              <select name="source" value={formData.source} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="manual">Manual / Direct</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Apply Link / URL *</label>
             <input type="url" name="apply_link" value={formData.apply_link} onChange={handleChange} placeholder="https://company.com/careers/apply/123" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 font-medium" required />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Description / Details</label>
             <textarea name="text" rows={6} value={formData.text} onChange={handleChange} placeholder="Paste job description here..." className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
             <button type="submit" disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20">
               {saving ? <FiLoader className="animate-spin" /> : <FiPlusCircle />} 
               {saving ? 'Creating...' : 'Create Job'}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}