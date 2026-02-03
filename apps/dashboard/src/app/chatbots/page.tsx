'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatbotApi } from '@/lib/api';
import { Button } from '@corpusai/ui';
import { Plus, Bot, Trash2, Settings, MessageSquare } from 'lucide-react';

interface Chatbot {
  chatbotId: string;
  title: string;
  desc?: string;
  status: 'ACTIVE' | 'BUILDING' | 'ERROR';
  origin: string;
  createdAt: number;
  updatedAt: number;
}

export default function ChatbotsPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChatbots();
  }, []);

  const loadChatbots = async () => {
    try {
      setLoading(true);
      const data = await chatbotApi.list();
      setChatbots(data.chatbots || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chatbotId: string) => {
    if (!confirm('Are you sure you want to delete this chatbot?')) return;

    try {
      await chatbotApi.delete(chatbotId);
      setChatbots(chatbots.filter((c) => c.chatbotId !== chatbotId));
    } catch (err: any) {
      alert('Failed to delete chatbot: ' + err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'BUILDING':
        return 'bg-yellow-500';
      case 'ERROR':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Chatbots</h1>
            <p className="mt-2 text-gray-600">
              Manage and monitor your AI chatbots
            </p>
          </div>
          <Button
            onClick={() => router.push('/chatbots/create')}
            className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Chatbot
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Chatbot Grid */}
        {chatbots.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-16">
            <Bot className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No chatbots yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first chatbot to get started
            </p>
            <Button
              onClick={() => router.push('/chatbots/create')}
              className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first chatbot
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {chatbots.map((chatbot) => (
              <div
                key={chatbot.chatbotId}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#BF56FF]"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${getStatusColor(
                      chatbot.status
                    )}`}
                  >
                    {chatbot.status}
                  </span>
                </div>

                {/* Chatbot Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {chatbot.title}
                  </h3>
                  {chatbot.desc && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {chatbot.desc}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Created {new Date(chatbot.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/chatbots/${chatbot.chatbotId}/chat`)}
                    className="flex-1"
                  >
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/chatbots/${chatbot.chatbotId}/settings`)
                    }
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(chatbot.chatbotId)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
