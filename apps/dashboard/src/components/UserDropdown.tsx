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
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open || !user) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-60 bg-canvas rounded-xl border border-line shadow-lg z-50 overflow-hidden"
      style={{ animation: 'fadeInUp 0.15s cubic-bezier(0,0,0.2,1) both' }}
    >
      {/* Identity */}
      <div className="px-4 py-3 border-b border-line">
        <p className="text-[13px] font-medium text-ink truncate">{user.name || user.username}</p>
        <p className="text-[11px] text-muted truncate mt-0.5">{user.email}</p>
      </div>

      <div className="py-1.5">
        <Link
          href="/settings/billing"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-[13px] text-muted hover:bg-surface hover:text-ink transition-colors"
        >
          <Settings className="w-4 h-4 text-muted-soft" />
          Account settings
        </Link>
      </div>

      <div className="border-t border-line py-1.5">
        <button
          onClick={() => { onClose(); logout(); }}
          className="flex items-center gap-3 px-4 py-2 w-full text-[13px] text-muted hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
