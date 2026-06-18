import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ColabStatus from "@/components/ColabStatus";

export const metadata: Metadata = {
  title: "Shopee AI Co-Pilot",
  description: "AI Agent untuk optimasi penjualan Shopee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <ColabStatus />
      </body>
    </html>
  );
}
