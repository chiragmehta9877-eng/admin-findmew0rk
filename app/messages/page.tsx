import React from 'react';
import { connectToDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
// 👇 Updated Import path based on where you put the component
import EnquiriesList from '@/components/EnquiriesList'; 

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  await connectToDB();
  
  // Fetch messages (Newest First)
  // .lean() is important for performance and serialization
  const rawMessages = await Contact.find({}).sort({ createdAt: -1 }).lean();
  
  // Convert _id and dates to string to avoid serialization warnings
  const messages = JSON.parse(JSON.stringify(rawMessages));

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      
      <div className="max-w-[1600px] mx-auto p-6 md:p-10">
        
        {/* --- NAVIGATION --- */}
        <div className="mb-8">
            <Link 
                href="/dashboard" 
                className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors duration-200"
            >
                <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                Back to Dashboard
            </Link>
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              Enquiries & Messages
            </h1>
            <p className="text-gray-500 max-w-lg leading-relaxed">
              View and manage incoming support requests. Keep track of user feedback directly from here.
            </p>
          </div>
          
          {/* Stat Pill */}
          <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-full border border-gray-100">
              <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center text-[10px] font-bold shadow-sm">
                    <MessageSquare size={14} className="text-gray-900"/>
                  </div>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total</span>
                  <span className="text-sm font-bold text-gray-900 leading-none">{messages.length} Messages</span>
              </div>
          </div>
        </div>

        {/* --- CLIENT LIST COMPONENT --- */}
        <EnquiriesList initialMessages={messages} />

      </div>
    </div>
  );
}