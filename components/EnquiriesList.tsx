'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Clock, ArrowUpRight, CheckCircle2, 
  Trash2, ChevronLeft, ChevronRight, LayoutGrid, RefreshCcw 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EnquiriesList({ initialMessages }: { initialMessages: any[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;

  // 🔥 IMPORTANT: Sync state when server data updates (after refresh)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // --- REFRESH LOGIC ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh(); // Re-fetches data from server
    
    // Visual timeout (just for smooth UX)
    setTimeout(() => {
        setIsRefreshing(false);
    }, 1000);
  };

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentMessages = messages.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    const previousMessages = [...messages];
    setMessages((prev) => prev.filter((msg) => msg._id !== id));

    try {
      const res = await fetch('/api/contact', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
      
      if (currentMessages.length === 1 && page > 1) {
          setPage(page - 1);
      }

    } catch (error) {
      console.error(error);
      alert("Failed to delete from server.");
      setMessages(previousMessages);
    }
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 relative">
        {/* Refresh Button even on empty state */}
        <button 
            onClick={handleRefresh}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
            title="Refresh List"
        >
            <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>

        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 text-gray-300">
          <LayoutGrid size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
        <p className="text-gray-500 mt-2">No enquiries found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* --- ACTION BAR (Refresh) --- */}
      <div className="flex justify-end mb-6">
        <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-black transition-all shadow-sm active:scale-95"
        >
            <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh List
        </button>
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {currentMessages.map((msg: any) => (
          <div 
            key={msg._id} 
            className="group flex flex-col h-full bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out relative"
          >
            {/* Delete Button */}
            <button 
                onClick={() => handleDelete(msg._id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Delete Message"
            >
                <Trash2 size={16} />
            </button>

            {/* Card Header */}
            <div className="flex justify-between items-start mb-6 pr-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-gray-50">
                  {getInitials(msg.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">
                    {msg.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <Mail size={12} className="text-gray-400"/> {msg.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Badge */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                <CheckCircle2 size={10} /> {msg.subject}
              </span>
            </div>

            {/* Message Body */}
            <div className="flex-1">
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                {msg.message}
              </p>
            </div>

            {/* Card Footer */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                  <Clock size={10} />
                  {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
              
              <a 
                href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} 
                className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-all hover:pr-7"
              >
                Reply
                <ArrowUpRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, messages.length)}</span> of {messages.length} results
            </p>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handlePrev} 
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                <button 
                    onClick={handleNext} 
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
      )}
    </div>
  );
}