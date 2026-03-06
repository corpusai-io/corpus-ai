'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, CreditCard, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Scenario Types ───────────────────────────────────────────────────────────

interface WorkflowStep {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
}

interface ChatStep {
  type: 'user' | 'typing' | 'workflow' | 'bot';
  text?: string;
  steps?: WorkflowStep[];
  delay: number;
}

interface Scenario {
  id: string;
  label: string;
  labelColor: string;
  steps: ChatStep[];
}

// ─── 3 Scenarios ─────────────────────────────────────────────────────────────

const scenarios: Scenario[] = [
  {
    id: 'rag',
    label: 'Knowledge Base',
    labelColor: 'text-[#16A34A]',
    steps: [
      { type: 'user', text: 'What is your return policy for online orders?', delay: 0 },
      { type: 'typing', delay: 800 },
      {
        type: 'workflow',
        steps: [
          { icon: Search, label: 'Searching knowledge base', color: 'text-[#7C3AED]', bgColor: 'bg-[#EDE9FE]' },
          { icon: CheckCircle, label: '3 relevant documents found', color: 'text-[#16A34A]', bgColor: 'bg-[#DCFCE7]' },
        ],
        delay: 1600,
      },
      {
        type: 'bot',
        text: 'Our return policy allows returns within 30 days of purchase. Items must be unused and in original packaging. Free return shipping is included for all orders over $50. Refunds are processed within 3–5 business days after we receive the item.',
        delay: 2800,
      },
    ],
  },
  {
    id: 'database',
    label: 'Database Agent',
    labelColor: 'text-[#4F46E5]',
    steps: [
      { type: 'user', text: 'How many orders did we process last week and what was the top category?', delay: 0 },
      { type: 'typing', delay: 800 },
      {
        type: 'workflow',
        steps: [
          { icon: Database, label: 'Connecting to orders_db', color: 'text-[#4F46E5]', bgColor: 'bg-[#EEF2FF]' },
          { icon: Search, label: 'Running aggregation query', color: 'text-[#D97706]', bgColor: 'bg-[#FEF3C7]' },
          { icon: CheckCircle, label: 'Query completed — 2 tables scanned', color: 'text-[#16A34A]', bgColor: 'bg-[#DCFCE7]' },
        ],
        delay: 1600,
      },
      {
        type: 'bot',
        text: 'Last week we processed 2,847 orders — a 23% increase from the prior week. The top category was Electronics at 42% ($128K revenue), followed by Home & Garden at 28% ($81K). Would you like a breakdown by day or by region?',
        delay: 3200,
      },
    ],
  },
  {
    id: 'action',
    label: 'Autonomous Action',
    labelColor: 'text-[#DB2777]',
    steps: [
      { type: 'user', text: 'Refund order #4821 — the customer received a damaged item.', delay: 0 },
      { type: 'typing', delay: 800 },
      {
        type: 'workflow',
        steps: [
          { icon: Search, label: 'Looking up order #4821', color: 'text-[#4F46E5]', bgColor: 'bg-[#EEF2FF]' },
          { icon: CreditCard, label: 'Processing refund — $49.99 → Visa ending 4242', color: 'text-[#D97706]', bgColor: 'bg-[#FEF3C7]' },
          { icon: CheckCircle, label: 'Refund issued — confirmation email sent', color: 'text-[#16A34A]', bgColor: 'bg-[#DCFCE7]' },
        ],
        delay: 1600,
      },
      {
        type: 'bot',
        text: "Done! I've refunded $49.99 to the Visa ending in 4242. The customer will see it in 3–5 business days. I also sent a confirmation email and flagged the item for quality review. Anything else?",
        delay: 3400,
      },
    ],
  },
];

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="v3-typing-dot w-1.5 h-1.5 bg-[#9CA3AF] rounded-full" />
      <span className="v3-typing-dot w-1.5 h-1.5 bg-[#9CA3AF] rounded-full" />
      <span className="v3-typing-dot w-1.5 h-1.5 bg-[#9CA3AF] rounded-full" />
    </div>
  );
}

// ─── Workflow Steps ───────────────────────────────────────────────────────────

function WorkflowSteps({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="space-y-2 py-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3, duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <div className={`w-6 h-6 rounded-md ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-3.5 h-3.5 ${step.color}`} />
            </div>
            <span className="text-xs text-[#6B7280]">{step.label}</span>
            {i < steps.length - 1 && (
              <ArrowRight className="w-3 h-3 text-[#D1D5DB] ml-auto flex-shrink-0" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Chat Widget ──────────────────────────────────────────────────────────────

function ChatWidget() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  const runScenario = useCallback(
    (scenarioIndex: number) => {
      clearAllTimeouts();
      setIsTransitioning(true);
      setVisibleSteps(0);

      const startTimeout = setTimeout(() => {
        setIsTransitioning(false);
        const scenario = scenarios[scenarioIndex];

        scenario.steps.forEach((step, i) => {
          const t = setTimeout(() => {
            setVisibleSteps(i + 1);
          }, step.delay);
          timeoutsRef.current.push(t);
        });

        const lastStep = scenario.steps[scenario.steps.length - 1];
        const autoT = setTimeout(() => {
          const next = (scenarioIndex + 1) % scenarios.length;
          setActiveScenario(next);
        }, lastStep.delay + 4000);
        autoAdvanceRef.current = autoT;
        timeoutsRef.current.push(autoT);
      }, 300);

      timeoutsRef.current.push(startTimeout);
    },
    [clearAllTimeouts]
  );

  useEffect(() => {
    runScenario(activeScenario);
    return clearAllTimeouts;
  }, [activeScenario, runScenario, clearAllTimeouts]);

  const handleTabClick = (i: number) => {
    if (i === activeScenario) return;
    setActiveScenario(i);
  };

  const scenario = scenarios[activeScenario];
  const currentSteps = scenario.steps.slice(0, visibleSteps);

  return (
    <div className="v4-card rounded-2xl overflow-hidden">
      {/* Scenario Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB]">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => handleTabClick(i)}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors relative ${
              i === activeScenario ? 'text-[#111827] bg-white' : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            <span className={i === activeScenario ? s.labelColor : ''}>{s.label}</span>
            {i === activeScenario && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center gap-3 bg-white">
        <img src="/logo_primary_circ.png" alt="Corpus AI" className="w-8 h-8 rounded-full object-contain" />
        <div>
          <div className="text-sm font-medium text-[#111827]">Corpus AI Agent</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[10px] text-[#9CA3AF]">Online</span>
          </div>
        </div>
        <div className="ml-auto">
          <MessageSquare className="w-4 h-4 text-[#D1D5DB]" />
        </div>
      </div>

      {/* Chat Body */}
      <div className="px-5 py-5 min-h-[320px] flex flex-col justify-end bg-[#FAFAFA]">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {currentSteps.map((step, i) => {
                if (step.type === 'user') {
                  return (
                    <motion.div
                      key={`user-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-end"
                    >
                      <div className="bg-[#7C3AED] text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">
                        {step.text}
                      </div>
                    </motion.div>
                  );
                }

                if (step.type === 'typing') {
                  const nextStepVisible = currentSteps.length > i + 1;
                  if (nextStepVisible) return null;
                  return (
                    <motion.div
                      key={`typing-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2.5"
                    >
                      <img src="/logo_primary_circ.png" alt="Corpus AI" className="w-7 h-7 rounded-full object-contain flex-shrink-0" />
                      <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-md shadow-sm">
                        <TypingDots />
                      </div>
                    </motion.div>
                  );
                }

                if (step.type === 'workflow' && step.steps) {
                  return (
                    <motion.div
                      key={`workflow-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-2.5"
                    >
                      <img src="/logo_primary_circ.png" alt="Corpus AI" className="w-7 h-7 rounded-full object-contain flex-shrink-0" />
                      <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] shadow-sm">
                        <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                          Agent Workflow
                        </div>
                        <WorkflowSteps steps={step.steps} />
                      </div>
                    </motion.div>
                  );
                }

                if (step.type === 'bot') {
                  return (
                    <motion.div
                      key={`bot-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-2.5"
                    >
                      <img src="/logo_primary_circ.png" alt="Corpus AI" className="w-7 h-7 rounded-full object-contain flex-shrink-0" />
                      <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-sm text-[#374151] leading-relaxed">{step.text}</p>
                      </div>
                    </motion.div>
                  );
                }

                return null;
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Input (decorative) */}
      <div className="px-5 pb-4 bg-white border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-3 mt-3">
          <span className="text-sm text-[#9CA3AF] flex-1">Ask your agent anything...</span>
          <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

export default function HeroV4() {
  return (
    <section className="relative pt-40 pb-24 px-6 text-center">
      {/* Background glow */}
      <div className="v4-glow-hero absolute inset-0 pointer-events-none" />

      <motion.div
        className="relative max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#DDD6FE] bg-[#EDE9FE] text-[#7C3AED] text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
            Introducing Agentic AI
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-[#111827]"
        >
          AI that doesn&apos;t just chat.
          <br />
          It{' '}
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4F46E5] bg-clip-text text-transparent">
            acts
          </span>
          .
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[#6B7280] mt-6 max-w-2xl mx-auto leading-relaxed"
        >
          Build AI agents that query your databases, execute workflows, and resolve customer issues — all autonomously.
          Trained on your data. Deployed in minutes.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/Sign-In"
            className="bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-lg px-6 py-3 text-sm font-medium transition-colors shadow-sm shadow-[#7C3AED]/20"
          >
            Build Your First Agent
          </Link>
          <Link
            href="/demo"
            className="border border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6] rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            Watch Demo
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p variants={itemVariants} className="text-sm text-[#9CA3AF] mt-4">
          Free forever plan · No credit card required · Live in 4 minutes
        </motion.p>

        {/* Chat Widget Demo */}
        <motion.div variants={itemVariants} className="mt-16 max-w-2xl mx-auto">
          <ChatWidget />
        </motion.div>
      </motion.div>
    </section>
  );
}
