'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { customizeApi, chatbotApi } from '@/lib/api';
import {
  Upload,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bot,
  Send,
  MessageSquare,
  Info,
  Settings,
  Keyboard,
  Palette,
  Mail,
  CheckCircle,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'common' | 'textual' | 'theme';

interface ThemeColors {
  chatBg: string;
  chatBorder: string;
  sendBtnBg: string;
  sendBtnText: string;
  botMsgBg: string;
  botMsgText: string;
  actionBtnBg: string;
  actionBtnText: string;
  inputBg: string;
  inputText: string;
  inputPlaceholder: string;
}

interface CustomizationState {
  // Common
  chatbotIcon: string;
  llm: string;
  showCitations: boolean;
  dashboardCitations: boolean;
  supportEmails: string[];
  // Textual
  initialMessages: string[];
  suggestedQuestions: string[];
  keepShowingSuggestions: boolean;
  messageBubbles: string[];
  messagePlaceholder: string;
  systemPrompt: string;
  promptType: string;
  // Theme
  themePreset: string;
  colors: ThemeColors;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_COLORS: ThemeColors = {
  chatBg: '#FFFFFF',
  chatBorder: '#E2E8F0',
  sendBtnBg: '#2563EB',
  sendBtnText: '#F8FAFC',
  botMsgBg: '#F1F5F9',
  botMsgText: '#020817',
  actionBtnBg: '#FFFFFF',
  actionBtnText: '#020817',
  inputBg: '#F1F5F9',
  inputText: '#020817',
  inputPlaceholder: '#64748B',
};

const THEME_PRESETS: Record<string, { label: string; desc: string; colors: ThemeColors; dots: string[] }> = {
  light: {
    label: 'Light Theme',
    desc: 'Clean and bright',
    dots: ['#2563EB', '#E5E7EB'],
    colors: { ...DEFAULT_COLORS },
  },
  dark: {
    label: 'Dark Theme',
    desc: 'Easy on the eyes',
    dots: ['#3B82F6', '#1E293B'],
    colors: {
      chatBg: '#0F172A',
      chatBorder: '#1E293B',
      sendBtnBg: '#3B82F6',
      sendBtnText: '#F8FAFC',
      botMsgBg: '#1E293B',
      botMsgText: '#E2E8F0',
      actionBtnBg: '#1E293B',
      actionBtnText: '#E2E8F0',
      inputBg: '#1E293B',
      inputText: '#E2E8F0',
      inputPlaceholder: '#64748B',
    },
  },
  ivory: {
    label: 'Classic Ivory',
    desc: 'Warm ivory with deep blue ink',
    dots: ['#1E40AF', '#FDF6E3'],
    colors: {
      chatBg: '#FDF6E3',
      chatBorder: '#D4C5A9',
      sendBtnBg: '#1E40AF',
      sendBtnText: '#FDF6E3',
      botMsgBg: '#F5ECD7',
      botMsgText: '#1A1A2E',
      actionBtnBg: '#FDF6E3',
      actionBtnText: '#1A1A2E',
      inputBg: '#F5ECD7',
      inputText: '#1A1A2E',
      inputPlaceholder: '#8B7E66',
    },
  },
  dracula: {
    label: 'Dracula Dark',
    desc: "Neon accents on moody backdrop",
    dots: ['#BD93F9', '#282A36'],
    colors: {
      chatBg: '#282A36',
      chatBorder: '#44475A',
      sendBtnBg: '#BD93F9',
      sendBtnText: '#282A36',
      botMsgBg: '#44475A',
      botMsgText: '#F8F8F2',
      actionBtnBg: '#44475A',
      actionBtnText: '#F8F8F2',
      inputBg: '#44475A',
      inputText: '#F8F8F2',
      inputPlaceholder: '#6272A4',
    },
  },
};

const LLM_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4 Turbo', icon: '✨' },
  { value: 'gpt-4o', label: 'GPT-4o', icon: '✨' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', icon: '⚡' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', icon: '✨' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', icon: '⚡' },
];

const DEFAULT_PROMPT = `### Role
You are a helpful AI assistant that answers questions based on the provided context.

### Constraints
- Only answer based on the context provided
- If you don't know the answer, say so honestly
- Keep responses concise and helpful
- Be polite and professional`;

// ── Custom Toggle ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#BF56FF]' : 'bg-white/[0.10]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Reusable Components ────────────────────────────────────────────────────────

function ListInput({
  label,
  items,
  max,
  placeholder,
  onChange,
  tooltip,
}: {
  label: string;
  items: string[];
  max: number;
  placeholder: string;
  onChange: (items: string[]) => void;
  tooltip?: string;
}) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const val = draft.trim();
    if (val && items.length < max) {
      onChange([...items, val]);
      setDraft('');
    }
  };

  return (
    <div className="v4-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="text-xs text-[#52525B]">
          ({items.length}/{max})
        </span>
        {tooltip && (
          <span title={tooltip} className="cursor-help">
            <Info className="h-3.5 w-3.5 text-[#52525B]" />
          </span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] transition-colors text-sm"
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#EC4899] hover:bg-[#EC4899]/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length < max && (
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] transition-colors text-sm"
            />
            <button
              onClick={addItem}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  highlighted,
  tooltip,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  highlighted?: boolean;
  tooltip?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl p-4 border ${
        highlighted
          ? 'border-[#BF56FF]/20 bg-[#BF56FF]/[0.03]'
          : 'bg-white/[0.03] border-white/[0.06]'
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{title}</span>
          {tooltip && (
            <span title={tooltip} className="cursor-help">
              <Info className="h-3.5 w-3.5 text-[#52525B]" />
            </span>
          )}
        </div>
        <p className="text-sm text-[#A1A1AA] mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#A1A1AA]">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className="h-5 w-5 rounded border border-white/[0.08]"
          style={{ backgroundColor: value }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-white/[0.16] transition-colors"
        />
        <label className="cursor-pointer relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <Settings className="h-3.5 w-3.5 text-[#52525B] hover:text-[#A1A1AA] transition-colors" />
        </label>
      </div>
    </div>
  );
}

function ColorSection({
  title,
  icon,
  children,
  defaultOpen,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="v4-card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-3 flex items-center gap-3 w-full hover:bg-white/[0.02] transition-colors"
      >
        <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
          {icon}
        </div>
        <span className="flex-1 text-sm font-semibold text-white text-left">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#52525B]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#52525B]" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 divide-y divide-white/[0.06]">{children}</div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CustomizationPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('common');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chatbotName, setChatbotName] = useState('New Chatbot');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [state, setState] = useState<CustomizationState>({
    chatbotIcon: '',
    llm: 'gpt-4o-mini',
    showCitations: true,
    dashboardCitations: true,
    supportEmails: [],
    initialMessages: ['Hello! How can I help you today?'],
    suggestedQuestions: [],
    keepShowingSuggestions: false,
    messageBubbles: [],
    messagePlaceholder: 'Type your question here...',
    systemPrompt: DEFAULT_PROMPT,
    promptType: 'custom',
    themePreset: 'light',
    colors: { ...DEFAULT_COLORS },
  });

  const savedRef = useRef<string>('');

  // Track changes
  useEffect(() => {
    if (savedRef.current) {
      setHasChanges(JSON.stringify(state) !== savedRef.current);
    }
  }, [state]);

  const update = (patch: Partial<CustomizationState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  // Load data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [chatbotData, customData] = await Promise.all([
          chatbotApi.get(chatbotId),
          customizeApi.get(chatbotId).catch(() => ({ customization: {} })),
        ]);

        const chatbot = (chatbotData as any).chatbot || chatbotData;
        setChatbotName(chatbot.title || 'New Chatbot');

        const c = (customData as any).customization || {};
        const loaded: CustomizationState = {
          chatbotIcon: c.chatbotIcon || '',
          llm: c.llm || 'gpt-4o-mini',
          showCitations: c.showCitations !== false,
          dashboardCitations: c.dashboardCitations !== false,
          supportEmails: c.supportEmails || [],
          initialMessages: c.initialMessages?.length ? c.initialMessages : ['Hello! How can I help you today?'],
          suggestedQuestions: c.suggestedQuestions || [],
          keepShowingSuggestions: c.keepShowingSuggestions || false,
          messageBubbles: c.messageBubbles || [],
          messagePlaceholder: c.messagePlaceholder || 'Type your question here...',
          systemPrompt: c.systemPrompt || DEFAULT_PROMPT,
          promptType: c.promptType || 'custom',
          themePreset: c.themePreset || 'light',
          colors: { ...DEFAULT_COLORS, ...(c.colors || {}) },
        };
        setState(loaded);
        savedRef.current = JSON.stringify(loaded);
      } catch (err: any) {
        console.error('Failed to load customization:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [chatbotId]);

  // Save
  const handleSave = async () => {
    try {
      setSaving(true);
      await customizeApi.update(chatbotId, state);
      savedRef.current = JSON.stringify(state);
      setHasChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Discard
  const handleDiscard = () => {
    if (savedRef.current) {
      setState(JSON.parse(savedRef.current));
      setHasChanges(false);
    }
  };

  // Warn on browser close/reload with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  // Navigation guard - intercept link clicks when there are unsaved changes
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasChanges) return;
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if (href === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingNavUrl(href);
      setShowLeaveDialog(true);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasChanges]);

  const confirmLeave = () => {
    setShowLeaveDialog(false);
    setHasChanges(false);
    if (pendingNavUrl) {
      router.push(pendingNavUrl);
      setPendingNavUrl(null);
    }
  };

  // Icon upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('File must be under 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({ chatbotIcon: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="v4-animate-in space-y-4">
        <div className="v4-shimmer h-8 w-48 rounded-lg" />
        <div className="v4-shimmer h-5 w-72 rounded-lg" />
        <div className="v4-shimmer h-10 w-80 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="v4-shimmer h-32 rounded-2xl" />
            <div className="v4-shimmer h-28 rounded-2xl" />
            <div className="v4-shimmer h-16 rounded-xl" />
            <div className="v4-shimmer h-16 rounded-xl" />
            <div className="v4-shimmer h-40 rounded-2xl" />
          </div>
          <div className="hidden lg:block">
            <div className="v4-shimmer h-[480px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Preview widget ─────────────────────────────────────────────────────────

  const clr = state.colors;
  const welcomeMsg = state.initialMessages[0] || 'Hello! How can I help you today?';

  const PreviewWidget = (
    <div className="sticky top-6">
      <p className="text-sm font-medium text-[#A1A1AA] mb-3">Preview</p>
      <div
        className="overflow-hidden rounded-xl shadow-lg"
        style={{ backgroundColor: clr.chatBg, border: `1px solid ${clr.chatBorder}` }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-[#2563EB]">
          {state.chatbotIcon ? (
            <img src={state.chatbotIcon} className="h-9 w-9 rounded-full object-cover" alt="" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{chatbotName}</p>
          </div>
          <Mail className="h-4 w-4 text-white/60" />
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 min-h-[280px]" style={{ backgroundColor: clr.chatBg }}>
          {/* Welcome message */}
          <div className="flex gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Bot className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div
              className="max-w-[80%] rounded-lg rounded-tl-none p-3 text-sm"
              style={{ backgroundColor: clr.botMsgBg, color: clr.botMsgText }}
            >
              {welcomeMsg}
            </div>
          </div>

          {/* Lead form preview */}
          <div
            className="rounded-lg border p-4 space-y-3"
            style={{ borderColor: clr.chatBorder, backgroundColor: clr.actionBtnBg }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium" style={{ color: clr.actionBtnText }}>
                  Tell us how to reach you
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <input
                disabled
                placeholder="Name *"
                className="w-full rounded border px-2 py-1.5 text-xs"
                style={{ borderColor: clr.chatBorder, backgroundColor: clr.inputBg, color: clr.inputText }}
              />
              <input
                disabled
                placeholder="Email *"
                className="w-full rounded border px-2 py-1.5 text-xs"
                style={{ borderColor: clr.chatBorder, backgroundColor: clr.inputBg, color: clr.inputText }}
              />
              <button
                disabled
                className="w-full rounded py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: clr.sendBtnBg }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-2 border-t p-3"
          style={{ borderColor: clr.chatBorder, backgroundColor: clr.chatBg }}
        >
          <input
            type="text"
            disabled
            placeholder={state.messagePlaceholder}
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: clr.chatBorder,
              backgroundColor: clr.inputBg,
              color: clr.inputPlaceholder,
            }}
          />
          <button
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: clr.sendBtnBg, color: clr.sendBtnText }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Tabs ───────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'common', label: 'Common', icon: <Settings className="h-4 w-4" /> },
    { key: 'textual', label: 'Textual', icon: <Keyboard className="h-4 w-4" /> },
    { key: 'theme', label: 'Theme', icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="v4-animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customization</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Configure your chatbot&apos;s appearance, behavior, and theme
        </p>
      </div>

      {/* Tab Bar */}
      <div className="inline-flex bg-white/[0.04] rounded-xl p-1 gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {hasChanges && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] ml-1" />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Settings Panel */}
        <div className="space-y-4 pb-20">
          {/* ── Common Tab ──────────────────────────────────────────────── */}
          {activeTab === 'common' && (
            <>
              {/* Chatbot Icon */}
              <div className="v4-card rounded-2xl p-5">
                <span className="text-sm font-semibold text-white">Chatbot Icon</span>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
                    {state.chatbotIcon ? (
                      <img src={state.chatbotIcon} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <span className="text-lg font-bold text-[#52525B]">AI</span>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.svg"
                      className="hidden"
                      onChange={handleIconUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.10] text-sm text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </button>
                    <p className="mt-1.5 text-xs text-[#52525B]">
                      Max size 1MB, format: jpg, jpeg, png, svg
                    </p>
                  </div>
                </div>
              </div>

              {/* LLM Selector */}
              <div className="v4-card rounded-2xl p-5">
                <span className="text-sm font-semibold text-white">LLM</span>
                <div className="relative mt-2">
                  <select
                    value={state.llm}
                    onChange={(e) => update({ llm: e.target.value })}
                    className="w-full appearance-none px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/[0.16] transition-colors pr-10"
                  >
                    {LLM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#08080A] text-white">
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B] pointer-events-none" />
                </div>
                <p className="mt-1.5 text-xs text-[#52525B]">
                  Select the large language model used by your chatbot
                </p>
              </div>

              {/* Citation Toggles */}
              <ToggleCard
                title="Citation"
                description="Enable to show the data source in the chatbot response"
                checked={state.showCitations}
                onChange={(v) => update({ showCitations: v })}
              />
              <ToggleCard
                title="Dashboard Citation"
                description="Enable to view the data source in the dashboard"
                checked={state.dashboardCitations}
                onChange={(v) => update({ dashboardCitations: v })}
              />

              {/* Customer Support */}
              <ListInput
                label="Customer Support"
                items={state.supportEmails}
                max={5}
                placeholder="email@example.com"
                onChange={(emails) => update({ supportEmails: emails })}
                tooltip="Add email addresses to receive customer support notifications"
              />
            </>
          )}

          {/* ── Textual Tab ─────────────────────────────────────────────── */}
          {activeTab === 'textual' && (
            <>
              <ListInput
                label="Initial messages"
                items={state.initialMessages}
                max={4}
                placeholder="Add another message..."
                onChange={(msgs) => update({ initialMessages: msgs })}
                tooltip="Messages shown when the chat starts"
              />

              <ListInput
                label="Suggest questions"
                items={state.suggestedQuestions}
                max={8}
                placeholder="Add a suggested question..."
                onChange={(q) => update({ suggestedQuestions: q })}
                tooltip="Quick question buttons shown to users"
              />

              <ToggleCard
                title="Keep showing suggested questions"
                description="Control whether suggested questions remain visible after the user's first message"
                checked={state.keepShowingSuggestions}
                onChange={(v) => update({ keepShowingSuggestions: v })}
                highlighted
                tooltip="When disabled, suggestions hide after the first user message"
              />

              <ListInput
                label="Message bubbles"
                items={state.messageBubbles}
                max={3}
                placeholder="Add a message bubble..."
                onChange={(b) => update({ messageBubbles: b })}
                tooltip="Message bubbles on your website to attract visitor attention"
              />

              {/* Message Placeholder */}
              <div className="v4-card rounded-2xl p-5">
                <span className="text-sm font-semibold text-white">Message placeholder</span>
                <input
                  value={state.messagePlaceholder}
                  onChange={(e) => update({ messagePlaceholder: e.target.value })}
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] transition-colors text-sm"
                />
              </div>

              {/* AI Prompt */}
              <div className="v4-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">AI Prompt</span>
                    <span title="Customize how your chatbot responds" className="cursor-help">
                      <Info className="h-3.5 w-3.5 text-[#52525B]" />
                    </span>
                  </div>
                  <span className="text-xs text-[#52525B]">
                    {state.systemPrompt.length} characters
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="relative">
                    <select
                      value={state.promptType}
                      onChange={(e) => update({ promptType: e.target.value })}
                      className="appearance-none px-3 py-1.5 pr-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-[#A1A1AA] focus:outline-none focus:border-white/[0.16] transition-colors"
                    >
                      <option value="custom" className="bg-[#08080A] text-white">Custom prompt</option>
                      <option value="default" className="bg-[#08080A] text-white">Default template</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#52525B] pointer-events-none" />
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={state.systemPrompt}
                    onChange={(e) => update({ systemPrompt: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && !state.systemPrompt.trim()) {
                        e.preventDefault();
                        update({ systemPrompt: DEFAULT_PROMPT });
                      }
                    }}
                    rows={10}
                    className="w-full px-3 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] transition-colors text-sm font-mono resize-y"
                  />
                  <p className="mt-1 text-xs text-[#52525B]">
                    Tip: Press Tab to insert default template
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── Theme Tab ───────────────────────────────────────────────── */}
          {activeTab === 'theme' && (
            <>
              {/* Quick Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => update({ themePreset: key, colors: { ...preset.colors } })}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      state.themePreset === key
                        ? 'border-[#BF56FF]/40 bg-[#BF56FF]/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex justify-center gap-1.5 mb-2">
                      {preset.dots.map((dot, i) => (
                        <div
                          key={i}
                          className="h-4 w-4 rounded-full border border-white/[0.08]"
                          style={{ backgroundColor: dot }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-white">{preset.label}</p>
                    <p className="text-[10px] text-[#71717A]">{preset.desc}</p>
                  </button>
                ))}
              </div>

              {/* Color Sections */}
              <ColorSection
                title="Chat Window"
                icon={<Settings className="h-4 w-4 text-[#71717A]" />}
                defaultOpen
              >
                <ColorRow label="Background Color" value={clr.chatBg} onChange={(v) => update({ colors: { ...clr, chatBg: v } })} />
                <ColorRow label="Border Color" value={clr.chatBorder} onChange={(v) => update({ colors: { ...clr, chatBorder: v } })} />
              </ColorSection>

              <ColorSection
                title="Send Button"
                icon={<Send className="h-4 w-4 text-[#71717A]" />}
              >
                <ColorRow label="Button Color" value={clr.sendBtnBg} onChange={(v) => update({ colors: { ...clr, sendBtnBg: v } })} />
                <ColorRow label="Button Text" value={clr.sendBtnText} onChange={(v) => update({ colors: { ...clr, sendBtnText: v } })} />
              </ColorSection>

              <ColorSection
                title="Bot Messages"
                icon={<MessageSquare className="h-4 w-4 text-[#71717A]" />}
              >
                <ColorRow label="Message Background" value={clr.botMsgBg} onChange={(v) => update({ colors: { ...clr, botMsgBg: v } })} />
                <ColorRow label="Message Text" value={clr.botMsgText} onChange={(v) => update({ colors: { ...clr, botMsgText: v } })} />
              </ColorSection>

              <ColorSection
                title="Action Buttons"
                icon={<Bot className="h-4 w-4 text-[#71717A]" />}
              >
                <ColorRow label="Button Background" value={clr.actionBtnBg} onChange={(v) => update({ colors: { ...clr, actionBtnBg: v } })} />
                <ColorRow label="Button Text" value={clr.actionBtnText} onChange={(v) => update({ colors: { ...clr, actionBtnText: v } })} />
              </ColorSection>

              <ColorSection
                title="Input Area"
                icon={<Keyboard className="h-4 w-4 text-[#71717A]" />}
              >
                <ColorRow label="Input Background" value={clr.inputBg} onChange={(v) => update({ colors: { ...clr, inputBg: v } })} />
                <ColorRow label="Input Text" value={clr.inputText} onChange={(v) => update({ colors: { ...clr, inputText: v } })} />
                <ColorRow label="Placeholder Text" value={clr.inputPlaceholder} onChange={(v) => update({ colors: { ...clr, inputPlaceholder: v } })} />
              </ColorSection>
            </>
          )}
        </div>

        {/* Preview Panel */}
        <div className="hidden lg:block">{PreviewWidget}</div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#22C55E]/20 bg-[#0E0E10] px-4 py-3 shadow-xl animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 text-[#22C55E]" />
          <span className="text-sm font-medium text-white">Customization saved successfully</span>
        </div>
      )}

      {/* Sticky Footer */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-[#0E0E10] border-t border-white/[0.06] px-6 py-3 flex items-center justify-between z-30">
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
            You have unsaved changes
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded-lg border border-white/[0.10] text-sm text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white text-[#08080A] text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Leave Dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowLeaveDialog(false);
              setPendingNavUrl(null);
            }}
          />
          {/* Dialog */}
          <div className="relative bg-[#0E0E10] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/10">
                <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Unsaved Changes</h2>
            </div>
            <p className="text-sm text-[#A1A1AA] mb-6">
              You have unsaved changes that will be lost if you leave this page.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowLeaveDialog(false);
                  setPendingNavUrl(null);
                }}
                className="px-4 py-2 rounded-lg border border-white/[0.10] text-sm text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors"
              >
                Stay on Page
              </button>
              <button
                onClick={confirmLeave}
                className="px-4 py-2 rounded-lg bg-[#EC4899] text-white text-sm font-medium hover:bg-[#EC4899]/90 transition-colors"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
