'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-28 px-4 sm:px-6 bg-[#171717] relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <span className="inline-block border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/60 mb-6">
          Your first agent is free
        </span>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-[-0.02em]">
          Stop triaging tickets.<br className="hidden md:block" />
          Deploy an agent today.
        </h2>

        <p className="text-lg text-white/60 mt-6 max-w-xl mx-auto">
          Upload your data, customize, and go live in under five minutes.
          No engineers required. Join 500+ teams already running on Corpus AI.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <Link
            href="/Sign-In"
            className="border border-white text-white hover:bg-white hover:text-[#171717] rounded-md px-5 sm:px-8 py-3.5 text-sm font-medium transition-all"
          >
            Build Your First Agent — Free
          </Link>
          <Link
            href="/Sign-In"
            className="bg-[#2a2a2a] text-white/80 hover:bg-[#333333] hover:text-white rounded-md px-5 sm:px-8 py-3.5 text-sm font-medium transition-all"
          >
            Talk to Sales
          </Link>
        </div>

        <p className="text-sm text-white/40 mt-6">
          Free forever plan · No credit card · Setup in under 5 minutes
        </p>
      </motion.div>

    </section>
  );
}
