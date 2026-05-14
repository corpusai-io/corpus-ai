'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { chatHistoryApi } from '@/lib/api';
import { useChatbotById } from '@/stores/chatbot-store';
import { useHeaderStore } from '@/stores/header-store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Database,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import {
  Eyebrow,
  Mark,
  Status,
  Pill,
  Divider,
  statusFromBackend,
} from '@/components/corpus';

interface Citation {
  source: string;
  text?: string;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
  citations?: Citation[];
  feedback?: 'up' | 'down' | null;
  copied?: boolean;
  persistedId?: string;
  queryType?: 'rag' | 'database';
  executedQuery?: string;
  connectionName?: string;
}

const SUGGESTED = [
  'What can you help me with?',
  'Summarize the main topics',
  'What are the most common questions?',
  'Give me a quick overview',
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ─── Brand mark (small) ──────────────────────────────────── */
function BotMark() {
  return (
    <div className="w-7 h-7 rounded-full bg-canvas border border-line flex items-center justify-center flex-shrink-0">
      <Mark size={12} />
    </div>
  );
}

/* ─── Typing indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <BotMark />
      <div className="rounded-2xl rounded-tl-md bg-canvas border border-line px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-line-strong" style={{ animation: 'typing-dot 1.4s ease-in-out infinite', animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-line-strong" style={{ animation: 'typing-dot 1.4s ease-in-out infinite', animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-line-strong" style={{ animation: 'typing-dot 1.4s ease-in-out infinite', animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Inline citations ────────────────────────────────────── */
function InlineCitations({ text, onCitationClick }: { text: string; onCitationClick: (i: number) => void }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onCitationClick(idx)}
              className="mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-surface text-[9px] font-semibold text-ink hover:bg-line transition-colors"
              style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }}
              title={`Source ${match[1]}`}
            >
              {match[1]}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ─── Citation badges ─────────────────────────────────────── */
function CitationBadges({ citations, highlightIndex }: { citations: Citation[]; highlightIndex?: number | null }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {citations.map((cit, i) => (
        <div key={i} id={`citation-badge-${i}`}>
          <button
            type="button"
            onClick={() => setExpanded(expanded === i ? null : i)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
              highlightIndex === i
                ? 'border-line-strong bg-surface text-ink'
                : 'border-line bg-canvas text-muted hover:text-ink hover:border-line-strong'
            }`}
          >
            <span
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-surface text-[9px] font-semibold text-ink"
              style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }}
            >
              {i + 1}
            </span>
            <span>
              {(cit.source || `Source ${i + 1}`).length > 28
                ? (cit.source || '').slice(0, 28) + '…'
                : (cit.source || `Source ${i + 1}`)}
            </span>
          </button>
          {expanded === i && cit.text && (
            <p className="mt-1.5 rounded-lg bg-surface border border-line px-3 py-2 text-[12px] text-muted leading-relaxed">
              {cit.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Message bubble ──────────────────────────────────────── */
function MessageBubble({
  msg,
  onFeedback,
  onCopy,
}: {
  msg: Message;
  onFeedback: (id: string, val: 'up' | 'down') => void;
  onCopy: (id: string, text: string) => void;
}) {
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);
  const isUser = msg.role === 'user';

  const handleCitationClick = (index: number) => {
    setHighlightedCitation(index);
    document.getElementById(`citation-badge-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => setHighlightedCitation(null), 2000);
  };

  const citationComponents = {
    p: ({ children }: any) => (
      <p>
        {Array.isArray(children)
          ? children.map((child, i) =>
              typeof child === 'string' && /\[\d+\]/.test(child)
                ? <InlineCitations key={i} text={child} onCitationClick={handleCitationClick} />
                : child
            )
          : typeof children === 'string' && /\[\d+\]/.test(children)
            ? <InlineCitations text={children} onCitationClick={handleCitationClick} />
            : children}
      </p>
    ),
    li: ({ children }: any) => (
      <li>
        {Array.isArray(children)
          ? children.map((child, i) =>
              typeof child === 'string' && /\[\d+\]/.test(child)
                ? <InlineCitations key={i} text={child} onCitationClick={handleCitationClick} />
                : child
            )
          : typeof children === 'string' && /\[\d+\]/.test(children)
            ? <InlineCitations text={children} onCitationClick={handleCitationClick} />
            : children}
      </li>
    ),
  };

  if (isUser) {
    return (
      <div className="flex justify-end items-start gap-2.5">
        <div className="flex flex-col items-end gap-1 max-w-[78%]">
          <div className="bg-ink text-white px-4 py-2.5 rounded-2xl rounded-tr-md text-[14px] leading-relaxed break-words">
            {msg.content}
          </div>
          <span className="text-[10px] text-muted-soft px-1 font-mono">{formatTime(msg.timestamp)}</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-canvas border border-line flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-3.5 h-3.5 text-muted-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start items-start gap-3">
      <BotMark />

      <div className="flex flex-col gap-1.5 max-w-[85%]">
        <div className="bg-canvas border border-line rounded-2xl rounded-tl-md px-4 py-3">
          <div className="markdown-content text-[14px] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={citationComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>

          {msg.queryType === 'database' && (
            <div className="mt-2 flex items-center gap-1.5">
              <Pill variant="soft">
                <Database className="w-3 h-3" />
                {msg.connectionName || 'Database'}
              </Pill>
            </div>
          )}

          {msg.queryType === 'database' && msg.executedQuery && (
            <details className="mt-2">
              <summary className="text-[11px] text-muted-soft cursor-pointer hover:text-ink select-none">
                View query
              </summary>
              <pre className="mt-1.5 text-[11px] bg-surface border border-line rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap font-mono text-ink">
                {msg.executedQuery}
              </pre>
            </details>
          )}

          {msg.citations && msg.citations.length > 0 && (
            <CitationBadges citations={msg.citations} highlightIndex={highlightedCitation} />
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] text-muted-soft font-mono">{formatTime(msg.timestamp)}</span>
          <div className="w-px h-3 bg-line" />
          <button
            type="button"
            onClick={() => onFeedback(msg.id, 'up')}
            className={`transition-colors ${
              msg.feedback === 'up' ? 'text-[#10B981]' : 'text-muted-soft hover:text-ink'
            }`}
            title="Helpful"
          >
            <ThumbsUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onFeedback(msg.id, 'down')}
            className={`transition-colors ${
              msg.feedback === 'down' ? 'text-[#EF4444]' : 'text-muted-soft hover:text-ink'
            }`}
            title="Not helpful"
          >
            <ThumbsDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onCopy(msg.id, msg.content)}
            className={`transition-colors ml-0.5 ${
              msg.copied ? 'text-[#10B981]' : 'text-muted-soft hover:text-ink'
            }`}
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function ChatPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  const chatbot = useChatbotById(chatbotId);
  const { setChatContext, updateChatContext, clearChatContext } = useHeaderStore();

  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return crypto.randomUUID();
    const storageKey = `corpus-session-${chatbotId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem(storageKey, newId);
    return newId;
  });

  const resetSession = useCallback(() => {
    const storageKey = `corpus-session-${chatbotId}`;
    const newId = crypto.randomUUID();
    localStorage.setItem(storageKey, newId);
    setSessionId(newId);
  }, [chatbotId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history
  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const data = await chatHistoryApi.getHistory(chatbotId, 100);
        if (cancelled) return;
        if (data.messages?.length > 0) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.messageId,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.createdAt).getTime(),
              citations: Array.isArray(m.citations)
                ? m.citations.map((c: string | Citation) => (typeof c === 'string' ? { source: c } : c))
                : undefined,
              feedback: (m.feedback === 1 ? 'up' : m.feedback === -1 ? 'down' : null) as 'up' | 'down' | null,
              persistedId: m.messageId,
            }))
            .sort((a, b) => a.timestamp - b.timestamp)
          );
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [chatbotId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ chatbotId, query: text.trim(), username: user?.email, sessionId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat request failed');

      const citations: Citation[] = Array.isArray(data.citations)
        ? data.citations.map((c: string | Citation) => (typeof c === 'string' ? { source: c } : c))
        : [];

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          content: data.answer,
          timestamp: Date.now(),
          citations: citations.length > 0 ? citations : undefined,
          queryType: data.queryType,
          executedQuery: data.executedQuery,
          connectionName: data.connectionName,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          content: `Sorry, I ran into an error: ${error.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleFeedback = useCallback((msgId: string, val: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const next = m.feedback === val ? null : val;
        if (m.persistedId) {
          chatHistoryApi
            .updateFeedback(chatbotId, m.persistedId, next === 'up' ? 1 : next === 'down' ? -1 : null)
            .catch(() => {});
        }
        return { ...m, feedback: next };
      })
    );
  }, [chatbotId]);

  const handleCopy = useCallback((msgId: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, copied: true } : m)));
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, copied: false } : m)));
    }, 1500);
  }, []);

  const chatbotName = chatbot?.title || 'AI Assistant';
  const canSend = input.trim().length > 0 && !loading;

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history for this chatbot? This cannot be undone.')) return;
    setClearingHistory(true);
    updateChatContext({ clearingHistory: true });
    try {
      await chatHistoryApi.clearHistory(chatbotId);
      setMessages([]);
      resetSession();
    } catch { /* silent */ } finally {
      setClearingHistory(false);
      updateChatContext({ clearingHistory: false });
    }
  };

  useEffect(() => {
    setChatContext({
      chatbotName,
      chatbotId,
      hasMessages: messages.length > 0,
      clearingHistory,
      onClear: handleClearHistory,
    });
    return () => clearChatContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotName, chatbotId]);

  useEffect(() => {
    updateChatContext({ hasMessages: messages.length > 0 });
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateChatContext({ clearingHistory });
  }, [clearingHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col -m-6 lg:-m-8 bg-surface" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Title row ────────────────────────────────────── */}
      <div className="px-6 lg:px-8 pt-6 pb-4 border-b border-line bg-canvas/60">
        <div className="max-w-[920px] mx-auto flex items-center justify-between">
          <div>
            <Eyebrow>Chatbot</Eyebrow>
            <h1
              className="font-display text-2xl font-medium text-ink mt-1.5"
              style={{ letterSpacing: '-0.02em' }}
            >
              {chatbotName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {chatbot && <Status kind={statusFromBackend(chatbot.status)} size="lg" />}
            {messages.length > 0 && (
              <Pill variant="soft">{messages.length} msgs</Pill>
            )}
          </div>
        </div>
      </div>

      {/* ── Thread ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[920px] mx-auto px-6 lg:px-8 py-6 flex flex-col gap-5">

          {historyLoading && (
            <div className="flex justify-center py-16">
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <div className="h-3.5 w-3.5 rounded-full border border-line border-t-ink animate-spin" />
                Loading history…
              </div>
            </div>
          )}

          {!historyLoading && messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BotMark />
              <Eyebrow className="mt-4">Ready</Eyebrow>
              <h2
                className="font-display text-2xl font-medium leading-tight mt-2"
                style={{ letterSpacing: '-0.02em' }}
              >
                <span className="text-ink">How can I help?</span>{' '}
                <span className="text-muted">Pick a thread.</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-1.5 mt-6 max-w-xl">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-[12px] px-3 py-1.5 rounded-full border border-line bg-canvas text-ink hover:bg-surface transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onFeedback={handleFeedback}
              onCopy={handleCopy}
            />
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Composer ─────────────────────────────────────── */}
      <div className="shrink-0 px-6 lg:px-8 pb-6 pt-3 bg-surface">
        <div className="max-w-[920px] mx-auto">
          <div className="border border-line bg-canvas rounded-2xl shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              placeholder="Ask the bot anything…"
              className="w-full resize-none outline-none px-4 pt-3 pb-1 text-[14px] text-ink placeholder:text-muted-soft bg-transparent disabled:opacity-50"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2 text-[11px] text-muted-soft">
                <Sparkles className="w-3 h-3" />
                <span>Grounded in your sources</span>
                <span className="mx-1">·</span>
                <span className="font-mono" style={{ letterSpacing: '0.14em' }}>
                  ⌘ + ENTER
                </span>
              </div>
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!canSend}
                className="w-8 h-8 rounded-lg bg-ink hover:bg-ink-hover text-white flex items-center justify-center transition-colors disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
