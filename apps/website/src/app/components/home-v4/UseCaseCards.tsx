'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, Heart, Scale, Landmark, Briefcase } from 'lucide-react';

const useCases = [
  {
    title: 'Education',
    href: '/Solution/Education',
    icon: GraduationCap,
    color: '#7C3AED',
    bg: '#EDE9FE',
    body: 'AI tutors that adapt to each student. Instant answers from course materials, 24/7 campus support, and 60% less admin overhead.',
  },
  {
    title: 'Healthcare',
    href: '/Solution/Healthcare',
    icon: Heart,
    color: '#DB2777',
    bg: '#FCE7F3',
    body: 'HIPAA-aware patient intake, symptom triage, appointment scheduling, and prescription refills. Reduce wait times by 40%.',
  },
  {
    title: 'Legal',
    href: '/Solution/Legal',
    icon: Scale,
    color: '#4F46E5',
    bg: '#EEF2FF',
    body: 'Parse case files, contracts, and statutes in seconds. Client intake bots, document review, and 75% faster paralegal research.',
  },
  {
    title: 'Government',
    href: '/Solution/Government',
    icon: Landmark,
    color: '#D97706',
    bg: '#FEF3C7',
    body: 'Citizen-facing bots for permits, licenses, and benefits. Multi-language support and ADA-compliant interfaces for all users.',
  },
  {
    title: 'Workplace',
    href: '/Solution/Workplace',
    icon: Briefcase,
    color: '#16A34A',
    bg: '#DCFCE7',
    body: 'Internal knowledge bots for wikis, SOPs, and policies. IT help desk automation that resolves 70% of tickets without humans.',
  },
];

export default function UseCaseCards() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest mb-4">
            Solutions
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] tracking-tight">
            Purpose-built for your industry
          </h2>
          <p className="text-lg text-[#6B7280] mt-4">
            AI agents trained on industry-specific knowledge and compliance requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((useCase, i) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={useCase.href} className="v4-card p-8 group block h-full">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: useCase.bg }}
                >
                  <useCase.icon className="w-5 h-5" style={{ color: useCase.color }} />
                </div>
                <h3
                  className="text-lg font-semibold text-[#111827] mb-3 transition-colors"
                  style={{ color: undefined }}
                >
                  <span className="group-hover:text-[#7C3AED] transition-colors">{useCase.title}</span>
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {useCase.body}
                </p>
                <p className="text-xs text-[#9CA3AF] group-hover:text-[#7C3AED] transition-colors mt-4 font-medium">
                  Explore {useCase.title} &rarr;
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
