"use client";
import { useState } from "react"; // State chahiye menu toggle ke liye
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  FiHome, FiLogOut, FiBriefcase, FiSettings, FiMenu, FiX 
} from "react-icons/fi";

const menuItems = [
  { name: "Overview", icon: FiHome, href: "/dashboard" },
  { name: "Manage Jobs", icon: FiBriefcase, href: "/dashboard/jobs" },
  { name: "Settings", icon: FiSettings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu State

  return (
    <>
      {/* 🔥 MOBILE HEADER (Sirf Mobile pe dikhega) */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">
            FindMe<span className="text-teal-600">Work</span>
        </h1>
        <button onClick={() => setIsOpen(true)} className="text-gray-600 focus:outline-none p-2">
            <FiMenu size={24} />
        </button>
      </div>

      {/* 🔥 OVERLAY (Jab mobile menu khulega, peeche ka dhundhla ho jayega) */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR CONTAINER */}
      <div className={`
        fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 w-64
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block
      `}>
        
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            FindMe<span className="text-teal-600">Work</span>
          </h1>
          {/* Close Button (Mobile Only) */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-red-500">
            <FiX size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Mobile pe click karte hi menu band ho jaye
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-gray-100 text-teal-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-teal-600" : ""} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <FiLogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}