'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$19',
    description: 'For small teams getting started with AI support.',
    features: [
      '2,000 messages / month',
      '1 chatbot',
      '50 training pages',
      'Website embed',
      'Email support',
    ],
    highlighted: false,
    cta: 'Get Started Free',
  },
  {
    name: 'Standard',
    price: '$99',
    description: 'For growing teams that need integrations and scale.',
    features: [
      '10,000 messages / month',
      '5 chatbots',
      '500 training pages',
      'All integrations',
      'Lead capture & analytics',
      'Database connectivity',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Business',
    price: '$399',
    description: 'Enterprise-grade features for large organizations.',
    features: [
      'Unlimited messages',
      'Unlimited chatbots',
      'Unlimited training pages',
      'All integrations + API',
      'Full white-label',
      'Agentic capabilities',
      'Dedicated account manager',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

export default function PricingV4() {
  return (
    <section className="py-32 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold text-[#7C3AED] uppercase tracking-widest mb-4">
          Pricing
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-[#111827] tracking-tight">
          Start free.{' '}<span className="v4-gradient-text">Scale infinitely.</span>
        </h2>
        <p className="text-lg text-[#6B7280] mt-4">
          No hidden fees. No surprises. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-2xl p-8 border transition-all ${
              tier.highlighted
                ? 'bg-[#F5F3FF] border-[#7C3AED]/30 v4-pricing-highlight'
                : 'bg-white border-[#E5E7EB] shadow-sm hover:border-[#DDD6FE] hover:shadow-md'
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#7C3AED]/25">
                Most Popular
              </span>
            )}

            <p className="text-lg font-semibold text-[#111827]">{tier.name}</p>

            <div className="mt-4">
              <span className="text-4xl font-bold text-[#111827]">{tier.price}</span>
              <span className="text-base font-normal text-[#9CA3AF]">/mo</span>
            </div>

            <p className="text-sm text-[#6B7280] mt-3">{tier.description}</p>

            <div className="border-t border-[#E5E7EB] my-6" />

            <ul className="space-y-0">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-[#6B7280] py-1.5">
                  <Check
                    className={`w-4 h-4 flex-shrink-0 ${
                      tier.highlighted ? 'text-[#7C3AED]' : 'text-[#9CA3AF]'
                    }`}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/Sign-In"
              className={`block w-full mt-8 text-center py-3 rounded-lg text-sm font-semibold transition-colors ${
                tier.highlighted
                  ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-md shadow-[#7C3AED]/20 hover:shadow-lg hover:shadow-[#7C3AED]/30'
                  : 'border border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6]'
              }`}
            >
              {tier.cta}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/Pricing"
          className="text-sm text-[#6B7280] hover:text-[#7C3AED] transition-colors"
        >
          Compare all plans &rarr;
        </Link>
      </div>
    </section>
  );
}
