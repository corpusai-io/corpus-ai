'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { accessControlApi, chatbotApi } from '@/lib/api';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  Globe,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  Loader2,
  Code,
  X,
} from 'lucide-react';

interface AccessUser {
  email: string;
  grantedAt: number;
}

type AccessMode = 'public' | 'private' | 'whitelist';

const ACCESS_MODES: {
  value: AccessMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can chat with this bot',
    icon: <Globe className="h-5 w-5 text-[#22C55E]" />,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can use this bot',
    icon: <Lock className="h-5 w-5 text-[#F59E0B]" />,
  },
  {
    value: 'whitelist',
    label: 'Whitelist',
    description: 'Only approved emails can chat',
    icon: <Shield className="h-5 w-5 text-[#BF56FF]" />,
  },
];

export default function SecurityPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [accessMode, setAccessMode] = useState<AccessMode>('public');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [whitelist, setWhitelist] = useState<AccessUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [modeUpdating, setModeUpdating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Regenerate dialog
  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  // Remove email dialog
  const [removeEmail, setRemoveEmail] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chatbotData, accessData]: any[] = await Promise.all([
        chatbotApi.get(chatbotId),
        accessControlApi.list(chatbotId),
      ]);

      setAccessMode(
        ((chatbotData as any).chatbot?.accessMode?.toLowerCase() as AccessMode) || 'public'
      );
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
    try {
      await accessControlApi.updateMode(chatbotId, mode);
      setAccessMode(mode);
    } catch (err: any) {
      alert('Failed to update access mode: ' + err.message);
    } finally {
      setModeUpdating(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) return;

    try {
      await accessControlApi.grant(chatbotId, newEmail);
      setWhitelist([...whitelist, { email: newEmail, grantedAt: Date.now() }]);
      setNewEmail('');
    } catch (err: any) {
      alert('Failed to add email: ' + err.message);
    }
  };

  const handleRemoveEmail = async () => {
    if (!removeEmail) return;
    setRemoveLoading(true);

    try {
      await accessControlApi.revoke(chatbotId, removeEmail);
      setWhitelist(whitelist.filter((u) => u.email !== removeEmail));
      setRemoveEmail(null);
    } catch (err: any) {
      alert('Failed to remove email: ' + err.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    setRegenLoading(true);
    try {
      const data: any = await accessControlApi.generateApiKey(chatbotId);
      setApiKey(data.apiKey);
      setShowApiKey(true);
      setShowRegenDialog(false);
    } catch (err: any) {
      alert('Failed to regenerate API key: ' + err.message);
    } finally {
      setRegenLoading(false);
    }
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
        <div className="v4-shimmer rounded-lg" style={{ height: '32px', width: '256px' }} />
        <div className="v4-shimmer rounded-lg" style={{ height: '16px', width: '192px' }} />
        <div className="v4-card">
          <div className="v4-shimmer rounded-lg mb-4" style={{ height: '24px', width: '128px' }} />
          <div className="space-y-3">
            <div className="v4-shimmer rounded-lg" style={{ height: '64px' }} />
            <div className="v4-shimmer rounded-lg" style={{ height: '64px' }} />
            <div className="v4-shimmer rounded-lg" style={{ height: '64px' }} />
          </div>
        </div>
        <div className="v4-card">
          <div className="v4-shimmer rounded-lg mb-4" style={{ height: '24px', width: '96px' }} />
          <div className="v4-shimmer rounded-lg" style={{ height: '40px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="v4-animate-in mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Security &amp; Access Control</h1>
        <p className="mt-1 text-[#A1A1AA]">Manage who can access your chatbot</p>
      </div>

      <div className="space-y-6">
        {/* Access Mode */}
        <div className="v4-card">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#BF56FF]" />
            <h2 className="text-lg font-semibold text-white">Access Mode</h2>
          </div>

          <div className="space-y-2">
            {ACCESS_MODES.map((mode) => (
              <label
                key={mode.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  accessMode === mode.value
                    ? 'border-[#BF56FF]/40 bg-[#BF56FF]/[0.06]'
                    : 'border-white/[0.06] hover:bg-white/[0.02]'
                }`}
              >
                <input
                  type="radio"
                  name="accessMode"
                  checked={accessMode === mode.value}
                  onChange={() => handleUpdateAccessMode(mode.value)}
                  disabled={modeUpdating}
                  className="accent-[#BF56FF] mt-0.5"
                />
                <div className="flex items-start gap-3">
                  {mode.icon}
                  <div>
                    <p className="font-medium text-white">{mode.label}</p>
                    <p className="text-sm text-[#A1A1AA]">{mode.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Whitelist */}
        {accessMode === 'whitelist' && (
          <div className="v4-card">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#BF56FF]" />
              <h2 className="text-lg font-semibold text-white">Authorized Emails</h2>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddEmail();
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] text-sm transition-colors"
                />
                <button
                  onClick={handleAddEmail}
                  disabled={!newEmail.includes('@')}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-white text-[#08080A] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Mail className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            {whitelist.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.10] p-8 text-center">
                <p className="text-sm text-[#A1A1AA]">
                  No whitelisted users yet. Add emails above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {whitelist.map((user) => (
                  <div
                    key={user.email}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-[#71717A]" />
                      <span className="text-white">{user.email}</span>
                      <span className="text-xs text-[#52525B]">
                        Added {new Date(user.grantedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => setRemoveEmail(user.email)}
                      className="text-[#52525B] hover:text-[#EC4899] hover:bg-[#EC4899]/10 h-7 w-7 rounded-md inline-flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Key */}
        <div className="v4-card">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-[#BF56FF]" />
            <h2 className="text-lg font-semibold text-white">API Access</h2>
          </div>

          <p className="mb-4 text-sm text-[#A1A1AA]">
            Use an API key to access this chatbot programmatically.
          </p>

          {apiKey ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] text-sm transition-colors flex-1 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(apiKey, 'apiKey')}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors"
                  >
                    {copied === 'apiKey' ? (
                      <Check className="h-4 w-4 text-[#22C55E]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowRegenDialog(true)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#52525B]">
                Keep your API key secure. Never share it publicly.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowRegenDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-white text-[#08080A] hover:bg-white/90 transition-colors"
            >
              <Key className="h-4 w-4" />
              Generate API Key
            </button>
          )}
        </div>

        {/* Embed Code */}
        <div className="v4-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-[#BF56FF]" />
              <h2 className="text-lg font-semibold text-white">Embed on Your Website</h2>
            </div>
            <button
              onClick={() => copyToClipboard(embedCode, 'embed')}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors"
            >
              {copied === 'embed' ? (
                <>
                  <Check className="h-4 w-4 text-[#22C55E]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 font-mono text-sm text-[#A1A1AA] overflow-x-auto">
            <code>{embedCode}</code>
          </div>

          <p className="mt-3 text-sm text-[#A1A1AA]">
            Add this snippet to your website to embed the chatbot widget.
          </p>
        </div>
      </div>

      {/* Regenerate API Key Dialog */}
      {showRegenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !regenLoading && setShowRegenDialog(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0E0E10] border border-white/[0.08] shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              {apiKey ? 'Regenerate' : 'Generate'} API Key
            </h3>
            <p className="text-sm text-[#A1A1AA] mb-6">
              {apiKey
                ? 'This will invalidate your current API key. Any integrations using the old key will stop working.'
                : 'Generate an API key to access your chatbot programmatically. The key will only be shown once.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRegenDialog(false)}
                disabled={regenLoading}
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateApiKey}
                disabled={regenLoading}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  apiKey
                    ? 'bg-[#F59E0B] text-[#08080A] hover:bg-[#F59E0B]/90'
                    : 'bg-white text-[#08080A] hover:bg-white/90'
                }`}
              >
                {regenLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : apiKey ? (
                  'Regenerate'
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Email Dialog */}
      {removeEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !removeLoading && setRemoveEmail(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0E0E10] border border-white/[0.08] shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Remove from whitelist</h3>
            <p className="text-sm text-[#A1A1AA] mb-6">
              Remove <span className="font-bold text-white">{removeEmail}</span> from the
              whitelist? They will no longer be able to access this chatbot.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRemoveEmail(null)}
                disabled={removeLoading}
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveEmail}
                disabled={removeLoading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-[#EC4899] text-white hover:bg-[#EC4899]/90 transition-colors disabled:opacity-50"
              >
                {removeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
