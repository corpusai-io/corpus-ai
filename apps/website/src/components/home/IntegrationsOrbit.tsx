'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridPattern } from '@/components/ui/grid-pattern';

// ─── Data ─────────────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: 'slack',     name: 'Slack',     icon: '/socials-icons/slack.png',     desc: 'Deploy as a Slack workspace bot',   category: 'Messaging'  },
  { id: 'whatsapp',  name: 'WhatsApp',  icon: '/socials-icons/whatsapp.png',  desc: 'WhatsApp Business API messaging',   category: 'Messaging'  },
  { id: 'telegram',  name: 'Telegram',  icon: '/socials-icons/telegram.png',  desc: 'Telegram bot with full context',    category: 'Messaging'  },
  { id: 'wordpress', name: 'WordPress', icon: '/socials-icons/wordpress.png', desc: 'Embed widget on WordPress sites',   category: 'Web'        },
  { id: 'domain',    name: 'Website',   icon: '/socials-icons/domain.png',    desc: 'Widget on any web property',        category: 'Web'        },
  { id: 'shopify',   name: 'Shopify',   icon: '/socials-icons/shopify.png',   desc: 'E-commerce AI agent',               category: 'Commerce'   },
  { id: 'stripe',    name: 'Stripe',    icon: '/socials-icons/stripe.png',    desc: 'Payment intelligence & refunds',    category: 'Payments'   },
  { id: 'email',     name: 'Email',     icon: '/socials-icons/email.png',     desc: 'Gmail and Outlook integration',     category: 'Comms'      },
  { id: 'database',  name: 'Database',  icon: '/socials-icons/database.png',  desc: 'SQL & NoSQL live queries',          category: 'Data'       },
] as const;

type IntegrationId = typeof INTEGRATIONS[number]['id'];

// ─── Orbit geometry ───────────────────────────────────────────────────────────

const CW     = 800;   // viewBox width
const CH     = 460;   // viewBox height
const CX     = CW / 2;
const CY     = CH / 2;
const RADIUS = 172;   // orbit radius
const NODE_R = 27;    // node circle radius
const HUB_R  = 38;    // hub circle radius

function orbitPos(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // start from top
  return {
    x: CX + Math.cos(angle) * RADIUS,
    y: CY + Math.sin(angle) * RADIUS,
  };
}

/** Shorten a line segment so it doesn't overdraw the node/hub circles */
function shortenLine(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  return {
    sx: x1 + ux * r1,
    sy: y1 + uy * r1,
    ex: x2 - ux * r2,
    ey: y2 - uy * r2,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrbitSVG({ activeIds, hoveredId }: { activeIds: Set<IntegrationId>; hoveredId: IntegrationId | null }) {
  const n = INTEGRATIONS.length;
  return (
    <>
      <style>{`
        @keyframes dashMove    { to { stroke-dashoffset: -8; } }
        @keyframes spinRing    { to { transform: rotate(360deg); transform-box: fill-box; transform-origin: center; } }
        @keyframes spinRingRev { to { transform: rotate(-360deg); transform-box: fill-box; transform-origin: center; } }
      `}</style>

      <defs>
        {/* Radial fade for the faint grid overlay */}
        <radialGradient id="orbitFade" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* ── Connection lines ── */}
      {INTEGRATIONS.map((integ, i) => {
        const pos = orbitPos(i, n);
        const isActive = hoveredId ? hoveredId === integ.id : activeIds.has(integ.id);
        const { sx, sy, ex, ey } = shortenLine(pos.x, pos.y, CX, CY, NODE_R + 2, HUB_R + 2);
        return (
          <line
            key={integ.id}
            x1={sx} y1={sy} x2={ex} y2={ey}
            stroke={isActive ? '#171717' : '#E8E8E8'}
            strokeWidth={isActive ? 1.5 : 1}
            strokeDasharray={isActive ? '4 4' : '5 7'}
            opacity={isActive ? 1 : 0.5}
            style={{
              transition: 'stroke 0.45s ease, stroke-width 0.45s ease, opacity 0.45s ease',
              animation: isActive ? 'dashMove 0.8s linear infinite' : undefined,
            }}
          />
        );
      })}

      {/* ── Hub — outermost slow-spinning dashed ring ── */}
      <circle
        cx={CX} cy={CY} r={58}
        fill="none" stroke="#E8E8E8" strokeWidth="1" strokeDasharray="5 7" opacity={0.5}
        style={{ animation: 'spinRing 28s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
      />
      {/* Mid ring — counter-spin */}
      <circle
        cx={CX} cy={CY} r={48}
        fill="none" stroke="#D4D4D4" strokeWidth="1" opacity={0.35}
        style={{ animation: 'spinRingRev 18s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
      />
      {/* Hub fill circle */}
      <circle cx={CX} cy={CY} r={HUB_R} fill="white" stroke="#E8E8E8" strokeWidth="1.5" />
    </>
  );
}

function IntegrationNode({
  integ,
  pos,
  isActive,
  onHover,
  onLeave,
}: {
  integ: typeof INTEGRATIONS[number];
  pos: { x: number; y: number };
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const size = NODE_R * 2;
  return (
    <motion.button
      className="absolute flex items-center justify-center rounded-full bg-white cursor-pointer select-none"
      style={{
        left:   `${(pos.x / CW) * 100}%`,
        top:    `${(pos.y / CH) * 100}%`,
        width:  size,
        height: size,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      animate={{
        scale:     isActive ? 1.14 : 1,
        boxShadow: isActive
          ? '0 0 0 1.5px #171717, 0 4px 14px rgba(0,0,0,0.12)'
          : '0 0 0 1px #E8E8E8',
      }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      title={integ.name}
    >
      <Image
        src={integ.icon}
        alt={integ.name}
        width={26}
        height={26}
        className="w-[26px] h-[26px] object-contain"
        unoptimized
      />
    </motion.button>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function IntegrationsOrbit() {
  const [activeIds, setActiveIds] = useState<Set<IntegrationId>>(
    new Set(['slack', 'whatsapp', 'database'] as IntegrationId[])
  );
  const [hoveredId, setHoveredId] = useState<IntegrationId | null>(null);

  // Auto-cycle 3 random integrations every 2.5 s
  useEffect(() => {
    const id = setInterval(() => {
      if (hoveredId) return; // pause while user is hovering
      const shuffled = [...INTEGRATIONS].sort(() => Math.random() - 0.5);
      setActiveIds(new Set(shuffled.slice(0, 3).map((i) => i.id) as IntegrationId[]));
    }, 2500);
    return () => clearInterval(id);
  }, [hoveredId]);

  // Which integration to show in the info bar
  const featured: typeof INTEGRATIONS[number] =
    (hoveredId && INTEGRATIONS.find((i) => i.id === hoveredId)) ||
    INTEGRATIONS.find((i) => activeIds.has(i.id)) ||
    INTEGRATIONS[0];

  const n = INTEGRATIONS.length;

  return (
    <section className="py-28 px-6 bg-white relative overflow-hidden">
      {/* Subtle grid background */}
      <GridPattern
        width={32} height={32} x={-1} y={-1}
        className={cn(
          'fill-[#171717]/[0.015] stroke-[#171717]/[0.05]',
          '[mask-image:radial-gradient(ellipse_70%_55%_at_50%_50%,white,transparent)]',
        )}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-full px-4 py-1.5 text-sm text-[#737373] shadow-sm mb-5"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-3.5 h-3.5 text-[#171717]" />
            Integrations
          </motion.span>
          <motion.h2
            className="text-4xl md:text-5xl font-medium tracking-[-0.02em] text-[#171717]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            One agent, every channel
          </motion.h2>
          <motion.p
            className="text-base font-[family-name:var(--font-inter)] text-[#737373] mt-4 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            Deploy your AI agent wherever your customers already are.
            Connect once, reach everywhere — live data flows in real time.
          </motion.p>
        </div>

        {/* ── Orbit card ─────────────────────────────────────────── */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm">

            {/* Top status bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
                  Live connections · {hoveredId ? 1 : activeIds.size} active
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#A1A1A1]">corpus-ai · integration hub</span>
            </div>

            {/* Orbit diagram */}
            <div className="relative" style={{ width: '100%', paddingBottom: `${(CH / CW) * 100}%` }}>

              {/* SVG layer — lines + hub rings */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${CW} ${CH}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <OrbitSVG activeIds={activeIds} hoveredId={hoveredId} />
              </svg>

              {/* Hub image */}
              <div
                className="absolute z-10"
                style={{
                  left:      `${(CX / CW) * 100}%`,
                  top:       `${(CY / CH) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width:     HUB_R * 2,
                  height:    HUB_R * 2,
                }}
              >
                <img
                  src="/corpus-ai-emblem.svg"
                  alt="Corpus AI"
                  className="w-full h-full rounded-full object-contain"
                />
              </div>

              {/* Integration nodes */}
              {INTEGRATIONS.map((integ, i) => {
                const pos     = orbitPos(i, n);
                const isActive = hoveredId ? hoveredId === integ.id : activeIds.has(integ.id);
                return (
                  <IntegrationNode
                    key={integ.id}
                    integ={integ}
                    pos={pos}
                    isActive={isActive}
                    onHover={() => setHoveredId(integ.id)}
                    onLeave={() => setHoveredId(null)}
                  />
                );
              })}

              {/* Node labels (name below each icon) */}
              {INTEGRATIONS.map((integ, i) => {
                const pos = orbitPos(i, n);
                const isActive = hoveredId ? hoveredId === integ.id : activeIds.has(integ.id);
                // Push label outward from center
                const dx = pos.x - CX;
                const dy = pos.y - CY;
                const len = Math.sqrt(dx * dx + dy * dy);
                const labelX = pos.x + (dx / len) * (NODE_R + 14);
                const labelY = pos.y + (dy / len) * (NODE_R + 14);
                return (
                  <div
                    key={`label-${integ.id}`}
                    className="absolute pointer-events-none text-center transition-all duration-300"
                    style={{
                      left:      `${(labelX / CW) * 100}%`,
                      top:       `${(labelY / CH) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex:    5,
                      opacity:   isActive ? 1 : 0.4,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    <span
                      className="font-mono text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: isActive ? '#171717' : '#A1A1A1' }}
                    >
                      {integ.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom info bar */}
            <div className="border-t border-[#E8E8E8] px-6 py-4 flex items-center justify-between gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={featured.id}
                  className="flex items-center gap-3 min-w-0"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="w-8 h-8 rounded-lg border border-[#E8E8E8] bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                    <Image
                      src={featured.icon}
                      alt={featured.name}
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px] object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#171717] leading-tight">{featured.name}</p>
                    <p className="text-[11px] text-[#A1A1A1] truncate">{featured.desc}</p>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#A1A1A1] bg-[#F7F7F7] border border-[#E8E8E8] px-2 py-1 rounded flex-shrink-0">
                    {featured.category}
                  </span>
                </motion.div>
              </AnimatePresence>
              <Link
                href="/Sign-In"
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#737373] hover:text-[#171717] transition-colors"
              >
                Configure
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Icon chip strip ─────────────────────────────────────── */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {INTEGRATIONS.map((integ) => (
            <Link
              key={integ.id}
              href="/Sign-In"
              onMouseEnter={() => setHoveredId(integ.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-[12px]',
                hoveredId === integ.id || activeIds.has(integ.id)
                  ? 'border-[#171717]/20 bg-[#F7F7F7] text-[#171717]'
                  : 'border-[#E8E8E8] bg-white text-[#737373] hover:border-[#171717]/20 hover:bg-[#F7F7F7] hover:text-[#171717]',
              )}
            >
              <Image
                src={integ.icon}
                alt={integ.name}
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain"
                unoptimized
              />
              {integ.name}
            </Link>
          ))}
          <Link
            href="/Sign-In"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#D4D4D4] bg-transparent text-[12px] text-[#A1A1A1] hover:border-[#171717]/30 hover:text-[#737373] transition-colors"
          >
            + 5,000 via Zapier
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
