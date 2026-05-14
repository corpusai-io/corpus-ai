'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { accessControlApi } from '@/lib/api';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Code,
} from 'lucide-react';
import { Eyebrow, Pill, Button } from '@/components/corpus';

interface ApiKeyEntry {
  keyId: string;
  label: string;
  prefix: string;
  createdAt: number;
  lastUsed?: number | null;
}

export default function ApiKeysPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [keyLabel,           setKeyLabel]           = useState('');
  const [generating,         setGenerating]         = useState(false);
  const [newlyGeneratedKey,  setNewlyGeneratedKey]  = useState<string | null>(null);
  const [copied,             setCopied]             = useState(false);

  const [keys,         setKeys]         = useState<ApiKeyEntry[]>([]);
  const [loadingKeys,  setLoadingKeys]  = useState(true);
  const [listError,    setListError]    = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ApiKeyEntry | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const [codeCopied,   setCodeCopied]   = useState(false);
  const [showFullKey,  setShowFullKey]  = useState(false);

  useEffect(() => { loadKeys(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const loadKeys = async () => {
    try {
      setLoadingKeys(true);
      setListError(false);
      const data: any = await accessControlApi.listApiKeys(chatbotId);
      setKeys(data.keys || []);
    } catch {
      setListError(true);
      setKeys([]);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleGenerateKey = async () => {
    try {
      setGenerating(true);
      const data: any = await accessControlApi.generateApiKey(chatbotId, keyLabel.trim() || undefined);
      setNewlyGeneratedKey(data.apiKey);
      setKeyLabel('');
      loadKeys();
    } catch (err: any) {
      alert('Failed to generate API key: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await accessControlApi.deleteApiKey(chatbotId, deleteTarget.keyId);
      setKeys(keys.filter((k) => k.keyId !== deleteTarget.keyId));
      setDeleteTarget(null);
    } catch (err: any) {
      alert('Failed to delete API key: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  const copyCodeExample = () => {
    const code = `curl -X POST ${apiBase}/api/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Hello", "chatbotId": "${chatbotId}"}'`;
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const maskKey = (prefix: string) => prefix + '...' + '•'.repeat(24);

  return (
    <div className="v4-animate-in mx-auto max-w-4xl space-y-8">

      {/* Header */}
      <div>
        <Eyebrow>Settings · API keys</Eyebrow>
        <h1
          className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-ink">Programmatic access.</span>{' '}
          <span className="text-muted">One key at a time.</span>
        </h1>
      </div>

      {/* Generate */}
      <div className="v4-card p-6">
        <Eyebrow>Generate</Eyebrow>
        <h2
          className="font-display text-[18px] font-medium text-ink mt-2"
          style={{ letterSpacing: '-0.012em' }}
        >
          New API key
        </h2>
        <p className="mt-2 text-[13px] text-muted">
          Give it an optional label so you remember what it&apos;s for.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-muted mb-1.5">Label (optional)</label>
            <input
              type="text"
              placeholder="e.g. Production server, Mobile app"
              value={keyLabel}
              onChange={(e) => setKeyLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateKey(); }}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <Button variant="primary" icon={Plus} onClick={handleGenerateKey} disabled={generating}>
            {generating ? 'Generating…' : 'Generate key'}
          </Button>
        </div>

        {newlyGeneratedKey && (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[13px] font-medium text-ink">
                  Save this key now. It won&apos;t be shown again.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-canvas border border-line px-3 py-2 font-mono text-[13px] text-ink flex-1 overflow-x-auto">
                  {showFullKey
                    ? newlyGeneratedKey
                    : newlyGeneratedKey.substring(0, 12) + '•'.repeat(Math.max(0, newlyGeneratedKey.length - 12))}
                </div>
                <button
                  onClick={() => setShowFullKey(!showFullKey)}
                  className="h-8 w-8 rounded-lg border border-line text-muted hover:text-ink hover:bg-surface flex items-center justify-center shrink-0 transition-colors"
                  title={showFullKey ? 'Hide key' : 'Show key'}
                >
                  {showFullKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(newlyGeneratedKey)}
                  className="h-8 w-8 rounded-lg border border-line text-muted hover:text-ink hover:bg-surface flex items-center justify-center shrink-0 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => { setNewlyGeneratedKey(null); setShowFullKey(false); setCopied(false); }}
              className="text-[12px] text-muted-soft hover:text-ink transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="v4-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Eyebrow>Active keys</Eyebrow>
            <h2
              className="font-display text-[18px] font-medium text-ink mt-2"
              style={{ letterSpacing: '-0.012em' }}
            >
              All issued keys
            </h2>
          </div>
          {keys.length > 0 && <Pill variant="soft">{keys.length} {keys.length === 1 ? 'key' : 'keys'}</Pill>}
        </div>

        {loadingKeys ? (
          <div className="space-y-3">
            {[0,1,2].map(i => <div key={i} className="v4-shimmer rounded-xl h-14" />)}
          </div>
        ) : listError ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <Key className="w-9 h-9 text-line-strong mx-auto mb-3" />
            <p className="text-[13px] text-muted">Unable to load API keys list.</p>
            <p className="mt-1 text-[12px] text-muted-soft">You can still generate new keys above.</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <Key className="w-9 h-9 text-line-strong mx-auto mb-3" />
            <p className="text-[13px] font-medium text-muted">No API keys yet</p>
            <p className="mt-1 text-[12px] text-muted-soft">Generate your first key above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[1fr_180px_120px_120px_48px] gap-4 px-4 py-2.5 border-b border-line bg-surface/50">
              {['Label','Key','Created','Last used',''].map((h) => (
                <span
                  key={h || 'spacer'}
                  className="font-mono uppercase text-[10px] font-semibold text-muted-soft"
                  style={{ letterSpacing: '0.14em' }}
                >
                  {h}
                </span>
              ))}
            </div>

            {keys.map((key) => (
              <div
                key={key.keyId}
                className="group grid grid-cols-[1fr_180px_120px_120px_48px] gap-4 px-4 py-3 hover:bg-surface transition-colors border-b border-line items-center"
              >
                <span className={key.label ? 'text-[13px] text-ink' : 'text-[13px] italic text-muted-soft'}>
                  {key.label || 'No label'}
                </span>
                <code className="rounded bg-surface border border-line px-2 py-1 font-mono text-[11px] text-ink">
                  {maskKey(key.prefix || key.keyId.substring(0, 8))}
                </code>
                <span className="text-[12px] text-muted-soft font-mono">{formatDate(key.createdAt)}</span>
                <span className="text-[12px] text-muted-soft font-mono">{key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</span>
                <button
                  onClick={() => setDeleteTarget(key)}
                  className="h-7 w-7 rounded-md text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Example */}
      <div className="v4-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-ink" />
            <Eyebrow>Usage</Eyebrow>
          </div>
          <Button variant="secondary" size="sm" onClick={copyCodeExample}>
            {codeCopied ? <CheckCircle className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
            {codeCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <p className="text-[13px] text-muted mb-3">
          Send messages to your chatbot from any backend.
        </p>

        <div className="rounded-xl bg-surface border border-line p-4 font-mono text-[13px] text-ink overflow-x-auto">
          <pre>
            <code>{`curl -X POST ${apiBase}/api/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Hello", "chatbotId": "${chatbotId}"}'`}</code>
          </pre>
        </div>

        <div className="mt-4 space-y-2 text-[13px] text-muted">
          <p>
            Replace{' '}
            <code className="rounded bg-surface border border-line px-1.5 py-0.5 font-mono text-[11px] text-ink">YOUR_API_KEY</code>
            {' '}with your actual key. Your chatbot ID:
          </p>
          <div className="rounded-lg bg-surface border border-line px-3 py-2 font-mono text-[12px] text-ink">
            {chatbotId}
          </div>
        </div>
      </div>

      {/* Delete dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-line shadow-lg p-6">
            <Eyebrow>Confirm</Eyebrow>
            <h3
              className="font-display text-[20px] font-medium text-ink mt-2"
              style={{ letterSpacing: '-0.012em' }}
            >
              Delete API key?
            </h3>
            <p className="text-[13px] text-muted mt-2 mb-6 leading-relaxed">
              {deleteTarget.label
                ? <>The key <span className="font-medium text-ink">&quot;{deleteTarget.label}&quot;</span> will stop working immediately.</>
                : 'This key will stop working immediately.'}
              {' '}Any apps using it lose access. Cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
              <button
                onClick={handleDeleteKey}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-ink text-white text-[14px] font-medium hover:bg-ink-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Delete key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
