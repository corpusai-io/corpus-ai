'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  MessageSquare,
  HardDrive,
  Activity,
  Plus,
  CreditCard,
  ArrowRight,
  Rocket,
  BookOpen,
} from 'lucide-react';
import { quotaApi, chatbotApi } from '@/lib/api';
import type { Chatbot } from '@/stores/chatbot-store';
import OnboardingModal from '@/components/OnboardingModal';
import { useOnboarding } from '@/hooks/useOnboarding';

interface QuotaData {
  chatUsage: number;
  chatQuota: number;
  chatbotCount: number;
  chatbotQuota: number;
  storageUsed: number;
  storageQuota: number;
}

const TIER_NAMES: Record<number, string> = {
  0: 'Free',
  1: 'Starter',
  2: 'Standard',
  3: 'Business',
};

function formatStorage(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024)        return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  if (bytes >= 1024)               return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── Stat Card ──────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  progress: number;
  delay: string;
}

function StatCard({ icon, label, value, subtext, progress, delay }: StatCardProps) {
  const pct = Math.min(progress, 100);
  const barColor =
    pct >= 85 ? 'bg-red-400 dark:bg-[#9E4A4A]' :
    pct >= 65 ? 'bg-amber-400 dark:bg-[#A8802A]' :
                'bg-slate-400 dark:bg-[#4A4A54]';

  return (
    <div
      className="bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[#26262B] rounded-xl p-5 v4-animate-in shadow-sm dark:shadow-none"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-slate-900 dark:text-[#F0F0F4] tracking-tight">{value}</p>
      <p className="text-sm text-slate-400 dark:text-[#60606A] mt-0.5">{label}</p>

      <div className="mt-4">
        <div className="h-[2px] bg-slate-100 dark:bg-[#26262B] rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 dark:text-[#46464E] mt-1.5">{subtext}</p>
      </div>
    </div>
  );
}

/* ─── Stat Skeleton ──────────────────────────────────────────── */
function StatSkeleton({ delay }: { delay: string }) {
  return (
    <div
      className="bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[#26262B] rounded-xl p-5 v4-animate-in shadow-sm dark:shadow-none"
      style={{ animationDelay: delay }}
    >
      <div className="w-8 h-8 rounded-lg v4-shimmer mb-4" />
      <div className="w-14 h-7 rounded-lg v4-shimmer mb-2" />
      <div className="w-24 h-4 rounded-md v4-shimmer mb-4" />
      <div className="h-[2px] w-full rounded-full v4-shimmer" />
    </div>
  );
}

/* ─── Chatbot Card ───────────────────────────────────────────── */
const STATUS_CFG = {
  ACTIVE:   { dot: 'bg-emerald-400 dark:bg-[#4A9E6A]', pulse: true,  label: 'Active'   },
  BUILDING: { dot: 'bg-amber-400 dark:bg-[#A8802A]',   pulse: true,  label: 'Building' },
  ERROR:    { dot: 'bg-red-400 dark:bg-[#9E4A4A]',     pulse: false, label: 'Error'    },
} as const;

function ChatbotCard({ chatbot, delay }: { chatbot: Chatbot; delay: string }) {
  const cfg = STATUS_CFG[chatbot.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.ACTIVE;

  return (
    <Link
      href={`/chatbots/${chatbot.chatbotId}/chat`}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-[#26262B] bg-white dark:bg-[#17171A] hover:bg-slate-50 dark:hover:bg-[#1C1C20] hover:border-slate-300 dark:hover:border-[#32323A] transition-all duration-150 group v4-animate-in shadow-sm dark:shadow-none"
      style={{ animationDelay: delay }}
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-slate-400 dark:text-[#8A8A98]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-600 dark:text-[#C0C0CC] group-hover:text-slate-900 dark:group-hover:text-[#F0F0F4] transition-colors truncate">
          {chatbot.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
          <span className="text-[11px] text-slate-400 dark:text-[#50505A]">{cfg.label}</span>
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-[#3A3A42] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [quota, setQuota]       = useState<QuotaData | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { showOnboarding, completeOnboarding } = useOnboarding();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const authData = params.get('auth');
      if (authData) {
        try {
          const tokens = JSON.parse(decodeURIComponent(authData));
          localStorage.setItem('idToken', tokens.idToken);
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(tokens.user));
          window.location.href = '/';
        } catch (e) {
          console.error('Failed to parse auth data from URL:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/Sign-In`;
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchData() {
      setDataLoading(true);
      try {
        const [qRes, bRes] = await Promise.allSettled([quotaApi.get(), chatbotApi.list()]);
        if (qRes.status === 'fulfilled') {
          const d = qRes.value as any;
          const q = d.quota || d;
          setQuota({
            chatUsage:    q.chat?.usage    ?? q.chatUsage    ?? q.chat_usage    ?? 0,
            chatQuota:    q.chat?.quota    ?? q.chatQuota    ?? q.chat_quota    ?? 20,
            chatbotCount: q.chatbot?.usage ?? q.chatbotCount ?? q.chatbot_count ?? 0,
            chatbotQuota: q.chatbot?.quota ?? q.chatbotQuota ?? q.chatbot_quota ?? 1,
            storageUsed:  q.storage?.usage ?? q.storageUsed  ?? q.storage_used  ?? 0,
            storageQuota: q.storage?.quota ?? q.storageQuota ?? q.storage_quota ?? 10 * 1024 * 1024,
          });
        }
        if (bRes.status === 'fulfilled') {
          const bots = (bRes.value as any)?.chatbots ?? bRes.value ?? [];
          setChatbots(Array.isArray(bots) ? bots : []);
        }
      } catch { /* silent */ }
      finally { setDataLoading(false); }
    }
    fetchData();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-8 h-8">
            <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-[#2E2E34]" />
            <div className="absolute inset-0 rounded-full border-t border-slate-400 dark:border-[#8A8A98] animate-spin" />
          </div>
          <p className="mt-4 text-sm text-slate-400 dark:text-[#50505A]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeBots = chatbots.filter((b) => b.status === 'ACTIVE').length;
  const tierName   = TIER_NAMES[user.tier ?? 0] || 'Free';
  const firstName  = user.name || user.username || user.email.split('@')[0];

  return (
    <div className="space-y-8">
      {showOnboarding && isAuthenticated && (
        <OnboardingModal userName={firstName} onComplete={completeOnboarding} />
      )}

      {/* ── Greeting ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 v4-animate-in v4-delay-0">
        <div>
          <p className="text-xs text-slate-400 dark:text-[#50505A] mb-1.5">{getGreeting()}</p>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-[#F0F0F4] tracking-tight">
            {firstName}
          </h1>
          <p className="text-sm text-slate-400 dark:text-[#60606A] mt-0.5">Here's what's happening today.</p>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-[#1C1C20] text-slate-500 dark:text-[#8A8A98] border border-slate-200 dark:border-[#2E2E34]">
            {tierName} Plan
          </span>
        </div>
      </div>

      {/* ── Stat grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dataLoading ? (
          <>
            <StatSkeleton delay="60ms"  />
            <StatSkeleton delay="120ms" />
            <StatSkeleton delay="180ms" />
            <StatSkeleton delay="240ms" />
          </>
        ) : (
          <>
            <StatCard
              icon={<Bot className="h-4 w-4 text-slate-400 dark:text-[#8A8A98]" />}
              label="Total Chatbots"
              value={String(quota?.chatbotCount ?? chatbots.length)}
              subtext={`${quota?.chatbotCount ?? chatbots.length} of ${quota?.chatbotQuota ?? 1} used`}
              progress={((quota?.chatbotCount ?? chatbots.length) / (quota?.chatbotQuota ?? 1)) * 100}
              delay="60ms"
            />
            <StatCard
              icon={<MessageSquare className="h-4 w-4 text-slate-400 dark:text-[#8A8A98]" />}
              label="Messages Used"
              value={String(quota?.chatUsage ?? user.chat_usage ?? 0)}
              subtext={`${quota?.chatUsage ?? user.chat_usage ?? 0} of ${quota?.chatQuota ?? 20} messages`}
              progress={((quota?.chatUsage ?? user.chat_usage ?? 0) / (quota?.chatQuota ?? 20)) * 100}
              delay="120ms"
            />
            <StatCard
              icon={<HardDrive className="h-4 w-4 text-slate-400 dark:text-[#8A8A98]" />}
              label="Storage Used"
              value={formatStorage(quota?.storageUsed ?? 0)}
              subtext={`of ${formatStorage(quota?.storageQuota ?? 10 * 1024 * 1024)} total`}
              progress={((quota?.storageUsed ?? 0) / (quota?.storageQuota ?? 10 * 1024 * 1024)) * 100}
              delay="180ms"
            />
            <StatCard
              icon={<Activity className="h-4 w-4 text-slate-400 dark:text-[#8A8A98]" />}
              label="Active Bots"
              value={String(activeBots)}
              subtext={`${activeBots} of ${chatbots.length} bots live`}
              progress={chatbots.length > 0 ? (activeBots / chatbots.length) * 100 : 0}
              delay="240ms"
            />
          </>
        )}
      </div>

      {/* ── Divider ────────────────────────────────────────────── */}
      <div className="h-px w-full bg-slate-200 dark:bg-[#22222A]" />

      {/* ── Bento: chatbots 2/3 + actions 1/3 ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 v4-animate-in v4-delay-4">

        {/* ── Recent Chatbots (2 cols) ──────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-[#D0D0D8]">Your Chatbots</h2>
              <p className="text-xs text-slate-400 dark:text-[#50505A] mt-0.5">Active and recently created</p>
            </div>
            {chatbots.length > 0 && (
              <Link
                href="/chatbots"
                className="text-xs text-slate-400 dark:text-[#60606A] hover:text-slate-600 dark:hover:text-[#A0A0AC] transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {dataLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-[#26262B] bg-white dark:bg-[#17171A]">
                  <div className="w-8 h-8 rounded-lg v4-shimmer shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-28 h-3.5 rounded-md v4-shimmer" />
                    <div className="w-16 h-3 rounded-md v4-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : chatbots.length === 0 ? (
            <div className="bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[#26262B] rounded-xl p-10 text-center shadow-sm dark:shadow-none">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center mx-auto mb-4">
                <Bot className="h-5 w-5 text-slate-400 dark:text-[#8A8A98]" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-[#D0D0D8] mb-1">No chatbots yet</p>
              <p className="text-xs text-slate-400 dark:text-[#60606A] mb-5 max-w-xs mx-auto">
                Create your first AI chatbot trained on your data.
              </p>
              <Link
                href="/chatbots/create"
                className="inline-flex items-center gap-2 bg-slate-900 dark:bg-[#F0F0F4] text-white dark:text-[#111113] hover:bg-slate-700 dark:hover:bg-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Chatbot
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {chatbots.slice(0, 6).map((bot, i) => (
                <ChatbotCard
                  key={bot.chatbotId}
                  chatbot={bot}
                  delay={`${300 + i * 40}ms`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Access panel (1 col) ────────────────────────── */}
        <div className="v4-animate-in v4-delay-5">
          <div className="bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden h-full flex flex-col shadow-sm dark:shadow-none">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#22222A]">
              <p className="text-xs font-medium text-slate-400 dark:text-[#8A8A98] uppercase tracking-widest">
                Quick Access
              </p>
            </div>

            <div className="p-4 flex flex-col flex-1">
              {/* Primary CTA */}
              <Link
                href="/chatbots/create"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-[#F0F0F4] text-white dark:text-[#111113] hover:bg-slate-700 dark:hover:bg-white text-sm font-medium transition-colors mb-4"
              >
                <Rocket className="h-4 w-4" />
                Create Chatbot
              </Link>

              {/* Secondary links */}
              <div className="space-y-1 flex-1">
                {[
                  { icon: BookOpen,   label: 'Documentation', sub: 'Guides & API reference', href: process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3001' },
                  { icon: CreditCard, label: 'Billing',       sub: 'Usage & subscription',   href: '/settings/billing' },
                ].map(({ icon: Icon, label, sub, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1C1C20] transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-[#6A6A74] group-hover:text-slate-600 dark:group-hover:text-[#9090A0] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-[#A0A0AC] group-hover:text-slate-800 dark:group-hover:text-[#D0D0D8] transition-colors">{label}</p>
                      <p className="text-[11px] text-slate-400 dark:text-[#50505A]">{sub}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-slate-300 dark:text-[#3A3A42] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
