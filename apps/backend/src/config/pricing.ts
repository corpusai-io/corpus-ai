/**
 * Pricing Plans Configuration
 * Defines all subscription tiers and their features
 */

export interface PricingPlan {
  id: string;
  name: string;
  tier: number;
  price: number;
  interval: 'month' | 'year';
  stripePriceId?: string;
  features: {
    chatQuota: number;
    chatbotQuota: number;
    storageQuota: number;
    webPagesQuota: number;
  };
  highlights: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 0,
    price: 0,
    interval: 'month',
    features: {
      chatQuota: 20,
      chatbotQuota: 1,
      storageQuota: 10 * 1024 * 1024, // 10MB
      webPagesQuota: 10,
    },
    highlights: [
      '20 chat messages per month',
      '1 chatbot',
      '10MB storage',
      '10 web pages',
      'Basic customization',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 1,
    price: 19,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_ID_STARTER,
    features: {
      chatQuota: 1500,
      chatbotQuota: 2,
      storageQuota: 100 * 1024 * 1024, // 100MB
      webPagesQuota: 100,
    },
    highlights: [
      '1,500 chat messages per month',
      '2 chatbots',
      '100MB storage',
      '100 web pages',
      'Advanced customization',
      'Email support',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    tier: 2,
    price: 99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_ID_STANDARD,
    features: {
      chatQuota: 7500,
      chatbotQuota: 4,
      storageQuota: 500 * 1024 * 1024, // 500MB
      webPagesQuota: 500,
    },
    highlights: [
      '7,500 chat messages per month',
      '4 chatbots',
      '500MB storage',
      '500 web pages',
      'All integrations',
      'Priority support',
      'Advanced analytics',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tier: 3,
    price: 399,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_ID_BUSINESS,
    features: {
      chatQuota: 15000,
      chatbotQuota: 8,
      storageQuota: 2 * 1024 * 1024 * 1024, // 2GB
      webPagesQuota: 2000,
    },
    highlights: [
      '15,000 chat messages per month',
      '8 chatbots',
      '2GB storage',
      '2,000 web pages',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

/**
 * Get plan by tier
 */
export function getPlanByTier(tier: number): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.tier === tier);
}

/**
 * Get plan by Stripe price ID
 */
export function getPlanByStripePriceId(priceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.stripePriceId === priceId);
}
