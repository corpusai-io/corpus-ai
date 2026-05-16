'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Database, Zap } from 'lucide-react';
import DashboardPreview from '@/components/home/DashboardPreview';

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, bounce: 0.3, duration: 1.5 },
  },
};

const previewVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.75, ease: [0, 0, 0.2, 1] as const },
  },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle radial background blooms */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 60% 40% at 20% 0%, rgba(192,132,245,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 35% at 80% 10%, rgba(192,132,245,0.04) 0%, transparent 65%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 pt-24 md:pt-36 pb-0 px-4 sm:px-6 text-center">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── Badge ── */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E8E8E8] bg-white text-[#171717] text-[11px] font-semibold tracking-wide uppercase shadow-sm">
              <Zap className="w-3 h-3" />
              Agentic AI Platform
            </div>
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-[5.25rem] font-normal tracking-[-0.02em] leading-none max-w-4xl mx-auto text-balance"
          >
            <span className="text-[#171717]">AI Agents that act,</span>
            <br />
            <span className="text-[#737373]">not just answer.</span>
          </motion.h1>

          {/* ── Subtitle ── */}
          <motion.div variants={itemVariants} className="mt-7 max-w-2xl mx-auto">
            <p className="font-[family-name:var(--font-inter)] text-base font-normal text-[#737373] tracking-[-0.2px] leading-relaxed text-balance">
              Train on your data, connect your tools, and deploy autonomous agents that work with your{' '}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#E8E8E8] bg-white text-sm text-[#171717] align-middle">
                <BookOpen className="w-3 h-3" />
                Knowledge Base
              </span>
              {', '}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#E8E8E8] bg-white text-sm text-[#171717] align-middle">
                <Database className="w-3 h-3" />
                Database
              </span>
              {', and '}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#E8E8E8] bg-white text-sm text-[#171717] align-middle">
                <Zap className="w-3 h-3" />
                Actions
              </span>
              {' '}— in minutes, not months.
            </p>
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-3 mt-10 flex-wrap"
          >
            <motion.a
              href="/Sign-In"
              className="inline-flex items-center gap-2 bg-[#171717] text-white rounded-xl px-6 py-3.5 text-sm font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </motion.a>
            <motion.a
              href="/demo"
              className="inline-flex items-center gap-2 border border-[#E8E8E8] text-[#171717] rounded-xl px-6 py-3.5 text-sm font-medium bg-white shadow-sm hover:bg-[#F7F7F7] transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Talk to Sales
            </motion.a>
          </motion.div>

          {/* ── Trust signals ── */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-1 mt-5 flex-wrap"
          >
            {['500+ teams', 'SOC 2 compliant', 'No credit card', 'Free forever plan'].map((text, i, arr) => (
              <span key={text} className="text-xs text-[#737373]">
                {text}{i < arr.length - 1 && <span className="mx-2">&middot;</span>}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Dashboard Preview ── */}
        <motion.div
          className="relative mt-16 overflow-hidden px-2 sm:px-4"
          variants={previewVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top gradient fade — blends into white above */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(to bottom, transparent 35%, white 100%)',
            }}
          />

          {/* Scaled dashboard mockup container */}
          <div
            className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#E8E8E8] shadow-xl shadow-black/[0.06]"
            style={{ padding: 4 }}
          >
            {/* Inner border ring */}
            <div
              className="relative overflow-hidden rounded-xl"
              style={{ background: '#F7F7F7' }}
            >
              <ScaledDashboard />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Responsive scale wrapper ──────────────────────────────────────────────────
// Renders the 1100px dashboard mockup scaled to fill its container.

function ScaledDashboard() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / 1100);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: Math.round(620 * scale), position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 1100, transformOrigin: 'top left', transform: `scale(${scale})`, position: 'absolute', top: 0, left: 0 }}>
        <DashboardPreview />
      </div>
    </div>
  );
}
