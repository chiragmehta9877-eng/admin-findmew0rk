'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiLoader, FiExternalLink } from 'react-icons/fi';

const JOB_CATEGORIES = [
  { name: "All Jobs", value: "job" },
  { name: "Internships", value: "internship" },
  { name: "Freelance", value: "freelance" },
  { name: "Software Engineer", value: "Developer" },
  { name: "Data Science & AI", value: "Data" },
];

export default function EditJob({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    job_title: '',
    employer_name: '',
    category: '',
    source: '',
    apply_link: '',
    original_post_link: '', // 🔥 Added for Original Post Link
    text: '',
    isSpotlight: false 
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        
        if (data.success) {
          const job = data.data;

          // 🔥 STEP 1: Determine Apply Link
          let foundLink = job.apply_link || job.job_url || job.url || job.link || '';

          // 🔥 STEP 2: Construct Original Thread Link (Twitter/X) if empty
          let originalLink = '';
          if (job.source === 'twitter' && job.job_id) {
             const cleanId = job.job_id.includes('__') ? job.job_id.split('__')[0] : job.job_id;
             const username = job.employer_name ? job.employer_name.replace('@', '') : 'i';
             originalLink = `https://x.com/${username}/status/${cleanId}`;
          }

          // 🔥 STEP 3: Fallback - Extract from Text (Regex)
          if (!foundLink && job.text) {
             const urlMatch = job.text.match(/(https?:\/\/[^\s]+)/);
             if (urlMatch) foundLink = urlMatch[0];
          }

          setFormData({
            job_title: job.job_title || '',
            employer_name: job.employer_name || '',
            category: job.category || 'job', 
            source: job.source || 'manual',
            apply_link: foundLink, 
            original_post_link: job.job_url || originalLink, // Populate original link
            text: job.text || '',
            isSpotlight: job.isSpotlight || false 
          });
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      }
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        // Sync both link fields
        job_url: formData.original_post_link, // Save original post link here
        url: formData.apply_link,
        link: formData.apply_link,
        updated_by: 'Admin'
      };

      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Job Updated Successfully!");
        router.push('/dashboard/jobs'); 
        router.refresh();
      } else {
        alert("Failed to update.");
      }
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading job details...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
        <FiArrowLeft /> Back to Jobs
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Job Details</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
              <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
              <input type="text" name="employer_name" value={formData.employer_name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Source</label>
              <select name="source" value={formData.source} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="manual">Manual / Web</option>
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
                Enable this to make the job shine on the frontend.
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Apply Link / Email</label>
                <input 
                  type="text" 
                  name="apply_link" 
                  value={formData.apply_link} 
                  onChange={handleChange} 
                  placeholder="mailto: or https://..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 font-medium" 
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Description / Post Text</label>
              <textarea name="text" rows={8} value={formData.text} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20">
                {saving ? <FiLoader className="animate-spin" /> : <FiSave />} 
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
          </div>

        </form>
      </div>
    </div>
  );
}