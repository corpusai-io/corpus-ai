'use client';

// Static mockup that mirrors the real apps/dashboard UI exactly.
// Colors, spacing and typography are copied 1-to-1 from the dashboard's design tokens:
// canvas=#FFFFFF, surface=#F7F7F7, line=#E8E8E8, ink=#171717, muted=#737373, muted-soft=#A1A1A1

import React from 'react';
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  MessageSquare,
  BarChart3,
  Database,
  Users,
  Rocket,
  Settings,
  Plus,
  Search,
  Globe,
  FileText,
  BookOpen,
  Key,
  ArrowUpRight,
} from 'lucide-react';

// ─── Sub-components ───────────────────────────────────────────────────────────

function CorpusMark({ size = 22 }: { size?: number }) {
  // Simplified emblem matching the Mark component
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#171717" />
      <rect x="6" y="7" width="5" height="2" rx="1" fill="white" />
      <rect x="6" y="11" width="8" height="2" rx="1" fill="white" />
      <rect x="6" y="15" width="5" height="2" rx="1" fill="white" />
    </svg>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string | number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        color: active ? '#171717' : '#737373',
        background: active ? '#F7F7F7' : 'transparent',
      }}
    >
      <Icon style={{ width: 14, height: 14, flexShrink: 0, color: active ? '#171717' : '#A1A1A1' }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#A1A1A1' }}>{badge}</span>
      )}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'monospace',
        textTransform: 'uppercase',
        fontSize: 9,
        fontWeight: 600,
        color: '#A1A1A1',
        marginBottom: 6,
        padding: '0 10px',
        letterSpacing: '0.14em',
      }}
    >
      {children}
    </p>
  );
}

function QuotaRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 3 }}>
        <span style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#A1A1A1' }}>{label}</span>
        <span style={{ fontFamily: 'monospace', color: '#737373' }}>{pct}%</span>
      </div>
      <div style={{ height: 2, background: '#F7F7F7', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#171717', borderRadius: 99 }} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  hint,
  delay,
}: {
  label: string;
  value: string;
  sub: string;
  hint: string;
  delay: number;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderRadius: 12,
        padding: '14px 16px',
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#737373', fontFamily: 'monospace' }}>{label}</span>
        <span style={{ fontSize: 10, color: '#A1A1A1', fontFamily: 'monospace' }}>{hint}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#171717', marginTop: 6, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#A1A1A1', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function ChatbotCard({
  title,
  desc,
  origin,
  status,
}: {
  title: string;
  desc: string;
  origin: string;
  status: 'live' | 'training' | 'draft';
}) {
  const statusColor = status === 'live' ? '#10B981' : status === 'training' ? '#F59E0B' : '#C4C4C4';
  const statusLabel = status === 'live' ? 'Active' : status === 'training' ? 'Training' : 'Draft';
  const isUrl = origin.startsWith('http') || origin.includes('.');

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Icon chip */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#F7F7F7',
            border: '1px solid #E8E8E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CorpusMark size={16} />
        </div>
        {/* Status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 0 2px ${statusColor}33`,
            }}
          />
          <span style={{ fontSize: 10, color: statusColor, fontWeight: 500 }}>{statusLabel}</span>
        </div>
      </div>
      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#171717', letterSpacing: '-0.012em', lineHeight: 1.3 }}>{title}</div>
      {/* Desc */}
      <div style={{ fontSize: 11, color: '#737373', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</div>
      {/* Origin */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#A1A1A1' }}>
        {isUrl
          ? <Globe style={{ width: 10, height: 10 }} />
          : <FileText style={{ width: 10, height: 10 }} />
        }
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{origin}</span>
      </div>
      {/* Divider */}
      <div style={{ height: 1, background: '#E8E8E8' }} />
      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 500,
            color: '#737373',
            background: '#F7F7F7',
            border: '1px solid #E8E8E8',
          }}
        >
          <MessageSquare style={{ width: 10, height: 10 }} />
          Chat
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: 5, borderRadius: 6, color: '#A1A1A1' }}>
          <Settings style={{ width: 12, height: 12 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPreview() {
  return (
    // Outer scaler: renders at 1100px natural width, scaled down to fit container
    <div
      style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 16 }}
      aria-hidden="true"
    >
      {/* Scale wrapper — scales 1100px content down to container width */}
      <div
        style={{
          width: 1100,
          transformOrigin: 'top left',
          transform: 'scale(var(--dashboard-scale, 1))',
        }}
        className="dashboard-scale-wrapper"
      >
        {/* Shell */}
        <div
          style={{
            display: 'flex',
            height: 620,
            background: '#F7F7F7',
            border: '1px solid #E8E8E8',
            borderRadius: 16,
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside
            style={{
              width: 200,
              flexShrink: 0,
              background: '#FFFFFF',
              borderRight: '1px solid #E8E8E8',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Wordmark */}
            <div
              style={{
                height: 52,
                display: 'flex',
                alignItems: 'center',
                padding: '0 18px',
                borderBottom: '1px solid #E8E8E8',
                gap: 8,
              }}
            >
              <CorpusMark size={20} />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#171717',
                }}
              >
                CORPUS<span style={{ color: '#737373', fontWeight: 500 }}> AI</span>
              </span>
            </div>

            {/* Nav */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Workspace */}
              <div>
                <GroupLabel>Workspace</GroupLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <NavItem icon={LayoutDashboard} label="Dashboard" active />
                  <NavItem icon={Bot} label="Chatbots" badge={2} />
                  <NavItem icon={CreditCard} label="Billing" />
                </div>
              </div>
            </div>

            {/* Quota footer */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid #E8E8E8' }}>
              <QuotaRow label="Messages" pct={42} />
              <QuotaRow label="Chatbots" pct={100} />
              <QuotaRow label="Storage" pct={18} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 500,
                  background: '#171717',
                  color: '#FFFFFF',
                  marginTop: 10,
                  cursor: 'pointer',
                }}
              >
                <ArrowUpRight style={{ width: 11, height: 11 }} />
                Upgrade plan
              </div>
            </div>
          </aside>

          {/* ── Main ─────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header */}
            <header
              style={{
                height: 52,
                borderBottom: '1px solid #E8E8E8',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                gap: 10,
                background: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, color: '#737373' }}>Dashboard</span>
              <div style={{ flex: 1 }} />
              {/* Tier badge */}
              <div
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid #E8E8E8',
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#737373',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Starter
              </div>
              {/* Docs link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#A1A1A1', cursor: 'pointer' }}>
                <BookOpen style={{ width: 13, height: 13 }} />
                Docs
              </div>
              {/* Avatar */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#171717',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                A
              </div>
            </header>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 0' }}>

              {/* Greeting */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: '#A1A1A1',
                      marginBottom: 6,
                    }}
                  >
                    Monday · May 16
                  </div>
                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      color: '#171717',
                    }}
                  >
                    Good morning, Alex.{' '}
                    <span style={{ color: '#737373', fontWeight: 400 }}>2 bots running and learning.</span>
                  </h1>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 500,
                    background: '#171717',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Plus style={{ width: 12, height: 12 }} />
                  New chatbot
                </div>
              </div>

              {/* Stat grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                <StatCard label="[01] Chatbots" value="2" sub="2 of 2 used" hint="100%" delay={60} />
                <StatCard label="[02] Messages" value="847" sub="of 1,500 / month" hint="56%" delay={120} />
                <StatCard label="[03] Storage" value="24 MB" sub="of 50 MB" hint="48%" delay={180} />
                <StatCard label="[04] Active bots" value="2" sub="2 of 2 live" hint="100%" delay={240} />
              </div>

              {/* Chatbots section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: '#A1A1A1',
                        marginBottom: 4,
                      }}
                    >
                      Your chatbots
                    </div>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#171717', letterSpacing: '-0.012em' }}>
                      Active and recently created
                    </h2>
                  </div>
                  {/* Search */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      border: '1px solid #E8E8E8',
                      borderRadius: 8,
                      fontSize: 11,
                      color: '#A1A1A1',
                      background: '#FFFFFF',
                    }}
                  >
                    <Search style={{ width: 11, height: 11 }} />
                    Search chatbots…
                  </div>
                </div>

                {/* Cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <ChatbotCard
                    title="Support Agent"
                    desc="Handles tier-1 support queries using the help centre documentation."
                    origin="docs.acme.com"
                    status="live"
                  />
                  <ChatbotCard
                    title="Sales Assistant"
                    desc="Qualifies inbound leads and books demos from the pricing page."
                    origin="acme.com/pricing"
                    status="live"
                  />
                  <ChatbotCard
                    title="HR Onboarding Bot"
                    desc="Answers new-hire questions from the employee handbook PDFs."
                    origin="handbook.pdf"
                    status="training"
                  />
                </div>
              </div>

              {/* Quick access strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '1px solid #E8E8E8',
                  borderRadius: 12,
                  background: '#FFFFFF',
                  marginTop: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: '#A1A1A1',
                      marginBottom: 4,
                    }}
                  >
                    Quick access
                  </div>
                  <div style={{ fontSize: 12, color: '#171717' }}>
                    Documentation, billing, and API keys — all one click away.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { icon: BookOpen, label: 'Docs' },
                    { icon: CreditCard, label: 'Billing' },
                    { icon: Key, label: 'API keys' },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 10px',
                        border: '1px solid #E8E8E8',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 500,
                        color: '#737373',
                        background: '#F7F7F7',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon style={{ width: 11, height: 11 }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gradient fade at bottom ───────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, white 100%)',
          pointerEvents: 'none',
          borderRadius: 16,
        }}
      />
    </div>
  );
}
