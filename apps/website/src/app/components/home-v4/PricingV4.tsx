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
    <section className="py-28 px-6 bg-[#F7F7F7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-white border border-[#E8E8E8] rounded-full px-4 py-1.5 text-sm text-[#737373] mb-6">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-medium text-[#171717] tracking-tight">
            Start free. Scale infinitely.
          </h2>
          <p className="text-base text-[#737373] mt-4">
            No hidden fees. No surprises. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl p-8 ${
                tier.highlighted
                  ? 'border-2 border-[#171717]'
                  : ''
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#171717] text-white text-xs font-medium px-4 py-1.5 rounded-full">
                  Most Popular
                </span>
              )}

              <p className="text-lg font-medium text-[#171717]">{tier.name}</p>

              <div className="mt-4">
                <span className="text-4xl font-medium text-[#171717]">{tier.price}</span>
                <span className="text-base text-[#737373]">/mo</span>
              </div>

              <p className="text-sm text-[#737373] mt-3">{tier.description}</p>

              <div className="border-t border-[#E8E8E8] my-6" />

              <ul className="space-y-0">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-[#737373] py-1.5">
                    <Check className="w-4 h-4 flex-shrink-0 text-[#171717]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/Sign-In"
                className={`block w-full mt-8 text-center py-3 rounded-lg text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-[#171717] text-white hover:bg-[#2a2a2a]'
                    : 'border border-[#E8E8E8] text-[#171717] hover:bg-[#F7F7F7]'
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
            className="text-sm text-[#737373] hover:text-[#171717] transition-colors"
          >
            Compare all plans &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
