'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinalCTAV4() {
  return (
    <section className="py-32 px-6 bg-[#F5F3FF]">
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
          Get started today
        </p>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] tracking-tight">
          Build your first agent in five minutes
        </h2>

        <p className="text-lg text-[#6B7280] mt-6 max-w-xl mx-auto">
          Join 500+ teams using Corpus AI to automate support, capture leads,
          and unlock their data.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <Link
            href="/Sign-In"
            className="bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-lg px-7 py-3.5 text-sm font-semibold transition-colors shadow-md shadow-[#7C3AED]/20"
          >
            Start Building Free
          </Link>
          <Link
            href="/Sign-In"
            className="border border-[#D1D5DB] text-[#374151] hover:bg-white hover:border-[#DDD6FE] rounded-lg px-7 py-3.5 text-sm font-semibold transition-colors"
          >
            Talk to Sales
          </Link>
        </div>

        <p className="text-sm text-[#9CA3AF] mt-6">
          Free forever plan · No credit card required · Cancel anytime
        </p>
      </motion.div>
    </section>
  );
}
