'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bot,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  BarChart3,
  Database,
  Users,
  Shield,
  Link2,
  Zap,
  Paintbrush,
  Rocket,
  Wrench,
  CircuitBoard,
  Key,
  ArrowUpRight,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { quotaApi } from '@/lib/api';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  indent?: boolean;
}

function NavItem({ href, icon, label, active, onClick, indent }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        indent ? 'ml-3' : ''
      } ${
        active
          ? 'bg-slate-100 dark:bg-[#1C1C20] text-slate-800 dark:text-[#E8E8F0] border border-slate-200 dark:border-[#2E2E36] shadow-sm'
          : 'text-slate-500 dark:text-[#58585E] hover:text-slate-700 dark:hover:text-[#A8A8B0] hover:bg-slate-50 dark:hover:bg-[#17171A] border border-transparent'
      }`}
    >
      <span className={`shrink-0 transition-colors ${active ? 'text-slate-500 dark:text-[#A8A8B0]' : 'text-slate-400 dark:text-[#40404A]'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

interface ExpandableNavProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function ExpandableNav({ icon, label, active, defaultOpen = false, children }: ExpandableNavProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 border border-transparent ${
          active ? 'text-slate-700 dark:text-[#D0D0D8]' : 'text-slate-500 dark:text-[#58585E] hover:text-slate-700 dark:hover:text-[#A8A8B0] hover:bg-slate-50 dark:hover:bg-[#17171A]'
        }`}
      >
        <span className={`shrink-0 ${active ? 'text-slate-500 dark:text-[#A8A8B0]' : 'text-slate-400 dark:text-[#40404A]'}`}>{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-[#3A3A42]" />
          : <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-[#3A3A42]" />}
      </button>
      {open && <div className="mt-0.5 space-y-0.5">{children}</div>}
    </div>
  );
}

interface QuotaData {
  chatUsage: number;
  chatQuota: number;
  chatbotCount: number;
  chatbotQuota: number;
  storageUsed: number;
  storageQuota: number;
}

function formatStorageShort(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  if (bytes >= 1024 * 1024)        return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  if (bytes >= 1024)               return `${(bytes / 1024).toFixed(0)}KB`;
  return `${bytes}B`;
}

function QuotaBar({ label, value, max, suffix = '' }: { label: string; value: number; max: number; suffix?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isHigh = pct >= 80;
  return (
    <div className="space-y-1.5 px-1">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-slate-500 dark:text-[#50505A]">{label}</span>
        <span className="text-slate-600 dark:text-[#6A6A74]">{value}{suffix} / {max}{suffix}</span>
      </div>
      <div className="h-1 w-full bg-slate-200 dark:bg-[#26262B] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-red-400 dark:bg-[#9E4A4A]' : 'bg-slate-500 dark:bg-[#4A4A5A]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Sidebar({ onNavClick }: { onNavClick?: () => void } = {}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [quota, setQuota] = useState<QuotaData | null>(null);

  const chatbotMatch = pathname.match(/^\/chatbots\/([^/]+)/);
  const chatbotId = chatbotMatch ? chatbotMatch[1] : null;
  const isOnChatbotDetail = !!chatbotId && chatbotId !== 'create';

  useEffect(() => {
    if (!user) return;
    quotaApi.get()
      .then((data: any) => {
        const q = data.quota;
        setQuota({
          chatUsage:    q?.chat?.usage    ?? data.chatUsage    ?? 0,
          chatQuota:    q?.chat?.quota    ?? data.chatQuota    ?? 20,
          chatbotCount: q?.chatbot?.usage ?? data.chatbotCount ?? 0,
          chatbotQuota: q?.chatbot?.quota ?? data.chatbotQuota ?? 1,
          storageUsed:  q?.storage?.usage ?? data.storageUsed  ?? 0,
          storageQuota: q?.storage?.quota ?? data.storageQuota ?? 10 * 1024 * 1024,
        });
      })
      .catch(() => {});
  }, [pathname, user]);

  const isActive = (path: string) => pathname === path;
  const isActivePrefix = (prefix: string) => pathname.startsWith(prefix);

  return (
    <aside className="w-[240px] h-screen bg-white dark:bg-[#0E0E10] border-r border-slate-200 dark:border-[#1E1E22] flex flex-col fixed left-0 top-0 z-40">

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="h-14 flex items-center px-5 border-b border-slate-200 dark:border-[#1E1E22] bg-slate-50 dark:bg-[#111113]">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Corpus AI" className="h-6 dark:brightness-0 dark:invert dark:opacity-75 opacity-90" />
        </Link>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

        {/* Workspace group */}
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-[#3A3A42] mb-2 px-3 uppercase">
            Workspace
          </p>
          <nav className="space-y-0.5">
            <NavItem
              href="/"
              icon={<LayoutDashboard size={16} />}
              label="Dashboard"
              active={isActive('/')}
              onClick={onNavClick}
            />
            <NavItem
              href="/chatbots"
              icon={<Bot size={16} />}
              label="Chatbots"
              active={isActive('/chatbots') || isActive('/chatbots/create')}
              onClick={onNavClick}
            />
            <ExpandableNav
              icon={<Settings size={16} />}
              label="Settings"
              active={isActivePrefix('/settings')}
              defaultOpen={isActivePrefix('/settings')}
            >
              <NavItem
                href="/settings/billing"
                icon={<CreditCard size={16} />}
                label="Billing"
                active={isActive('/settings/billing')}
                onClick={onNavClick}
                indent
              />
            </ExpandableNav>
          </nav>
        </div>

        {/* Chatbot group — only when on a chatbot detail page */}
        {isOnChatbotDetail && (
          <>
            <div className="h-px bg-slate-200 dark:bg-[#1E1E22]" />

            <div>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-[#3A3A42] mb-2 px-3 uppercase">
                Chatbot
              </p>
              <nav className="space-y-0.5">
                <NavItem href={`/chatbots/${chatbotId}/chat`}       icon={<MessageSquare size={16} />} label="Chat"         active={isActive(`/chatbots/${chatbotId}/chat`)}       onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/analytics`}  icon={<BarChart3 size={16} />}     label="Analytics"    active={isActive(`/chatbots/${chatbotId}/analytics`)}  onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/datastores`} icon={<Database size={16} />}      label="Data Sources" active={isActive(`/chatbots/${chatbotId}/datastores`)} onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/leads`}      icon={<Users size={16} />}         label="Leads"        active={isActive(`/chatbots/${chatbotId}/leads`)}      onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/deploy`}     icon={<Rocket size={16} />}        label="Deploy"       active={isActive(`/chatbots/${chatbotId}/deploy`)}     onClick={onNavClick} />
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-[#3A3A42] mb-2 px-3 uppercase">
                Tools
              </p>
              <nav className="space-y-0.5">
                <ExpandableNav
                  icon={<Wrench size={16} />}
                  label="Tools"
                  active={isActivePrefix(`/chatbots/${chatbotId}/tools`)}
                  defaultOpen={isActivePrefix(`/chatbots/${chatbotId}/tools`)}
                >
                  <NavItem href={`/chatbots/${chatbotId}/tools/ai-actions`} icon={<Zap size={16} />}          label="AI Actions" active={isActive(`/chatbots/${chatbotId}/tools/ai-actions`)} onClick={onNavClick} indent />
                  <NavItem href={`/chatbots/${chatbotId}/tools/databases`}  icon={<CircuitBoard size={16} />}  label="Databases"  active={isActive(`/chatbots/${chatbotId}/tools/databases`)}  onClick={onNavClick} indent />
                </ExpandableNav>

                <ExpandableNav
                  icon={<Settings size={16} />}
                  label="Settings"
                  active={isActivePrefix(`/chatbots/${chatbotId}/settings`)}
                  defaultOpen={isActivePrefix(`/chatbots/${chatbotId}/settings`)}
                >
                  <NavItem href={`/chatbots/${chatbotId}/settings`}               icon={<Settings size={16} />}   label="General"       active={isActive(`/chatbots/${chatbotId}/settings`)}               onClick={onNavClick} indent />
                  <NavItem href={`/chatbots/${chatbotId}/settings/customization`} icon={<Paintbrush size={16} />} label="Customization" active={isActive(`/chatbots/${chatbotId}/settings/customization`)} onClick={onNavClick} indent />
                  <NavItem href={`/chatbots/${chatbotId}/settings/api-keys`}      icon={<Key size={16} />}        label="API Keys"      active={isActive(`/chatbots/${chatbotId}/settings/api-keys`)}      onClick={onNavClick} indent />
                  <NavItem href={`/chatbots/${chatbotId}/settings/integrations`}  icon={<Link2 size={16} />}      label="Integrations"  active={isActive(`/chatbots/${chatbotId}/settings/integrations`)}  onClick={onNavClick} indent />
                  <NavItem href={`/chatbots/${chatbotId}/settings/security`}      icon={<Shield size={16} />}     label="Security"      active={isActive(`/chatbots/${chatbotId}/settings/security`)}      onClick={onNavClick} indent />
                </ExpandableNav>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* ── Quota + Upgrade ───────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3 border-t border-slate-200 dark:border-[#1E1E22] bg-white dark:bg-[#0E0E10]">
        {quota && (
          <div className="space-y-3 mb-4">
            <QuotaBar label="Queries"  value={quota.chatUsage}    max={quota.chatQuota} />
            <QuotaBar label="Chatbots" value={quota.chatbotCount} max={quota.chatbotQuota} />
            <QuotaBar
              label="Storage"
              value={Math.round(quota.storageUsed / (1024 * 1024))}
              max={Math.round(quota.storageQuota / (1024 * 1024))}
              suffix="MB"
            />
          </div>
        )}

        {user && user.tier < 3 && (
          <Link
            href="/settings/billing"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-[#F0F0F4] text-white dark:text-[#111113] hover:bg-slate-800 dark:hover:bg-white transition-all shadow-sm"
          >
            <ArrowUpRight className="h-4 w-4" />
            Upgrade Plan
          </Link>
        )}
      </div>
    </aside>
  );
}
