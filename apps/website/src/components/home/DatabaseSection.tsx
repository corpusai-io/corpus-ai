'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ShoppingCart, Stethoscope, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Step { label: string; note: string }
interface TableResult { type: 'table'; headers: string[]; rows: [string, string, string][] }
interface ListResult  { type: 'list';  items: { label: string; detail: string }[] }
type Result = TableResult | ListResult;

interface Agent {
  id:          string;
  index:       string;
  icon:        typeof Database;
  label:       string;
  badge:       string;
  heading:     string;
  description: string;
  features:    string[];
  cta:         string;
  query:       string;
  steps:       Step[];
  result:      Result;
}

const AGENTS: Agent[] = [
  {
    id:          'database',
    index:       '01',
    icon:        Database,
    label:       'Database Agent',
    badge:       'SQL · Natural Language',
    heading:     'Query any database with natural language',
    description: 'Connect PostgreSQL, MySQL, MongoDB, or DynamoDB. Your agent translates plain questions into precise queries, returns structured results, and explains findings in clear English.',
    features: [
      'Read-only by default — your data stays safe',
      'Auto-generates optimised SQL from natural language',
      'Schema-aware — understands table relationships',
      'Returns results as tables or plain-English summaries',
    ],
    cta:   'Connect your database',
    query: 'How many orders did we complete last week?',
    steps: [
      { label: 'Parsing intent',    note: 'Aggregate count over time range' },
      { label: 'Reading schema',    note: 'orders table · 2.8 M rows detected' },
      { label: 'Generating query',  note: 'SELECT COUNT(*) WHERE status = completed' },
      { label: 'Executing',         note: '12 ms · read-only mode enforced' },
    ],
    result: {
      type:    'table',
      headers: ['Metric', 'Value', 'vs prior week'],
      rows: [
        ['Orders',    '2,847',    '+23 %'],
        ['Revenue',   '$184,320', '+18 %'],
        ['Avg order', '$64.72',   '−3 %'],
      ],
    },
  },
  {
    id:          'ecommerce',
    index:       '02',
    icon:        ShoppingCart,
    label:       'E-Commerce Agent',
    badge:       'RAG · Autonomous Actions',
    heading:     'Your smartest sales associate, 24 / 7',
    description: 'Combines deep product knowledge with autonomous actions — track orders, process returns, recommend products, and upsell intelligently, all within a single conversation.',
    features: [
      'Product recommendations from purchase history',
      'Real-time order tracking and status updates',
      'Automated returns, exchanges, and refund processing',
      'Contextual upsell and cross-sell suggestions',
    ],
    cta:   'Build your store agent',
    query: 'My left earbud stopped working after one week. Can I get a replacement?',
    steps: [
      { label: 'Looking up order',  note: '#ORD-7234 — Wireless Headphones Pro' },
      { label: 'Checking warranty', note: 'Purchased 6 days ago · within 30-day window' },
      { label: 'Creating order',    note: 'Replacement #ORD-7301 · free express shipping' },
      { label: 'Sending label',     note: 'Return label emailed to customer' },
    ],
    result: {
      type:  'list',
      items: [
        { label: 'Replacement created',  detail: 'Order #ORD-7301 · ships in 24 h' },
        { label: 'Return label sent',    detail: 'Email delivered to customer@email.com' },
        { label: 'No wait required',     detail: 'Keep using the right earbud in the meantime' },
        { label: 'Discount offered',     detail: '20 % off next purchase as an apology' },
      ],
    },
  },
  {
    id:          'healthcare',
    index:       '03',
    icon:        Stethoscope,
    label:       'Healthcare Agent',
    badge:       'Scheduling · Triage',
    heading:     'Patient support that never sleeps',
    description: 'HIPAA-aware AI that handles appointment scheduling, symptom pre-screening, insurance verification, and refill requests — reducing front-desk workload by 60 %.',
    features: [
      'Smart scheduling with provider matching',
      'Symptom pre-screening and urgency triage',
      'Insurance verification and copay estimation',
      'Prescription refill requests with pharmacy routing',
    ],
    cta:   'Build your healthcare agent',
    query: "I need to see a cardiologist. I've been having chest tightness after exercise.",
    steps: [
      { label: 'Triage assessment',  note: 'Priority: elevated · cardiac symptoms flagged' },
      { label: 'Verifying insurance', note: 'BlueCross PPO · cardiology covered' },
      { label: 'Matching provider',  note: 'Dr. Sarah Chen · Cardiology · in-network' },
      { label: 'Booking slot',       note: 'Tomorrow at 2:30 PM confirmed' },
    ],
    result: {
      type:  'list',
      items: [
        { label: 'Appointment booked',   detail: 'Dr. Sarah Chen · Tomorrow 2:30 PM' },
        { label: 'Location',             detail: 'City Medical Center, Suite 401' },
        { label: 'Estimated copay',      detail: '$35 · BlueCross PPO' },
        { label: 'Pre-visit forms sent', detail: 'Patient portal · confirmation emailed' },
      ],
    },
  },
];

// ─── Right-panel components ────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="bg-[#171717] text-white text-[13px] leading-relaxed rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]"
        style={{ letterSpacing: '-0.01em' }}
      >
        {text}
      </div>
    </div>
  );
}

function StepTrace({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start gap-3">
          {/* Number + connector */}
          <div className="flex flex-col items-center gap-1 pt-px flex-shrink-0">
            <div
              className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center flex-shrink-0"
              style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace' }}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px bg-[#E8E8E8]" style={{ minHeight: 14 }} />
            )}
          </div>
          {/* Content */}
          <div className="pb-1">
            <p className="text-[12px] font-semibold text-[#171717] leading-snug">{step.label}</p>
            <p className="text-[11px] text-[#A1A1A1] font-mono mt-0.5">{step.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultPanel({ result }: { result: Result }) {
  if (result.type === 'table') {
    return (
      <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-3 bg-[#F7F7F7] border-b border-[#E8E8E8]">
          {result.headers.map((h) => (
            <div
              key={h}
              className="px-2.5 sm:px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#A1A1A1]"
            >
              {h}
            </div>
          ))}
        </div>
        {/* Data rows */}
        {result.rows.map(([metric, value, change], i) => (
          <div
            key={metric}
            className={cn('grid grid-cols-3', i < result.rows.length - 1 && 'border-b border-[#E8E8E8]')}
          >
            <div className="px-2.5 sm:px-3 py-2.5 text-[12px] text-[#5C5C5C]">{metric}</div>
            <div className="px-2.5 sm:px-3 py-2.5 text-[12px] font-semibold text-[#171717]">{value}</div>
            <div className="px-2.5 sm:px-3 py-2.5 text-[12px] text-[#5C5C5C]">{change}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {result.items.map((item) => (
        <div key={item.label} className="flex items-start gap-2.5">
          <div className="mt-0.5 w-4 h-4 rounded-full bg-[#171717] flex items-center justify-center flex-shrink-0">
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          </div>
          <div>
            <span className="text-[12px] font-semibold text-[#171717]">{item.label}</span>
            <span className="text-[12px] text-[#5C5C5C]"> — {item.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScenarioPanel({ agent }: { agent: Agent }) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#E8E8E8] bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#171717] opacity-40" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#171717]" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1]">
            Agent · live trace
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#A1A1A1]">[{agent.index}] {agent.label}</span>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-5">
        {/* User message */}
        <UserBubble text={agent.query} />

        {/* Divider label */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E8E8E8]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1]">
            Agent reasoning
          </span>
          <div className="flex-1 h-px bg-[#E8E8E8]" />
        </div>

        {/* Step trace */}
        <StepTrace steps={agent.steps} />

        {/* Divider label */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E8E8E8]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1]">
            Result
          </span>
          <div className="flex-1 h-px bg-[#E8E8E8]" />
        </div>

        {/* Result */}
        <ResultPanel result={agent.result} />
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function DatabaseSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % AGENTS.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  const agent = AGENTS[active];
  const Icon  = agent.icon;

  return (
    <section className="py-16 md:py-28 px-4 sm:px-6 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#5C5C5C] shadow-sm mb-5">
            Agent Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-medium text-[#171717] tracking-[-0.02em]">
            See what your agent can do
          </h2>
          <p className="text-base font-[family-name:var(--font-inter)] font-normal text-[#5C5C5C] mt-4 max-w-2xl mx-auto leading-relaxed">
            From database queries to appointment booking — Corpus AI agents handle
            complex workflows across every industry.
          </p>
        </div>

        {/* ── Agent selector ──────────────────────────────────────── */}
        <div className="flex gap-2 mb-10 sm:mb-12 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {AGENTS.map((a, i) => {
            const AIcon = a.icon;
            const isActive = active === i;
            return (
              <button
                key={a.id}
                onClick={() => { setActive(i); setPaused(true); }}
                className={cn(
                  'relative flex flex-shrink-0 snap-start items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border',
                  isActive
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#5C5C5C] border-[#E8E8E8] hover:text-[#171717] hover:border-[#D4D4D4]',
                )}
              >
                <span
                  className={cn('font-mono text-[9px] font-semibold',
                    isActive ? 'text-white/40' : 'text-[#A1A1A1]')}
                >
                  [{a.index}]
                </span>
                <AIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{a.label}</span>
                <span className="sm:hidden">{a.label.replace(' Agent', '')}</span>
                {/* Progress underline */}
                {isActive && !paused && (
                  <motion.div
                    className="absolute bottom-0 left-3 right-3 h-px bg-white/40 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-white/70"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 6, ease: 'linear' }}
                      key={active}
                    />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Content grid ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
          >
            {/* Left — text content */}
            <div className="lg:pt-2">
              {/* Icon + badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4 text-[#171717]" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5C5C5C] bg-white border border-[#E8E8E8] px-3 py-1 rounded-full">
                  {agent.badge}
                </span>
              </div>

              {/* Heading */}
              <h3
                className="text-3xl md:text-4xl font-medium text-[#171717] tracking-[-0.02em] leading-tight"
              >
                {agent.heading}
              </h3>

              {/* Body */}
              <p className="text-[15px] font-[family-name:var(--font-inter)] text-[#5C5C5C] mt-4 leading-relaxed">
                {agent.description}
              </p>

              {/* Features */}
              <div className="mt-8 flex flex-col gap-3">
                {agent.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-[#171717] flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[13px] text-[#5C5C5C] leading-snug">{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/Sign-In"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#171717] hover:text-[#5C5C5C] transition-colors group"
                >
                  {agent.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right — scenario panel */}
            <ScenarioPanel agent={agent} />
          </motion.div>
        </AnimatePresence>

        {/* ── Dot nav ─────────────────────────────────────────────── */}
        <div className="flex justify-center gap-2 mt-12">
          {AGENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setPaused(true); }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                i === active ? 'bg-[#171717] w-6' : 'bg-[#D4D4D4] hover:bg-[#737373] w-1.5',
              )}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
