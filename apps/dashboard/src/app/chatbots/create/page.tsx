'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { chatbotApi } from '@/lib/api';
import { useChatbotStore } from '@/stores/chatbot-store';
import {
  ArrowLeft, ArrowRight, Globe, FileText, Table, Type, Check, Upload, X, Loader2, Bot, ChevronDown,
} from 'lucide-react';
import { Eyebrow, IconChip, Mark, Button, Divider } from '@/components/corpus';

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
  { value: 'en', label: 'English'    },
  { value: 'es', label: 'Spanish'    },
  { value: 'fr', label: 'French'     },
  { value: 'de', label: 'German'     },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian'    },
  { value: 'nl', label: 'Dutch'      },
  { value: 'ja', label: 'Japanese'   },
  { value: 'ko', label: 'Korean'     },
  { value: 'zh', label: 'Chinese'    },
  { value: 'ar', label: 'Arabic'     },
  { value: 'hi', label: 'Hindi'      },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const STEPS = [
  { n: 1, label: 'Basics'    },
  { n: 2, label: 'Source'    },
  { n: 3, label: 'Configure' },
  { n: 4, label: 'Review'    },
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
                className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-[11px] font-semibold transition-colors ${
                  done   ? 'bg-ink text-white' :
                  active ? 'bg-ink text-white' :
                           'bg-surface text-muted-soft border border-line'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : s.n}
              </div>
              <span
                className={`font-mono uppercase text-[10px] font-medium ${
                  active || done ? 'text-ink' : 'text-muted-soft'
                }`}
                style={{ letterSpacing: '0.14em' }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-5 mx-2 h-px w-10 transition-colors duration-300 ${done ? 'bg-ink' : 'bg-line'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Source card ─────────────────────────────────────────── */
function SourceCard({
  icon: Icon, title, description, selected, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; description: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors ${
        selected ? 'border-ink bg-surface' : 'border-line bg-canvas hover:bg-surface'
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-ink">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="h-11 w-11 rounded-xl bg-canvas border border-line flex items-center justify-center">
        <Icon className="w-5 h-5 text-ink" />
      </div>
      <div>
        <p
          className="font-display text-[14px] font-medium text-ink"
          style={{ letterSpacing: '-0.012em' }}
        >
          {title}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-soft leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

/* ─── Review row ──────────────────────────────────────────── */
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-line last:border-0">
      <span
        className="font-mono uppercase text-[10px] font-semibold text-muted-soft shrink-0 pt-0.5"
        style={{ letterSpacing: '0.14em' }}
      >
        {label}
      </span>
      <span className="text-[13px] text-ink text-right">{value}</span>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function CreateChatbotPage() {
  const router = useRouter();
  const { addChatbot } = useChatbotStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [form, setForm] = useState<WizardState>({
    name: '',
    description: '',
    language: 'en',
    sourceType: null,
    websiteUrl: '',
    files: [],
    text: '',
  });

  const update = (patch: Partial<WizardState>) => setForm((prev) => ({ ...prev, ...patch }));

  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 1: return form.name.trim().length > 0;
      case 2: return form.sourceType !== null;
      case 3:
        if (form.sourceType === 'website') {
          try { new URL(form.websiteUrl); return true; } catch { return false; }
        }
        if (form.sourceType === 'files') return form.files.length > 0;
        if (form.sourceType === 'text')  return form.text.trim().length > 0;
        return false;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => { if (step < 4 && isStepValid(step)) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.size <= MAX_FILE_SIZE && /\.(pdf|txt|docx|csv|xlsx|xls)$/i.test(f.name)
    );
    update({ files: [...form.files, ...dropped] });
  }, [form.files]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).filter((f) => f.size <= MAX_FILE_SIZE);
    update({ files: [...form.files, ...selected] });
    e.target.value = '';
  };

  const removeFile = (idx: number) => update({ files: form.files.filter((_, i) => i !== idx) });

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

  const getFileIcon = (filename: string) => /\.(csv|xlsx|xls)$/i.test(filename) ? Table : FileText;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectedLang = LANGUAGES.find((l) => l.value === form.language)?.label ?? 'English';

  return (
    <div className="mx-auto max-w-2xl v4-animate-in">

      <button
        onClick={() => router.push('/chatbots')}
        className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to chatbots
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <IconChip><Mark size={16} /></IconChip>
        <div>
          <Eyebrow>New chatbot</Eyebrow>
          <h1
            className="font-display text-2xl font-medium text-ink mt-1"
            style={{ letterSpacing: '-0.02em' }}
          >
            Train a new agent
          </h1>
        </div>
      </div>

      <div className="mb-8">
        <StepIndicator currentStep={step} />
      </div>

      <div className="v4-card p-7 space-y-6">

        {/* Step 1 — Basics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Eyebrow>Step 01</Eyebrow>
              <h2
                className="font-display text-[18px] font-medium text-ink mt-2"
                style={{ letterSpacing: '-0.012em' }}
              >
                Name your chatbot.
              </h2>
              <p className="text-[13px] text-muted mt-1">Give your bot an identity.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted">Name <span className="text-[#EF4444]">*</span></label>
              <input
                type="text"
                placeholder="My support bot"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted">Description <span className="text-muted-soft">(optional)</span></label>
              <textarea
                placeholder="Describe what this chatbot does…"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={3}
                className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted">Language</label>
              <div className="relative">
                <select
                  value={form.language}
                  onChange={(e) => update({ language: e.target.value })}
                  className="w-full appearance-none bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Source type */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Eyebrow>Step 02</Eyebrow>
              <h2
                className="font-display text-[18px] font-medium text-ink mt-2"
                style={{ letterSpacing: '-0.012em' }}
              >
                Pick a source.
              </h2>
              <p className="text-[13px] text-muted mt-1">Choose what your chatbot learns from.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SourceCard icon={Globe}    title="Website" description="Crawl a website URL"           selected={form.sourceType === 'website'} onClick={() => update({ sourceType: 'website' })} />
              <SourceCard icon={FileText} title="Files"   description="Upload PDF, TXT, DOCX, CSV"     selected={form.sourceType === 'files'}   onClick={() => update({ sourceType: 'files' })} />
              <SourceCard icon={Type}     title="Text"    description="Paste text directly"            selected={form.sourceType === 'text'}    onClick={() => update({ sourceType: 'text' })} />
            </div>
          </div>
        )}

        {/* Step 3 — Configure */}
        {step === 3 && (
          <div className="space-y-5">
            {form.sourceType === 'website' && (
              <>
                <div>
                  <Eyebrow>Step 03</Eyebrow>
                  <h2
                    className="font-display text-[18px] font-medium text-ink mt-2"
                    style={{ letterSpacing: '-0.012em' }}
                  >
                    Drop in a website URL.
                  </h2>
                  <p className="text-[13px] text-muted mt-1">We&apos;ll crawl and index the content.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted">Website URL <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={form.websiteUrl}
                    onChange={(e) => update({ websiteUrl: e.target.value })}
                    className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                  />
                  <p className="text-[11px] text-muted-soft">We&apos;ll crawl this URL and use its content to train your chatbot.</p>
                </div>
              </>
            )}

            {form.sourceType === 'files' && (
              <>
                <div>
                  <Eyebrow>Step 03</Eyebrow>
                  <h2
                    className="font-display text-[18px] font-medium text-ink mt-2"
                    style={{ letterSpacing: '-0.012em' }}
                  >
                    Upload your files.
                  </h2>
                  <p className="text-[13px] text-muted mt-1">PDF, TXT, DOCX, CSV, XLSX — 10 MB max each.</p>
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line p-8 transition-colors hover:border-ink hover:bg-surface group"
                >
                  <div className="h-12 w-12 rounded-xl bg-surface border border-line flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-ink" />
                  </div>
                  <p className="text-[14px] font-medium text-ink">Drop files here or click to browse</p>
                  <p className="mt-1 text-[12px] text-muted-soft">PDF, TXT, DOCX, CSV, XLSX</p>
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
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-surface border border-line px-3.5 py-2.5">
                          <div className="flex items-center gap-2.5 text-[13px] min-w-0">
                            <Icon className="w-4 h-4 text-muted-soft shrink-0" />
                            <span className="text-ink truncate">{file.name}</span>
                            <span className="font-mono text-[11px] text-muted-soft shrink-0">{formatSize(file.size)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="ml-2 p-1 rounded text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
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
                  <Eyebrow>Step 03</Eyebrow>
                  <h2
                    className="font-display text-[18px] font-medium text-ink mt-2"
                    style={{ letterSpacing: '-0.012em' }}
                  >
                    Paste your content.
                  </h2>
                  <p className="text-[13px] text-muted mt-1">Your chatbot will be trained on this text.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted">Content <span className="text-[#EF4444]">*</span></label>
                  <textarea
                    placeholder="Paste your content here…"
                    value={form.text}
                    onChange={(e) => update({ text: e.target.value })}
                    rows={9}
                    className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors resize-none"
                  />
                  <p className="text-right text-[11px] text-muted-soft font-mono">{form.text.length.toLocaleString()} characters</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <Eyebrow>Step 04</Eyebrow>
              <h2
                className="font-display text-[18px] font-medium text-ink mt-2"
                style={{ letterSpacing: '-0.012em' }}
              >
                Review &amp; create.
              </h2>
              <p className="text-[13px] text-muted mt-1">One last look before we ship it.</p>
            </div>

            <div className="rounded-xl bg-surface/50 border border-line px-4">
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
              <div className="flex items-start gap-2.5 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/20 px-4 py-3">
                <X className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#EF4444]">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-ink text-white hover:bg-ink-hover rounded-lg py-2.5 text-[14px] font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating…</>) : (<><Bot className="w-4 h-4" />Create chatbot</>)}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex gap-3 pt-2 ${step === 4 && !loading ? 'justify-start' : 'justify-between'}`}>
          {step > 1 && (
            <Button variant="secondary" icon={ArrowLeft} onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          {step < 4 && (
            <button
              onClick={handleNext}
              disabled={!isStepValid(step)}
              className="ml-auto flex items-center gap-1.5 px-5 py-2 rounded-lg bg-ink text-white hover:bg-ink-hover text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
