'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { queryLogApi } from '@/lib/api';
import { Button } from '@corpusai/ui';
import {
  ArrowLeft,
  Download,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface QueryLog {
  logId: string;
  query: string;
  answer: string;
  thumb?: 'up' | 'down';
  timestamp: number;
  sessionId?: string;
}

interface Analytics {
  totalQueries: number;
  thumbsUp: number;
  thumbsDown: number;
  avgResponseTime?: number;
  topQueries: Array<{ query: string; count: number }>;
}

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);

      const startDate = new Date();
      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
      if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      if (dateRange === '90d') startDate.setDate(startDate.getDate() - 90);

      const [logsData, analyticsData] = await Promise.all([
        queryLogApi.list(chatbotId, {
          startDate: startDate.getTime(),
          endDate: Date.now(),
          limit: 50,
        }),
        queryLogApi.analytics(chatbotId, {
          startDate: startDate.getTime(),
          endDate: Date.now(),
        }),
      ]);

      setLogs(logsData.logs || []);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await queryLogApi.export(chatbotId);
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

  const getSatisfactionRate = () => {
    if (!analytics) return 0;
    const total = analytics.thumbsUp + analytics.thumbsDown;
    if (total === 0) return 0;
    return Math.round((analytics.thumbsUp / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BF56FF] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/chatbots')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chatbots
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">
                Track chatbot performance and user engagement
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) =>
                  setDateRange(e.target.value as '7d' | '30d' | '90d')
                }
                className="rounded-md border border-gray-200 px-3 py-2 focus:border-[#BF56FF] focus:outline-none focus:ring-2 focus:ring-[#BF56FF]"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button
                onClick={handleExport}
                className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Queries
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics?.totalQueries || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-white">
                <MessageSquare className="h-6 w-6 text-[#BF56FF]" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thumbs Up</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {analytics?.thumbsUp || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <ThumbsUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thumbs Down</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {analytics?.thumbsDown || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <ThumbsDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Satisfaction
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {getSatisfactionRate()}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-white">
                <TrendingUp className="h-6 w-6 text-[#BF56FF]" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Queries */}
        {analytics?.topQueries && analytics.topQueries.length > 0 && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top Queries
            </h2>
            <div className="space-y-3">
              {analytics.topQueries.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-white text-sm font-bold text-[#BF56FF]">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-900">{item.query}</p>
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    {item.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query Logs Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Queries
            </h2>
          </div>

          {logs.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No queries yet
              </h3>
              <p className="text-gray-600">
                Query logs will appear here when users interact with your
                chatbot
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Answer Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Feedback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr
                      key={log.logId}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="max-w-xs truncate text-sm text-gray-900">
                          {log.query}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-md truncate text-sm text-gray-600">
                          {log.answer}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {log.thumb === 'up' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <ThumbsUp className="h-3 w-3" />
                            Positive
                          </span>
                        )}
                        {log.thumb === 'down' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            <ThumbsDown className="h-3 w-3" />
                            Negative
                          </span>
                        )}
                        {!log.thumb && (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
