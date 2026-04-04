"use client"
import React, { useState } from 'react';
import PricingCard from './PricingCard';
import Toggle from './Toggle';

const plans = [
  {
    title: 'Free',
    price: { Monthly: '$0', Yearly: '$0' },
    description: 'Good for getting started',
    features: [
      '1 Corpus Bot',
      '20 queries',
      '1 Corpus Bot',
      'Max 100 docs or 50MB',
    ],
    buttonLabel: 'Get Started',
    href: '/free',
  },
  {
    title: 'Starter',
    price: { Monthly: '$29', Yearly: '$24' },
    yearlySubText: 'Billed $288 yearly',
    description: 'Suite for personal',
    features: [
      '2 Corpus Bot',
      '1500 queries',
      'Maximum of 100 docs/ webpages or 50M doc storage per DenserBot',
      'REST Api',
      '30 days query log retention',
    ],
    buttonLabel: 'Get Started',
    href: '/starter',
  },
  {
    title: 'Standard',
    price: { Monthly: '$119', Yearly: '$96' },
    yearlySubText: 'Billed $1152 yearly',
    description: 'Good for small team.',
    features: [
      '4 Corpus Bot',
      '7500 queries',
      'Maximum of 2000 docs/ webpages or 1G doc storage per DenserBot',
      'REST Api',
      '30 days query log retention',
      'Remove "powered by Corpus.ai" label',
    ],
    buttonLabel: 'Get Started',
    highlight: true,
    highlightLabel: 'Most Popular',
    href: '/standard',
  },
  {
    title: 'Business',
    price: { Monthly: '$399', Yearly: '$320' },
    yearlySubText: 'Billed $3840 yearly',
    description: 'Perfect for businesses.',
    features: [
      '8 DenserBots',
      '15000 queries',
      'Maximum of 10000 docs/ webpages or 5G doc storage per Corpus Bot',
      'REST Api',
      '365 days query log retention',
      'Remove "powered by Corpus.ai" label',
      'Dedicated accuracy support',
    ],
    buttonLabel: 'Get Started',
    href: '/business',
  },
];

export default function Pricingg() {
  const [billing, setBilling] = useState<'Monthly' | 'Yearly'>('Monthly');

  return (
    <section data-aos = "fade-up" data-aos-duration = "300"  className="flex flex-col items-center py-16 px-4 w-full max-w-7xl">
        <div className="wrap flex flex-col items-center gap-3">
        <p className='text-[#BF56FF] font-semibold'>Pricing</p>
        <h2 className='text-2xl md:text-3xl font-semibold'>Simple Pricing</h2>
        <p className='text-[#8D8D8D] text-center'>Use Corpus Chat for free. Upgrade to enable custom domains and more advanced features.</p>
        </div>
        <div className='mt-10'>
        <Toggle  value={billing} onChange={setBilling} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.title}
              title={plan.title}
              price={plan.price[billing]}
              description={plan.description}
              features={plan.features}
              buttonLabel={plan.buttonLabel}
              highlight={!!plan.highlight}
              highlightLabel={plan.highlightLabel}
              href={plan.href}
              subText={billing === 'Yearly' ? plan.yearlySubText : undefined}
            />
          ))}
        </div>
      
    </section>
  );
}