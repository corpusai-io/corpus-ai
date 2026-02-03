'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentApi, quotaApi } from '@/lib/api';
import { Button, Progress } from '@corpusai/ui';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  tier: number;
  price: number;
  interval: 'month' | 'year';
  features: {
    chatQuota: number;
    chatbotQuota: number;
    storageQuota: number;
  };
  stripePriceId?: string;
  popular?: boolean;
}

interface Quota {
  tier: number;
  chatQuota: number;
  chatUsage: number;
  chatbotQuota: number;
  chatbotCount: number;
  storageQuota: number;
  storageUsage: number;
}

interface Subscription {
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  plan: string;
}

export default function BillingPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, quotaData, subData] = await Promise.all([
        paymentApi.getPlans(),
        quotaApi.get(),
        paymentApi.getSubscription().catch(() => null),
      ]);

      setPlans(plansData.plans || []);
      setQuota(quotaData);
      setSubscription(subData);
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!plan.stripePriceId) {
      alert('This plan is not available for purchase yet.');
      return;
    }

    try {
      setProcessingPlanId(plan.id);

      const { url } = await paymentApi.createCheckout({
        priceId: plan.stripePriceId,
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
      });

      window.location.href = url;
    } catch (err: any) {
      alert('Failed to create checkout session: ' + err.message);
      setProcessingPlanId(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await paymentApi.createPortalSession();
      window.location.href = url;
    } catch (err: any) {
      alert('Failed to open customer portal: ' + err.message);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of the billing period.'
      )
    )
      return;

    try {
      await paymentApi.cancel();
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
      loadData();
    } catch (err: any) {
      alert('Failed to cancel subscription: ' + err.message);
    }
  };

  const getCurrentPlanName = () => {
    if (!quota) return 'Free';
    const plan = plans.find((p) => p.tier === quota.tier);
    return plan?.name || 'Free';
  };

  const formatStorage = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BF56FF] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your plan and payment methods
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getCurrentPlanName()} Plan
                </h2>
                {subscription?.status === 'active' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    <Check className="h-3 w-3" />
                    Active
                  </span>
                )}
              </div>
              {subscription && (
                <p className="mt-1 text-sm text-gray-600">
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {subscription && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                  {!subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Cancel Plan
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Usage Stats */}
          {quota && (
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Chat Messages
                  </p>
                  <p className="text-sm text-gray-600">
                    {quota.chatUsage} / {quota.chatQuota}
                  </p>
                </div>
                <Progress
                  value={(quota.chatUsage / quota.chatQuota) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Chatbots</p>
                  <p className="text-sm text-gray-600">
                    {quota.chatbotCount} / {quota.chatbotQuota}
                  </p>
                </div>
                <Progress
                  value={(quota.chatbotCount / quota.chatbotQuota) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Storage</p>
                  <p className="text-sm text-gray-600">
                    {formatStorage(quota.storageUsage)} /{' '}
                    {formatStorage(quota.storageQuota)}
                  </p>
                </div>
                <Progress
                  value={(quota.storageUsage / quota.storageQuota) * 100}
                  className="h-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Available Plans
          </h2>

          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  plan.popular
                    ? 'border-[#BF56FF] bg-gradient-to-br from-purple-50 to-white'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] px-3 py-1 text-xs font-medium text-white">
                      <Zap className="h-3 w-3" />
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600">/{plan.interval}</span>
                    )}
                  </div>
                </div>

                <ul className="mb-6 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-600" />
                    {plan.features.chatQuota.toLocaleString()} messages/month
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-600" />
                    {plan.features.chatbotQuota} chatbot
                    {plan.features.chatbotQuota > 1 ? 's' : ''}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-600" />
                    {formatStorage(plan.features.storageQuota)} storage
                  </li>
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={
                    processingPlanId === plan.id ||
                    (quota && quota.tier >= plan.tier)
                  }
                  className={
                    plan.popular
                      ? 'w-full bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90'
                      : 'w-full'
                  }
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {processingPlanId === plan.id
                    ? 'Processing...'
                    : quota && quota.tier >= plan.tier
                      ? 'Current Plan'
                      : plan.price === 0
                        ? 'Free Forever'
                        : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900">Need Custom Plan?</h3>
          <p className="mt-2 text-sm text-blue-800">
            Contact our sales team for enterprise plans with custom limits and
            priority support.
          </p>
          <Button variant="outline" className="mt-4 border-blue-300" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
