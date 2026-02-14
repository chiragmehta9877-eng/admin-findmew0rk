import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MainLayout from "@/components/MainLayout"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FindMeWork Admin",
  description: "Super Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🔥 FIX 1: 'h-full' added to html
    <html lang="en" className="h-full">
      
      {/* 🔥 FIX 2: 'h-full' & 'overflow-hidden' added to body.
          यह Browser के Main Scrollbar को जबरदस्ती हटा देगा। 
      */}
      <body className={`${inter.className} h-full overflow-hidden bg-gray-50`}>
        <Providers>
            <MainLayout>
                {children}
            </MainLayout>
        </Providers>
      </body>
    </html>
  );
}