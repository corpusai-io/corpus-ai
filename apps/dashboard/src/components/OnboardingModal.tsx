'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Paintbrush, Rocket, BarChart3, ArrowRight, X } from 'lucide-react';
import { Eyebrow, Mark, IconChip, Button, Divider } from '@/components/corpus';

interface OnboardingModalProps {
  userName?: string;
  onComplete: () => void;
}

const FEATURES = [
  { icon: Bot,        title: 'Create chatbots',  description: 'Train agents on your documents, websites, or raw text.' },
  { icon: Paintbrush, title: 'Customize',         description: 'Match your chatbot to your brand — copy, behaviour, look.' },
  { icon: Rocket,     title: 'Deploy anywhere',   description: 'Embed widget, Slack, Telegram, WhatsApp, REST API.' },
  { icon: BarChart3,  title: 'Track & analyze',   description: 'Conversations, leads, exports — all in one workspace.' },
];

export default function OnboardingModal({ userName, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onComplete(), 200);
  }, [onComplete]);

  const handleCreateNow = useCallback(() => {
    onComplete();
    router.push('/chatbots/create');
  }, [onComplete, router]);

  const handleExploreDashboard = useCallback(() => {
    onComplete();
    router.push('/chatbots');
  }, [onComplete, router]);

  const isWideStep = step === 1;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(15, 15, 15, 0.32)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`relative rounded-2xl border border-line bg-canvas shadow-lg transition-all duration-300 ${
          isWideStep ? 'w-full max-w-2xl' : 'w-full max-w-md'
        } ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ animation: isExiting ? undefined : 'fadeInUp 0.25s cubic-bezier(0,0,0.2,1) both' }}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          {step === 0 && <WelcomeStep userName={userName} onNext={() => setStep(1)} />}
          {step === 1 && <OverviewStep onNext={() => setStep(2)} />}
          {step === 2 && (
            <CTAStep
              onCreateNow={handleCreateNow}
              onExplore={handleExploreDashboard}
              onSkip={handleClose}
            />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 pb-6">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-ink' : 'w-1.5 bg-line hover:bg-line-strong'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 0 ─────────────────────────────────────────────── */
function WelcomeStep({ userName, onNext }: { userName?: string; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <IconChip size={56} className="mb-6"><Mark size={22} /></IconChip>

      <Eyebrow className="mb-2">Welcome</Eyebrow>
      <h2
        className="font-display text-2xl md:text-[28px] font-medium leading-tight"
        style={{ letterSpacing: '-0.02em' }}
      >
        <span className="text-ink">Hey{userName ? `, ${userName}` : ''}.</span>{' '}
        <span className="text-muted">Let&apos;s get you set up.</span>
      </h2>

      <p className="text-[13px] text-muted max-w-xs mt-4 mb-8 leading-relaxed">
        Build AI chatbots trained on your data — in minutes, not weeks.
      </p>

      <Button variant="primary" iconAfter={ArrowRight} onClick={onNext}>
        Get started
      </Button>
    </div>
  );
}

/* ─── Step 1 ─────────────────────────────────────────────── */
function OverviewStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <Eyebrow>What you can do</Eyebrow>
      <h2
        className="font-display text-xl md:text-2xl font-medium leading-tight mt-2 text-center"
        style={{ letterSpacing: '-0.02em' }}
      >
        <span className="text-ink">Four moves.</span>{' '}
        <span className="text-muted">One workspace.</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6 mb-8">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="v4-card v4-animate-in p-4"
              style={{ animationDelay: `${60 + i * 60}ms` }}
            >
              <IconChip size={32}>
                <Icon className="w-4 h-4 text-ink" />
              </IconChip>
              <p
                className="font-display text-[14px] font-medium text-ink mt-3"
                style={{ letterSpacing: '-0.012em' }}
              >
                {feature.title}
              </p>
              <p className="text-[12px] text-muted leading-relaxed mt-1">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <Button variant="primary" iconAfter={ArrowRight} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}

/* ─── Step 2 ─────────────────────────────────────────────── */
function CTAStep({
  onCreateNow, onExplore, onSkip,
}: { onCreateNow: () => void; onExplore: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <IconChip size={48} className="mb-5">
        <Rocket className="w-5 h-5 text-ink" />
      </IconChip>

      <Eyebrow>You&apos;re ready</Eyebrow>
      <h2
        className="font-display text-xl md:text-2xl font-medium leading-tight mt-2"
        style={{ letterSpacing: '-0.02em' }}
      >
        <span className="text-ink">Build your first agent.</span>{' '}
        <span className="text-muted">A few minutes — that&apos;s it.</span>
      </h2>

      <p className="text-[13px] text-muted mt-3 mb-7 max-w-xs">
        Upload documents, customize the look, deploy it where your users are.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
        <button
          onClick={onCreateNow}
          className="flex flex-col items-start gap-3 rounded-xl bg-ink hover:bg-ink-hover p-5 text-left text-white transition-colors"
        >
          <Bot className="w-5 h-5" />
          <span
            className="font-display text-[15px] font-medium"
            style={{ letterSpacing: '-0.012em' }}
          >
            Create chatbot
          </span>
          <span className="text-[12px] text-white/70">Walk through the wizard now.</span>
        </button>
        <button
          onClick={onExplore}
          className="flex flex-col items-start gap-3 rounded-xl border border-line bg-canvas hover:bg-surface p-5 text-left text-ink transition-colors"
        >
          <BarChart3 className="w-5 h-5 text-ink" />
          <span
            className="font-display text-[15px] font-medium"
            style={{ letterSpacing: '-0.012em' }}
          >
            Explore first
          </span>
          <span className="text-[12px] text-muted">Look around, come back later.</span>
        </button>
      </div>

      <Divider className="my-6" />

      <button onClick={onSkip} className="text-[12px] text-muted hover:text-ink transition-colors">
        Skip for now
      </button>
    </div>
  );
}
