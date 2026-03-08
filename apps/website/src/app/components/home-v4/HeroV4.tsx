'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import DashboardPreview from '@/app/components/home-v4/DashboardPreview';

// ─── Rotating Personas ────────────────────────────────────────────────────────

const personas = [
  { label: 'E-commerce', text: 'Handle returns, refunds, and order tracking without a support ticket.' },
  { label: 'SaaS Support', text: 'Resolve 80% of tickets before a human reads them.' },
  { label: 'Healthcare', text: 'Automate patient intake, scheduling, and triage 24/7.' },
  { label: 'Internal Teams', text: 'Query any database in plain English. No SQL required.' },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0, 0, 0.2, 1] as const } },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function HeroV4() {
  const [personaIndex, setPersonaIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPersonaIndex(i => (i + 1) % personas.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative pt-36 pb-16 px-6 text-center overflow-hidden">
      {/* Static soft gradient background */}
      <div className="v4-glow-hero absolute inset-0 pointer-events-none" />

      <motion.div
        className="relative max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#E9D5FF] bg-[#FAF5FF] text-[#C084F5] text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            Agentic AI Platform
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-[44px] lg:text-[54px] font-bold tracking-[-0.025em] leading-[1.15] text-[#111827]"
        >
          Build <span className="v4-gradient-text">AI Agents</span> That Don&apos;t Just
          Answer. They <span className="v4-gradient-text">Act.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p variants={itemVariants} className="text-base md:text-lg text-[#6B7280] mt-5 max-w-2xl mx-auto leading-relaxed">
          Train on your data, connect your database, and deploy an autonomous agent
          across every channel — in minutes, not months.
        </motion.p>

        {/* Rotating persona */}
        <motion.div variants={itemVariants} className="mt-5 h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={personaIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-sm md:text-base text-[#9CA3AF] max-w-xl mx-auto"
            >
              <span className="text-[#C084F5] font-semibold">{personas[personaIndex].label}: </span>
              {personas[personaIndex].text}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <motion.a
            href="/Sign-In"
            className="v4-btn-glow inline-flex items-center gap-2 bg-[#C084F5] text-white rounded-xl px-7 py-3.5 text-sm font-semibold cursor-pointer shadow-lg shadow-[#C084F5]/20"
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(192,132,245,0.35)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Build Your First Agent — Free
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.a
            href="/demo"
            className="inline-flex items-center gap-2 border border-[#D1D5DB] text-[#374151] hover:border-[#E9D5FF] hover:text-[#C084F5] rounded-xl px-7 py-3.5 text-sm font-semibold transition-colors cursor-pointer bg-white/80 backdrop-blur-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Watch 3-Min Demo
          </motion.a>
        </motion.div>

        {/* Trust signals */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          {[
            { text: '500+ teams' },
            { text: 'SOC 2 compliant' },
            { text: 'No credit card' },
            { text: 'Free forever plan' },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
              <span className="text-[#C084F5] font-semibold">✓</span>
              {item.text}
            </span>
          ))}
        </motion.div>

        {/* Dashboard Product Preview */}
        <motion.div variants={itemVariants} className="mt-14 w-full">
          <DashboardPreview />
        </motion.div>
      </motion.div>
    </section>
  );
}
