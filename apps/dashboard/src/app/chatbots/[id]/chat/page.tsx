'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Textarea } from '@corpusai/ui';
import { Send, Bot, User, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: number;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get access token
      const accessToken =
        typeof window !== 'undefined' && typeof localStorage?.getItem === 'function'
          ? localStorage.getItem('accessToken')
          : null;

      // Get username from stored user
      const userStr =
        typeof window !== 'undefined' && typeof localStorage?.getItem === 'function'
          ? localStorage.getItem('user')
          : null;
      const user = userStr ? JSON.parse(userStr) : null;

      // Call chat service
      const CHAT_SERVICE_URL =
        process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8002';

      const response = await fetch(`${CHAT_SERVICE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          chatbotId,
          query: input,
          username: user?.username,
          sessionId: `session-${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      const botMessage: Message = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);

      // Show error message to user
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/chatbots')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Chat Interface
              </h1>
              <p className="text-sm text-gray-500">Chatbot ID: {chatbotId}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/chatbots/${chatbotId}/settings`)}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FC5990] to-[#AC5DE6]">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] text-white'
                    : 'border border-gray-200 bg-white text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>

                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
                    <p className="text-xs font-medium text-gray-500">
                      Sources:
                    </p>
                    {message.citations.map((citation, i) => (
                      <a
                        key={i}
                        href={citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-[#BF56FF] hover:underline"
                      >
                        {citation}
                      </a>
                    ))}
                  </div>
                )}

                {message.role === 'assistant' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Thumbs up"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Thumbs down"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FC5990] to-[#AC5DE6]">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-4">
            <Textarea
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] resize-none"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="h-[60px] shrink-0 bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
