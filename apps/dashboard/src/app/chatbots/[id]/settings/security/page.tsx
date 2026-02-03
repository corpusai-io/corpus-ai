'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { accessControlApi, chatbotApi } from '@/lib/api';
import { Button, Input, Label } from '@corpusai/ui';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Key,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';

interface AccessUser {
  email: string;
  grantedAt: number;
  language?: string;
}

type AccessMode = 'public' | 'private' | 'whitelist';

export default function SecurityPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [accessMode, setAccessMode] = useState<AccessMode>('public');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [whitelist, setWhitelist] = useState<AccessUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chatbotData, accessData] = await Promise.all([
        chatbotApi.get(chatbotId),
        accessControlApi.list(chatbotId),
      ]);

      // Set access mode from chatbot data (if available)
      setAccessMode(chatbotData.chatbot?.accessMode || 'public');

      // Set whitelist
      setWhitelist(accessData.users || []);

      // Generate API key (masked)
      setApiKey('••••••••••••••••••••••••');

      // Generate embed code
      generateEmbedCode();
    } catch (err: any) {
      console.error('Failed to load security settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateEmbedCode = () => {
    const code = `<!-- Corpus AI Chatbot Widget -->
<script>
  window.corpusAI = {
    chatbotId: '${chatbotId}',
    apiKey: 'YOUR_API_KEY',
  };
</script>
<script src="https://cdn.corpus-ai.com/widget.js"></script>`;

    setEmbedCode(code);
  };

  const handleUpdateAccessMode = async (mode: AccessMode) => {
    try {
      await accessControlApi.updateMode(chatbotId, mode);
      setAccessMode(mode);
      alert('Access mode updated successfully!');
    } catch (err: any) {
      alert('Failed to update access mode: ' + err.message);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await accessControlApi.grant(chatbotId, newEmail);
      setWhitelist([...whitelist, { email: newEmail, grantedAt: Date.now() }]);
      setNewEmail('');
    } catch (err: any) {
      alert('Failed to add email: ' + err.message);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?`)) return;

    try {
      await accessControlApi.revoke(chatbotId, email);
      setWhitelist(whitelist.filter((u) => u.email !== email));
    } catch (err: any) {
      alert('Failed to remove email: ' + err.message);
    }
  };

  const handleRegenerateApiKey = async () => {
    if (
      !confirm(
        'Regenerating the API key will invalidate the old key. Continue?'
      )
    )
      return;

    try {
      const { apiKey: newKey } = await accessControlApi.generateApiKey(
        chatbotId
      );
      setApiKey(newKey);
      setShowApiKey(true);
      alert('API key regenerated successfully! Make sure to save it.');
    } catch (err: any) {
      alert('Failed to regenerate API key: ' + err.message);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BF56FF] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/chatbots/${chatbotId}/settings`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Security & Access Control
          </h1>
          <p className="mt-2 text-gray-600">
            Manage who can access your chatbot
          </p>
        </div>

        <div className="space-y-6">
          {/* Access Mode */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#BF56FF]" />
              <h2 className="text-xl font-semibold text-gray-900">
                Access Mode
              </h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="accessMode"
                  checked={accessMode === 'public'}
                  onChange={() => handleUpdateAccessMode('public')}
                  className="mt-1 h-4 w-4 border-gray-300 text-[#BF56FF] focus:ring-[#BF56FF]"
                />
                <div>
                  <p className="font-medium text-gray-900">Public</p>
                  <p className="text-sm text-gray-600">
                    Anyone can access your chatbot
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="accessMode"
                  checked={accessMode === 'private'}
                  onChange={() => handleUpdateAccessMode('private')}
                  className="mt-1 h-4 w-4 border-gray-300 text-[#BF56FF] focus:ring-[#BF56FF]"
                />
                <div>
                  <p className="font-medium text-gray-900">Private</p>
                  <p className="text-sm text-gray-600">
                    Only you can access your chatbot
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="accessMode"
                  checked={accessMode === 'whitelist'}
                  onChange={() => handleUpdateAccessMode('whitelist')}
                  className="mt-1 h-4 w-4 border-gray-300 text-[#BF56FF] focus:ring-[#BF56FF]"
                />
                <div>
                  <p className="font-medium text-gray-900">Whitelist Only</p>
                  <p className="text-sm text-gray-600">
                    Only whitelisted users can access
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* API Key */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-[#BF56FF]" />
              <h2 className="text-xl font-semibold text-gray-900">API Key</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Your API Key</Label>
                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="pr-10"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCopyToClipboard(apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRegenerateApiKey}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Keep your API key secure. Never share it publicly.
                </p>
              </div>
            </div>
          </div>

          {/* Whitelist */}
          {accessMode === 'whitelist' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#BF56FF]" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Email Whitelist
                </h2>
              </div>

              <div className="mb-4">
                <Label htmlFor="newEmail">Add Email</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEmail();
                    }}
                  />
                  <Button
                    onClick={handleAddEmail}
                    className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {whitelist.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <p className="text-gray-600">
                    No whitelisted users yet. Add emails above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {whitelist.map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {user.email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmail(user.email)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Embed Code */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Embed Code
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyToClipboard(embedCode)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
            </div>

            <div className="rounded-lg bg-gray-900 p-4">
              <pre className="overflow-x-auto text-sm text-gray-100">
                <code>{embedCode}</code>
              </pre>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Add this code to your website to embed the chatbot widget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
