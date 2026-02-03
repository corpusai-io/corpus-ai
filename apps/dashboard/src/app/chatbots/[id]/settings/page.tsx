'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chatbotApi, customizeApi } from '@/lib/api';
import { Button, Input, Label, Textarea, Switch } from '@corpusai/ui';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic settings
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Customization
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [gptVersion, setGptVersion] = useState('gpt-3.5-turbo');
  const [showCitations, setShowCitations] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#BF56FF');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [chatbotData, customData] = await Promise.all([
        chatbotApi.get(chatbotId),
        customizeApi.get(chatbotId).catch(() => ({ customization: {} })),
      ]);

      setTitle(chatbotData.chatbot?.title || '');
      setDesc(chatbotData.chatbot?.desc || '');

      const custom = customData.customization || {};
      setWelcomeMessage(custom.welcomeMessage || '');
      setSystemPrompt(custom.systemPrompt || '');
      setGptVersion(custom.gptVersion || 'gpt-3.5-turbo');
      setShowCitations(custom.showCitations !== false);
      setPrimaryColor(custom.colors?.primary || '#BF56FF');
    } catch (err: any) {
      alert('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await Promise.all([
        chatbotApi.update(chatbotId, { title, desc }),
        customizeApi.update(chatbotId, {
          welcomeMessage,
          systemPrompt,
          gptVersion,
          showCitations,
          colors: { primary: primaryColor },
        }),
      ]);

      alert('Settings saved successfully!');
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this chatbot? This action cannot be undone.'
      )
    )
      return;

    try {
      await chatbotApi.delete(chatbotId);
      router.push('/chatbots');
    } catch (err: any) {
      alert('Failed to delete chatbot: ' + err.message);
    }
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
            onClick={() => router.push('/chatbots')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chatbots
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure your chatbot's behavior and appearance
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Chatbot Name</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Customization
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Hello! How can I help you today?"
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  className="mt-2"
                  rows={4}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Customize how the AI behaves and responds
                </p>
              </div>

              <div>
                <Label htmlFor="gptVersion">GPT Version</Label>
                <select
                  id="gptVersion"
                  value={gptVersion}
                  onChange={(e) => setGptVersion(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 focus:border-[#BF56FF] focus:outline-none focus:ring-2 focus:ring-[#BF56FF]"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                </select>
              </div>

              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                    placeholder="#BF56FF"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showCitations">Show Citations</Label>
                  <p className="text-sm text-gray-500">
                    Display source links in responses
                  </p>
                </div>
                <Switch
                  id="showCitations"
                  checked={showCitations}
                  onCheckedChange={setShowCitations}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Chatbot
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
