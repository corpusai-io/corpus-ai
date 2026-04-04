'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentApi, quotaApi } from '@/lib/api';
import {
  Check,
  CreditCard,
  ExternalLink,
  Zap,
  Loader2,
  X,
  MessageSquare,
  Bot,
  HardDrive,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  tier: number;
  price: number;
  interval: 'month' | 'year';
  features: { chatQuota: number; chatbotQuota: number; storageQuota: number };
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

/* ─── Quota bar ───────────────────────────────────────────── */
function QuotaBar({ label, used, max, icon: Icon }: { label: string; used: number; max: number; icon: React.ComponentType<{ className?: string }> }) {
  const safeUsed = used ?? 0;
  const safeMax = max ?? 0;
  const pct = safeMax > 0 ? Math.min((safeUsed / safeMax) * 100, 100) : 0;
  const isHigh = pct >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-[#3F3F46]" />
          <span className="text-xs font-medium text-slate-500 dark:text-[#A1A1AA]">{label}</span>
        </div>
        <span className={`text-xs font-medium ${isHigh ? 'text-[#EC4899]' : 'text-slate-400 dark:text-[#3F3F46]'}`}>
          {safeUsed.toLocaleString()} / {safeMax.toLocaleString()}
        </span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-[#EC4899]' : 'bg-[#BF56FF]/70'}`}
          style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
        />
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonPage() {
  return (
    <div className="space-y-6 v4-animate-in">
      <div className="space-y-1.5">
        <div className="w-40 h-7 rounded-lg v4-shimmer" />
        <div className="w-56 h-4 rounded-md v4-shimmer" />
      </div>
      <div className="v4-card rounded-2xl p-6 space-y-4">
        <div className="w-32 h-5 rounded-md v4-shimmer" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0,1,2].map(i => (
            <div key={i} className="space-y-2">
              <div className="w-full h-3 rounded-full v4-shimmer" />
              <div className="w-full h-1.5 rounded-full v4-shimmer" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="v4-card rounded-2xl p-5 space-y-3">
            <div className="w-20 h-5 rounded-md v4-shimmer" />
            <div className="w-24 h-9 rounded-md v4-shimmer" />
            <div className="space-y-2 pt-2">
              <div className="w-full h-3 rounded-full v4-shimmer" />
              <div className="w-3/4 h-3 rounded-full v4-shimmer" />
            </div>
            <div className="w-full h-9 rounded-lg v4-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Cancel modal ────────────────────────────────────────── */
function CancelModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0E10] p-6 relative"
        style={{ animation: 'fadeInUp 0.2s cubic-bezier(0,0,0.2,1) both' }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent rounded-t-2xl" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 dark:text-[#3F3F46] hover:text-slate-600 dark:hover:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 flex items-center justify-center mb-4">
          <Zap className="h-5 w-5 text-[#EC4899]" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Cancel subscription?</h3>
        <p className="text-sm text-slate-500 dark:text-[#71717A] mb-6">
          You'll retain access to premium features until the end of your current billing period.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/[0.10] text-sm font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50"
          >
            Keep Plan
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#EC4899]/15 border border-[#EC4899]/25 text-sm font-medium text-[#EC4899] hover:bg-[#EC4899]/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Canceling…' : 'Cancel Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Your plan has been upgraded successfully!');
    }
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
      setPlans((plansData as any).plans || []);
      setQuota(quotaData as any);
      setSubscription(subData as any);
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!plan.stripePriceId) { alert('This plan is not available for purchase yet.'); return; }
    try {
      setProcessingPlanId(plan.id);
      const result = await paymentApi.createCheckout({
        priceId: plan.stripePriceId,
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
      }) as any;
      window.location.href = result.url;
    } catch (err: any) {
      alert('Failed to create checkout session: ' + err.message);
      setProcessingPlanId(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const result = await paymentApi.createPortalSession(window.location.href) as any;
      window.location.href = result.url;
    } catch (err: any) {
      alert('Failed to open customer portal: ' + err.message);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await paymentApi.cancel();
      setShowCancelModal(false);
      await loadData();
    } catch (err: any) {
      alert('Failed to cancel subscription: ' + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatStorage = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getCurrentPlanName = () => {
    if (!quota) return 'Free';
    const plan = plans.find((p) => p.tier === quota.tier);
    return plan?.name || 'Free';
  };

  if (loading) return <SkeletonPage />;

  return (
    <>
      <div className="space-y-6 v4-animate-in">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing</h1>
          <p className="text-sm text-slate-500 dark:text-[#71717A] mt-0.5">Manage your plan and subscription</p>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl bg-[#22C55E]/[0.08] border border-[#22C55E]/20 px-4 py-3">
            <Check className="h-4 w-4 text-[#22C55E] shrink-0" />
            <p className="text-sm text-[#22C55E] font-medium flex-1">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="text-[#22C55E]/70 hover:text-[#22C55E] transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Current plan + usage */}
        <div className="v4-card rounded-2xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#BF56FF]/10 border border-[#BF56FF]/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#BF56FF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">{getCurrentPlanName()} Plan</h2>
                  {subscription?.status === 'active' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-medium text-[#22C55E]">
                      <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
                      Active
                    </span>
                  )}
                </div>
                {subscription && (
                  <p className="text-xs text-slate-500 dark:text-[#71717A] mt-0.5">
                    {subscription.cancelAtPeriodEnd
                      ? `Cancels on ${new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : `Renews on ${new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </p>
                )}
              </div>
            </div>
            {subscription && (
              <div className="flex gap-2">
                <button
                  onClick={handleManageSubscription}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.10] text-xs font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Manage
                </button>
                {!subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EC4899]/20 text-xs font-medium text-[#EC4899] hover:bg-[#EC4899]/10 transition-all"
                  >
                    Cancel Plan
                  </button>
                )}
              </div>
            )}
          </div>

          {quota && (
            <div className="grid gap-4 sm:grid-cols-3">
              <QuotaBar label="Chat Messages" used={quota.chatUsage ?? 0} max={quota.chatQuota ?? 0} icon={MessageSquare} />
              <QuotaBar label="Chatbots" used={quota.chatbotCount ?? 0} max={quota.chatbotQuota ?? 0} icon={Bot} />
              <QuotaBar label="Storage" used={Math.round(((quota.storageUsage ?? (quota as any).storageUsed ?? 0)) / (1024 * 1024))} max={Math.round((quota.storageQuota ?? 0) / (1024 * 1024))} icon={HardDrive} />
            </div>
          )}
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Available Plans</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const isCurrent = !!(quota && quota.tier >= plan.tier);
              const isPopular = plan.popular;
              const isProcessing = processingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-5 flex flex-col transition-all duration-200 ${
                    isPopular
                      ? 'border-[#BF56FF]/40 bg-[#BF56FF]/[0.04] shadow-[0_0_30px_rgba(191,86,255,0.07)]'
                      : 'border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/[0.12]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#BF56FF] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        <Sparkles className="h-2.5 w-2.5" />
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-xs text-slate-400 dark:text-[#3F3F46]">/{plan.interval}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#71717A]">
                      <Check className="h-3.5 w-3.5 text-[#22C55E] shrink-0" />
                      {plan.features.chatQuota.toLocaleString()} messages/month
                    </li>
                    <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#71717A]">
                      <Check className="h-3.5 w-3.5 text-[#22C55E] shrink-0" />
                      {plan.features.chatbotQuota} chatbot{plan.features.chatbotQuota > 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#71717A]">
                      <Check className="h-3.5 w-3.5 text-[#22C55E] shrink-0" />
                      {formatStorage(plan.features.storageQuota)} storage
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isProcessing || isCurrent}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-[#3F3F46] cursor-default'
                        : isPopular
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90'
                          : 'border border-slate-200 dark:border-white/[0.10] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.20] hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {isProcessing ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</>
                    ) : isCurrent ? (
                      <><Check className="h-3.5 w-3.5" /> Current Plan</>
                    ) : plan.price === 0 ? (
                      'Free Forever'
                    ) : (
                      <><ArrowUpRight className="h-3.5 w-3.5" /> Upgrade</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing history */}
        {subscription && (
          <div className="v4-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Billing History</h3>
                <p className="text-xs text-slate-500 dark:text-[#71717A] mt-0.5">View invoices and manage payment methods</p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.10] text-xs font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Portal
              </button>
            </div>
          </div>
        )}

        {/* Enterprise */}
        <div className="rounded-2xl border border-[#BF56FF]/15 bg-[#BF56FF]/[0.03] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Need a custom plan?</h3>
            <p className="text-xs text-slate-500 dark:text-[#71717A] mt-0.5">Enterprise plans with custom limits and priority support.</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/[0.10] text-sm font-medium text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all shrink-0">
            <ExternalLink className="h-3.5 w-3.5" />
            Contact Sales
          </button>
        </div>

      </div>

      {/* Cancel modal */}
      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelLoading}
      />
    </>
  );
}
