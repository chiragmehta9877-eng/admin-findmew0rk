import React from 'react';
import { connectToDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Lock } from 'lucide-react'; // 🔥 Lock Icon Added
import EnquiriesList from '@/components/EnquiriesList'; 

// 🔥 AUTH IMPORTS (Server Side)
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // 👈 Check this path matches your project

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  // 1. 🔥 SERVER SIDE AUTH CHECK
  const session = await getServerSession(authOptions);
  
  // Check specifically for 'super_admin' role
  const isSuperAdmin = (session?.user as any)?.role === 'super_admin';

  // 2. 🛑 IF NOT SUPER ADMIN - SHOW RESTRICTED SCREEN
  if (!isSuperAdmin) {
    return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center text-center p-6 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                <div className="mx-auto bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Lock size={32} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Restricted</h1>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    This page contains sensitive user data. <br/> Only <strong>Super Admins</strong> can view enquiries.
                </p>
                <Link href="/dashboard" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
  }

  // 3. ✅ IF SUPER ADMIN - FETCH DATA
  await connectToDB();
  
  // Fetch messages (Newest First)
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