'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentApi, quotaApi } from '@/lib/api';
import {
  Check, CreditCard, ExternalLink, Loader2, X,
  MessageSquare, Bot, HardDrive, ArrowUpRight,
} from 'lucide-react';
import { Eyebrow, Pill, Button, Divider } from '@/components/corpus';

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
  const safeMax  = max  ?? 0;
  const pct      = safeMax > 0 ? Math.min((safeUsed / safeMax) * 100, 100) : 0;
  const isHigh   = pct >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-muted-soft" />
          <span className="text-[12px] font-medium text-muted">{label}</span>
        </div>
        <span className={`text-[12px] font-mono ${isHigh ? 'text-[#EF4444]' : 'text-muted-soft'}`}>
          {safeUsed.toLocaleString()} / {safeMax.toLocaleString()}
        </span>
      </div>
      <div className="h-1 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-[#EF4444]' : 'bg-ink'}`}
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
      <div className="space-y-2"><div className="w-24 h-2.5 rounded v4-shimmer" /><div className="w-48 h-7 rounded v4-shimmer" /></div>
      <div className="v4-card p-6 space-y-4">
        <div className="w-32 h-5 rounded v4-shimmer" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0,1,2].map(i => <div key={i} className="space-y-2"><div className="w-full h-3 rounded v4-shimmer" /><div className="w-full h-1.5 rounded v4-shimmer" /></div>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map(i => <div key={i} className="v4-card p-5 h-64" />)}
      </div>
    </div>
  );
}

/* ─── Cancel modal ────────────────────────────────────────── */
function CancelModal({
  open, onClose, onConfirm, loading,
}: { open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-line bg-canvas p-6 relative shadow-lg"
        style={{ animation: 'fadeInUp 0.2s cubic-bezier(0,0,0.2,1) both' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <Eyebrow>Confirm</Eyebrow>
        <h3
          className="font-display text-[20px] font-medium text-ink mt-2"
          style={{ letterSpacing: '-0.012em' }}
        >
          Cancel subscription?
        </h3>
        <p className="text-[13px] text-muted leading-relaxed mt-2 mb-6">
          You&apos;ll keep premium features until the end of your current billing period.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 justify-center" onClick={onClose} disabled={loading}>Keep plan</Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40"
          >
            {loading ? 'Canceling…' : 'Cancel plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function BillingPage() {
  const searchParams = useSearchParams();

  const [plans,           setPlans]           = useState<PricingPlan[]>([]);
  const [quota,           setQuota]           = useState<Quota | null>(null);
  const [subscription,    setSubscription]    = useState<Subscription | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [successMessage,  setSuccessMessage]  = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading,   setCancelLoading]   = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Your plan has been upgraded.');
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        cancelUrl:  `${window.location.origin}/settings/billing?canceled=true`,
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
      <div className="space-y-8 v4-animate-in max-w-[1240px] mx-auto">

        {/* Header */}
        <div>
          <Eyebrow>Billing</Eyebrow>
          <h1
            className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-ink">Plan & usage.</span>{' '}
            <span className="text-muted">Pick the size that fits.</span>
          </h1>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl bg-canvas border border-line px-4 py-3">
            <Check className="w-4 h-4 text-[#10B981] shrink-0" />
            <p className="text-[13px] text-ink flex-1">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="text-muted-soft hover:text-ink transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current plan + usage */}
        <div className="v4-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div>
              <Eyebrow>Current plan</Eyebrow>
              <div className="flex items-center gap-2 mt-2">
                <h2
                  className="font-display text-[22px] font-medium text-ink"
                  style={{ letterSpacing: '-0.012em' }}
                >
                  {getCurrentPlanName()}
                </h2>
                {subscription?.status === 'active' && (
                  <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-line bg-surface">
                    <span className="w-1 h-3 rounded-sm bg-[#10B981]" />
                    <span className="font-mono uppercase text-[10px] tracking-[0.14em] text-ink">Active</span>
                  </span>
                )}
              </div>
              {subscription && (
                <p className="text-[12px] text-muted-soft mt-1.5 font-mono">
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels on ${new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : `Renews on ${new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </p>
              )}
            </div>
            {subscription && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={CreditCard} onClick={handleManageSubscription}>Manage</Button>
                {!subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1.5 rounded-lg border border-line text-[13px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                  >
                    Cancel plan
                  </button>
                )}
              </div>
            )}
          </div>

          {quota && (
            <>
              <Divider className="mb-5" />
              <div className="grid gap-4 sm:grid-cols-3">
                <QuotaBar label="Chat messages" used={quota.chatUsage ?? 0}    max={quota.chatQuota ?? 0}    icon={MessageSquare} />
                <QuotaBar label="Chatbots"     used={quota.chatbotCount ?? 0} max={quota.chatbotQuota ?? 0} icon={Bot}            />
                <QuotaBar
                  label="Storage"
                  used={Math.round(((quota.storageUsage ?? (quota as any).storageUsed ?? 0)) / (1024 * 1024))}
                  max={Math.round((quota.storageQuota ?? 0) / (1024 * 1024))}
                  icon={HardDrive}
                />
              </div>
            </>
          )}
        </div>

        {/* Plans */}
        <div>
          <Eyebrow>Plans</Eyebrow>
          <h2
            className="font-display text-xl font-medium text-ink mt-2 mb-5"
            style={{ letterSpacing: '-0.012em' }}
          >
            Available tiers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => {
              const isCurrent    = !!(quota && quota.tier >= plan.tier);
              const isPopular    = plan.popular;
              const isProcessing = processingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-5 flex flex-col transition-colors v4-animate-in ${
                    isPopular ? 'border-ink bg-surface' : 'border-line bg-canvas hover:bg-surface/50'
                  }`}
                  style={{ animationDelay: `${60 + i * 60}ms` }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Pill variant="inverted">Popular</Pill>
                    </div>
                  )}

                  <div className="mb-4">
                    <Eyebrow>[{String(plan.tier).padStart(2, '0')}] {plan.name}</Eyebrow>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span
                        className="font-display text-[32px] font-medium text-ink leading-none"
                        style={{ letterSpacing: '-0.02em' }}
                      >
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-[12px] text-muted-soft font-mono">/{plan.interval}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    <li className="flex items-center gap-2 text-[12px] text-muted">
                      <Check className="w-3.5 h-3.5 text-ink shrink-0" />
                      {plan.features.chatQuota.toLocaleString()} messages/month
                    </li>
                    <li className="flex items-center gap-2 text-[12px] text-muted">
                      <Check className="w-3.5 h-3.5 text-ink shrink-0" />
                      {plan.features.chatbotQuota} chatbot{plan.features.chatbotQuota > 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center gap-2 text-[12px] text-muted">
                      <Check className="w-3.5 h-3.5 text-ink shrink-0" />
                      {formatStorage(plan.features.storageQuota)} storage
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isProcessing || isCurrent}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-colors disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'bg-surface border border-line text-muted-soft cursor-default'
                        : isPopular
                          ? 'bg-ink text-white hover:bg-ink-hover'
                          : 'border border-line text-ink hover:bg-surface'
                    }`}
                  >
                    {isProcessing ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing…</>)
                      : isCurrent ? (<><Check className="w-3.5 h-3.5" />Current plan</>)
                      : plan.price === 0 ? 'Free forever'
                      : (<><ArrowUpRight className="w-3.5 h-3.5" />Upgrade</>)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing history */}
        {subscription && (
          <div className="v4-card p-5 flex items-center justify-between">
            <div>
              <Eyebrow>Billing history</Eyebrow>
              <p className="text-[13px] text-ink mt-1">View invoices and manage payment methods.</p>
            </div>
            <Button variant="secondary" size="sm" icon={ExternalLink} onClick={handleManageSubscription}>
              Open portal
            </Button>
          </div>
        )}

        {/* Enterprise */}
        <div className="rounded-2xl border border-line bg-surface/50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <Eyebrow>Enterprise</Eyebrow>
            <p className="font-display text-[15px] font-medium text-ink mt-1" style={{ letterSpacing: '-0.012em' }}>
              Need a custom plan?
            </p>
            <p className="text-[12px] text-muted-soft mt-0.5">Custom limits, priority support, dedicated infra.</p>
          </div>
          <Button variant="secondary" size="sm" icon={ExternalLink}>Contact sales</Button>
        </div>
      </div>

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelLoading}
      />
    </>
  );
}
