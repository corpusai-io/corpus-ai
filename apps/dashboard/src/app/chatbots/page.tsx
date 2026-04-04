'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { chatbotApi } from '@/lib/api';
import { useChatbotStore, Chatbot } from '@/stores/chatbot-store';
import {
  Plus,
  Bot,
  Trash2,
  Settings,
  MessageSquare,
  Search,
  Globe,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react';

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CFG = {
  ACTIVE:   { dot: 'bg-emerald-400', text: 'text-emerald-500 dark:text-[#22C55E]', pulse: true,  label: 'Active'   },
  BUILDING: { dot: 'bg-amber-400',   text: 'text-amber-500 dark:text-[#F59E0B]',   pulse: true,  label: 'Building' },
  ERROR:    { dot: 'bg-red-400',     text: 'text-red-400 dark:text-[#EC4899]',      pulse: false, label: 'Error'    },
} as const;

/* ─── Source icon ────────────────────────────────────────────── */
function SourceIcon({ origin }: { origin: string }) {
  const isUrl = origin.startsWith('http://') || origin.startsWith('https://');
  return isUrl
    ? <Globe className="h-3.5 w-3.5 text-slate-400 dark:text-[#3F3F46] shrink-0" />
    : <FileText className="h-3.5 w-3.5 text-slate-400 dark:text-[#3F3F46] shrink-0" />;
}

/* ─── Chatbot card ───────────────────────────────────────────── */
function ChatbotCard({ chatbot, onDelete }: { chatbot: Chatbot; onDelete: (id: string) => void }) {
  const router = useRouter();
  const cfg = STATUS_CFG[chatbot.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.ACTIVE;
  const originLabel = chatbot.origin.length > 32
    ? chatbot.origin.slice(0, 32) + '…'
    : chatbot.origin;

  return (
    <div className="v4-card rounded-2xl p-5 flex flex-col group transition-all duration-300">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-[#BF56FF]/10 border border-violet-100 dark:border-[#BF56FF]/15 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-violet-500 dark:text-[#BF56FF]" />
        </div>
        {/* Status */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug mb-1 group-hover:text-violet-600 dark:group-hover:text-[#D08AFF] transition-colors">
        {chatbot.title}
      </h3>

      {/* Description */}
      {chatbot.desc ? (
        <p className="text-xs text-slate-500 dark:text-[#71717A] line-clamp-2 mb-3 leading-relaxed">{chatbot.desc}</p>
      ) : (
        <p className="text-xs text-slate-400 dark:text-[#3F3F46] italic mb-3">No description</p>
      )}

      {/* Meta */}
      <div className="mt-auto space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#3F3F46]">
          <SourceIcon origin={chatbot.origin} />
          <span className="truncate">{originLabel}</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-[#3F3F46]">
          Created {new Date(chatbot.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-white/[0.04] my-4" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => router.push(`/chatbots/${chatbot.chatbotId}/chat`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>

        <div className="flex-1" />

        <button
          onClick={() => router.push(`/chatbots/${chatbot.chatbotId}/settings`)}
          className="p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-slate-600 dark:hover:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(chatbot.chatbotId)}
          className="p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-red-400 dark:hover:text-[#EC4899] hover:bg-red-50 dark:hover:bg-[#EC4899]/10 transition-all"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton card ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="v4-card rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg v4-shimmer" />
        <div className="w-16 h-4 rounded-full v4-shimmer mt-1" />
      </div>
      <div className="w-3/4 h-4 rounded-md v4-shimmer" />
      <div className="w-full h-3 rounded-md v4-shimmer" />
      <div className="w-2/3 h-3 rounded-md v4-shimmer" />
      <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />
      <div className="flex gap-2">
        <div className="w-16 h-7 rounded-lg v4-shimmer" />
        <div className="flex-1" />
        <div className="w-7 h-7 rounded-lg v4-shimmer" />
        <div className="w-7 h-7 rounded-lg v4-shimmer" />
      </div>
    </div>
  );
}

/* ─── Delete confirmation modal ──────────────────────────────── */
function DeleteModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0E10] p-6 relative shadow-xl dark:shadow-none"
        style={{ animation: 'fadeInUp 0.2s cubic-bezier(0,0,0.2,1) both' }}
      >
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300 dark:via-[#EC4899]/30 to-transparent rounded-t-2xl" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-slate-600 dark:hover:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-[#EC4899]/10 border border-red-100 dark:border-[#EC4899]/20 flex items-center justify-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-400 dark:text-[#EC4899]" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Delete chatbot</h3>
        <p className="text-sm text-slate-500 dark:text-[#71717A] mb-6">
          This action cannot be undone. The chatbot and all its data will be permanently deleted.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/[0.10] text-sm font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-red-50 dark:bg-[#EC4899]/15 border border-red-200 dark:border-[#EC4899]/25 text-sm font-medium text-red-500 dark:text-[#EC4899] hover:bg-red-100 dark:hover:bg-[#EC4899]/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ChatbotsPage() {
  const router = useRouter();
  const { chatbots, setChatbots, removeChatbot, isLoading, setIsLoading, setError } =
    useChatbotStore();

  const [search, setSearch]             = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { loadChatbots(); }, []);

  const loadChatbots = async () => {
    try {
      setIsLoading(true);
      const data: any = await chatbotApi.list();
      setChatbots(data.chatbots || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await chatbotApi.delete(deleteTarget);
      removeChatbot(deleteTarget);
      setDeleteTarget(null);
    } catch (err: any) {
      alert('Failed to delete chatbot: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return chatbots;
    const q = search.toLowerCase();
    return chatbots.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.desc?.toLowerCase().includes(q) ||
        c.origin.toLowerCase().includes(q)
    );
  }, [chatbots, search]);

  /* ── Loading ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6 v4-animate-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="w-32 h-7 rounded-lg v4-shimmer" />
            <div className="w-20 h-4 rounded-md v4-shimmer" />
          </div>
          <div className="w-36 h-9 rounded-lg v4-shimmer" />
        </div>
        <div className="w-full h-10 rounded-lg v4-shimmer" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  /* ── Empty state ─────────────────────────────────────────── */
  if (chatbots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] v4-animate-in">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-[#BF56FF]/10 border border-violet-100 dark:border-[#BF56FF]/20 flex items-center justify-center mx-auto mb-5">
            <Bot className="h-7 w-7 text-violet-500 dark:text-[#BF56FF]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No chatbots yet</h3>
          <p className="text-sm text-slate-500 dark:text-[#71717A] mb-6 leading-relaxed">
            Build your first AI chatbot trained on your documents, website, or custom text.
          </p>
          <Link
            href="/chatbots/create"
            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-700 dark:hover:bg-white/90 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create your first chatbot
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main view ───────────────────────────────────────────── */
  return (
    <>
      <div className="space-y-6 v4-animate-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Chatbots</h1>
            <p className="text-sm text-slate-400 dark:text-[#71717A] mt-0.5">
              {chatbots.length} bot{chatbots.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/chatbots/create"
            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-700 dark:hover:bg-white/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Chatbot
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-[#3F3F46]" />
          <input
            type="text"
            placeholder="Search chatbots…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-violet-300 dark:focus:border-[#BF56FF]/40 focus:ring-2 focus:ring-violet-100 dark:focus:ring-transparent transition-all duration-200 shadow-sm dark:shadow-none"
          />
        </div>

        {/* Grid or no-results */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center v4-animate-in">
            <p className="text-sm text-slate-400 dark:text-[#71717A]">
              No chatbots match <span className="text-slate-800 dark:text-white">&ldquo;{search}&rdquo;</span>
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-xs text-violet-500 dark:text-[#BF56FF] hover:text-violet-700 dark:hover:text-[#D08AFF] transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((chatbot, i) => (
              <div
                key={chatbot.chatbotId}
                className="v4-animate-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ChatbotCard chatbot={chatbot} onDelete={setDeleteTarget} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
