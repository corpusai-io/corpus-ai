'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { accessControlApi, chatbotApi } from '@/lib/api';
import {
  Copy, Check, Eye, EyeOff, Key, Globe, Lock, Mail, RefreshCw,
  Shield, Trash2, Users, Loader2, Code,
} from 'lucide-react';
import { Eyebrow, Button, Divider } from '@/components/corpus';

interface AccessUser { email: string; grantedAt: number; }
type AccessMode = 'public' | 'private' | 'whitelist';

const ACCESS_MODES: { value: AccessMode; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'public',    label: 'Public',    description: 'Anyone can chat with this bot.',     icon: <Globe  className="w-5 h-5 text-ink" /> },
  { value: 'private',   label: 'Private',   description: 'Only you can use this bot.',          icon: <Lock   className="w-5 h-5 text-ink" /> },
  { value: 'whitelist', label: 'Whitelist', description: 'Only approved emails can chat.',     icon: <Shield className="w-5 h-5 text-ink" /> },
];

export default function SecurityPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [accessMode,    setAccessMode]    = useState<AccessMode>('public');
  const [apiKey,        setApiKey]        = useState('');
  const [showApiKey,    setShowApiKey]    = useState(false);
  const [whitelist,     setWhitelist]     = useState<AccessUser[]>([]);
  const [newEmail,      setNewEmail]      = useState('');
  const [loading,       setLoading]       = useState(true);
  const [modeUpdating,  setModeUpdating]  = useState(false);
  const [copied,        setCopied]        = useState<string | null>(null);

  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [regenLoading,    setRegenLoading]    = useState(false);

  const [removeEmail,   setRemoveEmail]   = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chatbotData, accessData]: any[] = await Promise.all([
        chatbotApi.get(chatbotId),
        accessControlApi.list(chatbotId),
      ]);
      setAccessMode(((chatbotData as any).chatbot?.accessMode?.toLowerCase() as AccessMode) || 'public');
      setWhitelist((accessData as any).users || []);
      setApiKey((accessData as any).apiKey || '');
    } catch (err: any) {
      console.error('Failed to load security settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccessMode = async (mode: AccessMode) => {
    setModeUpdating(true);
    try { await accessControlApi.updateMode(chatbotId, mode); setAccessMode(mode); }
    catch (err: any) { alert('Failed to update access mode: ' + err.message); }
    finally { setModeUpdating(false); }
  };

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) return;
    try {
      await accessControlApi.grant(chatbotId, newEmail);
      setWhitelist([...whitelist, { email: newEmail, grantedAt: Date.now() }]);
      setNewEmail('');
    } catch (err: any) { alert('Failed to add email: ' + err.message); }
  };

  const handleRemoveEmail = async () => {
    if (!removeEmail) return;
    setRemoveLoading(true);
    try {
      await accessControlApi.revoke(chatbotId, removeEmail);
      setWhitelist(whitelist.filter((u) => u.email !== removeEmail));
      setRemoveEmail(null);
    } catch (err: any) { alert('Failed to remove email: ' + err.message); }
    finally { setRemoveLoading(false); }
  };

  const handleRegenerateApiKey = async () => {
    setRegenLoading(true);
    try {
      const data: any = await accessControlApi.generateApiKey(chatbotId);
      setApiKey(data.apiKey);
      setShowApiKey(true);
      setShowRegenDialog(false);
    } catch (err: any) { alert('Failed to regenerate API key: ' + err.message); }
    finally { setRegenLoading(false); }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const embedCode = `<script src="https://widget.corpusai.com/embed.js" data-chatbot-id="${chatbotId}"${apiKey ? ` data-api-key="${apiKey}"` : ''}></script>`;

  if (loading) {
    return (
      <div className="v4-animate-in mx-auto max-w-4xl space-y-6">
        <div className="v4-shimmer rounded h-2.5 w-40" />
        <div className="v4-shimmer rounded h-7 w-64" />
        <div className="v4-card p-6 space-y-3">
          {[0,1,2].map(i => <div key={i} className="v4-shimmer rounded h-16" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="v4-animate-in mx-auto max-w-4xl space-y-8">

      {/* Header */}
      <div>
        <Eyebrow>Settings · security</Eyebrow>
        <h1
          className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-ink">Access control.</span>{' '}
          <span className="text-muted">Who can chat, who can&apos;t.</span>
        </h1>
      </div>

      {/* Access mode */}
      <div className="v4-card p-6">
        <Eyebrow>Access mode</Eyebrow>
        <p className="text-[13px] text-muted mt-1 mb-4">Choose who can reach your chatbot.</p>

        <div className="space-y-2">
          {ACCESS_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                accessMode === mode.value ? 'border-ink bg-surface' : 'border-line hover:bg-surface'
              }`}
            >
              <input
                type="radio"
                name="accessMode"
                checked={accessMode === mode.value}
                onChange={() => handleUpdateAccessMode(mode.value)}
                disabled={modeUpdating}
                className="accent-[#171717] mt-0.5"
              />
              <div className="flex items-start gap-3">
                {mode.icon}
                <div>
                  <p className="font-display text-[14px] font-medium text-ink" style={{ letterSpacing: '-0.012em' }}>{mode.label}</p>
                  <p className="text-[13px] text-muted">{mode.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Whitelist */}
      {accessMode === 'whitelist' && (
        <div className="v4-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-ink" />
            <Eyebrow>Authorized emails</Eyebrow>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddEmail(); }}
              className="flex-1 px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
            />
            <Button variant="primary" icon={Mail} onClick={handleAddEmail} disabled={!newEmail.includes('@')}>
              Add
            </Button>
          </div>

          {whitelist.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-8 text-center">
              <p className="text-[13px] text-muted">No whitelisted users yet. Add emails above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {whitelist.map((user) => (
                <div key={user.email} className="flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-2.5">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Mail className="w-4 h-4 text-muted-soft" />
                    <span className="text-ink">{user.email}</span>
                    <span className="font-mono text-[11px] text-muted-soft">
                      added {new Date(user.grantedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setRemoveEmail(user.email)}
                    className="text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] h-7 w-7 rounded-md inline-flex items-center justify-center transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* API Key */}
      <div className="v4-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-ink" />
          <Eyebrow>API access</Eyebrow>
        </div>

        <p className="mb-4 text-[13px] text-muted">Use an API key to access this chatbot programmatically.</p>

        {apiKey ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink font-mono focus:outline-none focus:border-ink transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft hover:text-ink transition-colors"
                  title={showApiKey ? 'Hide' : 'Show'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(apiKey, 'apiKey')}
                  className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-[13px] font-medium border border-line text-muted hover:text-ink hover:bg-surface transition-colors"
                  title="Copy"
                >
                  {copied === 'apiKey' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                </button>
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => setShowRegenDialog(true)}>
                  Regenerate
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-soft">Keep your API key secure. Never share it publicly.</p>
          </div>
        ) : (
          <Button variant="primary" icon={Key} onClick={() => setShowRegenDialog(true)}>
            Generate API key
          </Button>
        )}
      </div>

      {/* Embed code */}
      <div className="v4-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-ink" />
            <Eyebrow>Embed snippet</Eyebrow>
          </div>
          <Button variant="secondary" size="sm" onClick={() => copyToClipboard(embedCode, 'embed')}>
            {copied === 'embed' ? <><Check className="w-4 h-4 text-[#10B981]" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}
          </Button>
        </div>

        <div className="rounded-xl bg-surface border border-line p-4 font-mono text-[13px] text-ink overflow-x-auto">
          <code>{embedCode}</code>
        </div>

        <p className="mt-3 text-[13px] text-muted">Add this snippet to your website to embed the chatbot widget.</p>
      </div>

      {/* Regenerate dialog */}
      {showRegenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
            onClick={() => !regenLoading && setShowRegenDialog(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-line shadow-lg p-6">
            <Eyebrow>Confirm</Eyebrow>
            <h3
              className="font-display text-[20px] font-medium text-ink mt-2"
              style={{ letterSpacing: '-0.012em' }}
            >
              {apiKey ? 'Regenerate API key?' : 'Generate API key?'}
            </h3>
            <p className="text-[13px] text-muted mt-2 mb-6">
              {apiKey
                ? 'The current key will stop working immediately. Any integrations using it lose access.'
                : 'The key will only be shown once — save it somewhere safe.'}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowRegenDialog(false)} disabled={regenLoading}>Cancel</Button>
              <button
                onClick={handleRegenerateApiKey}
                disabled={regenLoading}
                className="px-4 py-2 rounded-lg text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40 inline-flex items-center gap-2"
              >
                {regenLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Generating…</>) : (apiKey ? 'Regenerate' : 'Generate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove email dialog */}
      {removeEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
            onClick={() => !removeLoading && setRemoveEmail(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-line shadow-lg p-6">
            <Eyebrow>Confirm</Eyebrow>
            <h3
              className="font-display text-[20px] font-medium text-ink mt-2"
              style={{ letterSpacing: '-0.012em' }}
            >
              Remove from whitelist?
            </h3>
            <p className="text-[13px] text-muted mt-2 mb-6">
              Remove <span className="font-medium text-ink">{removeEmail}</span>? They will no longer be able to access this chatbot.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRemoveEmail(null)} disabled={removeLoading}>Cancel</Button>
              <button
                onClick={handleRemoveEmail}
                disabled={removeLoading}
                className="px-4 py-2 rounded-lg text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40 inline-flex items-center gap-2"
              >
                {removeLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Removing…</>) : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
