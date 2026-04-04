'use client';

import { motion } from 'framer-motion';
import { UserPlus, Palette, BarChart3, Languages } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1] as const },
  }),
};

export default function FeatureBento() {
  return (
    <section className="py-28 px-6 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#737373] shadow-sm mb-6">
            Platform
          </span>
          <h2 className="text-4xl md:text-5xl font-medium text-[#171717] tracking-[-0.02em]">
            Everything you need.{' '}<span className="text-[#737373]">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-lg font-normal text-[#737373] mt-4">
            A complete platform for building, training, and deploying AI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: RAG Pipeline — spans 2 cols */}
          <motion.div
            className="bg-white rounded-2xl p-8 relative overflow-hidden lg:col-span-2 hover:shadow-md transition-shadow"
            variants={cardVariants}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="text-xs font-medium text-[#737373] uppercase tracking-widest mb-3">[01] RETRIEVAL</p>
            <h3 className="text-xl font-medium text-[#171717] mb-2">
              Intelligent RAG Pipeline
            </h3>
            <p className="text-sm text-[#737373] max-w-md">
              Adaptive retrieval that automatically chooses the best strategy —
              simple search for direct questions, hybrid search with reranking for
              complex queries, and HyDE for vague ones.
            </p>
            <div className="flex items-center gap-2 mt-6 flex-wrap">
              {['Chunk', 'Embed', 'Index'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[#D1D5DB]">&rarr;</span>}
                  <span className="inline-flex px-3 py-1.5 rounded-lg bg-[#F7F7F7] text-[#171717] text-xs font-medium">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: Lead Capture */}
          <motion.div
            className="bg-white rounded-2xl p-8 hover:shadow-md transition-shadow"
            variants={cardVariants}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="text-xs font-medium text-[#737373] uppercase tracking-widest mb-3">[02] GROWTH</p>
            <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center mb-4">
              <UserPlus className="w-5 h-5 text-[#171717]" />
            </div>
            <h3 className="text-xl font-medium text-[#171717] mb-2">
              Smart Lead Capture
            </h3>
            <p className="text-sm text-[#737373]">
              Auto-classify leads as hot, warm, or cold based on conversation
              intent. Trigger capture forms on high-intent signals, unanswered
              questions, or exit intent.
            </p>
          </motion.div>

          {/* Card 3: Custom Branding */}
          <motion.div
            className="bg-white rounded-2xl p-8 hover:shadow-md transition-shadow"
            variants={cardVariants}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="text-xs font-medium text-[#737373] uppercase tracking-widest mb-3">[03] BRANDING</p>
            <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center mb-4">
              <Palette className="w-5 h-5 text-[#171717]" />
            </div>
            <h3 className="text-xl font-medium text-[#171717] mb-2">
              Full White-Label
            </h3>
            <p className="text-sm text-[#737373]">
              Match your brand perfectly — custom colors, fonts, avatar, welcome
              messages, and remove all Corpus AI branding on Business plans.
            </p>
          </motion.div>

          {/* Card 4: Analytics */}
          <motion.div
            className="bg-white rounded-2xl p-8 hover:shadow-md transition-shadow"
            variants={cardVariants}
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="text-xs font-medium text-[#737373] uppercase tracking-widest mb-3">[04] INSIGHTS</p>
            <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-[#171717]" />
            </div>
            <h3 className="text-xl font-medium text-[#171717] mb-2">
              Conversation Analytics
            </h3>
            <p className="text-sm text-[#737373]">
              Track message volume, resolution rates, popular topics, and customer
              satisfaction. Export reports and set up alerts for anomalies.
            </p>
          </motion.div>

          {/* Card 5: Security — spans 2 cols */}
          <motion.div
            className="bg-white rounded-2xl p-8 relative overflow-hidden lg:col-span-2 hover:shadow-md transition-shadow"
            variants={cardVariants}
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="text-xs font-medium text-[#737373] uppercase tracking-widest mb-3">[05] SECURITY</p>
            <h3 className="text-xl font-medium text-[#171717] mb-2">
              Enterprise-Grade Security
            </h3>
            <p className="text-sm text-[#737373] max-w-md">
              End-to-end encryption, SOC 2 compliance standards, domain
              whitelisting, rate limiting, and IP-based access controls. Your data
              never trains public models.
            </p>
            <div className="flex items-center gap-2 mt-6 flex-wrap">
              {['AES-256', 'SOC 2', 'GDPR', 'Rate Limited'].map((badge) => (
                <span
                  key={badge}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#F7F7F7] text-[#171717] font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 6: Multi-Language */}
          <motion.div
            className="bg-white rounded-2xl p-8 hover:shadow-md transition-shadow"
            variants={cardVariants}
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="text-xs font-medium text-[#737373] uppercase tracking-widest mb-3">[06] GLOBAL</p>
            <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center mb-4">
              <Languages className="w-5 h-5 text-[#171717]" />
            </div>
            <h3 className="text-xl font-medium text-[#171717] mb-2">
              Multi-Language Support
            </h3>
            <p className="text-sm text-[#737373]">
              Automatically detect and respond in 50+ languages. Serve global
              audiences without managing separate bots for each locale.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
