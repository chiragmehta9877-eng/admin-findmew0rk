"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page check
  const isLoginPage = pathname === "/login" || pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    // 🔥 Parent Fixed Wrapper
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {/* Sidebar (Fixed) */}
      <div className="flex-shrink-0 h-full relative z-20">
         <Sidebar />
      </div>

      {/* Main Content (Scrollable) */}
      {/* 🔥 सिर्फ़ यह 'main' div स्क्रोल होगा */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 relative z-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
         {children}
      </main>

    </div>
  );
}