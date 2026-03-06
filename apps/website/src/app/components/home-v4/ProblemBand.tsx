'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const before = [
  'Customers wait hours for answers your team already knows',
  'Support agents manually look up orders, one ticket at a time',
  'Scaling support means hiring — and training — more people',
  'Leads disappear when no one is available to respond',
  'Data lives in silos your team can\'t access fast enough',
];

const after = [
  'Customers get instant, accurate answers — 24/7, no hold time',
  'Your agent queries the database and responds in seconds',
  'Add another agent, not another headcount',
  'Every visitor engaged, every lead captured automatically',
  'All your data accessible through one natural conversation',
];

export default function ProblemBand() {
  return (
    <section className="py-28 px-6 bg-white relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
      <div className="max-w-6xl mx-auto">

        {/* Section label */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">
            The transformation
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
            From chaos to clarity.
          </h2>
          <p className="text-[#6B7280] mt-3 max-w-xl mx-auto">
            See the difference an AI agent makes when it handles what used to slow you down.
          </p>
        </motion.div>

        {/* Split layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before column */}
          <motion.div
            className="rounded-2xl border border-[#FEE2E2]/60 bg-gradient-to-b from-[#FAFAFA] to-[#FEF2F2]/30 p-8"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                <X className="w-4 h-4 text-[#EF4444]" />
              </div>
              <span className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-widest">
                Without Corpus AI
              </span>
            </div>

            <div className="space-y-4">
              {before.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 text-[#EF4444]" />
                  </div>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After column */}
          <motion.div
            className="rounded-2xl border border-[#DDD6FE] bg-gradient-to-b from-[#F5F3FF] to-[#EDE9FE]/50 p-8 shadow-sm shadow-[#7C3AED]/5"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                <Check className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest">
                With Corpus AI
              </span>
            </div>

            <div className="space-y-4">
              {after.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-[#7C3AED]" />
                  </div>
                  <p className="text-sm text-[#374151] font-medium leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
