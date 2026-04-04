'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { Sheet, SheetContent, SheetTitle } from '@corpusai/ui';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Widget routes bypass the shell entirely (public, no auth)
  if (pathname?.startsWith('/widget/')) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#111113]">
        <div className="text-center">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-[#2E2E34]" />
            <div className="absolute inset-0 rounded-full border-t border-slate-400 dark:border-[#8A8A98] animate-spin" />
          </div>
          <p className="mt-4 text-sm text-slate-400 dark:text-[#3F3F46]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111113]">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar (Sheet drawer) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[240px] bg-white dark:bg-[#08080A] border-r border-slate-200 dark:border-white/[0.06]"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="lg:ml-[240px] flex flex-col min-h-screen relative">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="relative flex-1 p-4 lg:p-6" style={{ zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
