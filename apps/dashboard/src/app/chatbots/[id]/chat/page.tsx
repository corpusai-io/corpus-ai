'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { chatbotApi, chatHistoryApi } from '@/lib/api';
import { useChatbotById } from '@/stores/chatbot-store';
import { useHeaderStore } from '@/stores/header-store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  ArrowUpRight,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Database,
  User,
} from 'lucide-react';

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

/* ─── Typing indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 mt-0.5 rounded-full bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-slate-400 dark:text-[#8A8A98]" />
      </div>
      <div className="bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[#26262B] rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#3A3A42] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#3A3A42] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#3A3A42] animate-bounce" style={{ animationDelay: '300ms' }} />
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
              className="mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 dark:bg-[#2A2A30] text-[9px] font-bold text-slate-500 dark:text-[#8A8A98] hover:bg-slate-300 dark:hover:bg-[#32323A] hover:text-slate-700 dark:hover:text-[#C0C0CC] transition-colors"
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
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium transition-all ${
              highlightIndex === i
                ? 'border-slate-300 dark:border-[#3A3A42] bg-slate-100 dark:bg-[#242428] text-slate-700 dark:text-[#C0C0CC]'
                : 'border-slate-200 dark:border-[#26262B] bg-slate-50 dark:bg-[#1A1A1E] text-slate-400 dark:text-[#58585E] hover:border-slate-300 dark:hover:border-[#3A3A42] hover:text-slate-600 dark:hover:text-[#8A8A98]'
            }`}
          >
            [{i + 1}] {(cit.source || `Source ${i + 1}`).length > 28
              ? (cit.source || '').slice(0, 28) + '…'
              : (cit.source || `Source ${i + 1}`)}
          </button>
          {expanded === i && cit.text && (
            <p className="mt-1.5 rounded-lg bg-slate-50 dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] px-3 py-2 text-xs text-slate-500 dark:text-[#58585E] leading-relaxed">
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
        <div className="flex flex-col items-end gap-1 max-w-[75%] sm:max-w-[60%]">
          <div className="bg-slate-800 dark:bg-[#F0F0F4] text-white dark:text-[#111113] px-4 py-2.5 rounded-2xl rounded-tr-none text-sm font-medium leading-relaxed break-words w-full">
            {msg.content}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#44444C] px-1">{formatTime(msg.timestamp)}</span>
        </div>
        <div className="w-7 h-7 mt-0.5 rounded-full bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#8A8A98]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start items-start gap-2.5">
      <div className="w-7 h-7 mt-0.5 rounded-full bg-slate-100 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E34] flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-slate-400 dark:text-[#8A8A98]" />
      </div>

      <div className="flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]">
        {/* Bot bubble */}
        <div className="bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[#26262B] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm dark:shadow-none">
          <div className="markdown-content text-sm text-slate-700 dark:text-[#C8C8D0] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={citationComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>

          {/* DB badge */}
          {msg.queryType === 'database' && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A1A1E] border border-slate-200 dark:border-[#2A2A2F] text-slate-500 dark:text-[#8A8A98] font-medium">
                <Database className="w-2.5 h-2.5" />
                {msg.connectionName || 'Database'}
              </span>
            </div>
          )}

          {/* SQL query */}
          {msg.queryType === 'database' && msg.executedQuery && (
            <details className="mt-2">
              <summary className="text-[10px] text-slate-400 dark:text-[#44444C] cursor-pointer hover:text-slate-600 dark:hover:text-[#70707A] select-none">
                View query
              </summary>
              <pre className="mt-1.5 text-[10px] bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-[#26262B] rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap font-mono text-slate-500 dark:text-[#58585E]">
                {msg.executedQuery}
              </pre>
            </details>
          )}

          {/* Citations */}
          {msg.citations && msg.citations.length > 0 && (
            <CitationBadges citations={msg.citations} highlightIndex={highlightedCitation} />
          )}
        </div>

        {/* Feedback row */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] text-slate-400 dark:text-[#44444C]">{formatTime(msg.timestamp)}</span>
          <div className="w-px h-3 bg-slate-200 dark:bg-[#26262B]" />
          <button
            type="button"
            onClick={() => onFeedback(msg.id, 'up')}
            className={`transition-colors ${
              msg.feedback === 'up' ? 'text-emerald-500 dark:text-[#5A9E6F]' : 'text-slate-400 dark:text-[#3A3A42] hover:text-slate-500 dark:hover:text-[#8A8A98]'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onFeedback(msg.id, 'down')}
            className={`transition-colors ${
              msg.feedback === 'down' ? 'text-red-400 dark:text-[#9E4A4A]' : 'text-slate-400 dark:text-[#3A3A42] hover:text-slate-500 dark:hover:text-[#8A8A98]'
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onCopy(msg.id, msg.content)}
            className={`transition-colors ml-0.5 ${
              msg.copied ? 'text-emerald-500 dark:text-[#5A9E6F]' : 'text-slate-400 dark:text-[#3A3A42] hover:text-slate-500 dark:hover:text-[#8A8A98]'
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
  const inputRef = useRef<HTMLInputElement>(null);

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
              feedback: m.feedback === 1 ? 'up' : m.feedback === -1 ? 'down' : null,
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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8001/api';

      const response = await fetch(`${CHAT_SERVICE_URL}/chat`, {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, copied: true } : m))
    );
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, copied: false } : m))
      );
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

  // Sync chatbot context into the main header
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

  // Keep hasMessages + clearingHistory in sync without re-registering onClear
  useEffect(() => {
    updateChatContext({ hasMessages: messages.length > 0 });
  }, [messages.length]);

  useEffect(() => {
    updateChatContext({ clearingHistory });
  }, [clearingHistory]);

  return (
    <div
      className="flex flex-col -m-4 lg:-m-6 bg-slate-50 dark:bg-[#111113]"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* ── Messages ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6 flex flex-col gap-6">

          {/* History loading */}
          {historyLoading && (
            <div className="flex justify-center py-16">
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-[#44444C]">
                <div className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-[#3A3A42] border-t-slate-500 dark:border-t-[#8A8A98] animate-spin" />
                Loading history…
              </div>
            </div>
          )}

          {/* Empty state */}
          {!historyLoading && messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-[#1A1A1E] border border-slate-200 dark:border-[#2A2A2F] flex items-center justify-center mb-5">
                <Bot className="h-5 w-5 text-slate-400 dark:text-[#8A8A98]" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-[#D0D0D8] mb-1">{chatbotName}</h2>
              <p className="text-sm text-slate-400 dark:text-[#58585E] mb-8">How can I help you today?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-lg border border-slate-200 dark:border-[#26262B] bg-white dark:bg-[#17171A] px-4 py-2 text-xs text-slate-500 dark:text-[#68686E] hover:border-slate-300 dark:hover:border-[#32323A] hover:text-slate-700 dark:hover:text-[#A8A8B0] hover:bg-slate-50 dark:hover:bg-[#1C1C20] transition-all shadow-sm dark:shadow-none"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onFeedback={handleFeedback}
              onCopy={handleCopy}
            />
          ))}

          {/* Typing */}
          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 py-4 border-t border-slate-200 dark:border-[#1E1E22] bg-white dark:bg-[#111113]">
        <div>
          <div className="relative flex items-center bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[#26262B] rounded-xl focus-within:border-slate-300 dark:focus-within:border-[#3A3A42] focus-within:ring-2 focus-within:ring-slate-100 dark:focus-within:ring-[#26262B] transition-all duration-200 shadow-sm dark:shadow-none">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Message chatbot…"
              className="flex-1 bg-transparent border-0 px-4 py-3 text-sm text-slate-800 dark:text-[#E0E0E8] placeholder-slate-400 dark:placeholder-[#3A3A42] focus:outline-none focus:ring-0 disabled:opacity-50"
            />
            <div className="pr-2">
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!canSend}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                  canSend
                    ? 'bg-slate-900 dark:bg-[#F0F0F4] text-white dark:text-[#111113] hover:bg-slate-700 dark:hover:bg-white shadow-sm'
                    : 'bg-transparent text-slate-200 dark:text-[#2E2E34] cursor-not-allowed'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center mt-2 text-[10px] text-slate-400 dark:text-[#2E2E34]">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
