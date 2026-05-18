'use client';

// Self-running animated demo mirroring the real dashboard.
// Loop: type prompt → action monitor → structured answer →
// cursor → Analytics (stat cards + chart) → scroll down to query log → back.
// Mirrors apps/dashboard chat + analytics pages. Respects reduced-motion.

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard, Bot, CreditCard, MessageSquare, BarChart3,
  Database, Users, Rocket, Settings, ArrowUp, Sparkles,
  ThumbsUp, ThumbsDown, Copy, Check, Loader2, TrendingUp, Download, Search,
} from 'lucide-react';

// ─── Tokens (mirror apps/dashboard design tokens) ──────────────────────────────
const INK = '#171717';
const MUTED = '#737373';
const SOFT = '#A1A1A1';
const LINE = '#E8E8E8';
const LINE_STRONG = '#D4D4D4';
const SURFACE = '#F7F7F7';
const CANVAS = '#FFFFFF';
const EASE = [0, 0, 0.2, 1] as const;

function CorpusMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <path d="M 10 20 L 24 12 L 70 46 L 56 54 Z" fill="currentColor" />
      <path d="M 10 80 L 24 88 L 70 54 L 56 46 Z" fill="currentColor" />
      <circle cx="80" cy="50" r="8" fill="currentColor" />
    </svg>
  );
}

type View = 'chat' | 'analytics';

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontSize: 9, fontWeight: 600, color: SOFT, marginBottom: 4, padding: '0 10px', letterSpacing: '0.14em' }}>
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
      color: active ? INK : MUTED,
      background: active ? SURFACE : 'transparent',
      transition: 'background 0.25s ease, color 0.25s ease',
    }}>
      <Icon style={{ width: 13, height: 13, flexShrink: 0, color: active ? INK : SOFT, transition: 'color 0.25s ease' }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontFamily: 'monospace', fontSize: 9, color: SOFT }}>{badge}</span>}
    </div>
  );
}

// ─── Chat pieces ───────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: CANVAS, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: INK }}>
      <CorpusMark size={12} />
    </div>
  );
}
function UserAvatar() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: CANVAS, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: SOFT }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </div>
  );
}

const QUESTION = 'Which plan fits ~8,000 conversations a month?';
const ACTION_STEPS = [
  { label: 'Retrieving sources', note: '12 docs · pricing.md' },
  { label: 'Reranking passages', note: '1,240 → 8 chunks' },
  { label: 'Generating answer', note: 'gpt-4o-mini' },
];
const ANSWER_BULLETS = [
  'Business plan — 15,000 messages / month',
  'Headroom for traffic spikes + up to 8 bots',
  'Upgrade anytime, billing is prorated',
];

function ActionMonitor({ done }: { done: number }) {
  return (
    <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkles style={{ width: 12, height: 12, color: INK }} />
        <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT }}>Action monitor</span>
      </div>
      {ACTION_STEPS.map((s, i) => {
        const isDone = i < done;
        const isActive = i === done;
        return (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: isDone || isActive ? 1 : 0.4, transition: 'opacity 0.3s ease' }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              background: isDone ? INK : CANVAS, border: `1px solid ${isDone ? INK : LINE}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}>
              {isDone ? <Check style={{ width: 9, height: 9, color: CANVAS }} strokeWidth={3} />
                : isActive ? <Loader2 style={{ width: 10, height: 10, color: SOFT, animation: 'cpSpin 0.8s linear infinite' }} /> : null}
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: INK, flex: 1 }}>{s.label}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: SOFT }}>{s.note}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Analytics view (mirrors apps/dashboard analytics page) ────────────────────

const STATS = [
  { label: '[01] Queries', value: '2,847', sub: 'across 30 days' },
  { label: '[02] Avg response', value: '1.2s', sub: 'from query to answer' },
  { label: '[03] Positive feedback', value: '94%', sub: '268 up · 17 down' },
  { label: '[04] Sessions', value: '1,043', sub: 'unique users' },
];
const BARS = [34, 48, 41, 60, 52, 73, 66, 58, 80, 71, 63, 88, 76, 69];
const LOGS = [
  { date: 'May 17', query: 'Which plan fits ~8,000 conversations?', answer: 'For ~8,000/mo the Business plan is the best fit…', thumb: 'up', dur: '1.1s' },
  { date: 'May 17', query: 'Do you support WhatsApp deployment?', answer: 'Yes — connect a WhatsApp Business number in…', thumb: 'up', dur: '0.9s' },
  { date: 'May 16', query: 'How is my data secured?', answer: 'All data is encrypted at rest (AES-256) and…', thumb: '', dur: '1.4s' },
  { date: 'May 16', query: 'Can I export the query logs?', answer: 'You can export any date range to CSV from…', thumb: 'up', dur: '0.8s' },
  { date: 'May 15', query: 'What happens after the free trial?', answer: 'Your workspace stays on the Free tier with…', thumb: 'down', dur: '1.2s' },
  { date: 'May 15', query: 'Does it work with Postgres?', answer: 'Yes, connect Postgres, MySQL, MongoDB or…', thumb: 'up', dur: '1.0s' },
];

function StatCard({ s, i }: { s: typeof STATS[number]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07, duration: 0.4, ease: EASE }}
      style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}
    >
      <p style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT, margin: 0 }}>{s.label}</p>
      <p style={{ fontSize: 24, fontWeight: 600, color: INK, margin: '8px 0 0', letterSpacing: '-0.02em' }}>{s.value}</p>
      <span style={{ display: 'inline-block', fontSize: 11, color: MUTED, marginTop: 4 }}>{s.sub}</span>
    </motion.div>
  );
}

function AnalyticsView() {
  const max = Math.max(...BARS);
  return (
    <div style={{ padding: '20px 32px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {STATS.map((s, i) => <StatCard key={s.label} s={s} i={i} />)}
      </div>

      {/* Bar chart — "Messages over time" */}
      <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT, margin: 0 }}>Query volume</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: INK, margin: '6px 0 0', letterSpacing: '-0.012em' }}>Messages over time</p>
          </div>
          <TrendingUp style={{ width: 16, height: 16, color: SOFT }} />
        </div>
        <div style={{ position: 'relative' }}>
          {/* gridlines */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 24, pointerEvents: 'none' }}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: '100%', height: 1, background: LINE }} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 150 }}>
            {BARS.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(h / max) * 100}%` }}
                transition={{ delay: 0.15 + i * 0.04, duration: 0.5, ease: EASE }}
                style={{ flex: 1, background: LINE_STRONG, borderRadius: '3px 3px 0 0' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {['May 4', '', '', 'May 8', '', '', 'May 12', '', '', 'May 15', '', '', '', 'May 17'].map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace', fontSize: 9, color: SOFT }}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Query log table */}
      <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${LINE}` }}>
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT, margin: 0 }}>Query log</p>
            <p style={{ fontSize: 12, color: MUTED, margin: '5px 0 0' }}>2,847 entries</p>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search style={{ position: 'absolute', left: 10, width: 13, height: 13, color: SOFT }} />
            <div style={{ width: 200, background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 8, padding: '7px 10px 7px 30px', fontSize: 12, color: SOFT }}>Search queries…</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1.4fr 1.4fr 64px 60px', gap: 12, padding: '10px 20px', borderBottom: `1px solid ${LINE}`, background: `${SURFACE}80` }}>
          {['Date', 'Query', 'Answer', 'Feedback', 'Duration'].map((h) => (
            <span key={h} style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT }}>{h}</span>
          ))}
        </div>
        {LOGS.map((l, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1.4fr 1.4fr 64px 60px', gap: 12, alignItems: 'center', padding: '11px 20px', borderBottom: i < LOGS.length - 1 ? `1px solid ${LINE}` : 'none' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: SOFT }}>{l.date}</span>
            <span style={{ fontSize: 12, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.query}</span>
            <span style={{ fontSize: 12, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.answer}</span>
            <span>{l.thumb === 'up' ? <ThumbsUp style={{ width: 13, height: 13, color: INK }} /> : l.thumb === 'down' ? <ThumbsDown style={{ width: 13, height: 13, color: SOFT }} /> : <span style={{ fontSize: 12, color: SOFT }}>—</span>}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: SOFT }}>{l.dur}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: `1px solid ${LINE}` }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: SOFT }}>1–10 of 2,847</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: MUTED }}>1 / 285</span>
        </div>
      </div>
    </div>
  );
}

// ─── Cursor ────────────────────────────────────────────────────────────────────

function Cursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  return (
    <motion.div
      animate={{ x, y, scale: clicking ? 0.85 : 1 }}
      transition={{ x: { duration: 0.75, ease: EASE }, y: { duration: 0.75, ease: EASE }, scale: { duration: 0.15, ease: EASE } }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 50, pointerEvents: 'none', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5 3l14 8-6 1.5L10 19 5 3z" fill={INK} stroke={CANVAS} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <AnimatePresence>
        {clicking && (
          <motion.span
            initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 2.4, opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ position: 'absolute', top: 2, left: 2, width: 18, height: 18, borderRadius: '50%', border: `2px solid ${INK}` }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const POS = {
  send:        { x: 980, y: 566 },
  navAnalytics:{ x: 96,  y: 241 },
  park:        { x: 620, y: 360 },
};

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardPreview() {
  const reduce = useReducedMotion();

  const [view, setView] = React.useState<View>('chat');
  const [typed, setTyped] = React.useState('');
  const [phase, setPhase] = React.useState<'typing' | 'sent' | 'thinking' | 'answered'>('typing');
  const [actionDone, setActionDone] = React.useState(0);
  const [scrollY, setScrollY] = React.useState(0);
  const [cursor, setCursor] = React.useState({ ...POS.send, clicking: false });

  const alive = React.useRef(true);

  React.useEffect(() => {
    alive.current = true;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const ok = () => alive.current;

    async function moveCursor(p: { x: number; y: number }) {
      setCursor((c) => ({ ...c, x: p.x, y: p.y }));
      await sleep(800);
    }
    async function click() {
      setCursor((c) => ({ ...c, clicking: true }));
      await sleep(280);
      setCursor((c) => ({ ...c, clicking: false }));
      await sleep(220);
    }

    async function run() {
      while (ok()) {
        // ── Chat ──
        setView('chat'); setTyped(''); setPhase('typing'); setActionDone(0); setScrollY(0);
        await moveCursor(POS.send);
        await sleep(500); if (!ok()) return;
        for (let i = 1; i <= QUESTION.length; i++) {
          if (!ok()) return;
          setTyped(QUESTION.slice(0, i));
          await sleep(34);
        }
        await sleep(450);
        await moveCursor(POS.send); await click(); if (!ok()) return;
        setPhase('sent'); await sleep(700);
        setPhase('thinking');
        for (let i = 1; i <= ACTION_STEPS.length; i++) {
          if (!ok()) return;
          await sleep(750);
          setActionDone(i);
        }
        await sleep(400);
        setPhase('answered');
        await sleep(2800); if (!ok()) return;

        // ── Analytics ──
        await moveCursor(POS.navAnalytics); await click(); if (!ok()) return;
        setView('analytics'); setScrollY(0);
        await moveCursor(POS.park);
        await sleep(2600); if (!ok()) return;
        // scroll down to reveal query log
        setScrollY(-230);
        await sleep(3000); if (!ok()) return;
        // scroll back up
        setScrollY(0);
        await sleep(1600); if (!ok()) return;
      }
    }

    if (reduce) {
      setView('chat'); setTyped(QUESTION); setPhase('answered'); setActionDone(ACTION_STEPS.length);
      return;
    }
    run();
    return () => { alive.current = false; };
  }, [reduce]);

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 16 }} aria-hidden="true">
      <style>{`@keyframes cpSpin{to{transform:rotate(360deg)}}@keyframes cpBlink{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
      <div style={{ width: 1100, transformOrigin: 'top left', transform: 'scale(var(--dashboard-scale, 1))' }} className="dashboard-scale-wrapper">

        <div style={{ display: 'flex', height: 620, background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>

          {/* Sidebar */}
          <aside style={{ width: 210, flexShrink: 0, background: CANVAS, borderRight: `1px solid ${LINE}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${LINE}`, gap: 9 }}>
              <div style={{ color: INK }}><CorpusMark size={20} /></div>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: INK }}>
                CORPUS<span style={{ color: MUTED, fontWeight: 400 }}> AI</span>
              </span>
            </div>
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
                  <NavItem icon={MessageSquare} label="Chat" indent active={view === 'chat'} />
                  <NavItem icon={BarChart3} label="Analytics" indent active={view === 'analytics'} />
                  <NavItem icon={Database} label="Datastores" indent />
                  <NavItem icon={Rocket} label="Deploy" indent />
                  <NavItem icon={Users} label="Leads" indent />
                  <NavItem icon={Settings} label="Settings" indent />
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: SURFACE, minWidth: 0 }}>

            {/* Title row */}
            <div style={{ padding: '18px 32px 14px', borderBottom: `1px solid ${LINE}`, background: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontSize: 9, fontWeight: 600, color: SOFT, letterSpacing: '0.14em', marginBottom: 5 }}>
                    {view === 'chat' ? 'Chatbot' : 'Analytics'}
                  </p>
                  <h1 style={{ fontSize: 22, fontWeight: 500, color: INK, letterSpacing: '-0.02em', margin: 0 }}>
                    {view === 'chat' ? 'Support Agent' : <>Performance.<span style={{ color: MUTED }}> At a glance.</span></>}
                  </h1>
                </div>
                {view === 'chat' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 4, height: 16, borderRadius: 2, background: '#10B981' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK }}>Live</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 2, background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 8, padding: 3 }}>
                      {['7 days', '30 days', '90 days'].map((d) => (
                        <span key={d} style={{ fontSize: 11, fontWeight: 500, padding: '4px 9px', borderRadius: 6, color: d === '30 days' ? INK : MUTED, background: d === '30 days' ? SURFACE : 'transparent' }}>{d}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 8, padding: '6px 11px', fontSize: 12, fontWeight: 500, color: INK }}>
                      <Download style={{ width: 12, height: 12 }} /> Export
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence mode="wait">
                {view === 'chat' ? (
                  <motion.div key="chat"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
                  >
                    <div style={{ padding: '24px 32px' }}>
                      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {phase !== 'typing' && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}
                            style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, maxWidth: '78%' }}>
                              <div style={{ background: INK, color: CANVAS, padding: '10px 16px', borderRadius: '16px 16px 4px 16px', fontSize: 13, lineHeight: 1.55 }}>{QUESTION}</div>
                              <span style={{ fontSize: 10, color: SOFT, fontFamily: 'monospace', paddingRight: 2 }}>09:41</span>
                            </div>
                            <UserAvatar />
                          </motion.div>
                        )}
                        {(phase === 'thinking' || phase === 'answered') && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <BotAvatar />
                            <div style={{ flex: 1, maxWidth: '85%' }}>
                              <ActionMonitor done={phase === 'answered' ? ACTION_STEPS.length : actionDone} />
                            </div>
                          </motion.div>
                        )}
                        {phase === 'answered' && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}
                            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12 }}>
                            <BotAvatar />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '85%' }}>
                              <div style={{ background: CANVAS, border: `1px solid ${LINE}`, padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: 13, lineHeight: 1.6, color: INK }}>
                                <p style={{ margin: '0 0 8px' }}>For ~8,000 conversations / month, the <strong>Business plan</strong> is the best fit:</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {ANSWER_BULLETS.map((b) => (
                                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                      <div style={{ marginTop: 2, width: 14, height: 14, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Check style={{ width: 8, height: 8, color: CANVAS }} strokeWidth={3} />
                                      </div>
                                      <span>{b}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
                                <span style={{ fontSize: 10, color: SOFT, fontFamily: 'monospace' }}>09:41</span>
                                <div style={{ width: 1, height: 10, background: LINE }} />
                                <ThumbsUp style={{ width: 11, height: 11, color: SOFT }} />
                                <ThumbsDown style={{ width: 11, height: 11, color: SOFT }} />
                                <Copy style={{ width: 11, height: 11, color: SOFT }} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="analytics"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
                  >
                    <motion.div
                      animate={{ y: scrollY }}
                      transition={{ duration: 1.1, ease: EASE }}
                      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                    >
                      <AnalyticsView />
                    </motion.div>
                    {/* scroll hint fade at bottom */}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 28, background: `linear-gradient(to bottom, transparent, ${SURFACE})`, pointerEvents: 'none' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Composer (chat only) */}
            {view === 'chat' && (
              <div style={{ flexShrink: 0, padding: '12px 32px 20px', background: SURFACE }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                  <div style={{ border: `1px solid ${LINE}`, background: CANVAS, borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '12px 16px 4px', fontSize: 13, color: typed ? INK : SOFT, minHeight: 19 }}>
                      {typed || 'Ask the bot anything…'}
                      {phase === 'typing' && typed && (
                        <span style={{ display: 'inline-block', width: 1.5, height: 14, background: INK, marginLeft: 2, verticalAlign: 'middle', animation: 'cpBlink 1s step-end infinite' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: SOFT }}>
                        <Sparkles style={{ width: 12, height: 12 }} />
                        <span>Grounded in your sources</span>
                        <span style={{ margin: '0 2px' }}>·</span>
                        <span style={{ fontFamily: 'monospace', letterSpacing: '0.14em' }}>⌘ + ENTER</span>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: typed ? INK : LINE, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.25s ease' }}>
                        <ArrowUp style={{ width: 14, height: 14, color: typed ? CANVAS : SOFT }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!reduce && <Cursor x={cursor.x} y={cursor.y} clicking={cursor.clicking} />}
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, white 100%)', pointerEvents: 'none', borderRadius: 16 }} />
    </div>
  );
}
