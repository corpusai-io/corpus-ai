'use client';

import { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

interface UserDropdownProps {
  open: boolean;
  onClose: () => void;
}

export default function UserDropdown({ open, onClose }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open || !user) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111113] rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xl dark:shadow-2xl dark:shadow-black/60 z-50 overflow-hidden"
      style={{ animation: 'fadeInUp 0.15s cubic-bezier(0,0,0.2,1) both' }}
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {user.name || user.username}
        </p>
        <p className="text-xs text-slate-400 dark:text-[#71717A] truncate mt-0.5">{user.email}</p>
      </div>

      <div className="py-1.5">
        <Link
          href="/settings/billing"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <Settings className="h-4 w-4 text-slate-400 dark:text-[#3F3F46]" />
          Account Settings
        </Link>
      </div>

      <div className="border-t border-slate-100 dark:border-white/[0.06] py-1.5">
        <button
          onClick={() => { onClose(); logout(); }}
          className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 dark:text-[#EC4899] hover:bg-red-50 dark:hover:bg-[#EC4899]/10 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
