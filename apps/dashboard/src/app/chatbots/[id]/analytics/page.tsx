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
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const;

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonPage() {
  return (
    <div className="space-y-6 v4-animate-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="w-28 h-7 rounded-lg v4-shimmer" />
          <div className="w-48 h-4 rounded-md v4-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="w-28 h-9 rounded-lg v4-shimmer" />
          <div className="w-28 h-9 rounded-lg v4-shimmer" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="v4-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-3.5 rounded v4-shimmer" />
              <div className="w-9 h-9 rounded-lg v4-shimmer" />
            </div>
            <div className="w-16 h-8 rounded-md v4-shimmer" />
          </div>
        ))}
      </div>
      <div className="v4-card rounded-2xl p-6 space-y-3">
        <div className="w-36 h-5 rounded-md v4-shimmer" />
        <div className="h-40 rounded-xl v4-shimmer" />
      </div>
      <div className="v4-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.05]">
          <div className="w-28 h-5 rounded-md v4-shimmer" />
        </div>
        {[0,1,2,3,4].map(i => (
          <div key={i} className="px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.04] flex gap-4">
            <div className="w-20 h-3.5 rounded v4-shimmer" />
            <div className="flex-1 h-3.5 rounded v4-shimmer" />
            <div className="w-32 h-3.5 rounded v4-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat card ───────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
}) {
  return (
    <div className="v4-card rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 dark:text-[#71717A]">{label}</p>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-[#3F3F46] mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Bar chart ───────────────────────────────────────────── */
function BarChart({ data, maxCount }: { data: Array<{ date: string; count: number }>; maxCount: number }) {
  const showEveryN = data.length > 14 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="v4-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Query Volume</h2>
          <p className="text-xs text-slate-400 dark:text-[#3F3F46] mt-0.5">Messages over time</p>
        </div>
        <TrendingUp className="h-4 w-4 text-slate-400 dark:text-[#3F3F46]" />
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Horizontal guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-full h-px bg-slate-100 dark:bg-white/[0.04]" />
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end gap-px h-40 pb-0">
          {data.map((day) => {
            const height = maxCount > 0 ? Math.max((day.count / maxCount) * 100, day.count > 0 ? 2 : 0) : 0;
            return (
              <div key={day.date} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t-sm bg-[#BF56FF]/40 group-hover:bg-[#BF56FF]/70 transition-colors duration-150"
                  style={{ height: `${height}%`, minHeight: day.count > 0 ? '3px' : '0' }}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="whitespace-nowrap rounded-lg bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/[0.10] px-3 py-1.5 text-xs shadow-xl">
                    <p className="font-semibold text-slate-900 dark:text-white">{day.count} queries</p>
                    <p className="text-slate-400 dark:text-[#71717A]">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((day, i) => (
            <div key={day.date} className="flex-1 text-center">
              {i % showEveryN === 0 && (
                <span className="text-[9px] text-slate-400 dark:text-[#3F3F46]">
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

  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [dateRange]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
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
      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
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
    <div className="space-y-5 v4-animate-in">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-400 dark:text-[#71717A] mt-0.5">Track performance and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg p-1">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  dateRange === opt.value
                    ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-sm dark:shadow-none'
                    : 'text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-[#A1A1AA]'
                }`}
              >
                {opt.label.replace('Last ', '')}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.10] text-xs font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Queries"
          value={(analytics?.totalQueries ?? 0).toLocaleString()}
          icon={BarChart3}
          color="bg-[#BF56FF]/10 border border-[#BF56FF]/20 text-[#BF56FF]"
        />
        <StatCard
          label="Avg Response Time"
          value={analytics?.avgResponseTime ? `${(analytics.avgResponseTime / 1000).toFixed(1)}s` : '—'}
          icon={Clock}
          color="bg-blue-500/10 border border-blue-500/20 text-blue-400"
        />
        <StatCard
          label="Positive Feedback"
          value={`${positiveRate}%`}
          icon={ThumbsUp}
          color="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]"
          sub={`${analytics?.thumbsUp ?? 0} up · ${analytics?.thumbsDown ?? 0} down`}
        />
        <StatCard
          label="Unique Sessions"
          value={uniqueSessions.toLocaleString()}
          icon={Users}
          color="bg-[#BF56FF]/10 border border-[#BF56FF]/20 text-[#BF56FF]"
        />
      </div>

      {/* Bar chart */}
      <BarChart data={chartData} maxCount={maxCount} />

      {/* Query log table */}
      <div className="v4-card rounded-2xl overflow-hidden">

        {/* Table header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.05]">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Query Logs</h2>
            <p className="text-xs text-slate-400 dark:text-[#3F3F46] mt-0.5">{filteredLogs.length.toLocaleString()} entries</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#3F3F46]" />
            <input
              type="text"
              placeholder="Search queries…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 transition-all"
            />
          </div>
        </div>

        {paginatedLogs.length === 0 ? (
          <div className="py-16 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-slate-200 dark:text-[#2D2D30] mb-3" />
            <p className="text-sm font-medium text-slate-400 dark:text-[#71717A]">
              {searchQuery ? 'No matching queries' : 'No queries yet'}
            </p>
            <p className="text-xs text-slate-400 dark:text-[#3F3F46] mt-1">
              {searchQuery ? 'Try a different search term' : 'Logs will appear when users interact with your chatbot'}
            </p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[120px_1fr_1fr_64px_72px] gap-4 px-5 py-2.5 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.015]">
              {['Date', 'Query', 'Answer', 'Feedback', 'Duration'].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-slate-400 dark:text-[#3F3F46] uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {paginatedLogs.map((log) => (
                <div key={log.logId}>
                  <button
                    type="button"
                    onClick={() => setExpandedLog(expandedLog === log.logId ? null : log.logId)}
                    className="w-full grid grid-cols-[120px_1fr_1fr_64px_72px] gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <span className="text-xs text-slate-400 dark:text-[#3F3F46] tabular-nums">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-[#A1A1AA] truncate">{log.query}</span>
                    <span className="text-xs text-slate-400 dark:text-[#71717A] truncate">{log.answer}</span>
                    <span className="flex items-center">
                      {log.thumb === 'up' && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
                          <ThumbsUp className="h-2.5 w-2.5 text-[#22C55E]" />
                        </span>
                      )}
                      {log.thumb === 'down' && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#EC4899]/10 border border-[#EC4899]/20">
                          <ThumbsDown className="h-2.5 w-2.5 text-[#EC4899]" />
                        </span>
                      )}
                      {!log.thumb && <span className="text-xs text-slate-400 dark:text-[#2D2D30]">—</span>}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-[#3F3F46] tabular-nums">
                      {log.duration ? `${(log.duration / 1000).toFixed(1)}s` : '—'}
                    </span>
                  </button>

                  {/* Expanded answer */}
                  {expandedLog === log.logId && (
                    <div className="px-5 pb-4 grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-[#3F3F46] uppercase tracking-wider mb-1.5">Query</p>
                        <p className="text-xs text-slate-600 dark:text-[#A1A1AA] leading-relaxed">{log.query}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-[#3F3F46] uppercase tracking-wider mb-1.5">Answer</p>
                        <p className="text-xs text-slate-400 dark:text-[#71717A] leading-relaxed line-clamp-6">{log.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.05]">
              <p className="text-xs text-slate-400 dark:text-[#3F3F46]">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-slate-700 dark:hover:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs text-slate-400 dark:text-[#71717A] tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-slate-700 dark:hover:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
