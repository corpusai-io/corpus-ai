'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinalCTAV4() {
  return (
    <section className="py-32 px-6 v4-animated-gradient relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center relative"
      >
        {/* Subtle glow */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124, 58, 237, 0.07) 0%, transparent 70%)',
          }}
        />

        <p className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest mb-6">
          Your first agent is free
        </p>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] tracking-tight">
          Stop triaging tickets.<br className="hidden md:block" />
          <span className="v4-gradient-text">Deploy an agent today.</span>
        </h2>

        <p className="text-lg text-[#6B7280] mt-6 max-w-xl mx-auto">
          Upload your data, customize, and go live in under five minutes.
          No engineers required. Join 500+ teams already running on Corpus AI.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <Link
            href="/Sign-In"
            className="v4-btn-glow bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-xl px-8 py-4 text-sm font-semibold transition-all shadow-lg shadow-[#7C3AED]/25 hover:shadow-xl hover:shadow-[#7C3AED]/30"
          >
            Build Your First Agent — Free
          </Link>
          <Link
            href="/Sign-In"
            className="border border-[#D1D5DB] text-[#374151] hover:bg-white hover:border-[#DDD6FE] hover:text-[#7C3AED] rounded-xl px-8 py-4 text-sm font-semibold transition-all bg-white/80 backdrop-blur-sm"
          >
            Talk to Sales
          </Link>
        </div>

        <p className="text-sm text-[#9CA3AF] mt-6">
          Free forever plan · No credit card · Setup in under 5 minutes
        </p>
      </motion.div>
    </section>
  );
}
