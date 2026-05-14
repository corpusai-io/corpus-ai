'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Bot, X, ArrowUp } from 'lucide-react';
import LeadCaptureForm from './LeadCaptureForm';

interface Citation {
  source: string;
  text?: string;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
  citations?: Citation[];
}

interface LeadField {
  key: string;
  name: string;
  description?: string;
  required?: boolean;
}

interface TriggerConfig {
  triggerType: 'gated' | 'after_messages' | 'high_intent' | 'cant_answer' | 'exit_intent';
  messageThreshold?: number;
  formStyle: 'popup' | 'inline';
  enabled: boolean;
}

interface WidgetChatProps {
  chatbotId: string;
  chatbotName: string;
  primaryColor: string;
  welcomeMessage: string;
  suggestedQuestions?: string[];
  showLeadForm: boolean;
  leadFields?: LeadField[];
  leadFormTitle?: string;
  triggerConfig?: TriggerConfig | null;
  onClose?: () => void;
}

/** Notify parent window (widget.js) to close the iframe */
function notifyParentClose() {
  try {
    window.parent.postMessage({ type: 'corpusai:close' }, '*');
  } catch (_) {
    // ignore if no parent
  }
}

// Trigger detection patterns
const HIGH_INTENT_PATTERNS = /\b(pricing|price|cost|buy|purchase|demo|trial|quote|subscribe|sign\s*up|order|upgrade)\b/i;
const CANT_ANSWER_PATTERNS = /\b(don't have (that |this )?information|unable to answer|cannot (find|answer|help)|no information|outside (my |of )?(scope|knowledge)|I'm not sure about that)\b/i;

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex gap-2">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}

export default function WidgetChat({
  chatbotId,
  chatbotName,
  primaryColor,
  welcomeMessage,
  suggestedQuestions,
  showLeadForm,
  leadFields: leadFieldsProp,
  leadFormTitle,
  triggerConfig,
  onClose,
}: WidgetChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [activeTriggerType, setActiveTriggerType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userMessageCount = useRef(0);

  const effectiveTrigger = triggerConfig?.enabled ? triggerConfig : null;
  const isGated = effectiveTrigger?.triggerType === 'gated';
  const formStyle = effectiveTrigger?.formStyle || 'popup';

  // Default lead fields if none provided
  const defaultFields: LeadField[] = [
    { key: 'name', name: 'Name', description: 'Your name', required: false },
    { key: 'email', name: 'Email', description: 'Your email', required: true },
  ];
  const activeLeadFields = leadFieldsProp && leadFieldsProp.length > 0 ? leadFieldsProp : defaultFields;

  // Persistent session ID
  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const key = `widget_session_${chatbotId}`;
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  }, [chatbotId]);

  // Get source page
  const sourcePage = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return document.referrer || window.location.href;
  }, []);

  // Check if lead was already submitted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const submitted = localStorage.getItem(`widget_lead_${chatbotId}`);
      if (submitted) setLeadCaptured(true);
    }
  }, [chatbotId]);

  // Initialize gated state
  const showGatedForm = isGated && !leadCaptured && showLeadForm;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showInlineForm]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 100)}px`;
  }, [input]);

  // Exit intent trigger
  useEffect(() => {
    if (!effectiveTrigger || effectiveTrigger.triggerType !== 'exit_intent' || leadCaptured) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        triggerLeadForm('exit_intent');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerLeadForm('exit_intent');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [effectiveTrigger, leadCaptured]);

  const triggerLeadForm = useCallback((triggerType: string) => {
    if (leadCaptured) return;
    setActiveTriggerType(triggerType);
    if (formStyle === 'inline') {
      setShowInlineForm(true);
    }
  }, [leadCaptured, formStyle]);

  // Check triggers after each message exchange
  const checkTriggers = useCallback((allMessages: Message[], latestBotResponse?: string) => {
    if (!effectiveTrigger || leadCaptured || activeTriggerType) return;

    const trigger = effectiveTrigger;

    switch (trigger.triggerType) {
      case 'after_messages': {
        const threshold = trigger.messageThreshold || 3;
        if (userMessageCount.current >= threshold) {
          triggerLeadForm('after_messages');
        }
        break;
      }
      case 'high_intent': {
        const recentUserMsgs = allMessages
          .filter((m) => m.role === 'user')
          .slice(-5)
          .map((m) => m.content)
          .join(' ');
        if (HIGH_INTENT_PATTERNS.test(recentUserMsgs)) {
          triggerLeadForm('high_intent');
        }
        break;
      }
      case 'cant_answer': {
        if (latestBotResponse && CANT_ANSWER_PATTERNS.test(latestBotResponse)) {
          triggerLeadForm('cant_answer');
        }
        break;
      }
      // exit_intent handled via event listeners above
      // gated handled via showGatedForm
    }
  }, [effectiveTrigger, leadCaptured, activeTriggerType, triggerLeadForm]);

  const handleLeadSubmit = async (data: Record<string, string>) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      await fetch(`${API_URL}/api/leads/${chatbotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sessionId,
          triggerType: activeTriggerType || (isGated ? 'gated' : undefined),
          sourcePage,
        }),
      });
    } catch {
      // Lead capture failure should not block chat
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`widget_lead_${chatbotId}`, 'true');
    }
    setLeadCaptured(true);
    setShowInlineForm(false);
    setActiveTriggerType(null);
  };

  const handleLeadSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`widget_lead_${chatbotId}`, 'skipped');
    }
    setLeadCaptured(true);
    setShowInlineForm(false);
    setActiveTriggerType(null);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    userMessageCount.current++;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId,
          query: text.trim(),
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      const citations: Citation[] = Array.isArray(data.citations)
        ? data.citations.map((c: string | Citation) =>
            typeof c === 'string' ? { source: c } : c
          )
        : [];

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: data.answer,
        timestamp: Date.now(),
        citations: citations.length > 0 ? citations : undefined,
      };

      const updatedMessages = [...newMessages, botMsg];
      setMessages(updatedMessages);

      // Check triggers after bot response
      checkTriggers(updatedMessages, data.answer);
    } catch (error: any) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Show gated lead form before chat (popup style always)
  if (showGatedForm) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{chatbotName}</span>
          </div>
          <button onClick={() => { onClose ? onClose() : notifyParentClose(); }} className="text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <LeadCaptureForm
          primaryColor={primaryColor}
          chatbotName={chatbotName}
          title={leadFormTitle}
          fields={activeLeadFields}
          formStyle="popup"
          onSubmit={handleLeadSubmit}
          onSkip={handleLeadSkip}
        />
      </div>
    );
  }

  // Non-gated popup trigger (shows overlay on top of chat)
  const showPopupOverlay = !leadCaptured && activeTriggerType && formStyle === 'popup';

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Popup overlay for non-gated triggers */}
      {showPopupOverlay && (
        <div className="absolute inset-0 z-10 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <LeadCaptureForm
              primaryColor={primaryColor}
              chatbotName={chatbotName}
              title={leadFormTitle}
              fields={activeLeadFields}
              formStyle="popup"
              onSubmit={handleLeadSubmit}
              onSkip={handleLeadSkip}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{chatbotName}</p>
            <p className="text-xs text-white/60">Online</p>
          </div>
        </div>
        <button onClick={() => { onClose ? onClose() : notifyParentClose(); }} className="text-white/70 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {/* Welcome screen */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Bot className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{chatbotName}</p>
            <p className="text-xs text-gray-500 mb-4 text-center px-4">
              {welcomeMessage}
            </p>
            {suggestedQuestions && suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 px-2">
                {suggestedQuestions.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'bot' && (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}

            <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-sm text-white'
                    : 'rounded-bl-sm bg-white text-gray-900 shadow-sm'
                }`}
                style={
                  msg.role === 'user' ? { backgroundColor: primaryColor } : undefined
                }
              >
                {msg.content}
              </div>

              {msg.role === 'bot' && msg.citations && msg.citations.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {msg.citations.map((cit, i) => (
                    <span
                      key={i}
                      className="inline-flex rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-500"
                    >
                      {cit.source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Inline lead form (shown between messages) */}
        {showInlineForm && !leadCaptured && (
          <LeadCaptureForm
            primaryColor={primaryColor}
            chatbotName={chatbotName}
            title={leadFormTitle}
            fields={activeLeadFields}
            formStyle="inline"
            onSubmit={handleLeadSubmit}
            onSkip={handleLeadSkip}
          />
        )}

        {loading && <TypingIndicator color={primaryColor} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={loading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-300">
          Powered by Corpus AI
        </p>
      </div>
    </div>
  );
}
