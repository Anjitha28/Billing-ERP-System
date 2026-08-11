import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Billing ERP System",
  description: "Indian Business Billing, Invoicing, Tax, and Profit & Loss Management",
};

import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = (session?.user as any)?.role || "USER";

  return (
    <div className={`${inter.className} flex h-screen bg-theme-surface-hover`}>
      <Sidebar userRole={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
