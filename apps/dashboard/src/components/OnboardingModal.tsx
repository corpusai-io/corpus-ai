'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Paintbrush, Rocket, BarChart3, ArrowRight, X, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  userName?: string;
  onComplete: () => void;
}

const FEATURES = [
  { icon: Bot,       title: 'Create Chatbots', description: 'Train AI chatbots on your documents, websites, or text' },
  { icon: Paintbrush,title: 'Customize',        description: "Match your chatbot's look and behavior to your brand" },
  { icon: Rocket,    title: 'Deploy Anywhere',  description: 'Embed on your website, Slack, Telegram, WhatsApp' },
  { icon: BarChart3, title: 'Track & Analyze',  description: 'Monitor conversations, collect leads, export data' },
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
    /* Backdrop */
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal */}
      <div
        className={`relative rounded-2xl border border-white/[0.08] bg-[#0E0E10] shadow-2xl shadow-black/80 transition-all duration-300 ${
          isWideStep ? 'w-full max-w-2xl' : 'w-full max-w-md'
        } ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ animation: isExiting ? undefined : 'fadeInUp 0.25s cubic-bezier(0,0,0.2,1) both' }}
      >
        {/* Purple glow top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BF56FF]/40 to-transparent rounded-t-2xl" />

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-lg text-[#3F3F46] hover:text-[#A1A1AA] hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
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

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pb-6">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-[#BF56FF]' : 'w-1.5 bg-white/[0.12] hover:bg-white/[0.20]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ userName, onNext }: { userName?: string; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-2xl bg-[#BF56FF]/15 border border-[#BF56FF]/25 flex items-center justify-center">
          <Bot className="h-8 w-8 text-[#BF56FF]" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-[#BF56FF] border-2 border-[#0E0E10] flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
        Welcome to Corpus AI{userName ? `, ${userName}` : ''}!
      </h2>
      <p className="text-[#71717A] text-sm max-w-xs mb-8">
        Build AI chatbots trained on your data in minutes
      </p>

      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 bg-white text-[#08080A] hover:bg-white/90 rounded-lg px-8 py-2.5 text-sm font-medium transition-colors"
      >
        Get Started
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function OverviewStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold text-white tracking-tight mb-1 text-center">
        What you can do
      </h2>
      <p className="text-sm text-[#71717A] mb-6 text-center">
        Everything you need to build and deploy AI chatbots
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] hover:border-white/[0.10] transition-all"
            >
              <div className="h-9 w-9 rounded-lg bg-[#BF56FF]/10 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-[#BF56FF]" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">{feature.title}</p>
              <p className="text-xs text-[#71717A] leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 bg-white text-[#08080A] hover:bg-white/90 rounded-lg px-8 py-2.5 text-sm font-medium transition-colors"
      >
        Next
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function CTAStep({
  onCreateNow, onExplore, onSkip,
}: { onCreateNow: () => void; onExplore: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-[#BF56FF]/15 border border-[#BF56FF]/25 flex items-center justify-center mb-5">
        <Rocket className="h-7 w-7 text-[#BF56FF]" />
      </div>

      <h2 className="text-xl font-bold text-white tracking-tight mb-2">
        Ready to create your first chatbot?
      </h2>
      <p className="text-sm text-[#71717A] mb-8 max-w-xs">
        It only takes a few minutes. Upload your documents, customize the look, and deploy.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-5">
        <button
          onClick={onCreateNow}
          className="flex flex-col items-center gap-2 rounded-xl bg-white hover:bg-white/90 p-5 text-[#08080A] transition-colors"
        >
          <Bot className="h-6 w-6" />
          <span className="text-sm font-semibold">Create Now</span>
        </button>
        <button
          onClick={onExplore}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#BF56FF]/30 p-5 text-[#A1A1AA] hover:text-white transition-all"
        >
          <BarChart3 className="h-6 w-6" />
          <span className="text-sm font-semibold">Explore Dashboard</span>
        </button>
      </div>

      <button
        onClick={onSkip}
        className="text-xs text-[#3F3F46] hover:text-[#71717A] transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}
