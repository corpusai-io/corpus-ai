'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { dataStoreApi, chatbotApi } from '@/lib/api';
import {
  Database, FileText, Globe, Type, Plus, Search, Trash2, Eye,
  Upload, Loader2, X, AlertCircle,
} from 'lucide-react';
import { Eyebrow, Stat, Status, Pill, Button, Divider } from '@/components/corpus';

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

function fileExt(filename: string): string {
  return (filename.split('.').pop() || '').toUpperCase();
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

/* ─── Inline status ──────────────────────────────────────── */
function InlineStatus({ status }: { status: string }) {
  if (status === 'active')     return <Status kind="live" />;
  if (status === 'processing') return <Status kind="training" />;
  return <Status kind="down" />;
}

/* ─── Portal modal ───────────────────────────────────────── */
function Modal({ open, onClose, children, className = '' }: {
  open: boolean; onClose: () => void; children: React.ReactNode; className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full bg-canvas rounded-2xl border border-line shadow-lg p-6 max-h-[90vh] overflow-y-auto ${className}`}
        style={{ animation: 'fadeInUp 0.2s cubic-bezier(0,0,0.2,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
function SkeletonPage() {
  return (
    <div className="space-y-6 v4-animate-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><div className="w-32 h-2.5 rounded v4-shimmer" /><div className="w-56 h-7 rounded v4-shimmer" /></div>
        <div className="w-28 h-9 rounded-lg v4-shimmer" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="v4-card p-5 space-y-2"><div className="w-20 h-2.5 rounded v4-shimmer" /><div className="w-12 h-7 rounded v4-shimmer" /></div>)}
      </div>
      <div className="v4-card overflow-hidden">
        {[0,1,2,3,4].map(i => <div key={i} className="px-5 py-4 border-b border-line flex gap-4"><div className="w-7 h-7 rounded v4-shimmer" /><div className="flex-1 h-4 rounded v4-shimmer" /><div className="w-16 h-4 rounded v4-shimmer" /></div>)}
      </div>
    </div>
  );
}

/* ─── Source-type selector card in modal ─────────────────── */
function SourceTypeCard({ icon: Icon, label, desc, selected, onClick }: {
  icon: React.ComponentType<{ className?: string }>; label: string; desc: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
        selected
          ? 'border-ink bg-surface'
          : 'border-line bg-canvas hover:bg-surface'
      }`}
    >
      <Icon className={`w-5 h-5 ${selected ? 'text-ink' : 'text-muted-soft'}`} />
      <span className={`text-[12px] font-medium ${selected ? 'text-ink' : 'text-muted'}`}>{label}</span>
      <span className="text-[10px] text-muted-soft">{desc}</span>
    </button>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function DataStoresPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [records,       setRecords]       = useState<DataRecord[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<SourceTab>('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [displayCount,  setDisplayCount]  = useState(20);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSourceType, setAddSourceType] = useState<AddSourceType>('documents');
  const [addFiles,      setAddFiles]      = useState<File[]>([]);
  const [addUrls,       setAddUrls]       = useState<string[]>([]);
  const [urlInput,      setUrlInput]      = useState('');
  const [addTextTitle,  setAddTextTitle]  = useState('');
  const [addTextContent,setAddTextContent]= useState('');
  const [adding,        setAdding]        = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<DataRecord | null>(null);
  const [deleting,      setDeleting]      = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    docs:  records.filter(r => isDocType(r.type)),
    webs:  records.filter(r => isWebType(r.type)),
    texts: records.filter(r => isTextType(r.type)),
  }), [records]);

  const stats = useMemo(() => ({
    total: records.length,
    docs:  { count: grouped.docs.length,  size:  grouped.docs.reduce((s, r) => s + (r.size || 0), 0) },
    webs:  { count: grouped.webs.length },
    texts: { count: grouped.texts.length, chars: grouped.texts.reduce((s, r) => s + (r.size || 0), 0) },
  }), [records, grouped]);

  const filteredRecords = useMemo(() => {
    let subset =
      activeTab === 'documents' ? grouped.docs :
      activeTab === 'web'       ? grouped.webs :
      activeTab === 'text'      ? grouped.texts :
      [...grouped.docs, ...grouped.webs, ...grouped.texts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      subset = subset.filter(r => r.source.toLowerCase().includes(q));
    }
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
      const fileMeta: Array<{ name: string; size: number }> = [];
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
    { key: 'all',       label: 'All',       count: records.length },
    { key: 'documents', label: 'Documents', count: grouped.docs.length },
    { key: 'web',       label: 'Web',       count: grouped.webs.length },
    { key: 'text',      label: 'Text',      count: grouped.texts.length },
  ];

  return (
    <div className="space-y-8 v4-animate-in">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Eyebrow>Data sources</Eyebrow>
          <h1
            className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-ink">Train your bot.</span>{' '}
            <span className="text-muted">Drop in the source.</span>
          </h1>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setAddSourceType('documents'); setShowAddDialog(true); }}>
          Add data
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/20 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
          <p className="text-[13px] text-[#EF4444]">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="[01] Sources"   value={stats.total}        sub={`${stats.docs.count} doc · ${stats.webs.count} web · ${stats.texts.count} text`} delay={60}  />
        <Stat label="[02] Documents" value={stats.docs.count}   sub={formatBytes(stats.docs.size)}                                                    delay={120} />
        <Stat label="[03] Web pages" value={stats.webs.count}   sub={`${stats.webs.count} page${stats.webs.count !== 1 ? 's' : ''}`}                  delay={180} />
        <Stat label="[04] Text"      value={stats.texts.count}  sub={formatChars(stats.texts.chars)}                                                  delay={240} />
      </div>

      {/* Processing banner */}
      {processingCount > 0 && (
        <div className="v4-card p-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-ink shrink-0" />
          <p className="text-[13px] text-ink">
            <span className="font-medium">{processingCount}</span> source{processingCount !== 1 ? 's' : ''} processing — embeddings will be ready shortly.
          </p>
        </div>
      )}

      {/* Empty / table */}
      {records.length === 0 ? (
        <div className="v4-card p-16 text-center border-dashed">
          <Database className="mx-auto w-10 h-10 text-line-strong mb-3" />
          <p className="text-[14px] font-medium text-muted mb-1">No data sources yet</p>
          <p className="text-[12px] text-muted-soft mb-5">Add documents, web pages or text to train your chatbot.</p>
          <Button variant="primary" icon={Plus} onClick={() => { setAddSourceType('documents'); setShowAddDialog(true); }}>
            Add data
          </Button>
        </div>
      ) : (
        <div className="v4-card overflow-hidden">
          {/* Tabs + search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pt-4 pb-3 border-b border-line">
            <div className="flex items-center gap-0.5">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setDisplayCount(20); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-surface text-ink'
                      : 'text-muted hover:text-ink hover:bg-surface'
                  }`}
                >
                  {tab.label}
                  <span className="font-mono text-[10px] text-muted-soft">{tab.count}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-soft" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sources…"
                className="w-full sm:w-52 bg-canvas border border-line rounded-lg pl-9 pr-3 py-2 text-[12px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_120px_120px_120px] gap-4 px-5 py-2.5 bg-surface/50 border-b border-line">
            {['', 'Source', 'Status', 'Details', 'Added'].map(h => (
              <span key={h} className="font-mono uppercase text-[10px] font-semibold text-muted-soft" style={{ letterSpacing: '0.14em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {paginatedRecords.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-[13px] text-muted">{searchQuery ? 'No results for that search' : 'No sources in this category'}</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {paginatedRecords.map(record => {
                const isWeb  = isWebType(record.type);
                const isText = isTextType(record.type);
                const ext    = !isWeb && !isText ? fileExt(record.source) : '';

                return (
                  <div key={record.dataId} className="group grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_120px_120px_120px] items-center gap-4 px-5 py-3.5 hover:bg-surface transition-colors">
                    {/* Icon / ext chip */}
                    <div className="shrink-0">
                      {isWeb && (
                        <div className="h-7 w-7 rounded-lg bg-surface border border-line flex items-center justify-center">
                          <Globe className="w-3.5 h-3.5 text-ink" />
                        </div>
                      )}
                      {isText && (
                        <div className="h-7 w-7 rounded-lg bg-surface border border-line flex items-center justify-center">
                          <Type className="w-3.5 h-3.5 text-ink" />
                        </div>
                      )}
                      {ext && (
                        <span
                          className="inline-flex items-center justify-center min-w-[28px] rounded-md px-1.5 py-0.5 bg-surface border border-line font-mono text-[9px] font-semibold text-ink uppercase"
                          style={{ letterSpacing: '0.08em' }}
                        >
                          {ext}
                        </span>
                      )}
                    </div>

                    {/* Source */}
                    <div className="min-w-0">
                      <p className="text-[13px] text-ink truncate">
                        {isWeb ? (() => { try { return new URL(record.source).hostname; } catch { return record.source; } })() : record.source}
                      </p>
                      {isWeb && <p className="text-[11px] text-muted-soft truncate mt-0.5">{record.source}</p>}
                      {!isWeb && <p className="text-[11px] text-muted-soft mt-0.5">{isText ? 'Custom text' : formatBytes(record.size)}</p>}
                    </div>

                    {/* Status */}
                    <div className="hidden sm:block"><InlineStatus status={record.status || 'active'} /></div>

                    {/* Details */}
                    <div className="hidden sm:block text-[12px] text-muted-soft font-mono">
                      {isWeb  ? (record.crawledPages ? `${record.crawledPages} pages` : '—')
                       : isText ? (record.size ? formatChars(record.size) : '—')
                       :         (record.pageCount ? `${record.pageCount} pages` : formatBytes(record.size))}
                    </div>

                    {/* Added + hover actions */}
                    <div className="hidden sm:block text-right relative">
                      <span className="text-[12px] text-muted-soft font-mono group-hover:opacity-0 transition-opacity">{timeAgo(record.createdAt)}</span>
                      <div className="absolute inset-0 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => isWeb ? window.open(record.source, '_blank') : handleViewDocument(record)}
                          className="p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-canvas transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(record)}
                          className="p-1.5 rounded-lg text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-line">
              <p className="text-[12px] text-muted-soft font-mono">
                Showing {Math.min(displayCount, filteredRecords.length)} of {filteredRecords.length}
              </p>
              {hasMore && (
                <button
                  onClick={() => setDisplayCount(p => p + 20)}
                  className="text-[12px] text-muted hover:text-ink transition-colors underline underline-offset-2"
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
        <Eyebrow>Add source</Eyebrow>
        <h2
          className="font-display text-[20px] font-medium text-ink mt-2 mb-1"
          style={{ letterSpacing: '-0.012em' }}
        >
          Train with new data.
        </h2>
        <p className="text-[12px] text-muted mb-5">Pick the format. We&apos;ll parse, chunk, and embed it.</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <SourceTypeCard icon={FileText} label="Documents" desc="PDF, DOCX, TXT"  selected={addSourceType === 'documents'} onClick={() => setAddSourceType('documents')} />
          <SourceTypeCard icon={Globe}    label="Web pages" desc="URLs / Sitemap"  selected={addSourceType === 'web'}       onClick={() => setAddSourceType('web')} />
          <SourceTypeCard icon={Type}     label="Plain text" desc="Paste content"   selected={addSourceType === 'text'}      onClick={() => setAddSourceType('text')} />
        </div>

        {addSourceType === 'documents' && (
          <div className="space-y-3">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line p-8 transition-colors hover:border-ink hover:bg-surface group"
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-10 w-10 rounded-xl bg-surface border border-line flex items-center justify-center mb-2.5">
                <Upload className="w-4 h-4 text-ink" />
              </div>
              <p className="text-[13px] font-medium text-ink">Drop files or click to browse</p>
              <p className="text-[11px] text-muted-soft mt-1">PDF, DOCX, TXT, CSV — 25MB max</p>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.doc,.docx,.csv,.xlsx,.xls,.md" className="hidden"
                onChange={e => { if (e.target.files) setAddFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
            </div>
            {addFiles.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {addFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface border border-line rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-muted-soft shrink-0" />
                      <span className="text-[12px] text-ink truncate">{file.name}</span>
                      <span className="text-[11px] text-muted-soft shrink-0 font-mono">{formatBytes(file.size)}</span>
                    </div>
                    <button onClick={() => setAddFiles(addFiles.filter((_, idx) => idx !== i))} className="text-muted-soft hover:text-[#EF4444] ml-2 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleAddFiles}
              disabled={adding || !addFiles.length}
              className="w-full flex items-center justify-center gap-2 bg-ink text-white hover:bg-ink-hover rounded-lg py-2.5 text-[14px] font-medium transition-colors disabled:opacity-40"
            >
              {adding ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Upload & train</>}
            </button>
          </div>
        )}

        {addSourceType === 'web' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrlChip(); } }}
                placeholder="https://example.com"
                className="flex-1 bg-canvas border border-line rounded-lg px-3.5 py-2 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
              />
              <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddUrlChip} disabled={!urlInput.trim()}>Add</Button>
            </div>
            {addUrls.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {addUrls.map((url, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface border border-line rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="w-3.5 h-3.5 text-ink shrink-0" />
                      <span className="text-[12px] text-ink truncate">{url}</span>
                    </div>
                    <button onClick={() => setAddUrls(addUrls.filter((_, idx) => idx !== i))} className="text-muted-soft hover:text-[#EF4444] ml-2 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleAddUrls}
              disabled={adding || !addUrls.length}
              className="w-full flex items-center justify-center gap-2 bg-ink text-white hover:bg-ink-hover rounded-lg py-2.5 text-[14px] font-medium transition-colors disabled:opacity-40"
            >
              {adding ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching…</> : <><Globe className="w-4 h-4" />Fetch & train</>}
            </button>
          </div>
        )}

        {addSourceType === 'text' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted">Title</label>
              <input
                value={addTextTitle}
                onChange={e => setAddTextTitle(e.target.value)}
                placeholder="FAQ, product info, etc."
                className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted">Content</label>
              <textarea
                value={addTextContent}
                onChange={e => setAddTextContent(e.target.value)}
                rows={5}
                placeholder="Paste your content here…"
                className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors resize-none"
              />
            </div>
            <button
              onClick={handleAddText}
              disabled={adding || !addTextTitle.trim() || !addTextContent.trim()}
              className="w-full flex items-center justify-center gap-2 bg-ink text-white hover:bg-ink-hover rounded-lg py-2.5 text-[14px] font-medium transition-colors disabled:opacity-40"
            >
              {adding ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Type className="w-4 h-4" />Save & train</>}
            </button>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm">
        <Eyebrow>Confirm</Eyebrow>
        <h3
          className="font-display text-[20px] font-medium text-ink mt-2"
          style={{ letterSpacing: '-0.012em' }}
        >
          Delete this source?
        </h3>
        <p className="text-[13px] text-muted leading-relaxed mt-2 mb-6">
          <span className="text-ink font-medium">{deleteTarget?.source}</span> and all its embeddings will be permanently removed.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 justify-center" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
