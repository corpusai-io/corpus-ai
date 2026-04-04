'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, Heart, Scale, Landmark, Briefcase } from 'lucide-react';

const useCases = [
  {
    title: 'Education',
    href: '/Solution/Education',
    icon: GraduationCap,
    body: 'AI tutors that adapt to each student. Instant answers from course materials, 24/7 campus support, and 60% less admin overhead.',
  },
  {
    title: 'Healthcare',
    href: '/Solution/Healthcare',
    icon: Heart,
    body: 'HIPAA-aware patient intake, symptom triage, appointment scheduling, and prescription refills. Reduce wait times by 40%.',
  },
  {
    title: 'Legal',
    href: '/Solution/Legal',
    icon: Scale,
    body: 'Parse case files, contracts, and statutes in seconds. Client intake bots, document review, and 75% faster paralegal research.',
  },
  {
    title: 'Government',
    href: '/Solution/Government',
    icon: Landmark,
    body: 'Citizen-facing bots for permits, licenses, and benefits. Multi-language support and ADA-compliant interfaces for all users.',
  },
  {
    title: 'Workplace',
    href: '/Solution/Workplace',
    icon: Briefcase,
    body: 'Internal knowledge bots for wikis, SOPs, and policies. IT help desk automation that resolves 70% of tickets without humans.',
  },
];

export default function UseCaseCards() {
  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#171717] uppercase tracking-widest mb-4">
            Solutions
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#171717] tracking-tight">
            Purpose-built for your industry
          </h2>
          <p className="text-lg text-[#737373] mt-4">
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
              <Link
                href={useCase.href}
                className="bg-white rounded-2xl p-8 group block h-full transition-shadow duration-300 hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 bg-[#F7F7F7]">
                  <useCase.icon className="w-5 h-5 text-[#171717]" />
                </div>
                <h3 className="text-lg font-semibold text-[#171717] mb-3">
                  {useCase.title}
                </h3>
                <p className="text-sm text-[#737373] leading-relaxed">
                  {useCase.body}
                </p>
                <p className="text-xs text-[#737373] group-hover:text-[#171717] transition-colors mt-4 font-medium">
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
