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

  // Generate key state
  const [keyLabel, setKeyLabel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Keys list state
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [listError, setListError] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Code example copy state
  const [codeCopied, setCodeCopied] = useState(false);

  // Show/hide newly generated key
  const [showFullKey, setShowFullKey] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

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
      const data: any = await accessControlApi.generateApiKey(
        chatbotId,
        keyLabel.trim() || undefined
      );
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const maskKey = (prefix: string) => {
    return prefix + '...' + '\u2022'.repeat(24);
  };

  return (
    <div className="v4-animate-in mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API Keys</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#A1A1AA]">
          Manage API keys for programmatic access to your chatbot
        </p>
      </div>

      {/* Generate Key Section */}
      <div className="v4-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-slate-400 dark:text-white/60" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Generate New API Key
          </h2>
        </div>

        <p className="mb-4 text-sm text-slate-500 dark:text-[#A1A1AA]">
          Create a new API key for programmatic access. Each key can be given an
          optional label for identification.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 dark:text-[#71717A] uppercase tracking-wider mb-2 block">
              Label (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Production Server, Mobile App"
              value={keyLabel}
              onChange={(e) => setKeyLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateKey();
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-slate-300 dark:focus:border-white/[0.16] text-sm transition-colors"
            />
          </div>
          <button
            onClick={handleGenerateKey}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-[#08080A] hover:bg-white/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate New API Key'}
          </button>
        </div>

        {/* Newly Generated Key Display */}
        {newlyGeneratedKey && (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.05] p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-sm font-medium text-[#F59E0B]">
                  Save this API key securely. It will not be shown again.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] px-3 py-2 font-mono text-sm text-slate-900 dark:text-white flex-1 overflow-x-auto">
                  {showFullKey
                    ? newlyGeneratedKey
                    : newlyGeneratedKey.substring(0, 12) +
                      '\u2022'.repeat(Math.max(0, newlyGeneratedKey.length - 12))}
                </div>
                <button
                  onClick={() => setShowFullKey(!showFullKey)}
                  className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] flex items-center justify-center shrink-0 transition-colors"
                  title={showFullKey ? 'Hide key' : 'Show key'}
                >
                  {showFullKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(newlyGeneratedKey)}
                  className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] flex items-center justify-center shrink-0 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setNewlyGeneratedKey(null);
                setShowFullKey(false);
                setCopied(false);
              }}
              className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* API Keys List */}
      <div className="v4-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-slate-400 dark:text-white/60" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Active API Keys
            </h2>
          </div>
          {keys.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-[#71717A] bg-slate-100 dark:bg-white/[0.04] rounded-md px-2 py-0.5">
              {keys.length} key{keys.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loadingKeys ? (
          <div className="space-y-3">
            <div className="v4-shimmer rounded-xl" style={{ height: '56px' }} />
            <div className="v4-shimmer rounded-xl" style={{ height: '56px' }} />
            <div className="v4-shimmer rounded-xl" style={{ height: '56px' }} />
          </div>
        ) : listError ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] p-10 text-center">
            <Key className="h-10 w-10 text-[#3F3F46] mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-[#A1A1AA]">
              Unable to load API keys list. The key listing feature may not be
              available yet.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#71717A]">
              You can still generate new keys above.
            </p>
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] p-10 text-center">
            <Key className="h-10 w-10 text-[#3F3F46] mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-[#A1A1AA]">No API keys yet</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#71717A]">
              Generate your first API key above to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_180px_100px_100px_48px] gap-4 px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.04]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#52525B]">Label</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#52525B]">Key</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#52525B]">Created</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#52525B]">Last Used</span>
              <span />
            </div>

            {/* Table Rows */}
            {keys.map((key) => (
              <div
                key={key.keyId}
                className="group grid grid-cols-[1fr_180px_100px_100px_48px] gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/[0.04] items-center"
              >
                <span className={key.label ? 'text-sm text-slate-900 dark:text-white' : 'text-sm italic text-slate-400 dark:text-[#52525B]'}>
                  {key.label || 'No label'}
                </span>
                <span>
                  <code className="rounded bg-slate-100 dark:bg-white/[0.06] px-2 py-1 font-mono text-xs text-slate-500 dark:text-[#A1A1AA]">
                    {maskKey(key.prefix || key.keyId.substring(0, 8))}
                  </code>
                </span>
                <span className="text-xs text-slate-500 dark:text-[#71717A]">
                  {formatDate(key.createdAt)}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#71717A]">
                  {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                </span>
                <span className="flex justify-end">
                  <button
                    onClick={() => setDeleteTarget(key)}
                    className="h-7 w-7 rounded-md text-[#52525B] hover:text-[#EC4899] hover:bg-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Example */}
      <div className="v4-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-slate-400 dark:text-white/60" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Usage Example
            </h2>
          </div>
          <button
            onClick={copyCodeExample}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.10] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] transition-colors text-sm"
          >
            {codeCopied ? (
              <CheckCircle className="h-4 w-4 text-[#22C55E]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {codeCopied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <p className="mb-3 text-sm text-slate-500 dark:text-[#A1A1AA]">
          Use your API key to send messages to your chatbot programmatically.
        </p>

        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] p-4 font-mono text-sm text-[#22C55E] overflow-x-auto">
          <pre>
            <code>{`curl -X POST ${apiBase}/api/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Hello", "chatbotId": "${chatbotId}"}'`}</code>
          </pre>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-[#A1A1AA]">
          <p>
            Replace{' '}
            <code className="rounded bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-500 dark:text-[#A1A1AA]">
              YOUR_API_KEY
            </code>{' '}
            with your actual API key. The chatbot ID for this bot is:
          </p>
          <div className="rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] px-3 py-2 font-mono text-xs text-slate-500 dark:text-[#A1A1AA] mt-2">
            {chatbotId}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0E0E10] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#EC4899] mb-2">
              <AlertTriangle className="h-5 w-5" />
              Delete API Key
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#A1A1AA] mb-6">
              Are you sure you want to delete the API key
              {deleteTarget.label ? (
                <>
                  {' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    &quot;{deleteTarget.label}&quot;
                  </span>
                </>
              ) : null}
              ? Any applications using this key will immediately lose access.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/[0.10] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteKey}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-[#EC4899] text-white hover:bg-[#EC4899]/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
