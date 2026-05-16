'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'We replaced three support agents and a $2,000-per-month help desk with one Corpus AI agent. It resolves 80% of inquiries autonomously — and customers actually prefer it.',
    name: 'Sarah Mitchell',
    role: 'VP Customer Experience',
    company: 'TechFlow Solutions',
    initials: 'SM',
  },
  {
    quote:
      'Our team was drowning in repetitive questions. Within a week of deploying Corpus AI, first-response time dropped from 4 hours to under 30 seconds. We haven\'t looked back.',
    name: 'James Okafor',
    role: 'Head of Operations',
    company: 'Meridian Health',
    initials: 'JO',
  },
  {
    quote:
      'The database connectivity is what sold us. Our sales team now asks questions in plain English and gets live CRM data back — no SQL, no waiting for analysts.',
    name: 'Priya Nair',
    role: 'Director of Revenue',
    company: 'Stackline Commerce',
    initials: 'PN',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-28 px-4 sm:px-6 bg-[#F7F7F7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-white border border-[#E8E8E8] rounded-full px-4 py-1.5 text-sm text-[#737373] mb-6">
            Trusted by 500+ teams
          </span>
          <h2 className="text-3xl md:text-4xl font-medium text-[#171717] tracking-tight">
            What our customers say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 flex flex-col justify-between"
            >
              {/* Decorative quote mark */}
              <div>
                <span className="text-5xl leading-none font-serif text-[#E8E8E8] select-none">
                  &ldquo;
                </span>
                <blockquote className="text-base text-[#737373] leading-relaxed italic mt-2">
                  {t.quote}
                </blockquote>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#171717] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#171717]">{t.name}</p>
                    <p className="text-xs text-[#737373]">{t.role}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#737373] ml-4 flex-shrink-0">
                  {t.company}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
