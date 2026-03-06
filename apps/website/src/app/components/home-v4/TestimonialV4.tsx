'use client';

import { motion } from 'framer-motion';

export default function TestimonialV4() {
  return (
    <section className="py-32 px-6 bg-[#F5F3FF]">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-8xl text-[#7C3AED]/15 font-serif leading-none mb-4">
          &ldquo;
        </div>

        <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#111827] leading-relaxed tracking-tight">
          We replaced three support agents and a $2,000-per-month help desk with one Corpus AI
          agent. It resolves 80% of inquiries autonomously &mdash; and customers actually prefer
          it.
        </blockquote>

        <div className="mt-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] mx-auto mb-4 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#7C3AED]/20">
            SM
          </div>
          <div className="text-base font-semibold text-[#111827]">Sarah Mitchell</div>
          <div className="text-sm text-[#6B7280] mt-1">
            VP Customer Experience, TechFlow Solutions
          </div>
        </div>
      </motion.div>
    </section>
  );
}
