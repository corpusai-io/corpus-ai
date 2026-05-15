'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BeamCard {
  id: string;
  name: string;
  desc: string;
  icon: string | null;
  emoji?: string;
  href: string;
  side: 'left' | 'right';
}

interface Particle {
  id: number;
  cardId: string;
  progress: number;
  side: 'left' | 'right';
  rowIndex: number;
}

// ─── Integration Data ──────────────────────────────────────────────────────────

const cards: BeamCard[] = [
  { id: 'slack',     name: 'Slack',     desc: 'Channel alerts',     icon: '/socials-icons/Slack.svg',          href: '/Sign-In',     side: 'left'  },
  { id: 'telegram',  name: 'Telegram',  desc: 'Bot messaging',      icon: '/socials-icons/telegram-1 1.svg',   href: '/Sign-In',  side: 'left'  },
  { id: 'whatsapp',  name: 'WhatsApp',  desc: 'Business API',       icon: '/socials-icons/whatsapp.svg',       href: '/Sign-In',  side: 'left'  },
  { id: 'wordpress', name: 'WordPress', desc: 'Site embedding',     icon: '/socials-icons/wordpress-icon.svg', href: '/Sign-In', side: 'left'  },
  { id: 'zapier',    name: 'Zapier',    desc: '5,000+ automations', icon: '/socials-icons/zapier.svg',         href: '/Sign-In',    side: 'left'  },
  { id: 'website',  name: 'Website',  desc: 'Embed widget',         icon: null, emoji: '🌐', href: '/Sign-In', side: 'right' },
  { id: 'crm',      name: 'CRM',      desc: 'HubSpot · Salesforce', icon: null, emoji: '🎯', href: '/Sign-In', side: 'right' },
  { id: 'database', name: 'Database', desc: 'SQL · NoSQL queries',  icon: null, emoji: '🗄️', href: '/Sign-In', side: 'right' },
  { id: 'email',    name: 'Email',    desc: 'Gmail · Outlook',      icon: null, emoji: '📧', href: '/Sign-In', side: 'right' },
  { id: 'webhooks', name: 'Webhooks', desc: 'Custom endpoints',     icon: null, emoji: '🔗', href: '/Sign-In', side: 'right' },
];

const leftCards  = cards.filter(c => c.side === 'left');
const rightCards = cards.filter(c => c.side === 'right');

// ─── Layout constants ──────────────────────────────────────────────────────────

const HUB_COL_W  = 140;
const COL_GAP    = 24;
const HUB_LOGO_R = 40;
const CARD_H     = 60;
const CARD_GAP   = 12;

// ─── Geometry helpers ──────────────────────────────────────────────────────────

function clampToHub(sx: number, sy: number, hx: number, hy: number, r: number) {
  const dx = hx - sx;
  const dy = hy - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= r) return { ex: sx, ey: sy };
  const t = (dist - r) / dist;
  return { ex: sx + dx * t, ey: sy + dy * t };
}

function lerpPoint(sx: number, sy: number, ex: number, ey: number, t: number) {
  return { x: sx + (ex - sx) * t, y: sy + (ey - sy) * t };
}

// ─── Beam CSS ─────────────────────────────────────────────────────────────────

const BEAM_CSS = `
@keyframes beamFlow {
  0%   { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0;  }
}
`;

// ─── Single Integration Card ───────────────────────────────────────────────────

function BeamCardItem({ card, lit }: { card: BeamCard; lit: boolean; wasLit: boolean }) {
  return (
    <Link href={card.href} className="block">
      <motion.div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors duration-700 ${
          lit
            ? 'border-[#171717]/20 bg-[#F7F7F7] shadow-sm'
            : 'border-[#E8E8E8] bg-white hover:border-[#171717]/15 hover:bg-[#FAFAFA]'
        }`}
        initial={{ opacity: 0, x: card.side === 'left' ? -16 : 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          animate={{
            backgroundColor: lit ? 'rgba(23,23,23,0.06)' : 'rgba(243,244,246,1)',
          }}
          transition={{ duration: 0.6 }}
        >
          {card.icon ? (
            <Image src={card.icon} alt={card.name} width={22} height={22} className="w-[22px] h-[22px]" unoptimized />
          ) : (
            <span className="text-lg leading-none">{card.emoji}</span>
          )}
        </motion.div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <motion.div
            className="text-sm font-medium leading-tight"
            animate={{ color: lit ? '#171717' : '#737373' }}
            transition={{ duration: 0.6 }}
          >
            {card.name}
          </motion.div>
          <div className="text-xs text-[#A3A3A3] mt-0.5 truncate">{card.desc}</div>
        </div>

        {/* Active dot */}
        <AnimatePresence>
          {lit && (
            <motion.span
              key="dot"
              className="w-2 h-2 rounded-full bg-[#171717] flex-shrink-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

// ─── SVG Beams + Particles ─────────────────────────────────────────────────────

function BeamLines({
  containerRef,
  litIds,
  particles,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  litIds: Set<string>;
  particles: Particle[];
}) {
  const [dims, setDims] = useState({ w: 900, h: 360 });

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setDims({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  const { w, h } = dims;
  const hubX = w / 2;
  const hubY = h / 2;
  const onefrW      = (w - HUB_COL_W - 2 * COL_GAP) / 2;
  const leftStartX  = onefrW;
  const rightStartX = onefrW + COL_GAP + HUB_COL_W + COL_GAP;
  const totalCardsH = 5 * CARD_H + 4 * CARD_GAP;
  const firstCardY  = (h - totalCardsH) / 2 + CARD_H / 2;
  const rowY        = (i: number) => firstCardY + i * (CARD_H + CARD_GAP);

  function getEndpoints(side: 'left' | 'right', rowIndex: number) {
    const sx = side === 'left' ? leftStartX : rightStartX;
    const sy = rowY(rowIndex);
    const { ex, ey } = clampToHub(sx, sy, hubX, hubY, HUB_LOGO_R);
    return { sx, sy, ex, ey };
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <style>{BEAM_CSS}</style>
      <defs>
        <linearGradient id="glLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#171717" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#171717" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="glLeftLit" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#171717" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#171717" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="glRight" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="#171717" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#171717" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="glRightLit" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="#171717" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#171717" stopOpacity="0.3" />
        </linearGradient>
        <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* LEFT BEAMS */}
      {leftCards.map((card, i) => {
        const lit   = litIds.has(card.id);
        const sy    = rowY(i);
        const delay = `${(i * 0.18).toFixed(2)}s`;
        const { ex, ey } = clampToHub(leftStartX, sy, hubX, hubY, HUB_LOGO_R);
        return (
          <line
            key={card.id}
            x1={leftStartX} y1={sy} x2={ex} y2={ey}
            stroke={lit ? 'url(#glLeftLit)' : 'url(#glLeft)'}
            strokeWidth={lit ? 2 : 1}
            strokeDasharray="7 5"
            opacity={lit ? 0.9 : 0.3}
            style={{ animation: `beamFlow 1.8s linear ${delay} infinite`, transition: 'opacity 0.7s ease' }}
          />
        );
      })}

      {/* RIGHT BEAMS */}
      {rightCards.map((card, i) => {
        const lit   = litIds.has(card.id);
        const sy    = rowY(i);
        const delay = `${(i * 0.18 + leftCards.length * 0.18).toFixed(2)}s`;
        const { ex, ey } = clampToHub(rightStartX, sy, hubX, hubY, HUB_LOGO_R);
        return (
          <line
            key={card.id}
            x1={rightStartX} y1={sy} x2={ex} y2={ey}
            stroke={lit ? 'url(#glRightLit)' : 'url(#glRight)'}
            strokeWidth={lit ? 2 : 1}
            strokeDasharray="7 5"
            opacity={lit ? 0.9 : 0.3}
            style={{ animation: `beamFlow 1.8s linear ${delay} infinite`, transition: 'opacity 0.7s ease' }}
          />
        );
      })}

      {/* TRAVELING PARTICLES */}
      {particles.map(p => {
        const { sx, sy, ex, ey } = getEndpoints(p.side, p.rowIndex);
        const pos = lerpPoint(sx, sy, ex, ey, p.progress);
        const opacity =
          p.progress < 0.1 ? p.progress / 0.1
          : p.progress > 0.85 ? (1 - p.progress) / 0.15
          : 1;
        return (
          <g key={p.id} filter="url(#particleGlow)">
            <circle cx={pos.x} cy={pos.y} r={5} fill="#171717" opacity={opacity * 0.15} />
            <circle cx={pos.x} cy={pos.y} r={2.5} fill="#171717" opacity={opacity * 0.7} />
            <circle cx={pos.x} cy={pos.y} r={1} fill="#171717" opacity={opacity * 0.9} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

function Hub({ pulse }: { pulse: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute rounded-full border border-[#E8E8E8]"
          animate={pulse
            ? { width: [88, 108, 88], height: [88, 108, 88], opacity: [0.4, 0, 0.4] }
            : { width: 88, height: 88, opacity: 0.2 }
          }
          transition={{ duration: 1.6, ease: 'easeOut', repeat: pulse ? 1 : 0 }}
        />
        <motion.div
          className="absolute rounded-full border border-[#E8E8E8]"
          animate={pulse
            ? { width: [72, 96, 72], height: [72, 96, 72], opacity: [0.5, 0, 0.5] }
            : { width: 72, height: 72, opacity: 0.3 }
          }
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.15, repeat: pulse ? 1 : 0 }}
        />
        <motion.div
          className="absolute rounded-full"
          animate={pulse
            ? { boxShadow: ['0 0 0 0 rgba(23,23,23,0)', '0 0 0 12px rgba(23,23,23,0.06)', '0 0 0 0 rgba(23,23,23,0)'] }
            : {}}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ width: 68, height: 68, borderRadius: '50%' }}
        />
        <motion.div
          className="absolute rounded-full"
          animate={{
            opacity: pulse ? [0.15, 0.3, 0.15] : [0.08, 0.15, 0.08],
            scale:   pulse ? [1, 1.3, 1]       : [1, 1.08, 1],
          }}
          transition={{ duration: pulse ? 1.4 : 3, ease: 'easeInOut', repeat: Infinity }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(23,23,23,0.12) 0%, transparent 70%)',
            filter: 'blur(12px)',
          }}
        />
        <motion.img
          src="/corpus-ai-emblem.svg"
          alt="Corpus AI"
          className="relative w-16 h-16 rounded-full object-contain block"
          style={{ zIndex: 2 }}
          animate={pulse ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function IntegrationsOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const allIds = cards.map(c => c.id);

  const [litIds,     setLitIds]     = useState<Set<string>>(new Set(['slack', 'whatsapp', 'website']));
  const [prevLitIds, setPrevLitIds] = useState<Set<string>>(new Set());
  const [hubPulse,   setHubPulse]   = useState(false);
  const [particles,  setParticles]  = useState<Particle[]>([]);
  const particleId = useRef(0);
  const frameRef   = useRef<number | null>(null);
  const lastTime   = useRef<number>(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setLitIds(prev => {
        setPrevLitIds(new Set(prev));
        const shuffled = [...allIds].sort(() => Math.random() - 0.5);
        return new Set(shuffled.slice(0, 3));
      });
      setHubPulse(true);
      setTimeout(() => setHubPulse(false), 1600);
    }, 2200);
    return () => clearInterval(tick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const newlyLit = [...litIds].filter(id => !prevLitIds.has(id));
    newlyLit.forEach((id, offset) => {
      const card = cards.find(c => c.id === id);
      if (!card) return;
      const rowIndex = (card.side === 'left' ? leftCards : rightCards).findIndex(c => c.id === id);
      [0, 0.12].forEach(delay => {
        setTimeout(() => {
          const pid = particleId.current++;
          setParticles(prev => [...prev, { id: pid, cardId: id, progress: 0, side: card.side, rowIndex }]);
          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== pid));
          }, 960);
        }, offset * 80 + delay * 1000);
      });
    });
  }, [litIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const animateParticles = useCallback((timestamp: number) => {
    if (!lastTime.current) lastTime.current = timestamp;
    const delta = timestamp - lastTime.current;
    lastTime.current = timestamp;
    const step = delta / 900;
    setParticles(prev =>
      prev.map(p => ({ ...p, progress: Math.min(p.progress + step, 1) })).filter(p => p.progress < 1),
    );
    frameRef.current = requestAnimationFrame(animateParticles);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [animateParticles]);

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-16">
        <motion.p
          className="text-sm font-semibold text-[#171717] uppercase tracking-widest mb-4"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Integrations
        </motion.p>
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-[#171717] tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          One agent, every channel
        </motion.h2>
        <motion.p
          className="text-lg text-[#737373] mt-4 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          Deploy your AI agent wherever your customers already are.
          Live data flows in real time.
        </motion.p>
      </div>

      {/* DESKTOP: Beam Grid */}
      <div className="hidden md:block">
        <div ref={containerRef} className="relative max-w-[900px] mx-auto">
          <BeamLines containerRef={containerRef} litIds={litIds} particles={particles} />
          <div
            className="relative grid items-center gap-6"
            style={{ gridTemplateColumns: `1fr ${HUB_COL_W}px 1fr`, zIndex: 2 }}
          >
            <div className="flex flex-col gap-3">
              {leftCards.map(card => (
                <BeamCardItem key={card.id} card={card} lit={litIds.has(card.id)} wasLit={prevLitIds.has(card.id)} />
              ))}
            </div>
            <Hub pulse={hubPulse} />
            <div className="flex flex-col gap-3">
              {rightCards.map(card => (
                <BeamCardItem key={card.id} card={card} lit={litIds.has(card.id)} wasLit={prevLitIds.has(card.id)} />
              ))}
            </div>
          </div>
        </div>

        <motion.p
          className="text-center text-[11px] text-[#A3A3A3] mt-8 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-[#171717]">●</span> Active connection
          &nbsp;·&nbsp; Particles travel to hub every 2s
        </motion.p>
      </div>

      {/* MOBILE: Stacked */}
      <div className="md:hidden space-y-2.5">
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute w-16 h-16 rounded-full"
              animate={{ opacity: [0.08, 0.15, 0.08], scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'radial-gradient(circle, rgba(23,23,23,0.12) 0%, transparent 70%)',
                filter: 'blur(10px)',
              }}
            />
            <img src="/corpus-ai-emblem.svg" alt="Corpus AI" className="relative w-14 h-14 rounded-full object-contain" />
          </div>
        </div>
        <div className="h-8 w-px bg-gradient-to-b from-[#171717]/20 to-transparent mx-auto" />
        {cards.map(card => (
          <BeamCardItem key={card.id} card={card} lit={litIds.has(card.id)} wasLit={prevLitIds.has(card.id)} />
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap justify-center gap-3 mt-12">
        {[
          { name: 'Slack',         href: '/Sign-In'    },
          { name: 'WhatsApp',      href: '/Sign-In' },
          { name: 'Telegram',      href: '/Sign-In' },
          { name: 'WordPress',     href: '/Sign-In'},
          { name: 'Zapier',        href: '/Sign-In'   },
          { name: 'Website Embed', href: '/Sign-In'               },
        ].map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              href={item.href}
              className="px-4 py-2 rounded-lg border border-[#E8E8E8] hover:border-[#171717]/30 hover:text-[#171717] transition-colors text-sm text-[#737373] bg-white"
            >
              {item.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
