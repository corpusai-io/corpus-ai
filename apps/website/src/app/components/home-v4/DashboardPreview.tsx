'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, CreditCard, CheckCircle, ArrowRight, Zap, BarChart3, MessageSquare, Settings, FileText, Plug, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Scenarios ────────────────────────────────────────────────────────────────

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
          { icon: Search, label: 'Searching knowledge base', color: 'text-[#C084F5]', bgColor: 'bg-[#F3E8FF]' },
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
      { type: 'user', text: 'How many orders did we process last week?', delay: 0 },
      { type: 'typing', delay: 800 },
      {
        type: 'workflow',
        steps: [
          { icon: Database, label: 'Connecting to orders_db', color: 'text-[#4F46E5]', bgColor: 'bg-[#EEF2FF]' },
          { icon: Search, label: 'Running aggregation query', color: 'text-[#D97706]', bgColor: 'bg-[#FEF3C7]' },
          { icon: CheckCircle, label: 'Query completed', color: 'text-[#16A34A]', bgColor: 'bg-[#DCFCE7]' },
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
      { type: 'user', text: 'Refund order #4821 — customer received a damaged item.', delay: 0 },
      { type: 'typing', delay: 800 },
      {
        type: 'workflow',
        steps: [
          { icon: Search, label: 'Looking up order #4821', color: 'text-[#4F46E5]', bgColor: 'bg-[#EEF2FF]' },
          { icon: CreditCard, label: 'Processing refund — $49.99', color: 'text-[#D97706]', bgColor: 'bg-[#FEF3C7]' },
          { icon: CheckCircle, label: 'Refund issued — email sent', color: 'text-[#16A34A]', bgColor: 'bg-[#DCFCE7]' },
        ],
        delay: 1600,
      },
      {
        type: 'bot',
        text: "Done. Refunded $49.99 to the Visa ending in 4242. Customer will see it in 3–5 business days. Confirmation sent.",
        delay: 3400,
      },
    ],
  },
];

// ─── Typing dots ──────────────────────────────────────────────────────────────

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
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.25, duration: 0.2 }}
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

// ─── Sidebar nav items ────────────────────────────────────────────────────────

const navItems = [
  { icon: MessageSquare, label: 'Chatbots', active: true },
  { icon: BarChart3, label: 'Analytics' },
  { icon: FileText, label: 'Sources' },
  { icon: Plug, label: 'Integrations' },
  { icon: Users, label: 'Leads' },
  { icon: Settings, label: 'Settings' },
];

// ─── Chat panel ───────────────────────────────────────────────────────────────

function ChatPanel() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null; }
  }, []);

  const runScenario = useCallback((idx: number) => {
    clearAllTimeouts();
    setIsTransitioning(true);
    setVisibleSteps(0);
    const start = setTimeout(() => {
      setIsTransitioning(false);
      const scenario = scenarios[idx];
      scenario.steps.forEach((step, i) => {
        const t = setTimeout(() => setVisibleSteps(i + 1), step.delay);
        timeoutsRef.current.push(t);
      });
      const lastStep = scenario.steps[scenario.steps.length - 1];
      const auto = setTimeout(() => {
        setActiveScenario((idx + 1) % scenarios.length);
      }, lastStep.delay + 4000);
      autoAdvanceRef.current = auto;
      timeoutsRef.current.push(auto);
    }, 300);
    timeoutsRef.current.push(start);
  }, [clearAllTimeouts]);

  useEffect(() => {
    runScenario(activeScenario);
    return clearAllTimeouts;
  }, [activeScenario, runScenario, clearAllTimeouts]);

  const scenario = scenarios[activeScenario];
  const currentSteps = scenario.steps.slice(0, visibleSteps);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Chat header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/logo_primary_circ.png" alt="Corpus AI" className="w-7 h-7 rounded-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <p className="text-xs font-semibold text-[#111827]">Corpus AI Agent</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-[10px] text-[#9CA3AF]">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
          <Zap className="w-3 h-3 text-[#C084F5]" />
          <span>Autonomous</span>
        </div>
      </div>

      {/* Scenario tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB] flex-shrink-0">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { if (i !== activeScenario) setActiveScenario(i); }}
            className={`flex-1 px-2 py-2.5 text-[10px] font-medium transition-colors relative ${i === activeScenario ? 'text-[#111827] bg-white' : 'text-[#9CA3AF]'}`}
          >
            <span className={i === activeScenario ? s.labelColor : ''}>{s.label}</span>
            {i === activeScenario && (
              <motion.div layoutId="previewTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C084F5]" transition={{ duration: 0.2 }} />
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-4 py-4">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div key={scenario.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
              {currentSteps.map((step, i) => {
                if (step.type === 'user') return (
                  <motion.div key={`u${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <div className="bg-[#C084F5] text-white rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%] text-xs leading-relaxed">{step.text}</div>
                  </motion.div>
                );
                if (step.type === 'typing' && currentSteps.length === i + 1) return (
                  <motion.div key={`t${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F3E8FF] flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-[#C084F5]" />
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-sm shadow-sm"><TypingDots /></div>
                  </motion.div>
                );
                if (step.type === 'workflow' && step.steps) return (
                  <motion.div key={`w${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F3E8FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-[#C084F5]" />
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-sm px-3 py-2.5 max-w-[80%] shadow-sm">
                      <p className="text-[9px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Agent Workflow</p>
                      <WorkflowSteps steps={step.steps} />
                    </div>
                  </motion.div>
                );
                if (step.type === 'bot') return (
                  <motion.div key={`b${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F3E8FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-[#C084F5]" />
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-sm px-3 py-2.5 max-w-[80%] shadow-sm">
                      <p className="text-xs text-[#374151] leading-relaxed">{step.text}</p>
                    </div>
                  </motion.div>
                );
                return null;
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-[#E5E7EB] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-3 py-2">
          <span className="text-xs text-[#9CA3AF] flex-1">Ask your agent anything...</span>
          <div className="w-6 h-6 rounded-lg bg-[#C084F5] flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────

function StatsPanel() {
  return (
    <div className="hidden xl:flex flex-col w-44 flex-shrink-0 border-l border-[#E5E7EB] bg-white">
      <div className="px-4 py-3.5 border-b border-[#E5E7EB]">
        <p className="text-[9px] font-semibold text-[#9CA3AF] uppercase tracking-wider">This Week</p>
      </div>
      <div className="px-4 py-4 space-y-4">
        {[
          { label: 'Total Chats', value: '2,847', change: '+12%' },
          { label: 'Leads Captured', value: '341', change: '+8%' },
          { label: 'Avg Response', value: '1.2s', change: '-0.3s' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[9px] text-[#9CA3AF] font-medium mb-0.5">{stat.label}</p>
            <p className="text-sm font-bold text-[#111827]">{stat.value}</p>
            <p className="text-[10px] font-medium text-emerald-600">{stat.change}</p>
          </div>
        ))}
        <div className="pt-3 border-t border-[#E5E7EB] space-y-3">
          <p className="text-[9px] text-[#9CA3AF] font-semibold uppercase tracking-wider">Top Sources</p>
          {[
            { name: 'Website', pct: 68 },
            { name: 'PDF Docs', pct: 22 },
            { name: 'API', pct: 10 },
          ].map((s) => (
            <div key={s.name}>
              <div className="flex justify-between text-[10px] text-[#6B7280] mb-1">
                <span>{s.name}</span><span>{s.pct}%</span>
              </div>
              <div className="h-1 bg-[#F3F4F6] rounded-full">
                <div className="h-full bg-[#C084F5] rounded-full" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Preview ───────────────────────────────────────────────────

export default function DashboardPreview() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div
        className="rounded-2xl overflow-hidden border border-[#E5E7EB]"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05)' }}
      >
        {/* Browser chrome */}
        <div className="bg-[#F2F2F2] border-b border-[#E5E7EB] px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 max-w-xs mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-[11px] text-[#9CA3AF] flex items-center gap-1.5">
              <svg className="w-3 h-3 text-[#D1D5DB] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              app.corpus.ai/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="flex h-[420px] sm:h-[480px]">
          {/* Sidebar */}
          <div className="w-44 border-r border-[#E5E7EB] bg-white flex flex-col flex-shrink-0">
            <div className="px-4 py-3.5 border-b border-[#E5E7EB]">
              <img src="/logo.svg" alt="Corpus AI" className="h-5 w-auto" />
            </div>

            {/* Active bot indicator */}
            <div className="px-3 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2 bg-[#FAF5FF] border border-[#E9D5FF] rounded-lg px-2.5 py-2">
                <div className="w-5 h-5 rounded-full bg-[#C084F5] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#111827] truncate">Website Bot</p>
                  <p className="text-[9px] text-[#C084F5] font-medium">Active</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-2 py-2 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium cursor-default ${
                      item.active ? 'bg-[#FAF5FF] text-[#C084F5]' : 'text-[#9CA3AF]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {item.label}
                  </div>
                );
              })}
            </nav>

            <div className="px-3 py-3 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C084F5] to-[#9333EA] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                  J
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#374151] truncate">John Smith</p>
                  <p className="text-[9px] text-[#9CA3AF] truncate">john@acme.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatPanel />
          </div>

          {/* Stats panel */}
          <StatsPanel />
        </div>
      </div>
    </div>
  );
}
