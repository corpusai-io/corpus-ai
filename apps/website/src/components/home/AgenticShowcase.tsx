'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import { Brain, Plug, Zap, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridPattern } from '@/components/ui/grid-pattern';

// ─── Scroll-scrubbed headline ─────────────────────────────────────────────────

function ScrollWord({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const color = useTransform(progress, range, ['#D4D4D4', '#171717']);
  return (
    <motion.span style={{ color }} className="transition-none">
      {children}{' '}
    </motion.span>
  );
}

function ScrollHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.4'],
  });

  const words = ['Your', 'chatbot', 'answers', 'questions.', '\n', 'Your', 'AI', 'agent', 'resolves', 'them.'];

  return (
    <h2
      ref={ref}
      className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.02em] leading-tight"
    >
      {words.map((word, i) => {
        if (word === '\n') return <br key={i} className="hidden md:block" />;
        const total = words.filter((w) => w !== '\n').length;
        const textWords = words.filter((w) => w !== '\n');
        const wordIndex = textWords.indexOf(word, i === 0 ? 0 : textWords.indexOf(word));
        const start = wordIndex / total;
        const end = (wordIndex + 1) / total;
        return (
          <ScrollWord key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </ScrollWord>
        );
      })}
    </h2>
  );
}

// ─── Capability visuals ───────────────────────────────────────────────────────

function ReasoningVisual() {
  const steps = [
    { label: 'Parse intent', sub: 'Identify query type and required data' },
    { label: 'Retrieve context', sub: 'Search knowledge base · 3 docs matched' },
    { label: 'Reason through steps', sub: 'Cross-reference data → synthesise answer' },
    { label: 'Generate response', sub: 'Ground output · confidence 97%' },
  ];
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4, ease: [0, 0, 0.2, 1] }}
          className="flex items-start gap-3"
        >
          {/* Step number / connector */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <div
              className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center flex-shrink-0"
              style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace' }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-[#E8E8E8]" style={{ minHeight: 16 }} />
            )}
          </div>
          {/* Content */}
          <div className="pb-3">
            <p className="text-[13px] font-semibold text-[#171717] leading-tight">{step.label}</p>
            <p className="text-[11px] text-[#A1A1A1] mt-0.5 font-mono">{step.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ToolVisual() {
  const calls = [
    { method: 'GET',  endpoint: '/api/customers/4821',    status: 200, time: '38ms' },
    { method: 'POST', endpoint: '/api/tickets/create',     status: 201, time: '124ms' },
    { method: 'POST', endpoint: '/api/email/notify',       status: 200, time: '61ms' },
    { method: 'PUT',  endpoint: '/crm/deals/1042/stage',   status: 200, time: '55ms' },
  ];
  const methodColor: Record<string, string> = {
    GET: 'text-[#3B82F6]',
    POST: 'text-[#10B981]',
    PUT: 'text-[#F59E0B]',
  };
  return (
    <div className="flex flex-col gap-2">
      {calls.map((call, i) => (
        <motion.div
          key={call.endpoint}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.35, ease: [0, 0, 0.2, 1] }}
          className="flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-lg px-3 py-2"
        >
          <span className={cn('font-mono text-[10px] font-bold w-8 flex-shrink-0', methodColor[call.method])}>
            {call.method}
          </span>
          <span className="font-mono text-[11px] text-[#737373] flex-1 truncate">{call.endpoint}</span>
          <span className="font-mono text-[10px] text-[#A1A1A1] flex-shrink-0">{call.time}</span>
          <span className="font-mono text-[10px] text-[#10B981] font-semibold flex-shrink-0">
            {call.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ActionsVisual() {
  const actions = [
    { icon: CheckCircle, color: 'text-[#10B981]', label: 'Refund processed', value: '$49.99 → Sarah Chen', time: 'just now' },
    { icon: CheckCircle, color: 'text-[#10B981]', label: 'Meeting scheduled', value: 'Thu 2pm · Google Meet', time: '12s ago' },
    { icon: CheckCircle, color: 'text-[#10B981]', label: 'Ticket escalated', value: 'Priority: high → Team lead', time: '28s ago' },
    { icon: Clock,        color: 'text-[#F59E0B]', label: 'Follow-up queued', value: 'Email in 24h · template A',  time: 'queued' },
  ];
  return (
    <div className="flex flex-col gap-2">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease: [0, 0, 0.2, 1] }}
            className="flex items-center gap-3 bg-white border border-[#E8E8E8] rounded-lg px-3 py-2.5"
          >
            <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', action.color)} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#171717] leading-tight">{action.label}</p>
              <p className="text-[10px] text-[#A1A1A1] mt-0.5 truncate">{action.value}</p>
            </div>
            <span className="font-mono text-[10px] text-[#A1A1A1] flex-shrink-0">{action.time}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Tab data ─────────────────────────────────────────────────────────────────

const tabs = [
  {
    id: 'reasoning',
    index: '01',
    icon: Brain,
    title: 'Multi-Step Reasoning',
    body: 'Your agent breaks complex queries into sub-tasks, reasons through each step, and synthesises a coherent answer — grounded in your data, never hallucinated.',
    visual: ReasoningVisual,
  },
  {
    id: 'tools',
    index: '02',
    icon: Plug,
    title: 'Tool & API Execution',
    body: 'Your agent calls external APIs, triggers webhooks, sends emails, updates CRMs, and executes custom functions — all within a single conversation turn.',
    visual: ToolVisual,
  },
  {
    id: 'actions',
    index: '03',
    icon: Zap,
    title: 'Autonomous Actions',
    body: 'Configure guardrails and let your agent act independently — schedule meetings, process refunds, escalate issues — all within the boundaries you define.',
    visual: ActionsVisual,
  },
] as const;

// ─── Section ──────────────────────────────────────────────────────────────────

export default function AgenticShowcase() {
  const [active, setActive] = useState<number>(0);

  // Auto-cycle every 4s, pause on manual select
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % tabs.length), 4000);
    return () => clearInterval(id);
  }, [paused]);

  const tab = tabs[active];
  const Visual = tab.visual;

  return (
    <section className="py-16 md:py-28 px-4 sm:px-6 bg-[#F7F7F7] relative overflow-hidden">
      {/* ── Grid background ─────────────────────────────────────── */}
      <GridPattern
        width={32}
        height={32}
        x={-1}
        y={-1}
        className={cn(
          'fill-[#171717]/[0.018] stroke-[#171717]/[0.06]',
          '[mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,white,transparent)]',
        )}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-full px-4 py-1.5 text-sm text-[#737373] shadow-sm mb-5">
            <Zap className="w-3.5 h-3.5 text-[#171717]" />
            Agents, not chatbots
          </span>
          <ScrollHeading />
          <p className="text-base font-[family-name:var(--font-inter)] font-normal text-[#737373] mt-5 max-w-2xl mx-auto leading-relaxed">
            Chatbots follow scripts. Corpus AI agents reason through complexity,
            query live data, and take real action — all within guardrails you define.
          </p>
        </div>

        {/* ── Interactive Panel ───────────────────────────────────── */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">

            {/* Left — tab list */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#E8E8E8] p-4 sm:p-6 flex flex-col gap-3">
              {tabs.map((t, i) => {
                const Icon = t.icon;
                const isActive = active === i;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActive(i); setPaused(true); }}
                    className={cn(
                      'group w-full text-left rounded-xl px-4 py-4 transition-all duration-200 border',
                      isActive
                        ? 'bg-[#171717] border-[#171717]'
                        : 'bg-transparent border-transparent hover:bg-[#F7F7F7] hover:border-[#E8E8E8]',
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {/* Monospace index */}
                      <span
                        className={cn(
                          'font-mono text-[10px] font-semibold tracking-wider',
                          isActive ? 'text-white/50' : 'text-[#A1A1A1]',
                        )}
                      >
                        [{t.index}]
                      </span>
                      <Icon
                        className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[#737373]')}
                      />
                      {/* Progress bar (auto-cycle indicator) */}
                      {isActive && !paused && (
                        <div className="flex-1 h-px bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white/60 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 4, ease: 'linear' }}
                            key={active}
                          />
                        </div>
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-[14px] font-semibold tracking-[-0.012em] leading-snug',
                        isActive ? 'text-white' : 'text-[#171717]',
                      )}
                    >
                      {t.title}
                    </p>
                    <p
                      className={cn(
                        'text-[12px] mt-1.5 leading-relaxed line-clamp-2',
                        isActive ? 'text-white/60' : 'text-[#A1A1A1]',
                      )}
                    >
                      {t.body}
                    </p>
                    {isActive && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-white/70">
                        See how it works <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right — animated visual */}
            <div className="p-4 sm:p-8 bg-[#FAFAFA] flex flex-col justify-center min-h-[300px] sm:min-h-[360px]">
              {/* Panel header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[11px] font-mono text-[#A1A1A1] uppercase tracking-wider">
                    Agent · Live trace
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#A1A1A1]">
                  [{tab.index}] {tab.title}
                </span>
              </div>

              {/* Visual area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
                >
                  <Visual />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
