'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Connect your data sources',
    body: 'Upload PDFs, paste URLs, crawl entire websites, or connect your database. Our pipeline handles chunking, embedding, and indexing automatically.',
    badges: ['PDF', 'URL', 'Database'],
  },
  {
    number: '02',
    title: 'Configure your agent',
    body: 'Set the personality, tone, and guardrails. Define what tools your agent can access, which databases it can query, and how it should handle edge cases.',
  },
  {
    number: '03',
    title: 'Test in the sandbox',
    body: 'Chat with your agent in a live sandbox. Refine responses, adjust retrieval settings, and validate behavior before going live.',
  },
  {
    number: '04',
    title: 'Deploy everywhere',
    body: 'Embed on your website, connect to Slack, WhatsApp, Telegram, or WordPress. Your agent is live and learning from every interaction.',
    platforms: [
      { label: 'W', title: 'Web' },
      { label: 'S', title: 'Slack' },
      { label: 'WA', title: 'WhatsApp' },
      { label: 'T', title: 'Telegram' },
      { label: 'WP', title: 'WordPress' },
    ],
  },
];

export default function WorkflowTimeline() {
  return (
    <section className="py-32 px-6 bg-[#FAF5FF] relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-[#C084F5] uppercase tracking-widest mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] tracking-tight">
            Live in four simple steps
          </h2>
          <p className="text-lg text-[#6B7280] mt-4">
            From zero to deployed AI agent. No ML expertise required.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#C084F5]/50 via-[#E9D5FF] to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className={`relative flex gap-6 md:gap-8 ${i < steps.length - 1 ? 'mb-16' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2, duration: 0.5, ease: [0, 0, 0.2, 1] }}
              viewport={{ once: true, margin: '-40px' }}
            >
              {/* Step dot */}
              <div
                className={`absolute left-6 md:left-8 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#C084F5] z-10 ${
                  i === 0 ? 'bg-[#C084F5] shadow-md shadow-[#C084F5]/30' : 'bg-white'
                }`}
              />

              {/* Content */}
              <div className="ml-16 md:ml-20">
                <p className="text-xs font-mono text-[#C084F5] font-semibold mb-2">
                  {step.number}
                </p>
                <h3 className="text-xl font-semibold text-[#111827] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-md">
                  {step.body}
                </p>

                {/* Source badges */}
                {step.badges && (
                  <div className="flex items-center gap-2 mt-4">
                    {step.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white text-[#6B7280] border border-[#E5E7EB] font-medium shadow-sm"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Platform icons */}
                {step.platforms && (
                  <div className="flex items-center gap-2 mt-4">
                    {step.platforms.map((p) => (
                      <span
                        key={p.label}
                        title={p.title}
                        className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[10px] text-[#6B7280] font-semibold"
                      >
                        {p.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
