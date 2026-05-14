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
import { Eyebrow, Pill, Button, Divider } from '@/components/corpus';

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
  chatbotIcon: string;
  llm: string;
  showCitations: boolean;
  dashboardCitations: boolean;
  supportEmails: string[];
  initialMessages: string[];
  suggestedQuestions: string[];
  keepShowingSuggestions: boolean;
  messageBubbles: string[];
  messagePlaceholder: string;
  systemPrompt: string;
  promptType: string;
  themePreset: string;
  colors: ThemeColors;
}

const DEFAULT_COLORS: ThemeColors = {
  chatBg: '#FFFFFF',
  chatBorder: '#E8E8E8',
  sendBtnBg: '#171717',
  sendBtnText: '#FFFFFF',
  botMsgBg: '#F7F7F7',
  botMsgText: '#171717',
  actionBtnBg: '#FFFFFF',
  actionBtnText: '#171717',
  inputBg: '#F7F7F7',
  inputText: '#171717',
  inputPlaceholder: '#A1A1A1',
};

const THEME_PRESETS: Record<string, { label: string; desc: string; colors: ThemeColors; dots: string[] }> = {
  monochrome: {
    label: 'Monochrome',
    desc: 'Editorial black and white',
    dots: ['#171717', '#F7F7F7'],
    colors: { ...DEFAULT_COLORS },
  },
  dark: {
    label: 'Dark',
    desc: 'Easy on the eyes',
    dots: ['#FFFFFF', '#0E0E10'],
    colors: {
      chatBg: '#0E0E10',
      chatBorder: '#2A2A2A',
      sendBtnBg: '#FFFFFF',
      sendBtnText: '#0E0E10',
      botMsgBg: '#1A1A1A',
      botMsgText: '#F0F0F4',
      actionBtnBg: '#1A1A1A',
      actionBtnText: '#F0F0F4',
      inputBg: '#1A1A1A',
      inputText: '#F0F0F4',
      inputPlaceholder: '#737373',
    },
  },
  ivory: {
    label: 'Ivory',
    desc: 'Warm paper with deep ink',
    dots: ['#1A1A2E', '#FDF6E3'],
    colors: {
      chatBg: '#FDF6E3',
      chatBorder: '#D4C5A9',
      sendBtnBg: '#1A1A2E',
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
  brand: {
    label: 'Brand blue',
    desc: 'Confident blue accent',
    dots: ['#2563EB', '#FFFFFF'],
    colors: {
      chatBg: '#FFFFFF',
      chatBorder: '#E8E8E8',
      sendBtnBg: '#2563EB',
      sendBtnText: '#FFFFFF',
      botMsgBg: '#F1F5F9',
      botMsgText: '#020817',
      actionBtnBg: '#FFFFFF',
      actionBtnText: '#020817',
      inputBg: '#F1F5F9',
      inputText: '#020817',
      inputPlaceholder: '#64748B',
    },
  },
};

const LLM_OPTIONS = [
  { value: 'gpt-4o-mini',       label: 'GPT-4o mini',       tier: 'Fast'      },
  { value: 'gpt-4o',            label: 'GPT-4o',            tier: 'Capable'   },
  { value: 'gpt-3.5-turbo',     label: 'GPT-3.5 Turbo',     tier: 'Fast'      },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', tier: 'Capable'   },
  { value: 'claude-3-haiku',    label: 'Claude 3 Haiku',    tier: 'Fast'      },
];

const DEFAULT_PROMPT = `### Role
You are a helpful AI assistant that answers questions based on the provided context.

### Constraints
- Only answer based on the context provided
- If you don't know the answer, say so honestly
- Keep responses concise and helpful
- Be polite and professional`;

/* ─── Toggle ─────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
        checked ? 'bg-ink' : 'bg-line-strong'
      }`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

/* ─── Reusable bits ──────────────────────────────────────── */
function ListInput({
  label, items, max, placeholder, onChange, tooltip,
}: {
  label: string; items: string[]; max: number; placeholder: string; onChange: (items: string[]) => void; tooltip?: string;
}) {
  const [draft, setDraft] = useState('');
  const addItem = () => {
    const val = draft.trim();
    if (val && items.length < max) { onChange([...items, val]); setDraft(''); }
  };
  return (
    <div className="v4-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="font-mono text-[10px] text-muted-soft">{items.length}/{max}</span>
        {tooltip && <span title={tooltip} className="cursor-help"><Info className="w-3.5 h-3.5 text-muted-soft" /></span>}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
              className="flex-1 px-3 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink focus:outline-none focus:border-ink transition-colors"
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-1.5 rounded-lg text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
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
              className="flex-1 px-3 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
            />
            <button
              onClick={addItem}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:text-ink hover:bg-surface transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleCard({
  title, description, checked, onChange, tooltip,
}: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl p-4 border border-line bg-canvas">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-ink">{title}</span>
          {tooltip && <span title={tooltip} className="cursor-help"><Info className="w-3.5 h-3.5 text-muted-soft" /></span>}
        </div>
        <p className="text-[12px] text-muted mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded border border-line" style={{ backgroundColor: value }} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 rounded bg-canvas border border-line text-[11px] text-ink font-mono focus:outline-none focus:border-ink transition-colors"
        />
        <label className="cursor-pointer relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <Palette className="w-3.5 h-3.5 text-muted-soft hover:text-ink transition-colors" />
        </label>
      </div>
    </div>
  );
}

function ColorSection({
  title, icon, children, defaultOpen,
}: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="v4-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="px-4 py-3 flex items-center gap-3 w-full hover:bg-surface transition-colors">
        <div className="h-7 w-7 rounded-lg bg-surface border border-line flex items-center justify-center">
          {icon}
        </div>
        <span className="flex-1 text-[13px] font-medium text-ink text-left">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-soft" /> : <ChevronDown className="w-4 h-4 text-muted-soft" />}
      </button>
      {open && <div className="px-4 pb-3 divide-y divide-line">{children}</div>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function CustomizationPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState<Tab>('common');
  const [hasChanges,     setHasChanges]     = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [chatbotName,    setChatbotName]    = useState('New chatbot');
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavUrl,  setPendingNavUrl]  = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    messagePlaceholder: 'Type your question here…',
    systemPrompt: DEFAULT_PROMPT,
    promptType: 'custom',
    themePreset: 'monochrome',
    colors: { ...DEFAULT_COLORS },
  });

  const savedRef = useRef<string>('');

  useEffect(() => {
    if (savedRef.current) setHasChanges(JSON.stringify(state) !== savedRef.current);
  }, [state]);

  const update = (patch: Partial<CustomizationState>) => setState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [chatbotData, customData] = await Promise.all([
          chatbotApi.get(chatbotId),
          customizeApi.get(chatbotId).catch(() => ({ customization: {} })),
        ]);

        const chatbot = (chatbotData as any).chatbot || chatbotData;
        setChatbotName(chatbot.title || 'New chatbot');

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
          messagePlaceholder: c.messagePlaceholder || 'Type your question here…',
          systemPrompt: c.systemPrompt || DEFAULT_PROMPT,
          promptType: c.promptType || 'custom',
          themePreset: c.themePreset || 'monochrome',
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

  const handleDiscard = () => {
    if (savedRef.current) {
      setState(JSON.parse(savedRef.current));
      setHasChanges(false);
    }
  };

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (hasChanges) e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

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
    if (pendingNavUrl) { router.push(pendingNavUrl); setPendingNavUrl(null); }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('File must be under 1MB'); return; }
    const reader = new FileReader();
    reader.onload = () => update({ chatbotIcon: reader.result as string });
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="v4-animate-in space-y-4">
        <div className="v4-shimmer h-2.5 w-32 rounded" />
        <div className="v4-shimmer h-7 w-64 rounded" />
        <div className="v4-shimmer h-10 w-80 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="v4-shimmer h-32 rounded-2xl" />
            <div className="v4-shimmer h-28 rounded-2xl" />
            <div className="v4-shimmer h-16 rounded-xl" />
            <div className="v4-shimmer h-40 rounded-2xl" />
          </div>
          <div className="hidden lg:block"><div className="v4-shimmer h-[480px] rounded-xl" /></div>
        </div>
      </div>
    );
  }

  const clr = state.colors;
  const welcomeMsg = state.initialMessages[0] || 'Hello! How can I help you today?';

  /* Preview widget — uses user-chosen colors (this is the whole point of the page) */
  const PreviewWidget = (
    <div className="sticky top-6">
      <Eyebrow className="mb-3">Preview</Eyebrow>
      <div className="overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: clr.chatBg, border: `1px solid ${clr.chatBorder}` }}>
        <div className="flex items-center gap-3 p-4" style={{ backgroundColor: clr.sendBtnBg }}>
          {state.chatbotIcon ? (
            <img src={state.chatbotIcon} className="h-9 w-9 rounded-full object-cover" alt="" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="w-5 h-5" style={{ color: clr.sendBtnText }} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: clr.sendBtnText }}>{chatbotName}</p>
          </div>
          <Mail className="w-4 h-4 opacity-60" style={{ color: clr.sendBtnText }} />
        </div>

        <div className="p-4 space-y-3 min-h-[280px]" style={{ backgroundColor: clr.chatBg }}>
          <div className="flex gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: clr.sendBtnBg }}>
              <Bot className="w-3.5 h-3.5" style={{ color: clr.sendBtnText }} />
            </div>
            <div className="max-w-[80%] rounded-lg rounded-tl-none p-3 text-sm" style={{ backgroundColor: clr.botMsgBg, color: clr.botMsgText }}>
              {welcomeMsg}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: clr.chatBorder, backgroundColor: clr.chatBg }}>
          <input
            type="text"
            disabled
            placeholder={state.messagePlaceholder}
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: clr.chatBorder, backgroundColor: clr.inputBg, color: clr.inputPlaceholder }}
          />
          <button disabled className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: clr.sendBtnBg, color: clr.sendBtnText }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'common',  label: 'Common',  icon: <Settings className="w-4 h-4" /> },
    { key: 'textual', label: 'Textual', icon: <Keyboard className="w-4 h-4" /> },
    { key: 'theme',   label: 'Theme',   icon: <Palette  className="w-4 h-4" /> },
  ];

  return (
    <div className="v4-animate-in space-y-8">
      {/* Header */}
      <div>
        <Eyebrow>Settings · customization</Eyebrow>
        <h1
          className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-ink">Make it yours.</span>{' '}
          <span className="text-muted">Brand, copy, theme.</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-canvas border border-line rounded-xl p-1 gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === tab.key ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 pb-20">
          {/* Common */}
          {activeTab === 'common' && (
            <>
              <div className="v4-card p-5">
                <Eyebrow>Chatbot icon</Eyebrow>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-line bg-surface overflow-hidden">
                    {state.chatbotIcon ? (
                      <img src={state.chatbotIcon} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <span className="font-display text-lg font-medium text-muted-soft">AI</span>
                    )}
                  </div>
                  <div>
                    <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.svg" className="hidden" onChange={handleIconUpload} />
                    <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                      Upload image
                    </Button>
                    <p className="mt-1.5 text-[11px] text-muted-soft">Max size 1MB · jpg, jpeg, png, svg</p>
                  </div>
                </div>
              </div>

              <div className="v4-card p-5">
                <Eyebrow>LLM</Eyebrow>
                <div className="relative mt-2">
                  <select
                    value={state.llm}
                    onChange={(e) => update({ llm: e.target.value })}
                    className="w-full appearance-none px-3 py-2 rounded-lg bg-canvas border border-line text-ink text-[14px] focus:outline-none focus:border-ink transition-colors pr-10"
                  >
                    {LLM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label} — {opt.tier}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft pointer-events-none" />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-soft">Pick the model that powers your chatbot.</p>
              </div>

              <ToggleCard
                title="Show citations in chat"
                description="Display source references in the chatbot response."
                checked={state.showCitations}
                onChange={(v) => update({ showCitations: v })}
              />
              <ToggleCard
                title="Show citations in dashboard"
                description="View source references from the dashboard query log."
                checked={state.dashboardCitations}
                onChange={(v) => update({ dashboardCitations: v })}
              />

              <ListInput
                label="Customer support emails"
                items={state.supportEmails}
                max={5}
                placeholder="email@example.com"
                onChange={(emails) => update({ supportEmails: emails })}
                tooltip="Receive customer support notifications at these addresses."
              />
            </>
          )}

          {/* Textual */}
          {activeTab === 'textual' && (
            <>
              <ListInput
                label="Initial messages"
                items={state.initialMessages}
                max={4}
                placeholder="Add another message…"
                onChange={(msgs) => update({ initialMessages: msgs })}
                tooltip="Messages shown when the chat opens."
              />

              <ListInput
                label="Suggested questions"
                items={state.suggestedQuestions}
                max={8}
                placeholder="Add a suggested question…"
                onChange={(q) => update({ suggestedQuestions: q })}
                tooltip="Quick question buttons shown to users."
              />

              <ToggleCard
                title="Keep showing suggested questions"
                description="Show suggestions even after the user has sent their first message."
                checked={state.keepShowingSuggestions}
                onChange={(v) => update({ keepShowingSuggestions: v })}
              />

              <ListInput
                label="Message bubbles"
                items={state.messageBubbles}
                max={3}
                placeholder="Add a message bubble…"
                onChange={(b) => update({ messageBubbles: b })}
                tooltip="Bubbles displayed on your site to attract visitors."
              />

              <div className="v4-card p-5">
                <Eyebrow>Input placeholder</Eyebrow>
                <input
                  value={state.messagePlaceholder}
                  onChange={(e) => update({ messagePlaceholder: e.target.value })}
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              <div className="v4-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eyebrow>System prompt</Eyebrow>
                    <span title="Customize how the bot responds." className="cursor-help">
                      <Info className="w-3.5 h-3.5 text-muted-soft" />
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-soft">{state.systemPrompt.length} chars</span>
                </div>
                <div className="relative mb-2">
                  <select
                    value={state.promptType}
                    onChange={(e) => update({ promptType: e.target.value })}
                    className="appearance-none px-3 py-1.5 pr-8 rounded-lg bg-canvas border border-line text-[12px] text-muted focus:outline-none focus:border-ink transition-colors"
                  >
                    <option value="custom">Custom prompt</option>
                    <option value="default">Default template</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-soft pointer-events-none" />
                </div>
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
                  className="w-full px-3 py-3 rounded-lg bg-canvas border border-line text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors font-mono resize-y"
                />
                <p className="mt-1 text-[11px] text-muted-soft">Tip: Press Tab to insert default template.</p>
              </div>
            </>
          )}

          {/* Theme */}
          {activeTab === 'theme' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => update({ themePreset: key, colors: { ...preset.colors } })}
                    className={`rounded-xl border p-3 text-center transition-colors ${
                      state.themePreset === key ? 'border-ink bg-surface' : 'border-line bg-canvas hover:bg-surface'
                    }`}
                  >
                    <div className="flex justify-center gap-1.5 mb-2">
                      {preset.dots.map((dot, i) => (
                        <div key={i} className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: dot }} />
                      ))}
                    </div>
                    <p className="text-[12px] font-medium text-ink">{preset.label}</p>
                    <p className="text-[10px] text-muted-soft">{preset.desc}</p>
                  </button>
                ))}
              </div>

              <ColorSection title="Chat window" icon={<Settings className="w-4 h-4 text-ink" />} defaultOpen>
                <ColorRow label="Background"   value={clr.chatBg}     onChange={(v) => update({ colors: { ...clr, chatBg: v } })} />
                <ColorRow label="Border"       value={clr.chatBorder} onChange={(v) => update({ colors: { ...clr, chatBorder: v } })} />
              </ColorSection>

              <ColorSection title="Send button" icon={<Send className="w-4 h-4 text-ink" />}>
                <ColorRow label="Background"   value={clr.sendBtnBg}   onChange={(v) => update({ colors: { ...clr, sendBtnBg: v } })} />
                <ColorRow label="Text"         value={clr.sendBtnText} onChange={(v) => update({ colors: { ...clr, sendBtnText: v } })} />
              </ColorSection>

              <ColorSection title="Bot messages" icon={<MessageSquare className="w-4 h-4 text-ink" />}>
                <ColorRow label="Background"   value={clr.botMsgBg}   onChange={(v) => update({ colors: { ...clr, botMsgBg: v } })} />
                <ColorRow label="Text"         value={clr.botMsgText} onChange={(v) => update({ colors: { ...clr, botMsgText: v } })} />
              </ColorSection>

              <ColorSection title="Action buttons" icon={<Bot className="w-4 h-4 text-ink" />}>
                <ColorRow label="Background"   value={clr.actionBtnBg}   onChange={(v) => update({ colors: { ...clr, actionBtnBg: v } })} />
                <ColorRow label="Text"         value={clr.actionBtnText} onChange={(v) => update({ colors: { ...clr, actionBtnText: v } })} />
              </ColorSection>

              <ColorSection title="Input area" icon={<Keyboard className="w-4 h-4 text-ink" />}>
                <ColorRow label="Background"  value={clr.inputBg}          onChange={(v) => update({ colors: { ...clr, inputBg: v } })} />
                <ColorRow label="Text"        value={clr.inputText}        onChange={(v) => update({ colors: { ...clr, inputText: v } })} />
                <ColorRow label="Placeholder" value={clr.inputPlaceholder} onChange={(v) => update({ colors: { ...clr, inputPlaceholder: v } })} />
              </ColorSection>
            </>
          )}
        </div>

        <div className="hidden lg:block">{PreviewWidget}</div>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-line bg-canvas px-4 py-3 shadow-lg">
          <CheckCircle className="w-5 h-5 text-[#10B981]" />
          <span className="text-[13px] font-medium text-ink">Customization saved</span>
        </div>
      )}

      {/* Sticky footer */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-canvas border-t border-line px-6 py-3 flex items-center justify-between z-30">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-ink" />
            You have unsaved changes
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleDiscard}>Discard</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save all changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Leave dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
            onClick={() => { setShowLeaveDialog(false); setPendingNavUrl(null); }}
          />
          <div className="relative bg-canvas border border-line rounded-2xl p-6 w-full max-w-md shadow-lg">
            <Eyebrow>Unsaved</Eyebrow>
            <h2
              className="font-display text-[20px] font-medium text-ink mt-2"
              style={{ letterSpacing: '-0.012em' }}
            >
              Leave without saving?
            </h2>
            <p className="text-[13px] text-muted mt-2 mb-6 leading-relaxed">
              You have unsaved changes. If you leave now, they&apos;ll be lost.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => { setShowLeaveDialog(false); setPendingNavUrl(null); }}>
                Stay on page
              </Button>
              <button
                onClick={confirmLeave}
                className="px-4 py-2 rounded-lg bg-ink text-white text-[14px] font-medium hover:bg-ink-hover transition-colors"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
