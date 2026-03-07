'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Database, Search, CreditCard, CheckCircle, ArrowRight, MessageSquare, Zap, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Rotating Personas ────────────────────────────────────────────────────────

const personas = [
  { label: 'E-commerce', text: 'Handle returns, refunds, and order tracking — without a support ticket.' },
  { label: 'SaaS Support', text: 'Resolve 80% of tickets before a human reads them.' },
  { label: 'Healthcare', text: 'Automate patient intake, scheduling, and triage 24/7.' },
  { label: 'Internal Teams', text: 'Query any database in plain English — no SQL required.' },
];

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
        text: 'Our return policy allows returns within 30 days. Items must be unused. Free return shipping on orders over $50. Refunds process in 3–5 business days.',
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
        text: 'Last week: 2,847 orders (+23% vs prior week). Top category: Electronics at 42% ($128K). Want a breakdown by day or region?',
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
        text: "Done. Refunded $49.99 to the Visa ending in 4242. Customer will see it in 3–5 business days. Confirmation sent, item flagged for quality review.",
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
            {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-[#D1D5DB] ml-auto flex-shrink-0" />}
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
          const t = setTimeout(() => setVisibleSteps(i + 1), step.delay);
          timeoutsRef.current.push(t);
        });
        const lastStep = scenario.steps[scenario.steps.length - 1];
        const autoT = setTimeout(() => {
          setActiveScenario((scenarioIndex + 1) % scenarios.length);
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

  const scenario = scenarios[activeScenario];
  const currentSteps = scenario.steps.slice(0, visibleSteps);

  return (
    <div className="v4-card rounded-2xl overflow-hidden shadow-lg shadow-[#7C3AED]/5">
      {/* Scenario Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB]">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { if (i !== activeScenario) setActiveScenario(i); }}
            className={`flex-1 px-3 py-3 text-xs font-medium transition-colors relative ${
              i === activeScenario ? 'text-[#111827] bg-white' : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            <span className={i === activeScenario ? s.labelColor : ''}>{s.label}</span>
            {i === activeScenario && (
              <motion.div layoutId="heroTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" transition={{ duration: 0.2 }} />
            )}
          </button>
        ))}
      </div>

      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center gap-3 bg-white">
        <img src="/logo_primary_circ.png" alt="Corpus AI" className="w-8 h-8 rounded-full object-contain" />
        <div>
          <div className="text-sm font-semibold text-[#111827]">Corpus AI Agent</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[10px] text-[#9CA3AF]">Online · Responding instantly</span>
          </div>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
            <Zap className="w-3 h-3 text-[#7C3AED]" />
            <span>Autonomous</span>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="px-5 py-5 min-h-[300px] flex flex-col justify-end bg-[#FAFAFA]">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div key={scenario.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
              {currentSteps.map((step, i) => {
                if (step.type === 'user') {
                  return (
                    <motion.div key={`u${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex justify-end">
                      <div className="bg-[#7C3AED] text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">{step.text}</div>
                    </motion.div>
                  );
                }
                if (step.type === 'typing') {
                  if (currentSteps.length > i + 1) return null;
                  return (
                    <motion.div key={`t${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5">
                      <img src="/logo_primary_circ.png" alt="" className="w-7 h-7 rounded-full object-contain flex-shrink-0" />
                      <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-md shadow-sm"><TypingDots /></div>
                    </motion.div>
                  );
                }
                if (step.type === 'workflow' && step.steps) {
                  return (
                    <motion.div key={`w${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex items-start gap-2.5">
                      <img src="/logo_primary_circ.png" alt="" className="w-7 h-7 rounded-full object-contain flex-shrink-0" />
                      <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] shadow-sm">
                        <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Agent Workflow</div>
                        <WorkflowSteps steps={step.steps} />
                      </div>
                    </motion.div>
                  );
                }
                if (step.type === 'bot') {
                  return (
                    <motion.div key={`b${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-start gap-2.5">
                      <img src="/logo_primary_circ.png" alt="" className="w-7 h-7 rounded-full object-contain flex-shrink-0" />
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

      {/* Input Bar */}
      <div className="px-5 pb-4 bg-white border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-3 mt-3">
          <span className="text-sm text-[#9CA3AF] flex-1">Ask your agent anything...</span>
          <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0, 0, 0.2, 1] as const } },
};

export default function HeroV4() {
  const [personaIndex, setPersonaIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  useEffect(() => {
    const t = setInterval(() => setPersonaIndex(i => (i + 1) % personas.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={sectionRef} className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="v4-hero-mesh absolute inset-0 pointer-events-none" />

      {/* Dot grid pattern — subtle */}
      <div className="absolute inset-0 v4-dot-grid pointer-events-none" />

      {/* Floating gradient orbs — visible warm wash like reference */}
      <motion.div
        className="v4-orb absolute -top-32 -left-16 w-[600px] h-[600px] opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, rgba(167,139,250,0.4) 40%, transparent 70%)', y: orbY, scale: orbScale }}
      />
      <motion.div
        className="v4-orb v4-orb-fast absolute -top-20 -right-24 w-[500px] h-[500px] opacity-[0.10]"
        style={{ background: 'radial-gradient(circle, #A78BFA 0%, rgba(139,92,246,0.3) 40%, transparent 70%)', y: orbY }}
      />
      <motion.div
        className="v4-orb absolute bottom-10 left-1/4 w-[400px] h-[400px] opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #F472B6 0%, rgba(244,114,182,0.3) 40%, transparent 70%)' }}
      />
      <motion.div
        className="v4-orb absolute -bottom-20 right-1/4 w-[350px] h-[350px] opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #FB923C 0%, rgba(251,146,60,0.3) 40%, transparent 70%)' }}
      />

      {/* Noise texture overlay */}
      <div className="v4-noise absolute inset-0 pointer-events-none opacity-50" />

      <motion.div
        className="relative max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Category badge with shimmer */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="v4-badge-shimmer inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#DDD6FE] text-[#7C3AED] text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            Agentic AI Platform
          </div>
        </motion.div>

        {/* Headline — bold words with luminous gradient like reference */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-[72px] font-bold tracking-[-0.03em] leading-[1.08] text-[#111827]"
        >
          Your customers{' '}
          <span className="v4-gradient-text-shine">ask.</span>
          <br />
          Your <span className="v4-gradient-text-shine">AI agent</span> acts.
        </motion.h1>

        {/* Rotating persona subtitle */}
        <motion.div variants={itemVariants} className="mt-7 h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={personaIndex}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed"
            >
              <span className="text-[#7C3AED] font-semibold">{personas[personaIndex].label}: </span>
              {personas[personaIndex].text}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Supporting line */}
        <motion.p variants={itemVariants} className="text-base text-[#9CA3AF] mt-4 max-w-xl mx-auto">
          Train on your data. Connect to your database. Deploy in 4 minutes. No ML expertise needed.
        </motion.p>

        {/* CTAs with enhanced hover effects */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <motion.a
            href="/Sign-In"
            className="v4-btn-glow inline-flex items-center gap-2 bg-[#7C3AED] text-white rounded-xl px-7 py-3.5 text-sm font-semibold cursor-pointer shadow-lg shadow-[#7C3AED]/20"
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(124,58,237,0.35)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Build Your First Agent — Free
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.a
            href="/demo"
            className="inline-flex items-center gap-2 border border-[#D1D5DB] text-[#374151] hover:border-[#DDD6FE] hover:text-[#7C3AED] rounded-xl px-7 py-3.5 text-sm font-semibold transition-colors cursor-pointer bg-white/80 backdrop-blur-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Watch 3-Min Demo
          </motion.a>
        </motion.div>

        {/* Trust signals */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mt-7 flex-wrap">
          {[
            { icon: '✓', text: '500+ teams' },
            { icon: '✓', text: 'SOC 2 compliant' },
            { icon: '✓', text: 'No credit card' },
            { icon: '✓', text: 'Free forever plan' },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
              <span className="text-[#7C3AED] font-semibold">{item.icon}</span>
              {item.text}
            </span>
          ))}
        </motion.div>

        {/* Product Preview with enhanced shadow */}
        <motion.div variants={itemVariants} className="mt-16 max-w-2xl mx-auto">
          <div className="relative">
            {/* Glow behind widget */}
            <div
              className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
              }}
            />
            <ChatWidget />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
