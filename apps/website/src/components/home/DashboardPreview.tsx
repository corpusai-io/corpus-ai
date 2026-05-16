'use client';

// Static mockup of the real dashboard — chatbot chat page view.
// Mirrors apps/dashboard/src/app/chatbots/[id]/chat/page.tsx exactly.

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
  ArrowUp,
  Sparkles,
  UserIcon,
  ThumbsUp,
  ThumbsDown,
  Copy,
} from 'lucide-react';

// ─── Correct Corpus AI mark ────────────────────────────────────────────────────
function CorpusMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <path d="M 10 20 L 24 12 L 70 46 L 56 54 Z" fill="currentColor" />
      <path d="M 10 80 L 24 88 L 70 54 L 56 46 Z" fill="currentColor" />
      <circle cx="80" cy="50" r="8" fill="currentColor" />
    </svg>
  );
}

// ─── Sidebar pieces ────────────────────────────────────────────────────────────

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontSize: 9, fontWeight: 600, color: '#A1A1A1', marginBottom: 4, padding: '0 10px', letterSpacing: '0.14em' }}>
      {children}
    </p>
  );
}

function NavItem({ icon: Icon, label, active, indent, badge }: {
  icon: React.ElementType; label: string; active?: boolean; indent?: boolean; badge?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: indent ? '5px 10px 5px 22px' : '5px 10px',
      borderRadius: 8, fontSize: 12, fontWeight: 500,
      color: active ? '#171717' : '#737373',
      background: active ? '#F7F7F7' : 'transparent',
    }}>
      <Icon style={{ width: 13, height: 13, flexShrink: 0, color: active ? '#171717' : '#A1A1A1' }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#A1A1A1' }}>{badge}</span>}
    </div>
  );
}

// ─── Chat page sub-components ─────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: '#FFFFFF', border: '1px solid #E8E8E8',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      color: '#171717',
    }}>
      <CorpusMark size={12} />
    </div>
  );
}

function UserAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: '#FFFFFF', border: '1px solid #E8E8E8',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      color: '#A1A1A1',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </div>
  );
}

interface ChatMsg { role: 'user' | 'bot'; text: string; time: string }

function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, maxWidth: '78%' }}>
          <div style={{
            background: '#171717', color: '#FFFFFF',
            padding: '10px 16px', borderRadius: '16px 16px 4px 16px',
            fontSize: 13, lineHeight: 1.55,
          }}>{msg.text}</div>
          <span style={{ fontSize: 10, color: '#A1A1A1', fontFamily: 'monospace', paddingRight: 2 }}>{msg.time}</span>
        </div>
        <UserAvatar />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12 }}>
      <BotAvatar />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '85%' }}>
        <div style={{
          background: '#FFFFFF', border: '1px solid #E8E8E8',
          padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
          fontSize: 13, lineHeight: 1.6, color: '#171717',
        }}>{msg.text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
          <span style={{ fontSize: 10, color: '#A1A1A1', fontFamily: 'monospace' }}>{msg.time}</span>
          <div style={{ width: 1, height: 10, background: '#E8E8E8' }} />
          <ThumbsUp style={{ width: 11, height: 11, color: '#A1A1A1' }} />
          <ThumbsDown style={{ width: 11, height: 11, color: '#A1A1A1' }} />
          <Copy style={{ width: 11, height: 11, color: '#A1A1A1' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MESSAGES: ChatMsg[] = [
  { role: 'user', text: 'What are the refund policy details?', time: '09:41' },
  { role: 'bot',  text: 'We offer a 30-day refund window on all plans. To request a refund, email support@acme.com with your order ID. Refunds are processed within 5–7 business days.', time: '09:41' },
  { role: 'user', text: 'Can I get a partial refund if I upgrade mid-cycle?', time: '09:42' },
];

const SUGGESTED = [
  'What can you help me with?',
  'Summarise the main topics',
  'Give me a quick overview',
];

export default function DashboardPreview() {
  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 16 }} aria-hidden="true">
      <div style={{ width: 1100, transformOrigin: 'top left', transform: 'scale(var(--dashboard-scale, 1))' }} className="dashboard-scale-wrapper">

        {/* Shell */}
        <div style={{
          display: 'flex', height: 620, background: '#F7F7F7',
          border: '1px solid #E8E8E8', borderRadius: 16,
          overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif',
        }}>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside style={{ width: 210, flexShrink: 0, background: '#FFFFFF', borderRight: '1px solid #E8E8E8', display: 'flex', flexDirection: 'column' }}>
            {/* Wordmark */}
            <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: '1px solid #E8E8E8', gap: 9 }}>
              <div style={{ color: '#171717' }}><CorpusMark size={20} /></div>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: '#171717' }}>
                CORPUS<span style={{ color: '#737373', fontWeight: 400 }}> AI</span>
              </span>
            </div>

            {/* Nav */}
            <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <GroupLabel>Workspace</GroupLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <NavItem icon={LayoutDashboard} label="Dashboard" />
                  <NavItem icon={Bot} label="Chatbots" badge="2" />
                  <NavItem icon={CreditCard} label="Billing" />
                </div>
              </div>
              <div>
                <GroupLabel>Support Agent</GroupLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <NavItem icon={MessageSquare} label="Chat" indent active />
                  <NavItem icon={BarChart3}     label="Analytics" indent />
                  <NavItem icon={Database}      label="Datastores" indent />
                  <NavItem icon={Rocket}        label="Deploy" indent />
                  <NavItem icon={Users}         label="Leads" indent />
                  <NavItem icon={Settings}      label="Settings" indent />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Chat page ────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F7F7F7', minWidth: 0 }}>

            {/* Title row — mirrors the real px-6 lg:px-8 pt-6 pb-4 border-b */}
            <div style={{
              padding: '18px 32px 14px',
              borderBottom: '1px solid #E8E8E8',
              background: 'rgba(255,255,255,0.6)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontSize: 9, fontWeight: 600, color: '#A1A1A1', letterSpacing: '0.14em', marginBottom: 5 }}>
                    Chatbot
                  </p>
                  <h1 style={{ fontSize: 22, fontWeight: 500, color: '#171717', letterSpacing: '-0.02em', margin: 0 }}>
                    Support Agent
                  </h1>
                </div>
                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 4, height: 16, borderRadius: 2, background: '#10B981',
                      boxShadow: '0 0 0 0 #10B981',
                      animation: 'none',
                    }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#171717' }}>
                      Live
                    </span>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 99, background: '#FFFFFF',
                    border: '1px solid #E8E8E8', fontSize: 11, color: '#737373',
                  }}>
                    3 msgs
                  </div>
                </div>
              </div>
            </div>

            {/* Thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {MESSAGES.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}

                {/* Typing indicator */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <BotAvatar />
                  <div style={{
                    background: '#FFFFFF', border: '1px solid #E8E8E8',
                    padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
                    display: 'flex', gap: 5, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4D4D4' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Composer — mirrors the real composer exactly */}
            <div style={{ flexShrink: 0, padding: '12px 32px 20px', background: '#F7F7F7' }}>
              <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <div style={{
                  border: '1px solid #E8E8E8', background: '#FFFFFF',
                  borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  {/* Placeholder input */}
                  <div style={{
                    padding: '12px 16px 4px',
                    fontSize: 13, color: '#A1A1A1',
                  }}>
                    Ask the bot anything…
                  </div>
                  {/* Composer footer */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 12px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#A1A1A1' }}>
                      <Sparkles style={{ width: 12, height: 12 }} />
                      <span>Grounded in your sources</span>
                      <span style={{ margin: '0 2px' }}>·</span>
                      <span style={{ fontFamily: 'monospace', letterSpacing: '0.14em' }}>⌘ + ENTER</span>
                    </div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: '#E8E8E8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ArrowUp style={{ width: 14, height: 14, color: '#A1A1A1' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 40%, white 100%)',
        pointerEvents: 'none', borderRadius: 16,
      }} />
    </div>
  );
}
