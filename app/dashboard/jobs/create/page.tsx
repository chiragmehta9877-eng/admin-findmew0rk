'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiLoader, FiPlusCircle, FiExternalLink } from 'react-icons/fi';

// 🔥 Standardized Categories (Matches Frontend Filters)
const JOB_CATEGORIES = [
  { name: "IT & Software", value: "software" },
  { name: "Finance & Accounting", value: "finance" },
  { name: "Business & Management", value: "management" },
  { name: "Human Resources", value: "hr" },
  { name: "Sales & Marketing", value: "marketing" },
  { name: "ESG & Sustainability", value: "esg" },
  { name: "E-Commerce", value: "commerce" },
  { name: "Design & Architecture", value: "design" },
  { name: "Research & Analytics", value: "research" },
  { name: "Internships", value: "internship" },
  { name: "Freelance", value: "freelance" },
  { name: "Other / General", value: "other" },
];

export default function CreateJob() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    job_title: '',
    employer_name: '',
    category: 'software', // Default
    source: 'manual', 
    apply_link: '',
    original_post_link: '', // 🔥 New Field
    text: '',
    isSpotlight: false // 🔥 New Field
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox vs text input
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        // Map fields correctly for DB schema
        job_url: formData.original_post_link, 
        url: formData.apply_link,
        link: formData.apply_link,
        updated_by: 'Admin'
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
        const err = await res.json();
        alert("Failed: " + err.error);
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
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Source Label</label>
              <select name="source" value={formData.source} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="manual">Manual / Direct</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
              </select>
            </div>
          </div>

          {/* 🔥 SPOTLIGHT TOGGLE SECTION */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div>
                <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                ⚡ Spotlight Job
                </h3>
                <p className="text-xs text-yellow-600">
                Enable this to make the job shine on the frontend immediately.
                </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                type="checkbox" 
                name="isSpotlight"
                checked={formData.isSpotlight} 
                onChange={handleChange} 
                className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Apply Link / Email *</label>
                <input 
                    type="text" 
                    name="apply_link" 
                    value={formData.apply_link} 
                    onChange={handleChange} 
                    placeholder="mailto:hr@co.com or https://..." 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 font-medium" 
                    required 
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                   Original Post Link <FiExternalLink />
                </label>
                <input 
                  type="text" 
                  name="original_post_link" 
                  value={formData.original_post_link} 
                  onChange={handleChange} 
                  placeholder="https://x.com/..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-600" 
                />
            </div>
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