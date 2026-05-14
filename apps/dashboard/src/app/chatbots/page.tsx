'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Settings,
  MessageSquare,
  Search,
  Globe,
  FileText,
  X,
} from 'lucide-react';
import { chatbotApi } from '@/lib/api';
import { useChatbotStore, Chatbot } from '@/stores/chatbot-store';
import {
  Eyebrow,
  Mark,
  IconChip,
  Status,
  Pill,
  Button,
  Divider,
  statusFromBackend,
} from '@/components/corpus';

/* ─── Source icon ────────────────────────────────────────────── */
function sourceIcon(origin: string | undefined) {
  if (!origin) return <FileText className="w-3 h-3" />;
  if (origin.startsWith('http') || /\.(com|ai|io|org|net|dev|app|co)\b/.test(origin)) {
    return <Globe className="w-3 h-3" />;
  }
  return <FileText className="w-3 h-3" />;
}

/* ─── Format created date ─────────────────────────────────── */
function formatCreated(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Card ────────────────────────────────────────────────── */
function ChatbotCard({
  chatbot,
  onDelete,
  delay,
}: {
  chatbot: Chatbot;
  onDelete: (id: string) => void;
  delay: number;
}) {
  const router = useRouter();
  const originLabel = (chatbot.origin || '').length > 32 ? `${chatbot.origin.slice(0, 32)}…` : chatbot.origin;

  return (
    <div
      className="v4-card v4-animate-in p-5 flex flex-col gap-3"
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
        <span className="truncate">{originLabel || 'No source'}</span>
        {chatbot.createdAt ? (
          <>
            <span className="mx-1">·</span>
            <span>{formatCreated(chatbot.createdAt)}</span>
          </>
        ) : null}
      </div>

      <Divider className="my-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon={MessageSquare}
          onClick={() => router.push(`/chatbots/${chatbot.chatbotId}/chat`)}
        >
          Chat
        </Button>
        <div className="flex-1" />
        <button
          onClick={() => router.push(`/chatbots/${chatbot.chatbotId}/settings`)}
          className="p-1.5 rounded-md text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(chatbot.chatbotId)}
          className="p-1.5 rounded-md text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonCard() {
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

/* ─── Delete confirmation modal · monochrome ──────────────── */
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
      style={{ background: 'rgba(15, 15, 15, 0.32)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-line bg-canvas p-6 relative shadow-lg"
        style={{ animation: 'fadeInUp 0.2s cubic-bezier(0,0,0.2,1) both' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <Eyebrow>Confirm</Eyebrow>
        <h3
          className="font-display text-[20px] font-medium text-ink mt-2"
          style={{ letterSpacing: '-0.012em' }}
        >
          Delete this chatbot?
        </h3>
        <p className="text-[13px] text-muted leading-relaxed mt-2 mb-6">
          This cannot be undone. The chatbot, its files, vectors, and chat history will be permanently removed.
        </p>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 justify-center" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[14px] font-medium bg-[#171717] text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-40"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function ChatbotsPage() {
  const { chatbots, setChatbots, removeChatbot, isLoading, setIsLoading, setError } = useChatbotStore();
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  useEffect(() => { loadChatbots(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

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
        c.origin?.toLowerCase().includes(q)
    );
  }, [chatbots, search]);

  const total      = chatbots.length;
  const activeBots = chatbots.filter((b) => b.status === 'ACTIVE').length;

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6 v4-animate-in max-w-[1240px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-24 h-2.5 rounded v4-shimmer" />
            <div className="w-48 h-7 rounded v4-shimmer" />
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

  /* ─── Empty ─── */
  if (chatbots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] v4-animate-in">
        <div className="text-center max-w-md">
          <IconChip size={56} className="mx-auto"><Mark size={22} /></IconChip>
          <Eyebrow className="mt-5">Chatbots</Eyebrow>
          <h1
            className="font-display text-3xl md:text-4xl font-medium leading-tight mt-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-ink">No chatbots yet.</span>{' '}
            <span className="text-muted">Build the first one.</span>
          </h1>
          <p className="text-[14px] text-muted leading-relaxed mt-4">
            Train an agent on your documents, website, or raw text. Deploy it as a widget, a Slack bot, or hit the API.
          </p>
          <div className="mt-6">
            <Link href="/chatbots/create">
              <Button variant="primary" icon={Plus}>Create your first chatbot</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main ─── */
  return (
    <>
      <div className="space-y-8 v4-animate-in max-w-[1240px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Eyebrow>Chatbots</Eyebrow>
            <h1
              className="font-display text-3xl md:text-4xl font-medium leading-tight mt-2"
              style={{ letterSpacing: '-0.02em' }}
            >
              <span className="text-ink">All your agents.</span>{' '}
              <span className="text-muted">One workspace.</span>
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <Pill variant="soft">{total} total</Pill>
              {activeBots > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Status kind="live" />
                  <span className="text-[12px] text-muted">{activeBots} live</span>
                </span>
              )}
            </div>
          </div>
          <Link href="/chatbots/create">
            <Button variant="primary" icon={Plus}>New chatbot</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
          <input
            type="text"
            placeholder="Search by name, description, or source…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-canvas border border-line rounded-lg pl-10 pr-4 py-2.5 text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors shadow-sm"
          />
        </div>

        {/* Grid or no-results */}
        {filtered.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((chatbot, i) => (
              <ChatbotCard
                key={chatbot.chatbotId}
                chatbot={chatbot}
                onDelete={setDeleteTarget}
                delay={i * 60}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
