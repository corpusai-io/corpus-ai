'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, Heart, Scale, Landmark, Briefcase } from 'lucide-react';

const useCases = [
  {
    title: 'Education',
    href: '/Sign-In',
    icon: GraduationCap,
    body: 'AI tutors that adapt to each student. Instant answers from course materials, 24/7 campus support, and 60% less admin overhead.',
  },
  {
    title: 'Healthcare',
    href: '/Sign-In',
    icon: Heart,
    body: 'HIPAA-aware patient intake, symptom triage, appointment scheduling, and prescription refills. Reduce wait times by 40%.',
  },
  {
    title: 'Legal',
    href: '/Sign-In',
    icon: Scale,
    body: 'Parse case files, contracts, and statutes in seconds. Client intake bots, document review, and 75% faster paralegal research.',
  },
  {
    title: 'Government',
    href: '/Sign-In',
    icon: Landmark,
    body: 'Citizen-facing bots for permits, licenses, and benefits. Multi-language support and ADA-compliant interfaces for all users.',
  },
  {
    title: 'Workplace',
    href: '/Sign-In',
    icon: Briefcase,
    body: 'Internal knowledge bots for wikis, SOPs, and policies. IT help desk automation that resolves 70% of tickets without humans.',
  },
];

export default function UseCaseCards() {
  return (
    <section className="py-16 md:py-28 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#F7F7F7] border border-[#E8E8E8] text-sm text-[#737373] shadow-sm mb-5">
            Solutions
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#171717] tracking-[-0.02em]">
            Purpose-built for your industry
          </h2>
          <p className="text-base font-[family-name:var(--font-inter)] text-[#737373] mt-4 max-w-xl mx-auto">
            AI agents trained on industry-specific knowledge and compliance requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="bg-white rounded-2xl p-6 sm:p-8 group block h-full transition-shadow duration-300 hover:shadow-md"
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
