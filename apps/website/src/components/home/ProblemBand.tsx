'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Clock, Search, Users, Target, Layers } from 'lucide-react';

const rows = [
  {
    pain: 'Customers wait hours for answers your team already knows',
    solution: 'Instant, accurate answers — 24/7, no hold time',
    icon: Clock,
  },
  {
    pain: 'Support agents manually look up orders, one ticket at a time',
    solution: 'Your agent queries the database and responds in seconds',
    icon: Search,
  },
  {
    pain: 'Scaling support means hiring — and training — more people',
    solution: 'Add another agent, not another headcount',
    icon: Users,
  },
  {
    pain: 'Leads disappear when no one is available to respond',
    solution: 'Every visitor engaged, every lead captured automatically',
    icon: Target,
  },
  {
    pain: "Data lives in silos your team can't access fast enough",
    solution: 'All your data accessible through one natural conversation',
    icon: Layers,
  },
];

export default function ProblemBand() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-28 px-4 sm:px-6 bg-[#F7F7F7]">
      <div className="max-w-4xl mx-auto">

        {/* Section label — unchanged */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-full px-4 py-1.5 text-sm text-[#737373] shadow-sm mb-5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#171717]" />
            The transformation
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-[-0.02em] text-[#171717]">
            From chaos to clarity.
          </h2>
          <p className="font-[family-name:var(--font-inter)] font-normal text-[#737373] mt-3 max-w-xl mx-auto">
            See the difference an AI agent makes when it handles what used to slow you down.
          </p>
        </motion.div>

        {/* Column headers — desktop only */}
        <motion.div
          className="hidden md:grid gap-0 mb-3"
          style={{ gridTemplateColumns: '1fr 48px 1fr' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C0C0C0] pl-4">Today</p>
          <span />
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#999] pl-4">With Corpus AI</p>
        </motion.div>

        {/* Mobile: solution-only list */}
        <div className="flex flex-col gap-3 md:hidden">
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <motion.div
                key={i}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-[#737373]" strokeWidth={1.5} />
                <p className="text-sm text-[#333] font-medium leading-snug">{row.solution}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop: comparison rows */}
        <div className="hidden md:flex flex-col gap-2">
          {rows.map((row, i) => {
            const Icon = row.icon;
            const isHovered = hovered === i;

            return (
              <motion.div
                key={i}
                className="grid items-center gap-0"
                style={{ gridTemplateColumns: 'minmax(0,1fr) 40px minmax(0,1fr)' }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0, 0, 0.2, 1] }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Pain cell */}
                <div
                  className="px-4 py-[18px] rounded-xl transition-all duration-250"
                  style={{
                    background: isHovered ? '#EBEBEB' : 'transparent',
                  }}
                >
                  <p
                    className="text-sm leading-relaxed transition-all duration-250"
                    style={{
                      color: isHovered ? '#888' : '#C4C4C4',
                      textDecoration: isHovered ? 'line-through' : 'none',
                      textDecorationColor: '#C4C4C4',
                    }}
                  >
                    {row.pain}
                  </p>
                </div>

                {/* Arrow cell — perfectly centered in the same grid row */}
                <div className="flex items-center justify-center">
                  <svg width="18" height="12" viewBox="0 0 20 12" fill="none">
                    <path
                      d="M0 6h15M12 1l5 5-5 5"
                      stroke={isHovered ? '#333' : '#DDD'}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transition: 'stroke 0.25s ease' }}
                    />
                  </svg>
                </div>

                {/* Solution cell */}
                <div
                  className="px-4 py-[16px] rounded-xl flex items-center gap-3 transition-all duration-300"
                  style={{
                    background: isHovered ? '#171717' : '#fff',
                    boxShadow: isHovered
                      ? '0 4px 20px rgba(0,0,0,0.12)'
                      : '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Icon
                    className="w-[18px] h-[18px] flex-shrink-0 transition-colors duration-300"
                    style={{ color: isHovered ? '#fff' : '#C0C0C0' }}
                    strokeWidth={1.5}
                  />
                  <p
                    className="text-sm leading-relaxed font-medium transition-colors duration-300"
                    style={{ color: isHovered ? '#fff' : '#333' }}
                  >
                    {row.solution}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
