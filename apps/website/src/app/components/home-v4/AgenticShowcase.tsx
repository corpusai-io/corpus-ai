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
              className="text-[#737373] text-xs"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              viewport={{ once: true }}
            >
              &rarr;
            </motion.span>
          )}
          <motion.span
            className="text-xs px-2 py-1 bg-[#F7F7F7] text-[#171717] rounded font-medium"
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
    iconColor: 'text-[#171717]',
    iconBg: 'bg-[#F7F7F7]',
    title: 'Multi-Step Reasoning',
    body: 'Your agent breaks complex queries into sub-tasks, reasons through each step, and synthesizes a coherent answer — no hallucinations, just grounded logic.',
    visual: 'thought-chain',
  },
  {
    icon: Plug,
    iconColor: 'text-[#171717]',
    iconBg: 'bg-[#F7F7F7]',
    title: 'Tool & API Execution',
    body: 'Your agent can call external APIs, trigger webhooks, send emails, update CRMs, and execute custom functions — all within a single conversation turn.',
    visual: 'tool-badges',
  },
  {
    icon: Zap,
    iconColor: 'text-[#171717]',
    iconBg: 'bg-[#F7F7F7]',
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
  { color: 'bg-[#171717]', text: 'Refund processed — $49.99' },
  { color: 'bg-[#737373]', text: 'Escalated to support lead' },
  { color: 'bg-[#171717]', text: 'Meeting scheduled — Thu 2pm' },
];

export default function AgenticShowcase() {
  return (
    <section className="py-28 px-6 bg-[#F7F7F7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-full px-4 py-1.5 text-sm text-[#737373] shadow-sm mb-5">
            <Zap className="w-3.5 h-3.5 text-[#171717]" />
            Agents, not chatbots
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.02em] text-[#171717]">
            Your chatbot answers questions.<br className="hidden md:block" />
            Your AI agent resolves them.
          </h2>
          <p className="text-lg font-[family-name:var(--font-inter)] font-normal text-[#737373] mt-6 max-w-2xl mx-auto">
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
                className="bg-white rounded-2xl p-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-6`}>
                    <Icon className={card.iconColor} size={24} />
                  </div>
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-[#171717] mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#737373] leading-relaxed">
                    {card.body}
                  </p>

                  {card.visual === 'thought-chain' && <ThoughtChain />}

                  {card.visual === 'tool-badges' && (
                    <div className="flex flex-col gap-2 mt-6">
                      {toolBadges.map((badge) => (
                        <span
                          key={badge}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#F7F7F7] text-[#737373] font-mono"
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
                          className="flex items-center gap-2 text-xs text-[#737373] py-1"
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
