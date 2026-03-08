'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  BarChart3,
  Database,
  Users,
  Rocket,
  Settings,
  Search,
  CheckCircle,
  CreditCard,
  ArrowRight,
  Zap,
  Bot,
  LayoutDashboard,
  Wrench,
  CircuitBoard,
  Paintbrush,
  Key,
  Link2,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Sun,
  FileText,
  ChevronDown,
} from 'lucide-react';
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
  citation?: string;
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
          { icon: Search, label: 'Searching knowledge base', color: 'text-[#171717]', bgColor: 'bg-[#171717]/10' },
          { icon: CheckCircle, label: '3 relevant documents found', color: 'text-[#16A34A]', bgColor: 'bg-[#16A34A]/10' },
        ],
        delay: 1600,
      },
      {
        type: 'bot',
        text: 'Our return policy allows returns within 30 days. Items must be unused. Free return shipping on orders over $50. Refunds process in 3–5 business days.',
        citation: 'return-policy.pdf',
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
          { icon: Database, label: 'Connecting to orders_db', color: 'text-[#4F46E5]', bgColor: 'bg-[#4F46E5]/10' },
          { icon: Search, label: 'Running aggregation query', color: 'text-[#D97706]', bgColor: 'bg-[#D97706]/10' },
          { icon: CheckCircle, label: 'Query completed', color: 'text-[#16A34A]', bgColor: 'bg-[#16A34A]/10' },
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
          { icon: Search, label: 'Looking up order #4821', color: 'text-[#4F46E5]', bgColor: 'bg-[#4F46E5]/10' },
          { icon: CreditCard, label: 'Processing refund — $49.99', color: 'text-[#D97706]', bgColor: 'bg-[#D97706]/10' },
          { icon: CheckCircle, label: 'Refund issued — email sent', color: 'text-[#16A34A]', bgColor: 'bg-[#16A34A]/10' },
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
    <div className="space-y-1.5 py-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.25, duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className={`w-5 h-5 rounded-md ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-3 h-3 ${step.color}`} />
            </div>
            <span className="text-[10px] text-[#6B7280]">{step.label}</span>
            {i < steps.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-[#D1D5DB] ml-auto flex-shrink-0" />}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Sidebar nav matching real dashboard ─────────────────────────────────────

interface NavSection {
  title?: string;
  items: { icon: LucideIcon; label: string; active?: boolean }[];
}

const sidebarSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard' },
      { icon: Bot, label: 'Chatbots' },
    ],
  },
  {
    title: 'Chatbot',
    items: [
      { icon: MessageSquare, label: 'Chat', active: true },
      { icon: BarChart3, label: 'Analytics' },
      { icon: Database, label: 'Data Sources' },
      { icon: Users, label: 'Leads' },
      { icon: Rocket, label: 'Deploy' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { icon: Zap, label: 'AI Actions' },
      { icon: CircuitBoard, label: 'Databases' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { icon: Settings, label: 'General' },
      { icon: Paintbrush, label: 'Customization' },
      { icon: Key, label: 'API Keys' },
      { icon: Link2, label: 'Integrations' },
      { icon: Shield, label: 'Security' },
    ],
  },
];

// ─── Chat panel ───────────────────────────────────────────────────────────────

function ChatPanel() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  const mountedRef = useRef(true);

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
      if (!mountedRef.current) return;
      setIsTransitioning(false);
      const scenario = scenarios[idx];
      scenario.steps.forEach((step, i) => {
        const t = setTimeout(() => {
          if (mountedRef.current) setVisibleSteps(i + 1);
        }, step.delay);
        timeoutsRef.current.push(t);
      });
      const lastStep = scenario.steps[scenario.steps.length - 1];
      const auto = setTimeout(() => {
        if (mountedRef.current) setActiveScenario((idx + 1) % scenarios.length);
      }, lastStep.delay + 4000);
      autoAdvanceRef.current = auto;
      timeoutsRef.current.push(auto);
    }, 300);
    timeoutsRef.current.push(start);
  }, [clearAllTimeouts]);

  useEffect(() => {
    mountedRef.current = true;
    runScenario(activeScenario);
    return () => {
      mountedRef.current = false;
      clearAllTimeouts();
    };
  }, [activeScenario, runScenario, clearAllTimeouts]);

  const scenario = scenarios[activeScenario];
  const currentSteps = scenario.steps.slice(0, visibleSteps);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Scenario tabs */}
      <div className="flex border-b border-[#E8E8E8] bg-white flex-shrink-0">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { if (i !== activeScenario) setActiveScenario(i); }}
            className={`flex-1 px-2 py-2 text-[9px] font-medium transition-colors relative ${i === activeScenario ? 'text-[#111827]' : 'text-[#94A3B8]'}`}
          >
            <span className={i === activeScenario ? s.labelColor : ''}>{s.label}</span>
            {i === activeScenario && (
              <motion.div layoutId="previewTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717]" transition={{ duration: 0.2 }} />
            )}
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden px-3 py-3">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div key={scenario.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-2.5">
              {currentSteps.map((step, i) => {
                if (step.type === 'user') return (
                  <motion.div key={`u${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <div className="bg-[#171717] text-white rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
                      <p className="text-[11px] leading-relaxed">{step.text}</p>
                    </div>
                  </motion.div>
                );
                if (step.type === 'typing' && currentSteps.length === i + 1) return (
                  <motion.div key={`t${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#171717] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white border border-[#E8E8E8] rounded-2xl rounded-bl-sm shadow-sm"><TypingDots /></div>
                  </motion.div>
                );
                if (step.type === 'workflow' && step.steps) return (
                  <motion.div key={`w${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#171717] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white border border-[#E8E8E8] rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] shadow-sm">
                      <p className="text-[8px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Agent Workflow</p>
                      <WorkflowSteps steps={step.steps} />
                    </div>
                  </motion.div>
                );
                if (step.type === 'bot') return (
                  <motion.div key={`b${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#171717] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white border border-[#E8E8E8] rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] shadow-sm">
                      <p className="text-[11px] text-[#334155] leading-relaxed">{step.text}</p>
                      {/* Citation badge */}
                      {step.citation && (
                        <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-[#F1F5F9]">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-[#171717]/10 text-[#171717] text-[8px] font-bold">1</span>
                          <span className="text-[9px] text-[#94A3B8]">{step.citation}</span>
                        </div>
                      )}
                      {/* Feedback row */}
                      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#F1F5F9]">
                        <button className="text-[#CBD5E1] hover:text-[#16A34A] transition-colors"><ThumbsUp className="w-3 h-3" /></button>
                        <button className="text-[#CBD5E1] hover:text-[#EF4444] transition-colors"><ThumbsDown className="w-3 h-3" /></button>
                        <button className="text-[#CBD5E1] hover:text-[#64748B] transition-colors ml-auto"><Copy className="w-3 h-3" /></button>
                      </div>
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
      <div className="bg-white border-t border-[#E8E8E8] px-3 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#F1F5F9] border border-[#E8E8E8] rounded-xl px-3 py-2">
          <span className="text-[10px] text-[#94A3B8] flex-1">Ask your agent anything...</span>
          <div className="w-5 h-5 rounded-lg bg-[#171717] flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
        <p className="text-[8px] text-[#CBD5E1] text-center mt-1">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────

function StatsPanel() {
  return (
    <div className="hidden xl:flex flex-col w-40 flex-shrink-0 border-l border-[#E8E8E8] bg-white">
      <div className="px-3 py-2.5 border-b border-[#E8E8E8]">
        <p className="text-[8px] font-semibold text-[#94A3B8] uppercase tracking-wider">This Week</p>
      </div>
      <div className="px-3 py-3 space-y-3">
        {[
          { label: 'Total Queries', value: '2,847', change: '+12%', icon: BarChart3, color: 'text-[#171717]' },
          { label: 'Avg Response', value: '1.2s', change: '-0.3s', icon: Zap, color: 'text-[#3B82F6]' },
          { label: 'Positive', value: '94%', change: '+3%', icon: ThumbsUp, color: 'text-[#16A34A]' },
          { label: 'Sessions', value: '1,204', change: '+8%', icon: Users, color: 'text-[#171717]' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={`w-3 h-3 ${stat.color}`} />
                <p className="text-[8px] text-[#94A3B8] font-medium">{stat.label}</p>
              </div>
              <p className="text-sm font-bold text-[#0F172A]">{stat.value}</p>
              <p className="text-[9px] font-medium text-emerald-600">{stat.change}</p>
            </div>
          );
        })}

        {/* Top sources bar charts */}
        <div className="pt-2.5 border-t border-[#E8E8E8] space-y-2">
          <p className="text-[8px] text-[#94A3B8] font-semibold uppercase tracking-wider">Top Sources</p>
          {[
            { name: 'Website', pct: 68 },
            { name: 'PDF Docs', pct: 22 },
            { name: 'API', pct: 10 },
          ].map((s) => (
            <div key={s.name}>
              <div className="flex justify-between text-[9px] text-[#64748B] mb-0.5">
                <span>{s.name}</span><span>{s.pct}%</span>
              </div>
              <div className="h-1 bg-[#F1F5F9] rounded-full">
                <div className="h-full bg-[#171717] rounded-full" style={{ width: `${s.pct}%` }} />
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
        className="rounded-2xl overflow-hidden border border-[#E8E8E8]"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}
      >
        {/* Browser chrome */}
        <div className="bg-[#F8FAFC] border-b border-[#E8E8E8] px-4 py-2 flex items-center gap-3 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 max-w-xs mx-auto">
            <div className="bg-white border border-[#E8E8E8] rounded-md px-3 py-1 text-[10px] text-[#94A3B8] flex items-center gap-1.5">
              <svg className="w-2.5 h-2.5 text-[#CBD5E1] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              app.corpus.ai/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="flex h-[420px] sm:h-[480px]">
          {/* ── Sidebar matching real dashboard ── */}
          <div className="hidden sm:flex w-[168px] border-r border-[#E8E8E8] bg-white flex-col flex-shrink-0">
            {/* Logo */}
            <div className="px-3 py-3 border-b border-[#E8E8E8]">
              <img src="/logo.svg" alt="Corpus AI" className="h-4 w-auto" />
            </div>

            {/* Active chatbot indicator */}
            <div className="px-2.5 py-2.5 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg px-2 py-1.5">
                <div className="w-5 h-5 rounded-md bg-[#171717] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-[#0F172A] truncate">Website Bot</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                    <p className="text-[8px] text-[#16A34A] font-medium">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation sections */}
            <nav className="flex-1 py-1.5 overflow-y-auto">
              {sidebarSections.map((section, idx) => (
                <div key={section.title || idx} className="px-2.5 mb-1">
                  {section.title && (
                    <p className="text-[7px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em] px-1.5 pt-2 pb-1">{section.title}</p>
                  )}
                  <div className="space-y-px">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2 px-2 py-[5px] rounded-md text-[10px] font-medium cursor-default transition-colors ${
                            item.active
                              ? 'bg-[#F7F7F7] text-[#171717] border border-[#E8E8E8]'
                              : 'text-[#64748B] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Quota bars */}
            <div className="px-2.5 py-2 border-t border-[#E8E8E8] space-y-1.5">
              {[
                { label: 'Queries', used: 847, total: 2000 },
                { label: 'Chatbots', used: 2, total: 5 },
                { label: 'Storage', used: 45, total: 100 },
              ].map((q) => (
                <div key={q.label}>
                  <div className="flex justify-between text-[8px] mb-0.5">
                    <span className="text-[#64748B]">{q.label}</span>
                    <span className="text-[#94A3B8]">{q.used}/{q.total}</span>
                  </div>
                  <div className="h-1 bg-[#F1F5F9] rounded-full">
                    <div
                      className="h-full bg-[#171717] rounded-full transition-all"
                      style={{ width: `${(q.used / q.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <button className="w-full text-[8px] font-semibold text-[#171717] bg-[#F7F7F7] border border-[#E8E8E8] rounded-md py-1 mt-1 hover:bg-[#EFEFEF] transition-colors">
                Upgrade Plan
              </button>
            </div>

            {/* User */}
            <div className="px-2.5 py-2 border-t border-[#E8E8E8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#171717] to-[#404040] flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                  J
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-medium text-[#334155] truncate">John Smith</p>
                  <p className="text-[7px] text-[#94A3B8] truncate">Starter Plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main content area ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Dashboard header bar */}
            <div className="bg-white border-b border-[#E8E8E8] px-3 py-2 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#171717] flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] font-semibold text-[#0F172A]">Website Bot</span>
                <span className="text-[8px] font-medium text-[#171717] bg-[#F7F7F7] border border-[#E8E8E8] px-1.5 py-0.5 rounded">Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  <FileText className="w-3 h-3" />
                </button>
                <button className="text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  <Sun className="w-3 h-3" />
                </button>
                <div className="w-px h-3 bg-[#E8E8E8]" />
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#171717] to-[#404040] flex items-center justify-center text-white text-[7px] font-bold">
                    J
                  </div>
                  <ChevronDown className="w-2.5 h-2.5 text-[#94A3B8]" />
                </div>
              </div>
            </div>

            {/* Chat panel */}
            <ChatPanel />
          </div>

          {/* Stats panel */}
          <StatsPanel />
        </div>
      </div>
    </div>
  );
}
