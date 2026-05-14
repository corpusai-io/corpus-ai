'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { queryLogApi } from '@/lib/api';
import {
  Download,
  BarChart3,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Eyebrow, Stat, Button, Divider } from '@/components/corpus';

interface QueryLog {
  logId: string;
  query: string;
  answer: string;
  thumb?: 'up' | 'down';
  timestamp: number;
  sessionId?: string;
  duration?: number;
}

interface Analytics {
  totalQueries: number;
  thumbsUp: number;
  thumbsDown: number;
  thumbsUpPercentage?: number;
  avgResponseTime?: number;
  uniqueSessions?: number;
  dailyVolume?: Array<{ date: string; count: number }>;
  topQueries?: Array<{ query: string; count: number }>;
}

const ITEMS_PER_PAGE = 10;

const DATE_OPTIONS = [
  { value: '7d',  label: '7 days'  },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
] as const;

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonPage() {
  return (
    <div className="space-y-6 v4-animate-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-24 h-2.5 rounded v4-shimmer" />
          <div className="w-48 h-7 rounded v4-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="w-32 h-9 rounded-lg v4-shimmer" />
          <div className="w-24 h-9 rounded-lg v4-shimmer" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="v4-card p-5 space-y-3">
            <div className="w-24 h-2.5 rounded v4-shimmer" />
            <div className="w-16 h-7 rounded v4-shimmer" />
            <div className="w-20 h-3 rounded v4-shimmer" />
          </div>
        ))}
      </div>
      <div className="v4-card p-6 space-y-3">
        <div className="w-36 h-5 rounded v4-shimmer" />
        <div className="h-40 rounded-xl v4-shimmer" />
      </div>
    </div>
  );
}

/* ─── Bar chart ───────────────────────────────────────────── */
function BarChart({ data, maxCount }: { data: Array<{ date: string; count: number }>; maxCount: number }) {
  const showEveryN = data.length > 14 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="v4-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <Eyebrow>Query volume</Eyebrow>
          <h2
            className="font-display text-[15px] font-medium text-ink mt-1.5"
            style={{ letterSpacing: '-0.012em' }}
          >
            Messages over time
          </h2>
        </div>
        <TrendingUp className="w-4 h-4 text-muted-soft" />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[0,1,2,3].map(i => <div key={i} className="w-full h-px bg-line" />)}
        </div>

        <div className="flex items-end gap-px h-40 pb-0">
          {data.map((day) => {
            const height = maxCount > 0 ? Math.max((day.count / maxCount) * 100, day.count > 0 ? 2 : 0) : 0;
            return (
              <div key={day.date} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t-sm bg-line-strong group-hover:bg-ink transition-colors duration-150"
                  style={{ height: `${height}%`, minHeight: day.count > 0 ? '3px' : '0' }}
                />
                <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="whitespace-nowrap rounded-lg bg-canvas border border-line px-3 py-1.5 text-[11px] shadow-sm">
                    <p className="font-medium text-ink">{day.count} {day.count === 1 ? 'query' : 'queries'}</p>
                    <p className="text-muted-soft font-mono">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-2">
          {data.map((day, i) => (
            <div key={day.date} className="flex-1 text-center">
              {i % showEveryN === 0 && (
                <span className="font-mono text-[9px] text-muted-soft">
                  {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [logs,         setLogs]         = useState<QueryLog[]>([]);
  const [analytics,    setAnalytics]    = useState<Analytics | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [dateRange,    setDateRange]    = useState<'7d' | '30d' | '90d'>('30d');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [expandedLog,  setExpandedLog]  = useState<string | null>(null);

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [dateRange]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      if (dateRange === '7d')  startDate.setDate(startDate.getDate() - 7);
      if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      if (dateRange === '90d') startDate.setDate(startDate.getDate() - 90);

      const [logsData, analyticsData] = await Promise.all([
        queryLogApi.list(chatbotId, { startDate: startDate.getTime(), endDate: Date.now(), limit: 500 }),
        queryLogApi.analytics(chatbotId, { startDate: startDate.getTime(), endDate: Date.now() }),
      ]);

      setLogs((logsData as any).logs || []);
      const raw = analyticsData as any;
      setAnalytics(raw.analytics ? raw.analytics : raw);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const startDate = new Date();
      if (dateRange === '7d')  startDate.setDate(startDate.getDate() - 7);
      if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      if (dateRange === '90d') startDate.setDate(startDate.getDate() - 90);
      const blob = await queryLogApi.export(chatbotId, { startDate: startDate.getTime(), endDate: Date.now() });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_logs_${chatbotId}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export: ' + err.message);
    }
  };

  const positiveRate = useMemo(() => {
    if (!analytics) return 0;
    const total = (analytics.thumbsUp ?? 0) + (analytics.thumbsDown ?? 0);
    return total === 0 ? 0 : Math.round(((analytics.thumbsUp ?? 0) / total) * 100);
  }, [analytics]);

  const uniqueSessions = useMemo(() => {
    if (analytics?.uniqueSessions != null) return analytics.uniqueSessions;
    return new Set(logs.filter((l) => l.sessionId).map((l) => l.sessionId)).size;
  }, [analytics, logs]);

  const chartData = useMemo(() => {
    if (analytics?.dailyVolume?.length) return analytics.dailyVolume;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets[d.toISOString().split('T')[0]] = 0;
    }
    logs.forEach((log) => {
      try {
        const key = new Date(log.timestamp).toISOString().split('T')[0];
        if (key in buckets) buckets[key]++;
      } catch { /* skip */ }
    });
    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }, [analytics, logs, dateRange]);

  const maxCount = useMemo(() => Math.max(1, ...chartData.map((d) => d.count)), [chartData]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => log.query.toLowerCase().includes(q) || log.answer.toLowerCase().includes(q));
  }, [logs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-8 v4-animate-in">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Analytics</Eyebrow>
          <h1
            className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-ink">Performance.</span>{' '}
            <span className="text-muted">At a glance.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-canvas border border-line rounded-lg p-1 shadow-sm">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  dateRange === opt.value
                    ? 'bg-surface text-ink'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat
          label="[01] Queries"
          value={(analytics?.totalQueries ?? 0).toLocaleString()}
          sub={`across ${dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} days`}
          delay={60}
        />
        <Stat
          label="[02] Avg response"
          value={analytics?.avgResponseTime ? `${(analytics.avgResponseTime / 1000).toFixed(1)}s` : '—'}
          sub="from query to answer"
          delay={120}
        />
        <Stat
          label="[03] Positive feedback"
          value={`${positiveRate}%`}
          sub={`${analytics?.thumbsUp ?? 0} up · ${analytics?.thumbsDown ?? 0} down`}
          delay={180}
        />
        <Stat
          label="[04] Sessions"
          value={uniqueSessions.toLocaleString()}
          sub="unique users"
          delay={240}
        />
      </div>

      <BarChart data={chartData} maxCount={maxCount} />

      {/* Query log table */}
      <div className="v4-card overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between px-5 py-4 border-b border-line">
          <div>
            <Eyebrow>Query log</Eyebrow>
            <p className="text-[12px] text-muted mt-1">{filteredLogs.length.toLocaleString()} entries</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-soft" />
            <input
              type="text"
              placeholder="Search queries…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 bg-canvas border border-line rounded-lg pl-9 pr-3 py-2 text-[12px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        </div>

        {paginatedLogs.length === 0 ? (
          <div className="py-16 text-center">
            <BarChart3 className="mx-auto w-9 h-9 text-line-strong mb-3" />
            <p className="text-[13px] font-medium text-muted">
              {searchQuery ? 'No matching queries' : 'No queries yet'}
            </p>
            <p className="text-[12px] text-muted-soft mt-1">
              {searchQuery ? 'Try a different search term' : 'Logs appear when users interact with your chatbot.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[120px_1fr_1fr_64px_72px] gap-4 px-5 py-2.5 border-b border-line bg-surface/50">
              {['Date', 'Query', 'Answer', 'Feedback', 'Duration'].map((h) => (
                <span
                  key={h}
                  className="font-mono uppercase text-[10px] font-semibold text-muted-soft"
                  style={{ letterSpacing: '0.14em' }}
                >
                  {h}
                </span>
              ))}
            </div>

            <div className="divide-y divide-line">
              {paginatedLogs.map((log) => (
                <div key={log.logId}>
                  <button
                    type="button"
                    onClick={() => setExpandedLog(expandedLog === log.logId ? null : log.logId)}
                    className="w-full grid grid-cols-[120px_1fr_1fr_64px_72px] gap-4 px-5 py-3.5 hover:bg-surface transition-colors text-left"
                  >
                    <span className="text-[12px] text-muted-soft tabular-nums font-mono">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </span>
                    <span className="text-[12px] text-ink truncate">{log.query}</span>
                    <span className="text-[12px] text-muted truncate">{log.answer}</span>
                    <span className="flex items-center">
                      {log.thumb === 'up' && (
                        <ThumbsUp className="w-3.5 h-3.5 text-[#10B981]" />
                      )}
                      {log.thumb === 'down' && (
                        <ThumbsDown className="w-3.5 h-3.5 text-[#EF4444]" />
                      )}
                      {!log.thumb && <span className="text-[12px] text-muted-soft">—</span>}
                    </span>
                    <span className="text-[12px] text-muted-soft tabular-nums font-mono">
                      {log.duration ? `${(log.duration / 1000).toFixed(1)}s` : '—'}
                    </span>
                  </button>

                  {expandedLog === log.logId && (
                    <div className="px-5 pb-4 grid grid-cols-2 gap-4 bg-surface/50">
                      <div>
                        <Eyebrow className="mb-1.5">Query</Eyebrow>
                        <p className="text-[12px] text-ink leading-relaxed">{log.query}</p>
                      </div>
                      <div>
                        <Eyebrow className="mb-1.5">Answer</Eyebrow>
                        <p className="text-[12px] text-muted leading-relaxed line-clamp-6">{log.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 border-t border-line">
              <p className="text-[12px] text-muted-soft font-mono">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-[12px] text-muted font-mono tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
