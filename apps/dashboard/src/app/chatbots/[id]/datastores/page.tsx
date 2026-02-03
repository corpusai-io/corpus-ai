'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataStoreApi } from '@/lib/api';
import { Button } from '@corpusai/ui';
import { Plus, Trash2, ArrowLeft, FileText, Globe } from 'lucide-react';

interface DataRecord {
  dataId: string;
  source: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: number;
  skipped: boolean;
}

export default function DataStoresPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await dataStoreApi.list(chatbotId);
      setRecords(data.records || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dataId: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;

    try {
      await dataStoreApi.delete(chatbotId, dataId);
      setRecords(records.filter((r) => r.dataId !== dataId));
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    if (type === 'web') return <Globe className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
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
              <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
              <p className="mt-2 text-gray-600">
                Manage your chatbot's knowledge base
              </p>
            </div>
            <Button className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add Data
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Data Table */}
        {records.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No data sources yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add data sources to train your chatbot
            </p>
            <Button className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add your first data source
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr
                    key={record.dataId}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        <span className="text-sm text-gray-900">
                          {record.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatBytes(record.size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.dataId)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {records.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-600">Total Sources</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {records.length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatBytes(records.reduce((sum, r) => sum + r.size, 0))}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-600">File Types</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {new Set(records.map((r) => r.type)).size}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
