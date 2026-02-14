export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">

      <main className="flex-1 w-full">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>

    </div>
  );
}