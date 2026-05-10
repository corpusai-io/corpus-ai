'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, FileText, Bot, Trash2, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useHeaderStore } from '@/stores/header-store';
import UserDropdown from './UserDropdown';

const TIER_NAMES: Record<number, string> = {
  0: 'Free',
  1: 'Starter',
  2: 'Standard',
  3: 'Business',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chatContext = useHeaderStore((s) => s.chatContext);

  const initials = user
    ? (user.name || user.email || '?')
        .split(/[\s@]/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s: string) => s[0].toUpperCase())
        .join('')
    : '?';

  const displayName = user?.name || user?.email?.split('@')[0] || '';
  const tier = user?.tier ?? 0;
  const tierName = TIER_NAMES[tier] || 'Free';

  return (
    <header className="h-14 bg-white/90 dark:bg-[#111113]/90 backdrop-blur-sm border-b border-slate-200 dark:border-[#1E1E22] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">

      {/* ── Left ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 dark:text-[#58585E] hover:text-slate-600 dark:hover:text-[#A8A8B0] hover:bg-slate-100 dark:hover:bg-[#1C1C20] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {chatContext ? (
          /* ── Chat context: show bot identity ── */
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-slate-400 dark:text-[#8A8A98]" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-[#E8E8F0]">{chatContext.chatbotName}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1C1C20] text-slate-400 dark:text-[#58585E] text-[10px] font-medium border border-slate-200 dark:border-[#2A2A30]">
              Preview
            </span>
          </div>
        ) : (
          /* ── Default: logo (mobile) + tier badge (desktop) ── */
          <>
            <Link href="/" className="flex items-center lg:hidden">
              <img src="/logo.svg" alt="Corpus AI" className="h-5 dark:brightness-0 dark:invert dark:opacity-75 opacity-80" />
            </Link>
            {user && (
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#1C1C20] text-slate-500 dark:text-[#68686E] border border-slate-200 dark:border-[#2A2A30]">
                {tierName}
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Right ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">

        {/* Chat-specific actions: Clear + Settings */}
        {chatContext && (
          <>
            {chatContext.hasMessages && (
              <button
                onClick={chatContext.onClear}
                disabled={chatContext.clearingHistory}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 dark:text-[#58585E] hover:text-red-500 dark:hover:text-[#9E4A4A] hover:bg-slate-100 dark:hover:bg-[#1C1C20] transition-all disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {chatContext.clearingHistory ? 'Clearing…' : 'Clear'}
                </span>
              </button>
            )}
            <button
              onClick={() => router.push(`/chatbots/${chatContext.chatbotId}/settings`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 dark:text-[#58585E] hover:text-slate-600 dark:hover:text-[#B0B0BC] hover:bg-slate-100 dark:hover:bg-[#1C1C20] transition-all"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-[#26262B] mx-1" />
          </>
        )}

        {/* Docs — always visible */}
        <a
          href={process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3001'}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-[#68686E] border border-slate-200 dark:border-[#26262B] hover:bg-slate-50 dark:hover:bg-[#1C1C20] hover:text-slate-700 dark:hover:text-[#C0C0CC] hover:border-slate-300 dark:hover:border-[#32323A] transition-all duration-150"
        >
          <FileText className="h-3.5 w-3.5" />
          Docs
        </a>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-400 dark:text-[#58585E] hover:text-slate-600 dark:hover:text-[#A8A8B0] hover:bg-slate-100 dark:hover:bg-[#1C1C20] transition-colors"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-[#26262B] mx-1" />

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1C1C20] transition-colors group"
          >
            <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8A8A98]">{initials}</span>
            </div>
            {displayName && (
              <span className="hidden md:block text-xs font-medium text-slate-500 dark:text-[#78787E] group-hover:text-slate-700 dark:group-hover:text-[#A8A8B0] transition-colors max-w-[100px] truncate">
                {displayName}
              </span>
            )}
          </button>
          <UserDropdown open={dropdownOpen} onClose={() => setDropdownOpen(false)} />
        </div>
      </div>
    </header>
  );
}
