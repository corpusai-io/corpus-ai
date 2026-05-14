'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, FileText, Trash2, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHeaderStore } from '@/stores/header-store';
import { Pill } from '@/components/corpus';
import UserDropdown from './UserDropdown';

const TIER_NAMES: Record<number, string> = {
  0: 'Free',
  1: 'Starter',
  2: 'Standard',
  3: 'Business',
};

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
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
  const tierName    = TIER_NAMES[user?.tier ?? 0] || 'Free';

  return (
    <header className="h-14 bg-canvas/85 backdrop-blur-md border-b border-line flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">

      {/* ── Left ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {chatContext ? (
          <>
            <button
              onClick={() => router.push('/chatbots')}
              className="text-[13px] text-muted hover:text-ink transition-colors"
            >
              Chatbots
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-muted-soft flex-shrink-0" />
            <span className="text-[13px] font-medium text-ink truncate max-w-[40vw]">
              {chatContext.chatbotName}
            </span>
            <Pill variant="mono" className="ml-2">Preview</Pill>
          </>
        ) : (
          user && <Pill variant="mono">{tierName} plan</Pill>
        )}
      </div>

      {/* ── Right ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">

        {/* Chat-specific actions */}
        {chatContext && (
          <>
            {chatContext.hasMessages && (
              <button
                onClick={chatContext.onClear}
                disabled={chatContext.clearingHistory}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-muted hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {chatContext.clearingHistory ? 'Clearing…' : 'Clear'}
                </span>
              </button>
            )}
            <button
              onClick={() => router.push(`/chatbots/${chatContext.chatbotId}/settings`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-muted hover:text-ink hover:bg-surface transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <div className="w-px h-4 bg-line mx-1" />
          </>
        )}

        <a
          href={process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3001'}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted border border-line hover:bg-surface hover:text-ink transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Docs
        </a>

        <div className="hidden sm:block w-px h-4 bg-line mx-1" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-surface transition-colors"
            aria-label="User menu"
          >
            <div className="h-7 w-7 rounded-full bg-canvas border border-line flex items-center justify-center">
              <span className="text-[10px] font-semibold text-muted">{initials}</span>
            </div>
            {displayName && (
              <span className="hidden md:block text-[12px] font-medium text-muted max-w-[100px] truncate">
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
