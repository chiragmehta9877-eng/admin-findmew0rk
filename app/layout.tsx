import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // 👈 Import This

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
    <html lang="en">
      <body className={inter.className}>
        {/* 👇 Wrap everything inside Providers */}
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}