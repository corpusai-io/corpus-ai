'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatbotApi } from '@/lib/api';
import { Button, Input, Label, Textarea } from '@corpusai/ui';
import { Globe, Upload, Cloud, ArrowLeft } from 'lucide-react';

type TabType = 'website' | 'files' | 'drive';

export default function CreateChatbotPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('website');
  const [loading, setLoading] = useState(false);

  // Website form
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [crawlMode, setCrawlMode] = useState<'single' | 'entire'>('single');
  const [title, setTitle] = useState('');

  // Files form
  const [files, setFiles] = useState<File[]>([]);

  const handleCreateFromWebsite = async () => {
    if (!websiteUrl || !title) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const data = await chatbotApi.create({
        title,
        origin: websiteUrl,
        language: 'en',
      });

      router.push(`/chatbots/${data.chatbot.chatbotId}`);
    } catch (err: any) {
      alert('Failed to create chatbot: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromFiles = async () => {
    if (files.length === 0 || !title) {
      alert('Please upload files and provide a title');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement file upload
      alert('File upload not yet implemented');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const tabs = [
    { id: 'website' as TabType, label: 'Website', icon: Globe },
    { id: 'files' as TabType, label: 'Files', icon: Upload },
    { id: 'drive' as TabType, label: 'Google Drive', icon: Cloud },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Chatbot
          </h1>
          <p className="mt-2 text-gray-600">
            Choose a data source to train your chatbot
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#BF56FF] text-[#BF56FF]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {activeTab === 'website' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Chatbot Name *</Label>
                <Input
                  id="title"
                  placeholder="My Support Bot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="mt-2"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the URL of your website to crawl
                </p>
              </div>

              <div>
                <Label>Crawl Mode</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="crawlMode"
                      checked={crawlMode === 'single'}
                      onChange={() => setCrawlMode('single')}
                      className="h-4 w-4 border-gray-300 text-[#BF56FF] focus:ring-[#BF56FF]"
                    />
                    <span className="text-sm text-gray-700">
                      Single Page - Crawl only the specified URL
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="crawlMode"
                      checked={crawlMode === 'entire'}
                      onChange={() => setCrawlMode('entire')}
                      className="h-4 w-4 border-gray-300 text-[#BF56FF] focus:ring-[#BF56FF]"
                    />
                    <span className="text-sm text-gray-700">
                      Entire Website - Crawl all linked pages
                    </span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleCreateFromWebsite}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
              >
                {loading ? 'Creating...' : 'Create from Website'}
              </Button>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="fileTitle">Chatbot Name *</Label>
                <Input
                  id="fileTitle"
                  placeholder="My Support Bot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="files">Upload Files *</Label>
                <div className="mt-2">
                  <label
                    htmlFor="files"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-[#BF56FF] hover:bg-purple-50"
                  >
                    <Upload className="mb-3 h-10 w-10 text-gray-400" />
                    <p className="mb-1 text-sm font-medium text-gray-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, TXT, DOCX (Max 10MB per file)
                    </p>
                    <input
                      id="files"
                      type="file"
                      multiple
                      accept=".pdf,.txt,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected files:
                    </p>
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <span className="text-sm text-gray-900">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleCreateFromFiles}
                disabled={loading || files.length === 0}
                className="w-full bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
              >
                {loading ? 'Creating...' : 'Create from Files'}
              </Button>
            </div>
          )}

          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Coming Soon:</strong> Google Drive integration will
                  allow you to sync files directly from your Drive folders.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-12">
                <Cloud className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Google Drive integration is not yet available
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('website')}
                >
                  Try Website Instead
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
