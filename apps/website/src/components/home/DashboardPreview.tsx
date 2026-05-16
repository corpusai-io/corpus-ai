'use client';

// Static mockup showing the chatbot settings/configuration view.
// Colors match dashboard design tokens exactly.

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
  Shield,
  Link2,
  Key,
  Paintbrush,
  ChevronRight,
  Globe,
  Send,
  BookOpen,
  ArrowUpRight,
  Plus,
  Zap,
} from 'lucide-react';

// ─── Correct Corpus AI mark (two converging diagonals + focal circle) ──────────
function CorpusMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <path d="M 10 20 L 24 12 L 70 46 L 56 54 Z" fill="#171717" />
      <path d="M 10 80 L 24 88 L 70 54 L 56 46 Z" fill="#171717" />
      <circle cx="80" cy="50" r="8" fill="#171717" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SidebarItem({
  icon: Icon,
  label,
  active,
  indent,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  indent?: boolean;
  badge?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: indent ? '5px 10px 5px 22px' : '5px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        color: active ? '#171717' : '#737373',
        background: active ? '#F7F7F7' : 'transparent',
      }}
    >
      <Icon style={{ width: 13, height: 13, flexShrink: 0, color: active ? '#171717' : '#A1A1A1' }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#A1A1A1' }}>{badge}</span>}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontSize: 9, fontWeight: 600, color: '#A1A1A1', marginBottom: 4, padding: '0 10px', letterSpacing: '0.14em' }}>
      {children}
    </p>
  );
}

function TabBtn({ label, active }: { label: string; active?: boolean }) {
  return (
    <div style={{
      padding: '7px 14px',
      fontSize: 12,
      fontWeight: 500,
      color: active ? '#171717' : '#737373',
      borderBottom: active ? '2px solid #171717' : '2px solid transparent',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#171717', marginBottom: 5 }}>{label}</div>
      <div style={{
        padding: '8px 12px',
        border: '1px solid #E8E8E8',
        borderRadius: 8,
        fontSize: 12,
        color: '#737373',
        background: '#FFFFFF',
        fontFamily: mono ? 'monospace' : 'inherit',
      }}>{value}</div>
    </div>
  );
}

function SelectRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#171717', marginBottom: 5 }}>{label}</div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        border: '1px solid #E8E8E8',
        borderRadius: 8,
        fontSize: 12,
        color: '#737373',
        background: '#FFFFFF',
      }}>
        <span>{value}</span>
        <ChevronRight style={{ width: 12, height: 12, color: '#A1A1A1' }} />
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, on }: { label: string; sub: string; on?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#171717' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#A1A1A1', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{
        width: 32,
        height: 18,
        borderRadius: 99,
        background: on ? '#171717' : '#E8E8E8',
        position: 'relative',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: 2,
          left: on ? 14 : 2,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#FFFFFF',
          transition: 'left 0.15s',
        }} />
      </div>
    </div>
  );
}

// ─── Right panel: live chat preview ──────────────────────────────────────────

function ChatPreviewPanel() {
  const messages = [
    { from: 'bot',  text: 'Hi! I\'m your Support Agent. How can I help you today?' },
    { from: 'user', text: 'What\'s your return policy?' },
    { from: 'bot',  text: 'We offer a 30-day return window on all orders. Items must be unused and in original packaging. Shall I start a return for you?' },
  ];

  return (
    <div style={{
      width: 260,
      flexShrink: 0,
      background: '#FAFAFA',
      borderLeft: '1px solid #E8E8E8',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Chat header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #E8E8E8',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#FFFFFF',
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: '#171717',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CorpusMark size={14} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#171717' }}>Support Agent</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#A1A1A1' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Online
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#A1A1A1', background: '#F7F7F7', border: '1px solid #E8E8E8', padding: '2px 6px', borderRadius: 4 }}>PREVIEW</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'hidden' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.from === 'bot' && (
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: '#171717',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 6,
                flexShrink: 0,
                alignSelf: 'flex-end',
              }}>
                <CorpusMark size={10} />
              </div>
            )}
            <div style={{
              maxWidth: '78%',
              padding: '8px 10px',
              borderRadius: m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              fontSize: 10.5,
              lineHeight: 1.5,
              background: m.from === 'user' ? '#171717' : '#FFFFFF',
              color: m.from === 'user' ? '#FFFFFF' : '#171717',
              border: m.from === 'bot' ? '1px solid #E8E8E8' : 'none',
            }}>{m.text}</div>
          </div>
        ))}

        {/* Typing indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CorpusMark size={10} />
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: '12px 12px 12px 2px', padding: '8px 12px', display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#A1A1A1', opacity: 0.6 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #E8E8E8', background: '#FFFFFF' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid #E8E8E8',
          borderRadius: 10,
          padding: '7px 10px',
          background: '#F7F7F7',
        }}>
          <span style={{ flex: 1, fontSize: 10, color: '#A1A1A1' }}>Message Support Agent…</span>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send style={{ width: 10, height: 10, color: '#FFFFFF' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPreview() {
  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 16 }} aria-hidden="true">
      <div style={{ width: 1100, transformOrigin: 'top left', transform: 'scale(var(--dashboard-scale, 1))' }} className="dashboard-scale-wrapper">
        {/* Shell */}
        <div style={{
          display: 'flex',
          height: 620,
          background: '#F7F7F7',
          border: '1px solid #E8E8E8',
          borderRadius: 16,
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <aside style={{ width: 210, flexShrink: 0, background: '#FFFFFF', borderRight: '1px solid #E8E8E8', display: 'flex', flexDirection: 'column' }}>
            {/* Wordmark */}
            <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: '1px solid #E8E8E8', gap: 8 }}>
              <CorpusMark size={20} />
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: '#171717' }}>
                CORPUS<span style={{ color: '#737373', fontWeight: 400 }}> AI</span>
              </span>
            </div>

            {/* Nav */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Workspace */}
              <div>
                <GroupLabel>Workspace</GroupLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <SidebarItem icon={LayoutDashboard} label="Dashboard" />
                  <SidebarItem icon={Bot} label="Chatbots" badge="2" />
                  <SidebarItem icon={CreditCard} label="Billing" />
                </div>
              </div>

              {/* Active chatbot sub-nav */}
              <div>
                <GroupLabel>Support Agent</GroupLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <SidebarItem icon={MessageSquare} label="Chat" indent />
                  <SidebarItem icon={BarChart3}     label="Analytics" indent />
                  <SidebarItem icon={Database}      label="Datastores" indent />
                  <SidebarItem icon={Rocket}        label="Deploy" indent />
                  <SidebarItem icon={Users}         label="Leads" indent />
                  <SidebarItem icon={Settings}      label="Settings" indent active />
                </div>
              </div>

              {/* Settings sub-nav */}
              <div>
                <GroupLabel>Settings</GroupLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <SidebarItem icon={Settings}   label="General" indent active />
                  <SidebarItem icon={Paintbrush} label="Customization" indent />
                  <SidebarItem icon={Key}        label="API Keys" indent />
                  <SidebarItem icon={Link2}      label="Integrations" indent />
                  <SidebarItem icon={Shield}     label="Security" indent />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid #E8E8E8' }}>
              <div style={{
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
                cursor: 'pointer',
              }}>
                <ArrowUpRight style={{ width: 11, height: 11 }} />
                Upgrade plan
              </div>
            </div>
          </aside>

          {/* ── Main ─────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header */}
            <header style={{
              height: 52,
              borderBottom: '1px solid #E8E8E8',
              display: 'flex',
              alignItems: 'center',
              padding: '0 22px',
              gap: 8,
              background: '#FFFFFF',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, color: '#A1A1A1' }}>Chatbots</span>
              <ChevronRight style={{ width: 11, height: 11, color: '#A1A1A1' }} />
              <span style={{ fontSize: 11, color: '#A1A1A1' }}>Support Agent</span>
              <ChevronRight style={{ width: 11, height: 11, color: '#A1A1A1' }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: '#171717' }}>Settings</span>
              <div style={{ flex: 1 }} />
              {/* Status pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 2px #10B98133' }} />
                <span style={{ fontSize: 10, fontWeight: 500, color: '#10B981', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
              </div>
              <div style={{ width: 1, height: 16, background: '#E8E8E8', margin: '0 4px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#A1A1A1', cursor: 'pointer' }}>
                <BookOpen style={{ width: 12, height: 12 }} />
                Docs
              </div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#FFFFFF' }}>
                A
              </div>
            </header>

            {/* Body: settings + chat preview */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

              {/* Settings panel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E8', background: '#FFFFFF', padding: '0 22px' }}>
                  <TabBtn label="General" active />
                  <TabBtn label="Customization" />
                  <TabBtn label="API Keys" />
                  <TabBtn label="Integrations" />
                  <TabBtn label="Security" />
                </div>

                {/* Form content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '22px 22px' }}>
                  {/* Section: Basic info */}
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#A1A1A1', marginBottom: 12 }}>
                      Basic information
                    </div>
                    <FieldRow label="Chatbot name" value="Support Agent" />
                    <FieldRow label="Description" value="Handles tier-1 support queries using the help centre documentation and product FAQs." />
                    <SelectRow label="Language" value="English (en)" />
                  </div>

                  <div style={{ height: 1, background: '#E8E8E8', marginBottom: 22 }} />

                  {/* Section: Behaviour */}
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#A1A1A1', marginBottom: 12 }}>
                      Behaviour
                    </div>
                    <SelectRow label="LLM Model" value="GPT-4o mini (fast, cost-efficient)" />
                    <ToggleRow label="Show citations" sub="Display source references in responses" on />
                    <ToggleRow label="Keep showing suggestions" sub="Persist suggested questions after first reply" />
                    <ToggleRow label="Lead capture" sub="Collect visitor contact info during chat" on />
                  </div>

                  <div style={{ height: 1, background: '#E8E8E8', marginBottom: 22 }} />

                  {/* Section: System prompt preview */}
                  <div>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#A1A1A1', marginBottom: 12 }}>
                      System prompt
                    </div>
                    <div style={{
                      background: '#F7F7F7',
                      border: '1px solid #E8E8E8',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: 11,
                      color: '#737373',
                      lineHeight: 1.7,
                      fontFamily: 'monospace',
                    }}>
                      You are a helpful support agent for Acme Corp. Answer questions using only the provided knowledge base. If unsure, escalate to a human agent. Always be concise and polite.
                    </div>
                  </div>

                  {/* Save button */}
                  <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      background: '#171717',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                    }}>
                      <Zap style={{ width: 12, height: 12 }} />
                      Save changes
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      background: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      color: '#737373',
                      cursor: 'pointer',
                    }}>
                      Discard
                    </div>
                  </div>
                </div>
              </div>

              {/* Live chat preview panel */}
              <ChatPreviewPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 40%, white 100%)',
        pointerEvents: 'none',
        borderRadius: 16,
      }} />
    </div>
  );
}
