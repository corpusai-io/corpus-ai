'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    quote:
      'We replaced three support agents and a $2,000-per-month help desk with one Corpus AI agent. It resolves 80% of inquiries autonomously — and customers actually prefer it.',
    name: 'Sarah Mitchell',
    role: 'VP Customer Experience, TechFlow Solutions',
    initials: 'SM',
  },
  {
    quote:
      'Our team was drowning in repetitive questions. Within a week of deploying Corpus AI, first-response time dropped from 4 hours to under 30 seconds. We haven\'t looked back.',
    name: 'James Okafor',
    role: 'Head of Operations, Meridian Health',
    initials: 'JO',
  },
  {
    quote:
      'The database connectivity is what sold us. Our sales team now asks questions in plain English and gets live CRM data back — no SQL, no waiting for analysts.',
    name: 'Priya Nair',
    role: 'Director of Revenue, Stackline Commerce',
    initials: 'PN',
  },
];

export default function TestimonialV4() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[index];

  return (
    <section className="py-32 px-6 v4-section-gradient-purple relative overflow-hidden">
      <div className="absolute top-20 left-10 w-[250px] h-[250px] opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest mb-12">
          Trusted by 500+ teams
        </p>

        <div className="text-7xl v4-gradient-text-warm font-serif leading-none mb-2 opacity-20">&ldquo;</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45 }}
          >
            <blockquote className="text-2xl md:text-3xl font-medium text-[#111827] leading-relaxed tracking-tight">
              {t.quote}
            </blockquote>

            <div className="mt-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4F46E5] mx-auto mb-4 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#7C3AED]/25">
                {t.initials}
              </div>
              <div className="text-base font-semibold text-[#111827]">{t.name}</div>
              <div className="text-sm text-[#6B7280] mt-1">{t.role}</div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot nav */}
        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-[#7C3AED]' : 'w-1.5 bg-[#DDD6FE]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
