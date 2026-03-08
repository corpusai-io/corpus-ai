'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Database, Zap } from 'lucide-react';
import DashboardPreview from '@/app/components/home-v4/DashboardPreview';

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0, 0, 0.2, 1] as const } },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function HeroV4() {
  return (
    <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden bg-white">
      <motion.div
        className="relative max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E8E8E8] bg-white text-[#171717] text-[11px] font-semibold tracking-wide uppercase shadow-sm">
            <Zap className="w-3 h-3" />
            Agentic AI Platform
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.02em] leading-none"
        >
          <span className="text-[#171717]">AI Agents that act,</span>
          <br />
          <span className="text-[#737373]">not just answer.</span>
        </motion.h1>

        {/* Subtitle with inline metric pills */}
        <motion.div variants={itemVariants} className="mt-6 max-w-2xl mx-auto">
          <p className="font-[family-name:var(--font-inter)] text-base font-normal text-[#737373] tracking-[-0.2px] leading-relaxed">
            Train on your data, connect your tools, and deploy autonomous agents
            that work with your{' '}
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

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mt-10 flex-wrap">
          <motion.a
            href="/Sign-In"
            className="inline-flex items-center gap-2 bg-[#171717] text-white rounded-md px-6 py-3.5 text-sm font-medium cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.a
            href="/demo"
            className="inline-flex items-center gap-2 border border-[#E8E8E8] text-[#171717] rounded-md px-6 py-3.5 text-sm font-medium transition-colors cursor-pointer bg-white shadow-sm hover:bg-[#F7F7F7]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Talk to Sales
          </motion.a>
        </motion.div>

        {/* Trust signals */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-1 mt-6 flex-wrap">
          {['500+ teams', 'SOC 2 compliant', 'No credit card', 'Free forever plan'].map((text, i, arr) => (
            <span key={text} className="text-xs text-[#737373]">
              {text}{i < arr.length - 1 && <span className="mx-2">&middot;</span>}
            </span>
          ))}
        </motion.div>

        {/* Dashboard Product Preview */}
        <motion.div
          className="mt-14 w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0, 0, 0.2, 1] }}
        >
          <DashboardPreview />
        </motion.div>
      </motion.div>
    </section>
  );
}
