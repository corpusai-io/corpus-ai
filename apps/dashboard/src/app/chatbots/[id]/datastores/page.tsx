'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { dataStoreApi, chatbotApi } from '@/lib/api';
import {
  Database, FileText, Globe, Type, Plus, Search, Trash2, Eye,
  Upload, Loader2, CheckCircle2, X, AlertCircle,
} from 'lucide-react';

interface DataRecord {
  dataId: string;
  source: string;
  type: string;
  size: number;
  pageCount?: number;
  crawledPages?: number;
  s3Key?: string;
  status: 'processing' | 'active' | 'error';
  createdAt: string;
  updatedAt: number;
  skipped: boolean;
}

type SourceTab = 'all' | 'documents' | 'web' | 'text';
type AddSourceType = 'documents' | 'web' | 'text';

/* ─── Helpers ─────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function getExtColor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    pdf: 'bg-red-500/10 text-red-400 border border-red-500/20',
    docx: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    doc: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    txt: 'bg-[#BF56FF]/10 text-[#BF56FF] border border-[#BF56FF]/20',
    csv: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20',
    xlsx: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20',
    xls: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20',
    md: 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-[#71717A] border border-slate-200 dark:border-white/[0.08]',
  };
  return { ext: ext.toUpperCase(), color: map[ext] || 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-[#71717A] border border-slate-200 dark:border-white/[0.08]' };
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

function formatChars(size: number): string {
  if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M chars`;
  if (size >= 1000) return `${(size / 1000).toFixed(1)}k chars`;
  return `${size} chars`;
}

const isWebType = (t: string) => t === 'web';
const isTextType = (t: string) => t === 'manual' || t === 'text';
const isDocType = (t: string) => !isWebType(t) && !isTextType(t);

/* ─── Status dot ──────────────────────────────────────────── */
function StatusDot({ status }: { status: string }) {
  if (status === 'active') return (
    <span className="flex items-center gap-1.5 text-xs text-[#22C55E]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />Active
    </span>
  );
  if (status === 'processing') return (
    <span className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
      <Loader2 className="h-3 w-3 animate-spin" />Training
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#EC4899]">
      <AlertCircle className="h-3 w-3" />Error
    </span>
  );
}

/* ─── Portal modal ────────────────────────────────────────── */
function Modal({ open, onClose, children, className = '' }: {
  open: boolean; onClose: () => void; children: React.ReactNode; className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full bg-white dark:bg-[#0E0E10] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${className}`}
        style={{ animation: 'fadeInUp 0.2s cubic-bezier(0,0,0.2,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BF56FF]/30 to-transparent rounded-t-2xl" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-slate-600 dark:hover:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonPage() {
  return (
    <div className="space-y-5 v4-animate-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5"><div className="w-32 h-7 rounded-lg v4-shimmer" /><div className="w-56 h-4 rounded v4-shimmer" /></div>
        <div className="w-24 h-9 rounded-lg v4-shimmer" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="v4-card rounded-2xl p-5 space-y-2"><div className="w-20 h-3.5 rounded v4-shimmer" /><div className="w-10 h-8 rounded-md v4-shimmer" /></div>)}
      </div>
      <div className="v4-card rounded-2xl overflow-hidden">
        {[0,1,2,3,4].map(i => <div key={i} className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.04] flex gap-4"><div className="w-12 h-4 rounded v4-shimmer" /><div className="flex-1 h-4 rounded v4-shimmer" /><div className="w-16 h-4 rounded v4-shimmer" /></div>)}
      </div>
    </div>
  );
}

/* ─── Source type selector card (used in modal) ───────────── */
function SourceTypeCard({ icon: Icon, label, desc, selected, onClick }: {
  icon: React.ComponentType<{className?: string}>; label: string; desc: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
        selected
          ? 'border-[#BF56FF]/50 bg-[#BF56FF]/[0.06]'
          : 'border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/[0.12]'
      }`}
    >
      <Icon className={`h-5 w-5 ${selected ? 'text-[#BF56FF]' : 'text-slate-400 dark:text-[#3F3F46]'}`} />
      <span className={`text-xs font-semibold ${selected ? 'text-[#BF56FF]' : 'text-slate-500 dark:text-[#71717A]'}`}>{label}</span>
      <span className="text-[10px] text-slate-400 dark:text-[#3F3F46]">{desc}</span>
    </button>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function DataStoresPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SourceTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSourceType, setAddSourceType] = useState<AddSourceType>('documents');
  const [addFiles, setAddFiles] = useState<File[]>([]);
  const [addUrls, setAddUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [addTextTitle, setAddTextTitle] = useState('');
  const [addTextContent, setAddTextContent] = useState('');
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<DataRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const buildPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dataStoreApi.list(chatbotId) as { records?: DataRecord[] };
      setRecords(data.records || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [chatbotId]);

  const startBuildPolling = useCallback(() => {
    if (buildPollRef.current) clearInterval(buildPollRef.current);
    buildPollRef.current = setInterval(async () => {
      try {
        const status = await chatbotApi.getStatus(chatbotId);
        if (status.status === 'ACTIVE' || status.status === 'ERROR') {
          if (buildPollRef.current) clearInterval(buildPollRef.current);
          buildPollRef.current = null;
          await loadRecords();
        }
      } catch {
        if (buildPollRef.current) clearInterval(buildPollRef.current);
        buildPollRef.current = null;
      }
    }, 5000);
  }, [chatbotId, loadRecords]);

  useEffect(() => {
    loadRecords();
    chatbotApi.getStatus(chatbotId).then(s => { if (s.status === 'BUILDING') startBuildPolling(); }).catch(() => {});
    return () => { if (buildPollRef.current) clearInterval(buildPollRef.current); };
  }, []);

  const hasProcessing = useMemo(() => records.some((r) => r.status !== 'active'), [records]);
  useEffect(() => {
    if (!hasProcessing) return;
    const interval = setInterval(async () => {
      try {
        const s = await chatbotApi.getStatus(chatbotId);
        if (s.status === 'ACTIVE' || s.status === 'ERROR') await loadRecords();
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [hasProcessing, chatbotId, loadRecords]);

  const grouped = useMemo(() => ({
    docs: records.filter(r => isDocType(r.type)),
    webs: records.filter(r => isWebType(r.type)),
    texts: records.filter(r => isTextType(r.type)),
  }), [records]);

  const stats = useMemo(() => ({
    total: records.length,
    docs: { count: grouped.docs.length, size: grouped.docs.reduce((s, r) => s + (r.size || 0), 0) },
    webs: { count: grouped.webs.length },
    texts: { count: grouped.texts.length, chars: grouped.texts.reduce((s, r) => s + (r.size || 0), 0) },
  }), [records, grouped]);

  const filteredRecords = useMemo(() => {
    let subset = activeTab === 'documents' ? grouped.docs : activeTab === 'web' ? grouped.webs : activeTab === 'text' ? grouped.texts : [...grouped.docs, ...grouped.webs, ...grouped.texts];
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); subset = subset.filter(r => r.source.toLowerCase().includes(q)); }
    return [...subset].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTab, grouped, searchQuery]);

  const paginatedRecords = useMemo(() => filteredRecords.slice(0, displayCount), [filteredRecords, displayCount]);
  const hasMore = filteredRecords.length > displayCount;
  const processingCount = records.filter(r => r.status !== 'active').length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await dataStoreApi.delete(chatbotId, deleteTarget.dataId);
      setRecords(prev => prev.filter(r => r.dataId !== deleteTarget.dataId));
      setDeleteTarget(null);
    } catch (err: any) { alert('Failed to delete: ' + err.message); }
    finally { setDeleting(false); }
  };

  const handleAddFiles = async () => {
    if (!addFiles.length) return;
    try {
      setAdding(true);
      const fileKeys: string[] = [];
      const fileMeta: Array<{name: string; size: number}> = [];
      for (const file of addFiles) {
        const { fileKey } = await chatbotApi.uploadFile(chatbotId, file);
        fileKeys.push(fileKey);
        fileMeta.push({ name: file.name, size: file.size });
      }
      await chatbotApi.startBuild(chatbotId, fileKeys, fileMeta);
      resetAdd(); startBuildPolling(); await loadRecords();
    } catch (err: any) { alert('Failed to upload files: ' + err.message); }
    finally { setAdding(false); }
  };

  const handleAddUrls = async () => {
    if (!addUrls.length) return;
    try {
      setAdding(true);
      for (const url of addUrls) await dataStoreApi.add(chatbotId, { type: 'web', source: url });
      try { await chatbotApi.rebuild(chatbotId); } catch {}
      resetAdd(); startBuildPolling(); await loadRecords();
    } catch (err: any) { alert('Failed to add URLs: ' + err.message); }
    finally { setAdding(false); }
  };

  const handleAddText = async () => {
    if (!addTextTitle.trim() || !addTextContent.trim()) return;
    try {
      setAdding(true);
      await dataStoreApi.add(chatbotId, { type: 'manual', source: addTextTitle.trim(), content: addTextContent.trim(), size: addTextContent.trim().length });
      try { await chatbotApi.rebuild(chatbotId); } catch {}
      resetAdd(); startBuildPolling(); await loadRecords();
    } catch (err: any) { alert('Failed to add text: ' + err.message); }
    finally { setAdding(false); }
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setAddFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleAddUrlChip = () => {
    const t = urlInput.trim();
    if (t && !addUrls.includes(t)) setAddUrls(prev => [...prev, t]);
    setUrlInput('');
  };

  const resetAdd = () => {
    setShowAddDialog(false); setAddSourceType('documents'); setAddFiles([]); setAddUrls([]); setUrlInput(''); setAddTextTitle(''); setAddTextContent('');
  };

  const handleViewDocument = async (record: DataRecord) => {
    try {
      const result = await dataStoreApi.getViewToken(chatbotId, record.source, record.s3Key);
      if (result.token) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        window.open(`${apiBase}/api/data-store/download?token=${result.token}`, '_blank');
      }
    } catch (err: any) { alert('Failed to open document: ' + err.message); }
  };

  if (loading) return <SkeletonPage />;

  const TABS: { key: SourceTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: records.length },
    { key: 'documents', label: 'Documents', count: grouped.docs.length },
    { key: 'web', label: 'Web', count: grouped.webs.length },
    { key: 'text', label: 'Text', count: grouped.texts.length },
  ];

  return (
    <div className="space-y-5 v4-animate-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Data Sources</h1>
          <p className="text-sm text-slate-400 dark:text-[#71717A] mt-0.5">Knowledge base powering your chatbot</p>
        </div>
        <button
          onClick={() => { setAddSourceType('documents'); setShowAddDialog(true); }}
          className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Data
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-[#EC4899]/[0.08] border border-[#EC4899]/20 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-[#EC4899] shrink-0" />
          <p className="text-sm text-[#EC4899]">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sources', value: stats.total, sub: `${stats.docs.count} doc · ${stats.webs.count} web · ${stats.texts.count} text`, icon: Database, color: 'bg-[#BF56FF]/10 border border-[#BF56FF]/20 text-[#BF56FF]' },
          { label: 'Documents', value: stats.docs.count, sub: formatBytes(stats.docs.size), icon: FileText, color: 'bg-[#BF56FF]/10 border border-[#BF56FF]/20 text-[#BF56FF]' },
          { label: 'Web Pages', value: stats.webs.count, sub: `${stats.webs.count} page${stats.webs.count !== 1 ? 's' : ''}`, icon: Globe, color: 'bg-blue-500/10 border border-blue-500/20 text-blue-400' },
          { label: 'Custom Text', value: stats.texts.count, sub: formatChars(stats.texts.chars), icon: Type, color: 'bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]' },
        ].map((card) => (
          <div key={card.label} className="v4-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 dark:text-[#71717A]">{card.label}</p>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-400 dark:text-[#3F3F46] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Processing banner */}
      {processingCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-[#F59E0B]/[0.08] border border-[#F59E0B]/20 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-[#F59E0B] shrink-0" />
          <p className="text-sm text-[#F59E0B] font-medium">{processingCount} source{processingCount !== 1 ? 's' : ''} being processed — embeddings will be ready shortly</p>
        </div>
      )}

      {/* Table card */}
      {records.length === 0 ? (
        <div className="v4-card rounded-2xl p-16 text-center border-dashed">
          <Database className="mx-auto h-10 w-10 text-slate-200 dark:text-[#2D2D30] mb-3" />
          <p className="text-sm font-semibold text-slate-400 dark:text-[#71717A] mb-1">No data sources yet</p>
          <p className="text-xs text-slate-400 dark:text-[#3F3F46] mb-5">Add documents, web pages or text to train your chatbot</p>
          <button
            onClick={() => { setAddSourceType('documents'); setShowAddDialog(true); }}
            className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />Add Data
          </button>
        </div>
      ) : (
        <div className="v4-card rounded-2xl overflow-hidden">
          {/* Tabs + search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-0.5">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setDisplayCount(20); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-[#BF56FF]/10 text-[#BF56FF]'
                      : 'text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-[#A1A1AA]'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#BF56FF]/20 text-[#BF56FF]' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-[#3F3F46]'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#3F3F46]" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sources…"
                className="w-full sm:w-52 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 transition-all"
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_100px_110px_100px] gap-4 px-5 py-2.5 bg-slate-50 dark:bg-white/[0.015] border-b border-slate-100 dark:border-white/[0.04]">
            {['', 'Source', 'Status', 'Details', 'Added'].map(h => (
              <span key={h} className="text-[10px] font-semibold text-slate-400 dark:text-[#3F3F46] uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {paginatedRecords.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-slate-400 dark:text-[#71717A]">{searchQuery ? 'No results for that search' : 'No sources in this category'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {paginatedRecords.map(record => {
                const isWeb = isWebType(record.type);
                const isText = isTextType(record.type);
                const badge = !isWeb && !isText ? getExtColor(record.source) : null;

                return (
                  <div key={record.dataId} className="group grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_100px_110px_100px] items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Icon */}
                    <div className="shrink-0">
                      {isWeb && (
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Globe className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                      )}
                      {isText && (
                        <div className="h-7 w-7 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center">
                          <Type className="h-3.5 w-3.5 text-[#22C55E]" />
                        </div>
                      )}
                      {badge && (
                        <span className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[9px] font-bold ${badge.color}`}>
                          {badge.ext}
                        </span>
                      )}
                    </div>
                    {/* Source */}
                    <div className="min-w-0">
                      <p className="text-sm text-slate-600 dark:text-[#A1A1AA] truncate">
                        {isWeb ? (() => { try { return new URL(record.source).hostname; } catch { return record.source; } })() : record.source}
                      </p>
                      {isWeb && <p className="text-xs text-slate-400 dark:text-[#3F3F46] truncate mt-0.5">{record.source}</p>}
                      {!isWeb && <p className="text-xs text-slate-400 dark:text-[#3F3F46] mt-0.5">{isText ? 'Custom text' : formatBytes(record.size)}</p>}
                    </div>
                    {/* Status */}
                    <div className="hidden sm:block"><StatusDot status={record.status || 'active'} /></div>
                    {/* Details */}
                    <div className="hidden sm:block text-xs text-slate-400 dark:text-[#3F3F46]">
                      {isWeb ? (record.crawledPages ? `${record.crawledPages} pages` : '—') : isText ? (record.size ? formatChars(record.size) : '—') : (record.pageCount ? `${record.pageCount} pages` : formatBytes(record.size))}
                    </div>
                    {/* Added + hover actions */}
                    <div className="hidden sm:block text-right relative">
                      <span className="text-xs text-slate-400 dark:text-[#3F3F46] group-hover:opacity-0 transition-opacity">{timeAgo(record.createdAt)}</span>
                      <div className="absolute inset-0 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => isWeb ? window.open(record.source, '_blank') : handleViewDocument(record)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(record)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-[#EC4899] hover:bg-[#EC4899]/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.05]">
              <p className="text-xs text-slate-400 dark:text-[#3F3F46]">Showing {Math.min(displayCount, filteredRecords.length)} of {filteredRecords.length}</p>
              {hasMore && (
                <button
                  onClick={() => setDisplayCount(p => p + 20)}
                  className="text-xs text-slate-400 dark:text-[#71717A] hover:text-slate-700 dark:hover:text-[#A1A1AA] transition-colors"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add data modal */}
      <Modal open={showAddDialog} onClose={resetAdd} className="max-w-lg">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">Add Data Source</h2>
        <p className="text-xs text-slate-400 dark:text-[#71717A] mb-5">Train your chatbot with new data</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <SourceTypeCard icon={FileText} label="Documents" desc="PDF, DOCX, TXT" selected={addSourceType === 'documents'} onClick={() => setAddSourceType('documents')} />
          <SourceTypeCard icon={Globe} label="Web Pages" desc="URLs & Sitemaps" selected={addSourceType === 'web'} onClick={() => setAddSourceType('web')} />
          <SourceTypeCard icon={Type} label="Plain Text" desc="Custom content" selected={addSourceType === 'text'} onClick={() => setAddSourceType('text')} />
        </div>

        {addSourceType === 'documents' && (
          <div className="space-y-3">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-white/[0.10] p-8 transition-all hover:border-[#BF56FF]/40 hover:bg-[#BF56FF]/[0.03] group"
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center mb-2.5 group-hover:border-[#BF56FF]/30 transition-colors">
                <Upload className="h-4 w-4 text-slate-400 dark:text-[#3F3F46] group-hover:text-[#BF56FF] transition-colors" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-[#A1A1AA]">Drop files or click to browse</p>
              <p className="text-xs text-slate-400 dark:text-[#3F3F46] mt-1">PDF, DOCX, TXT, CSV — 25MB max</p>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.doc,.docx,.csv,.xlsx,.xls,.md" className="hidden"
                onChange={e => { if (e.target.files) setAddFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
            </div>
            {addFiles.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {addFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-slate-400 dark:text-[#3F3F46] shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-[#A1A1AA] truncate">{file.name}</span>
                      <span className="text-xs text-slate-400 dark:text-[#3F3F46] shrink-0">{formatBytes(file.size)}</span>
                    </div>
                    <button onClick={() => setAddFiles(addFiles.filter((_, idx) => idx !== i))} className="text-slate-400 dark:text-[#3F3F46] hover:text-[#EC4899] ml-2 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleAddFiles} disabled={adding || !addFiles.length}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-40">
              {adding ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading…</> : <><Upload className="h-4 w-4" />Upload & Train</>}
            </button>
          </div>
        )}

        {addSourceType === 'web' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrlChip(); } }}
                placeholder="https://example.com"
                className="flex-1 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 transition-all" />
              <button onClick={handleAddUrlChip} disabled={!urlInput.trim()}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.10] text-xs font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-40">
                <Plus className="h-3.5 w-3.5" />Add
              </button>
            </div>
            {addUrls.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {addUrls.map((url, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-[#A1A1AA] truncate">{url}</span>
                    </div>
                    <button onClick={() => setAddUrls(addUrls.filter((_, idx) => idx !== i))} className="text-slate-400 dark:text-[#3F3F46] hover:text-[#EC4899] ml-2 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleAddUrls} disabled={adding || !addUrls.length}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-40">
              {adding ? <><Loader2 className="h-4 w-4 animate-spin" />Fetching…</> : <><Globe className="h-4 w-4" />Fetch & Train</>}
            </button>
          </div>
        )}

        {addSourceType === 'text' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">Title</label>
              <input value={addTextTitle} onChange={e => setAddTextTitle(e.target.value)} placeholder="FAQ, Product Info, etc."
                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">Content</label>
              <textarea value={addTextContent} onChange={e => setAddTextContent(e.target.value)} rows={5} placeholder="Paste your content here…"
                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 transition-all resize-none" />
            </div>
            <button onClick={handleAddText} disabled={adding || !addTextTitle.trim() || !addTextContent.trim()}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-40">
              {adding ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Type className="h-4 w-4" />Save & Train</>}
            </button>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent rounded-t-2xl" />
        <div className="w-10 h-10 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 flex items-center justify-center mb-4">
          <Trash2 className="h-5 w-5 text-[#EC4899]" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Delete data source?</h3>
        <p className="text-sm text-slate-400 dark:text-[#71717A] mb-6">
          <span className="text-slate-700 dark:text-[#A1A1AA] font-medium">{deleteTarget?.source}</span> and all its embeddings will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/[0.10] text-sm font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg bg-[#EC4899]/15 border border-[#EC4899]/25 text-sm font-medium text-[#EC4899] hover:bg-[#EC4899]/25 transition-all disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
