'use client';

import { motion } from 'framer-motion';
import { Brain, Plug, Zap } from 'lucide-react';

function ThoughtChain() {
  const steps = ['Parse intent', 'Query data', 'Generate response'];

  return (
    <div className="flex items-center gap-2 mt-6 flex-wrap">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          {i > 0 && (
            <motion.span
              className="text-[#D1D5DB] text-xs"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              viewport={{ once: true }}
            >
              &rarr;
            </motion.span>
          )}
          <motion.span
            className="text-xs px-2 py-1 bg-[#F3E8FF] text-[#C084F5] rounded font-medium"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            viewport={{ once: true }}
          >
            {step}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

const cards = [
  {
    icon: Brain,
    iconColor: 'text-[#C084F5]',
    iconBg: 'bg-[#F3E8FF]',
    title: 'Multi-Step Reasoning',
    body: 'Your agent breaks complex queries into sub-tasks, reasons through each step, and synthesizes a coherent answer — no hallucinations, just grounded logic.',
    visual: 'thought-chain',
  },
  {
    icon: Plug,
    iconColor: 'text-[#4F46E5]',
    iconBg: 'bg-[#EEF2FF]',
    title: 'Tool & API Execution',
    body: 'Your agent can call external APIs, trigger webhooks, send emails, update CRMs, and execute custom functions — all within a single conversation turn.',
    visual: 'tool-badges',
  },
  {
    icon: Zap,
    iconColor: 'text-[#DB2777]',
    iconBg: 'bg-[#FCE7F3]',
    title: 'Autonomous Actions',
    body: 'Configure guardrails and let your agent act independently — schedule meetings, process refunds, escalate critical issues — all within the boundaries you define.',
    visual: 'action-badges',
  },
] as const;

const toolBadges = [
  'POST /api/create-ticket',
  'GET /crm/customer/:id',
  'SEND email.notification',
];

const actionBadges = [
  { color: 'bg-[#16A34A]', text: 'Refund processed — $49.99' },
  { color: 'bg-[#D97706]', text: 'Escalated to support lead' },
  { color: 'bg-[#2563EB]', text: 'Meeting scheduled — Thu 2pm' },
];

export default function AgenticShowcase() {
  return (
    <section className="py-20 px-6 bg-[#F9FAFB] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#C084F5] uppercase tracking-widest mb-4">
            Agents, not chatbots
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] tracking-tight">
            Your chatbot answers questions.<br className="hidden md:block" />
            <span className="v4-gradient-text">Your AI agent resolves them.</span>
          </h2>
          <p className="text-lg text-[#6B7280] mt-6 max-w-2xl mx-auto">
            Chatbots follow scripts. Corpus AI agents reason through complexity,
            query live data, and take real action — all within guardrails you define.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className="v4-card-glow p-8 relative overflow-hidden group"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-6`}>
                    <Icon className={card.iconColor} size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#111827] mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {card.body}
                  </p>

                  {card.visual === 'thought-chain' && <ThoughtChain />}

                  {card.visual === 'tool-badges' && (
                    <div className="flex flex-col gap-2 mt-6">
                      {toolBadges.map((badge) => (
                        <span
                          key={badge}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-mono"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {card.visual === 'action-badges' && (
                    <div className="flex flex-col gap-1 mt-6">
                      {actionBadges.map((badge) => (
                        <div
                          key={badge.text}
                          className="flex items-center gap-2 text-xs text-[#6B7280] py-1"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.color} flex-shrink-0`} />
                          {badge.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
