'use client';

import { motion } from 'framer-motion';
import { UserPlus, Palette, BarChart3, Languages } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

export default function FeatureBento() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest mb-4">
          Platform
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-[#111827] tracking-tight">
          Everything you need. Nothing you don&apos;t.
        </h2>
        <p className="text-lg text-[#6B7280] mt-4">
          A complete platform for building, training, and deploying AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: RAG Pipeline — spans 2 cols */}
        <motion.div
          className="v4-card p-8 relative overflow-hidden lg:col-span-2"
          variants={cardVariants}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">[01] RETRIEVAL</p>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            Intelligent RAG Pipeline
          </h3>
          <p className="text-sm text-[#6B7280] max-w-md">
            Adaptive retrieval that automatically chooses the best strategy —
            simple search for direct questions, hybrid search with reranking for
            complex queries, and HyDE for vague ones.
          </p>
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {['Chunk', 'Embed', 'Index'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#D1D5DB]">&rarr;</span>}
                <span className="inline-flex px-3 py-1.5 rounded-lg bg-[#EDE9FE] text-[#7C3AED] text-xs font-medium">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card 2: Lead Capture */}
        <motion.div
          className="v4-card p-8"
          variants={cardVariants}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">[02] GROWTH</p>
          <div className="w-10 h-10 rounded-lg bg-[#FCE7F3] flex items-center justify-center mb-4">
            <UserPlus className="w-5 h-5 text-[#DB2777]" />
          </div>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            Smart Lead Capture
          </h3>
          <p className="text-sm text-[#6B7280]">
            Auto-classify leads as hot, warm, or cold based on conversation
            intent. Trigger capture forms on high-intent signals, unanswered
            questions, or exit intent.
          </p>
        </motion.div>

        {/* Card 3: Custom Branding */}
        <motion.div
          className="v4-card p-8"
          variants={cardVariants}
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">[03] BRANDING</p>
          <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] flex items-center justify-center mb-4">
            <Palette className="w-5 h-5 text-[#D97706]" />
          </div>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            Full White-Label
          </h3>
          <p className="text-sm text-[#6B7280]">
            Match your brand perfectly — custom colors, fonts, avatar, welcome
            messages, and remove all Corpus AI branding on Business plans.
          </p>
        </motion.div>

        {/* Card 4: Analytics */}
        <motion.div
          className="v4-card p-8"
          variants={cardVariants}
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">[04] INSIGHTS</p>
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center mb-4">
            <BarChart3 className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            Conversation Analytics
          </h3>
          <p className="text-sm text-[#6B7280]">
            Track message volume, resolution rates, popular topics, and customer
            satisfaction. Export reports and set up alerts for anomalies.
          </p>
        </motion.div>

        {/* Card 5: Security — spans 2 cols */}
        <motion.div
          className="v4-card p-8 relative overflow-hidden lg:col-span-2"
          variants={cardVariants}
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">[05] SECURITY</p>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            Enterprise-Grade Security
          </h3>
          <p className="text-sm text-[#6B7280] max-w-md">
            End-to-end encryption, SOC 2 compliance standards, domain
            whitelisting, rate limiting, and IP-based access controls. Your data
            never trains public models.
          </p>
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {['AES-256', 'SOC 2', 'GDPR', 'Rate Limited'].map((badge) => (
              <span
                key={badge}
                className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] text-[#6B7280] font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Card 6: Multi-Language */}
        <motion.div
          className="v4-card p-8"
          variants={cardVariants}
          custom={5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">[06] GLOBAL</p>
          <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] flex items-center justify-center mb-4">
            <Languages className="w-5 h-5 text-[#16A34A]" />
          </div>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            Multi-Language Support
          </h3>
          <p className="text-sm text-[#6B7280]">
            Automatically detect and respond in 50+ languages. Serve global
            audiences without managing separate bots for each locale.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
