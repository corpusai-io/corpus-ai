'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { chatbotApi } from '@/lib/api';
import { useChatbotStore } from '@/stores/chatbot-store';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  FileText,
  Table,
  Type,
  Check,
  Upload,
  X,
  Loader2,
  Bot,
  ChevronDown,
} from 'lucide-react';

type SourceType = 'website' | 'files' | 'text';

interface WizardState {
  name: string;
  description: string;
  language: string;
  sourceType: SourceType | null;
  websiteUrl: string;
  files: File[];
  text: string;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const STEPS = [
  { n: 1, label: 'Basics' },
  { n: 2, label: 'Source' },
  { n: 3, label: 'Configure' },
  { n: 4, label: 'Review' },
];

/* ─── Step indicator ─────────────────────────────────────── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((s, i) => {
        const done = s.n < currentStep;
        const active = s.n === currentStep;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  done
                    ? 'bg-[#22C55E] text-white'
                    : active
                      ? 'bg-[#BF56FF] text-white shadow-[0_0_16px_rgba(191,86,255,0.45)]'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-[#3F3F46] border border-slate-200 dark:border-white/[0.08]'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s.n}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-[#BF56FF]' : done ? 'text-[#22C55E]' : 'text-slate-400 dark:text-[#3F3F46]'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-5 mx-2 h-px w-10 transition-colors duration-300 ${done ? 'bg-[#22C55E]/60' : 'bg-slate-200 dark:bg-white/[0.06]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Source card ─────────────────────────────────────────── */
function SourceCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all duration-200 ${
        selected
          ? 'border-[#BF56FF]/50 bg-[#BF56FF]/[0.06] shadow-[0_0_20px_rgba(191,86,255,0.08)]'
          : 'border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/[0.14] hover:bg-slate-50 dark:hover:bg-white/[0.04]'
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#BF56FF]">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${selected ? 'bg-[#BF56FF]/15 border border-[#BF56FF]/25' : 'bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]'}`}>
        <Icon className={`h-5 w-5 ${selected ? 'text-[#BF56FF]' : 'text-slate-400 dark:text-[#3F3F46]'}`} />
      </div>
      <div>
        <p className={`text-sm font-semibold transition-colors ${selected ? 'text-[#BF56FF]' : 'text-slate-700 dark:text-[#A1A1AA]'}`}>{title}</p>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-[#3F3F46] leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

/* ─── Review row ──────────────────────────────────────────── */
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-white/[0.05] last:border-0">
      <span className="text-xs font-medium text-slate-400 dark:text-[#3F3F46] uppercase tracking-wider shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-500 dark:text-[#A1A1AA] text-right">{value}</span>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function CreateChatbotPage() {
  const router = useRouter();
  const { addChatbot } = useChatbotStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<WizardState>({
    name: '',
    description: '',
    language: 'en',
    sourceType: null,
    websiteUrl: '',
    files: [],
    text: '',
  });

  const update = (patch: Partial<WizardState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 1: return form.name.trim().length > 0;
      case 2: return form.sourceType !== null;
      case 3:
        if (form.sourceType === 'website') {
          try { new URL(form.websiteUrl); return true; } catch { return false; }
        }
        if (form.sourceType === 'files') return form.files.length > 0;
        if (form.sourceType === 'text') return form.text.trim().length > 0;
        return false;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => { if (step < 4 && isStepValid(step)) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files).filter(
        (f) => f.size <= MAX_FILE_SIZE && /\.(pdf|txt|docx|csv|xlsx|xls)$/i.test(f.name)
      );
      update({ files: [...form.files, ...dropped] });
    },
    [form.files]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).filter((f) => f.size <= MAX_FILE_SIZE);
    update({ files: [...form.files, ...selected] });
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    update({ files: form.files.filter((_, i) => i !== idx) });
  };

  const handleCreate = async () => {
    setError(null);
    setLoading(true);
    try {
      let origin = '';
      if (form.sourceType === 'website') origin = form.websiteUrl;
      else if (form.sourceType === 'files') origin = 'file-upload';
      else if (form.sourceType === 'text') origin = 'text-input';

      const data: any = await chatbotApi.create({
        title: form.name,
        desc: form.description,
        origin,
        language: form.language,
        ...(form.sourceType === 'text' && { textContent: form.text }),
      });

      if (!data.chatbot) throw new Error('Failed to create chatbot');

      const chatbotId = data.chatbot.chatbotId;

      if (form.sourceType === 'files' && form.files.length > 0) {
        const fileKeys: string[] = [];
        for (const file of form.files) {
          const result = await chatbotApi.uploadFile(chatbotId, file);
          fileKeys.push(result.fileKey);
        }
        await chatbotApi.startBuild(chatbotId, fileKeys, form.files.map(f => ({ name: f.name, size: f.size })));
      }

      addChatbot(data.chatbot);
      router.push(`/chatbots/${data.chatbot.chatbotId}/chat`);
    } catch (err: any) {
      setError(err.message || 'Failed to create chatbot');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename: string) => {
    if (/\.(csv|xlsx|xls)$/i.test(filename)) return Table;
    return FileText;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectedLang = LANGUAGES.find((l) => l.value === form.language)?.label ?? 'English';

  return (
    <div className="mx-auto max-w-2xl v4-animate-in">

      {/* Back */}
      <button
        onClick={() => router.push('/chatbots')}
        className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-[#A1A1AA] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Chatbots
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-[#BF56FF]/10 border border-[#BF56FF]/20 flex items-center justify-center">
          <Bot className="h-5 w-5 text-[#BF56FF]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Create Chatbot</h1>
          <p className="text-xs text-slate-400 dark:text-[#71717A]">Train a new AI chatbot on your data</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator currentStep={step} />
      </div>

      {/* Card */}
      <div className="v4-card rounded-2xl p-7 space-y-6">

        {/* Step 1 — Basics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">Name your chatbot</h2>
              <p className="text-xs text-slate-400 dark:text-[#71717A]">Give your bot an identity</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">Name <span className="text-[#BF56FF]">*</span></label>
              <input
                type="text"
                placeholder="My Support Bot"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 focus:bg-white dark:focus:bg-white/[0.05] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">Description <span className="text-slate-400 dark:text-[#3F3F46]">(optional)</span></label>
              <textarea
                placeholder="Describe what this chatbot does…"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={3}
                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 focus:bg-white dark:focus:bg-white/[0.05] transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">Language</label>
              <div className="relative">
                <select
                  value={form.language}
                  onChange={(e) => update({ language: e.target.value })}
                  className="w-full appearance-none bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#BF56FF]/40 transition-all cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-slate-50 dark:bg-[#111113]">
                      {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-[#3F3F46] pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Source type */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">How should your chatbot learn?</h2>
              <p className="text-xs text-slate-400 dark:text-[#71717A]">Choose a data source to train on</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SourceCard
                icon={Globe}
                title="Website"
                description="Crawl a website URL"
                selected={form.sourceType === 'website'}
                onClick={() => update({ sourceType: 'website' })}
              />
              <SourceCard
                icon={FileText}
                title="Files"
                description="Upload PDF, TXT, DOCX, CSV"
                selected={form.sourceType === 'files'}
                onClick={() => update({ sourceType: 'files' })}
              />
              <SourceCard
                icon={Type}
                title="Text"
                description="Paste text directly"
                selected={form.sourceType === 'text'}
                onClick={() => update({ sourceType: 'text' })}
              />
            </div>
          </div>
        )}

        {/* Step 3 — Configure source */}
        {step === 3 && (
          <div className="space-y-5">
            {form.sourceType === 'website' && (
              <>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">Enter your website URL</h2>
                  <p className="text-xs text-slate-400 dark:text-[#71717A]">We'll crawl and index the content</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">Website URL <span className="text-[#BF56FF]">*</span></label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={form.websiteUrl}
                    onChange={(e) => update({ websiteUrl: e.target.value })}
                    className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 focus:bg-white dark:focus:bg-white/[0.05] transition-all"
                  />
                  <p className="text-xs text-slate-400 dark:text-[#3F3F46]">We'll crawl this URL and use its content to train your chatbot.</p>
                </div>
              </>
            )}

            {form.sourceType === 'files' && (
              <>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">Upload your files</h2>
                  <p className="text-xs text-slate-400 dark:text-[#71717A]">PDF, TXT, DOCX, CSV, XLSX — 10 MB max each</p>
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-white/[0.10] p-8 transition-all hover:border-[#BF56FF]/40 hover:bg-[#BF56FF]/[0.03] group"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center mb-3 group-hover:border-[#BF56FF]/30 transition-colors">
                    <Upload className="h-5 w-5 text-slate-400 dark:text-[#3F3F46] group-hover:text-[#BF56FF] transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-[#A1A1AA]">Drop files here or click to browse</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-[#3F3F46]">PDF, TXT, DOCX, CSV, XLSX</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {form.files.length > 0 && (
                  <div className="space-y-2">
                    {form.files.map((file, idx) => {
                      const Icon = getFileIcon(file.name);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] px-3.5 py-2.5"
                        >
                          <div className="flex items-center gap-2.5 text-sm min-w-0">
                            <Icon className="h-4 w-4 text-slate-400 dark:text-[#3F3F46] shrink-0" />
                            <span className="text-slate-600 dark:text-[#A1A1AA] truncate">{file.name}</span>
                            <span className="text-slate-400 dark:text-[#3F3F46] shrink-0">{formatSize(file.size)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="ml-2 p-1 rounded text-slate-400 dark:text-[#3F3F46] hover:text-slate-600 dark:hover:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {form.sourceType === 'text' && (
              <>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">Paste your content</h2>
                  <p className="text-xs text-slate-400 dark:text-[#71717A]">Your chatbot will be trained on this text</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">Content <span className="text-[#BF56FF]">*</span></label>
                  <textarea
                    placeholder="Paste your content here…"
                    value={form.text}
                    onChange={(e) => update({ text: e.target.value })}
                    rows={9}
                    className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#3F3F46] focus:outline-none focus:border-[#BF56FF]/40 focus:bg-white dark:focus:bg-white/[0.05] transition-all resize-none"
                  />
                  <p className="text-right text-xs text-slate-400 dark:text-[#3F3F46]">{form.text.length.toLocaleString()} characters</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">Review &amp; Create</h2>
              <p className="text-xs text-slate-400 dark:text-[#71717A]">Double-check your settings before launching</p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] px-4 divide-y divide-slate-100 dark:divide-white/[0.05]">
              <ReviewRow label="Name" value={form.name} />
              {form.description && <ReviewRow label="Description" value={form.description} />}
              <ReviewRow label="Language" value={selectedLang} />
              <ReviewRow
                label="Source"
                value={
                  form.sourceType === 'website'
                    ? form.websiteUrl
                    : form.sourceType === 'files'
                      ? `${form.files.length} file${form.files.length !== 1 ? 's' : ''}`
                      : `${form.text.length.toLocaleString()} characters of text`
                }
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-[#EC4899]/[0.08] border border-[#EC4899]/20 px-4 py-3">
                <X className="h-4 w-4 text-[#EC4899] shrink-0 mt-0.5" />
                <p className="text-sm text-[#EC4899]">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Create Chatbot
                </>
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex gap-3 pt-2 ${step === 4 && !loading ? 'justify-start' : 'justify-between'}`}>
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/[0.10] text-sm font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          {step < 4 && (
            <button
              onClick={handleNext}
              disabled={!isStepValid(step)}
              className="ml-auto flex items-center gap-1.5 px-5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
