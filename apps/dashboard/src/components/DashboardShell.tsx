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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-line" />
            <div className="absolute inset-0 rounded-full border-t border-ink animate-spin" />
          </div>
          <p className="mt-4 text-sm text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar (Sheet drawer) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[240px] bg-canvas border-r border-line"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="lg:ml-[240px] flex flex-col min-h-screen relative">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="relative flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
