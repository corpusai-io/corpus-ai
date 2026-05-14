'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Globe,
  FileText,
  ArrowRight,
  BookOpen,
  CreditCard,
  MessageSquare,
  Settings,
  Trash2,
  Key,
} from 'lucide-react';
import { quotaApi, chatbotApi } from '@/lib/api';
import type { Chatbot } from '@/stores/chatbot-store';
import OnboardingModal from '@/components/OnboardingModal';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  Eyebrow,
  Mark,
  IconChip,
  Status,
  Stat,
  Pill,
  Button,
  ButtonLink,
  Divider,
  statusFromBackend,
} from '@/components/corpus';

interface QuotaData {
  chatUsage: number;
  chatQuota: number;
  chatbotCount: number;
  chatbotQuota: number;
  storageUsed: number;
  storageQuota: number;
}

function formatStorage(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  if (bytes >= 1024 * 1024)        return `${Math.round(bytes / (1024 * 1024))}MB`;
  if (bytes >= 1024)               return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(d: Date): string {
  const day   = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month:   'short'  });
  return `${day} · ${month} ${d.getDate()}`;
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

function sourceIcon(origin: string | undefined) {
  if (!origin) return <FileText className="w-3 h-3" />;
  if (origin.startsWith('http') || /\.(com|ai|io|org|net|dev|app|co)\b/.test(origin)) {
    return <Globe className="w-3 h-3" />;
  }
  return <FileText className="w-3 h-3" />;
}

/* ─── Skeleton (stat card) ───────────────────────────────────── */
function StatSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="v4-card v4-animate-in p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline justify-between">
        <div className="w-20 h-2.5 rounded v4-shimmer" />
        <div className="w-6  h-2.5 rounded v4-shimmer" />
      </div>
      <div className="mt-3 w-16 h-7 rounded v4-shimmer" />
      <div className="mt-2 w-24 h-3 rounded v4-shimmer" />
    </div>
  );
}

/* ─── Skeleton (chatbot card) ────────────────────────────────── */
function ChatbotCardSkeleton() {
  return (
    <div className="v4-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg v4-shimmer" />
        <div className="w-16 h-3 rounded-md v4-shimmer" />
      </div>
      <div className="w-3/4 h-4 rounded-md v4-shimmer" />
      <div className="w-full h-3 rounded-md v4-shimmer" />
      <div className="w-2/3 h-3 rounded-md v4-shimmer" />
      <Divider />
      <div className="flex gap-2">
        <div className="w-16 h-7 rounded-lg v4-shimmer" />
        <div className="flex-1" />
        <div className="w-7 h-7 rounded-lg v4-shimmer" />
        <div className="w-7 h-7 rounded-lg v4-shimmer" />
      </div>
    </div>
  );
}

/* ─── Chatbot card ───────────────────────────────────────────── */
function ChatbotCard({ chatbot, delay }: { chatbot: Chatbot; delay: number }) {
  return (
    <Link
      href={`/chatbots/${chatbot.chatbotId}/chat`}
      className="v4-card v4-animate-in p-5 flex flex-col gap-3 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <IconChip><Mark /></IconChip>
        <Status kind={statusFromBackend(chatbot.status)} />
      </div>
      <h3
        className="font-display text-[16px] font-medium text-ink leading-snug"
        style={{ letterSpacing: '-0.012em' }}
      >
        {chatbot.title}
      </h3>
      <p className="text-[13px] text-muted leading-relaxed line-clamp-2 min-h-[2.4em]">
        {chatbot.desc || 'No description yet.'}
      </p>
      <div className="flex items-center gap-1.5 text-[12px] text-muted-soft mt-1">
        {sourceIcon(chatbot.origin)}
        <span className="truncate">{chatbot.origin || 'No source'}</span>
      </div>
      <Divider className="my-1" />
      <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
        <Button
          variant="ghost"
          size="sm"
          icon={MessageSquare}
          onClick={() => { window.location.href = `/chatbots/${chatbot.chatbotId}/chat`; }}
        >
          Chat
        </Button>
        <div className="flex-1" />
        <Link
          href={`/chatbots/${chatbot.chatbotId}/settings`}
          className="p-1.5 rounded-md text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/chatbots"
          className="p-1.5 rounded-md text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
          title="Manage"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [quota,        setQuota]        = useState<QuotaData | null>(null);
  const [chatbots,     setChatbots]     = useState<Chatbot[]>([]);
  const [dataLoading,  setDataLoading]  = useState(true);
  const [search,       setSearch]       = useState('');
  const { showOnboarding, completeOnboarding } = useOnboarding();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return;
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const authData = params.get('auth');
    if (!authData) return;
    try {
      const tokens = JSON.parse(decodeURIComponent(authData));
      localStorage.setItem('idToken',      tokens.idToken);
      localStorage.setItem('accessToken',  tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user',         JSON.stringify(tokens.user));
      window.location.href = '/';
    } catch (e) {
      console.error('Failed to parse auth hash:', e);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/Sign-In`;
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    async function fetchData() {
      setDataLoading(true);
      try {
        const [qRes, bRes] = await Promise.allSettled([quotaApi.get(), chatbotApi.list()]);
        if (cancelled) return;
        if (qRes.status === 'fulfilled') {
          const d = qRes.value as any;
          const q = d.quota || d;
          setQuota({
            chatUsage:    q.chat?.usage    ?? q.chatUsage    ?? q.chat_usage    ?? 0,
            chatQuota:    q.chat?.quota    ?? q.chatQuota    ?? q.chat_quota    ?? 20,
            chatbotCount: q.chatbot?.usage ?? q.chatbotCount ?? q.chatbot_count ?? 0,
            chatbotQuota: q.chatbot?.quota ?? q.chatbotQuota ?? q.chatbot_quota ?? 1,
            storageUsed:  q.storage?.usage ?? q.storageUsed  ?? q.storage_used  ?? 0,
            storageQuota: q.storage?.quota ?? q.storageQuota ?? q.storage_quota ?? 50 * 1024 * 1024,
          });
        }
        if (bRes.status === 'fulfilled') {
          const bots = (bRes.value as any)?.chatbots ?? bRes.value ?? [];
          setChatbots(Array.isArray(bots) ? bots : []);
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setDataLoading(false); }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-8 h-8">
            <div className="absolute inset-0 rounded-full border border-line" />
            <div className="absolute inset-0 rounded-full border-t border-ink animate-spin" />
          </div>
          <p className="mt-4 text-sm text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeBots = chatbots.filter((b) => b.status === 'ACTIVE').length;
  const firstName  = user.name || user.username || user.email.split('@')[0];

  const tagline =
    chatbots.length === 0 ? 'Build your first agent today.' :
    chatbots.length === 1 ? 'One bot, ready to help.' :
    activeBots === chatbots.length
      ? `${chatbots.length} bots running and learning.`
      : `${chatbots.length} bots, ${activeBots} live.`;

  const filtered = !search.trim()
    ? chatbots
    : chatbots.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.desc?.toLowerCase().includes(q) ||
          c.origin?.toLowerCase().includes(q)
        );
      });

  const visible = filtered.slice(0, 6);

  return (
    <div className="space-y-10 max-w-[1240px] mx-auto">
      {showOnboarding && isAuthenticated && (
        <OnboardingModal userName={firstName} onComplete={completeOnboarding} />
      )}

      {/* ── Greeting ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 v4-animate-in">
        <div>
          <Eyebrow className="mb-2">{formatDate(new Date())}</Eyebrow>
          <h1
            className="font-display text-3xl md:text-4xl font-medium leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-ink">{getGreeting()}, {firstName}.</span>{' '}
            <span className="text-muted">{tagline}</span>
          </h1>
        </div>
        <Link href="/chatbots/create">
          <Button variant="primary" icon={Plus}>New chatbot</Button>
        </Link>
      </div>

      {/* ── Stat grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dataLoading ? (
          <>
            <StatSkeleton delay={60}  />
            <StatSkeleton delay={120} />
            <StatSkeleton delay={180} />
            <StatSkeleton delay={240} />
          </>
        ) : (
          <>
            <Stat
              label="[01] Chatbots"
              value={String(quota?.chatbotCount ?? chatbots.length)}
              sub={`${quota?.chatbotCount ?? chatbots.length} of ${quota?.chatbotQuota ?? 1} used`}
              hint={`${pct(quota?.chatbotCount ?? chatbots.length, quota?.chatbotQuota ?? 1)}%`}
              delay={60}
            />
            <Stat
              label="[02] Messages"
              value={(quota?.chatUsage ?? 0).toLocaleString()}
              sub={`of ${(quota?.chatQuota ?? 20).toLocaleString()} / month`}
              hint={`${pct(quota?.chatUsage ?? 0, quota?.chatQuota ?? 20)}%`}
              delay={120}
            />
            <Stat
              label="[03] Storage"
              value={formatStorage(quota?.storageUsed ?? 0)}
              sub={`of ${formatStorage(quota?.storageQuota ?? 50 * 1024 * 1024)}`}
              hint={`${pct(quota?.storageUsed ?? 0, quota?.storageQuota ?? 50 * 1024 * 1024)}%`}
              delay={180}
            />
            <Stat
              label="[04] Active bots"
              value={String(activeBots)}
              sub={chatbots.length > 0 ? `${activeBots} of ${chatbots.length} live` : 'No bots yet'}
              hint={chatbots.length > 0 ? `${pct(activeBots, chatbots.length)}%` : '—'}
              delay={240}
            />
          </>
        )}
      </div>

      {/* ── Chatbots section ─────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <Eyebrow>Your chatbots</Eyebrow>
            <h2
              className="font-display text-xl font-medium text-ink mt-1.5"
              style={{ letterSpacing: '-0.012em' }}
            >
              Active and recently created
            </h2>
          </div>
          {chatbots.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-soft" />
              <input
                placeholder="Search chatbots…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-canvas border border-line rounded-lg pl-9 pr-3 py-2 text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors shadow-sm w-56"
              />
            </div>
          )}
        </div>

        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <ChatbotCardSkeleton key={i} />)}
          </div>
        ) : chatbots.length === 0 ? (
          <div className="v4-card v4-animate-in p-10 text-center">
            <IconChip size={40} className="mx-auto"><Mark size={18} /></IconChip>
            <h3
              className="font-display text-[18px] font-medium text-ink mt-4"
              style={{ letterSpacing: '-0.012em' }}
            >
              Build your first chatbot.
            </h3>
            <p className="text-[13px] text-muted max-w-sm mx-auto mt-1.5">
              Connect a website, drop in a few docs, or paste raw text. We&apos;ll handle the rest.
            </p>
            <div className="mt-5">
              <Link href="/chatbots/create">
                <Button variant="primary" icon={Plus}>Create chatbot</Button>
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-muted">
              No chatbots match <span className="text-ink">&ldquo;{search}&rdquo;</span>
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-[12px] text-muted hover:text-ink transition-colors underline underline-offset-2"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((bot, i) => (
              <ChatbotCard key={bot.chatbotId} chatbot={bot} delay={300 + i * 60} />
            ))}
          </div>
        )}

        {chatbots.length > 6 && (
          <div className="flex justify-center">
            <Link
              href="/chatbots"
              className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition-colors"
            >
              View all {chatbots.length} chatbots <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Quick access strip ──────────────────────────────── */}
      <div className="v4-card v4-animate-in p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ animationDelay: '480ms' }}>
        <div>
          <Eyebrow>Quick access</Eyebrow>
          <div className="text-[14px] text-ink mt-1.5">
            Documentation, billing, and API keys — all one click away.
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ButtonLink
            href={process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3001'}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="sm"
            icon={BookOpen}
          >
            Docs
          </ButtonLink>
          <Link href="/settings/billing">
            <Button variant="secondary" size="sm" icon={CreditCard}>Billing</Button>
          </Link>
          {chatbots[0] && (
            <Link href={`/chatbots/${chatbots[0].chatbotId}/settings/api-keys`}>
              <Button variant="ghost" size="sm" iconAfter={ArrowRight} icon={Key}>API keys</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
