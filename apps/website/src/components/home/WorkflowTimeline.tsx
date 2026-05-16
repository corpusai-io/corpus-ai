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
    <section className="py-16 md:py-28 px-4 sm:px-6 bg-[#F7F7F7] relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#737373] shadow-sm mb-6">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-medium text-[#171717] tracking-[-0.02em]">
            Live in four simple steps
          </h2>
          <p className="text-lg font-normal text-[#737373] mt-4">
            From zero to deployed AI agent. No ML expertise required.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-[#E8E8E8]" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className={`relative flex gap-6 md:gap-8 ${i < steps.length - 1 ? 'mb-16' : ''}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: [0, 0, 0.2, 1] }}
              viewport={{ once: true, margin: '-40px' }}
            >
              {/* Step circle with number */}
              <div className="absolute left-6 md:left-8 -translate-x-1/2 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    i === 0
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#171717]'
                  }`}
                >
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <div className="ml-16 md:ml-20">
                <h3 className="text-xl font-medium text-[#171717] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm font-normal text-[#737373] leading-relaxed max-w-md">
                  {step.body}
                </p>

                {/* Source badges */}
                {step.badges && (
                  <div className="flex items-center gap-2 mt-4">
                    {step.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#F7F7F7] text-[#171717] font-medium border border-[#E8E8E8]"
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
                        className="w-7 h-7 rounded-full bg-white border border-[#E8E8E8] flex items-center justify-center text-[10px] text-[#171717] font-medium"
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
