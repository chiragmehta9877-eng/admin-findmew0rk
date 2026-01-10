import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar: Mobile pe hidden rahega (logic Sidebar.tsx me hai), Desktop pe dikhega */}
      <Sidebar />

      {/* Main Content Area */}
      {/* md:flex-1 ka matlab desktop pe baki jagah lega */}
      {/* overflow-y-auto taaki sidebar fix rahe aur content scroll ho */}
      <main className="flex-1 overflow-y-auto h-screen w-full">
        {/* Mobile Header ke liye upar thodi jagah chhodni padegi (pt-16) */}
        <div className="pt-16 md:pt-0">
            {children}
        </div>
      </main>
    </div>
  );
}