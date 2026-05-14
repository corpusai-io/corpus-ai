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
  Key,
  ArrowUpRight,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { quotaApi } from '@/lib/api';
import { useChatbotStore } from '@/stores/chatbot-store';

/* ─── Nav row ─────────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string | number;
  indent?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon: Icon, label, active, badge, indent, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
        indent ? 'ml-3' : ''
      } ${
        active
          ? 'bg-surface text-ink'
          : 'text-muted hover:bg-surface hover:text-ink'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-ink' : 'text-muted-soft'}`} />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span className="font-mono text-[10px] text-muted-soft">{badge}</span>
      )}
    </Link>
  );
}

/* ─── Expandable group (for Configure) ───────────────────── */
function ExpandableGroup({
  icon: Icon,
  label,
  active,
  defaultOpen,
  children,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  useEffect(() => { if (defaultOpen) setOpen(true); }, [defaultOpen]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-left transition-colors ${
          active ? 'text-ink' : 'text-muted hover:bg-surface hover:text-ink'
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-ink' : 'text-muted-soft'}`} />
        <span className="flex-1">{label}</span>
        {open
          ? <ChevronDown  className="w-3.5 h-3.5 text-muted-soft" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-soft" />}
      </button>
      {open && <div className="space-y-0.5 mt-0.5">{children}</div>}
    </div>
  );
}

/* ─── Section header ──────────────────────────────────────── */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono uppercase text-[10px] font-semibold text-muted-soft mb-2 px-3 truncate"
      style={{ letterSpacing: '0.14em' }}
    >
      {children}
    </p>
  );
}

/* ─── Quota types ─────────────────────────────────────────── */
interface QuotaData {
  chatUsage: number;
  chatQuota: number;
  chatbotCount: number;
  chatbotQuota: number;
  storageUsed: number;
  storageQuota: number;
}

function formatMB(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  if (bytes >= 1024 * 1024)        return `${Math.round(bytes / (1024 * 1024))}MB`;
  if (bytes >= 1024)               return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

function QuotaRow({ label, used, total, pct }: { label: string; used: string; total: string; pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[10px]">
        <span
          className="font-mono uppercase text-muted-soft"
          style={{ letterSpacing: '0.14em' }}
        >
          {label}
        </span>
        <span className="font-mono text-muted">{used} / {total}</span>
      </div>
      <div className="h-[2px] w-full bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-ink rounded-full transition-all duration-500" style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
      </div>
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────── */
export default function Sidebar({ onNavClick }: { onNavClick?: () => void } = {}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const chatbots = useChatbotStore((s) => s.chatbots);
  const [quota, setQuota] = useState<QuotaData | null>(null);

  const chatbotMatch    = pathname?.match(/^\/chatbots\/([^/]+)/);
  const rawChatbotId    = chatbotMatch ? chatbotMatch[1] : null;
  const chatbotId       = rawChatbotId && rawChatbotId !== 'create' ? rawChatbotId : null;
  const isOnChatbot     = !!chatbotId;
  const currentBot      = isOnChatbot ? chatbots.find((c) => c.chatbotId === chatbotId) : null;
  const isActive        = (path: string) => pathname === path;
  const isActivePrefix  = (prefix: string) => pathname?.startsWith(prefix) ?? false;

  useEffect(() => {
    if (!user) return;
    quotaApi.get()
      .then((data: any) => {
        const q = data.quota || data;
        setQuota({
          chatUsage:    q?.chat?.usage    ?? data.chatUsage    ?? 0,
          chatQuota:    q?.chat?.quota    ?? data.chatQuota    ?? 20,
          chatbotCount: q?.chatbot?.usage ?? data.chatbotCount ?? 0,
          chatbotQuota: q?.chatbot?.quota ?? data.chatbotQuota ?? 1,
          storageUsed:  q?.storage?.usage ?? data.storageUsed  ?? 0,
          storageQuota: q?.storage?.quota ?? data.storageQuota ?? 50 * 1024 * 1024,
        });
      })
      .catch(() => {});
  }, [user, pathname]);

  return (
    <aside className="w-[240px] h-screen bg-canvas border-r border-line flex flex-col fixed left-0 top-0 z-40">

      {/* ── Wordmark ────────────────────────────────────────── */}
      <div className="h-14 flex items-center px-5 border-b border-line">
        <Link href="/" className="flex items-center" onClick={onNavClick}>
          <span
            className="font-display text-ink"
            style={{ fontWeight: 600, fontSize: 20, letterSpacing: '-0.03em', lineHeight: 1 }}
          >
            CorpusAI<span style={{ color: 'var(--muted)' }}>.</span>
          </span>
        </Link>
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

        {/* Workspace */}
        <div>
          <GroupLabel>Workspace</GroupLabel>
          <nav className="space-y-0.5">
            <NavItem href="/"          icon={LayoutDashboard} label="Dashboard" active={isActive('/')} onClick={onNavClick} />
            <NavItem
              href="/chatbots"
              icon={Bot}
              label="Chatbots"
              active={isActive('/chatbots') || isActive('/chatbots/create')}
              badge={quota?.chatbotCount ?? chatbots.length}
              onClick={onNavClick}
            />
            <NavItem href="/settings/billing" icon={CreditCard} label="Billing" active={isActivePrefix('/settings')} onClick={onNavClick} />
          </nav>
        </div>

        {/* Per-chatbot contextual nav */}
        {isOnChatbot && (
          <>
            <div className="h-px bg-line" />

            <div>
              <GroupLabel>{currentBot?.title || 'Chatbot'}</GroupLabel>
              <nav className="space-y-0.5">
                <NavItem href={`/chatbots/${chatbotId}/chat`}       icon={MessageSquare} label="Chat"         active={isActive(`/chatbots/${chatbotId}/chat`)}       onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/analytics`}  icon={BarChart3}     label="Analytics"    active={isActive(`/chatbots/${chatbotId}/analytics`)}  onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/datastores`} icon={Database}      label="Data sources" active={isActive(`/chatbots/${chatbotId}/datastores`)} onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/leads`}      icon={Users}         label="Leads"        active={isActive(`/chatbots/${chatbotId}/leads`)}      onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/deploy`}     icon={Rocket}        label="Deploy"       active={isActive(`/chatbots/${chatbotId}/deploy`)}     onClick={onNavClick} />
              </nav>
            </div>

            <div>
              <GroupLabel>Tools</GroupLabel>
              <nav className="space-y-0.5">
                <NavItem href={`/chatbots/${chatbotId}/tools/ai-actions`} icon={Zap}      label="AI actions" active={isActive(`/chatbots/${chatbotId}/tools/ai-actions`)} onClick={onNavClick} />
                <NavItem href={`/chatbots/${chatbotId}/tools/databases`}  icon={Database} label="Databases"  active={isActive(`/chatbots/${chatbotId}/tools/databases`)}  onClick={onNavClick} />

                <ExpandableGroup
                  icon={Settings}
                  label="Configure"
                  active={isActivePrefix(`/chatbots/${chatbotId}/settings`)}
                  defaultOpen={isActivePrefix(`/chatbots/${chatbotId}/settings`)}
                >
                  <NavItem href={`/chatbots/${chatbotId}/settings`}               icon={Settings}   label="General"       active={isActive(`/chatbots/${chatbotId}/settings`)}               indent onClick={onNavClick} />
                  <NavItem href={`/chatbots/${chatbotId}/settings/customization`} icon={Paintbrush} label="Customization" active={isActive(`/chatbots/${chatbotId}/settings/customization`)} indent onClick={onNavClick} />
                  <NavItem href={`/chatbots/${chatbotId}/settings/api-keys`}      icon={Key}        label="API keys"      active={isActive(`/chatbots/${chatbotId}/settings/api-keys`)}      indent onClick={onNavClick} />
                  <NavItem href={`/chatbots/${chatbotId}/settings/integrations`}  icon={Link2}      label="Integrations"  active={isActive(`/chatbots/${chatbotId}/settings/integrations`)}  indent onClick={onNavClick} />
                  <NavItem href={`/chatbots/${chatbotId}/settings/security`}      icon={Shield}     label="Security"      active={isActive(`/chatbots/${chatbotId}/settings/security`)}      indent onClick={onNavClick} />
                </ExpandableGroup>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* ── Footer · quota + upgrade ────────────────────────── */}
      <div className="px-4 pb-4 pt-3 border-t border-line">
        {quota && (
          <div className="mb-3 space-y-2.5">
            <QuotaRow
              label="Messages"
              used={quota.chatUsage.toLocaleString()}
              total={quota.chatQuota.toLocaleString()}
              pct={(quota.chatUsage / Math.max(quota.chatQuota, 1)) * 100}
            />
            <QuotaRow
              label="Chatbots"
              used={String(quota.chatbotCount)}
              total={String(quota.chatbotQuota)}
              pct={(quota.chatbotCount / Math.max(quota.chatbotQuota, 1)) * 100}
            />
            <QuotaRow
              label="Storage"
              used={formatMB(quota.storageUsed)}
              total={formatMB(quota.storageQuota)}
              pct={(quota.storageUsed / Math.max(quota.storageQuota, 1)) * 100}
            />
          </div>
        )}

        {user && (user.tier ?? 0) < 3 && (
          <Link
            href="/settings/billing"
            onClick={onNavClick}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-[13px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Upgrade plan
          </Link>
        )}
      </div>
    </aside>
  );
}
