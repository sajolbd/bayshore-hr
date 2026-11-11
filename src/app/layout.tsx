import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Bayshore HR - HRMS Dashboard | Bayshore Communication",
  description: "Modern, premium HR Management System for Bayshore Communication.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-full flex flex-col text-slate-900 bg-slate-50 antialiased font-sans selection:bg-orange-100 selection:text-orange-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
