'use client';

/**
 * Corpus AI · monochrome editorial primitives.
 *
 * These are the dashboard equivalents of the design kit's `ui.jsx`.
 * Every dashboard page composes from this small kit — that's the
 * point. Adding ad-hoc styling outside these primitives is the path
 * back to inconsistency the redesign exists to fix.
 */

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/* ──────────────────────────────────────────────────────────────
   Eyebrow · mono uppercase letterspaced label.
   Used above section titles, stat labels, and date stamps.
─────────────────────────────────────────────────────────────── */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cx('font-mono uppercase text-[10px] font-semibold text-muted-soft', className)}
      style={{ letterSpacing: '0.14em', margin: 0 }}
    >
      {children}
    </p>
  );
}

/* ──────────────────────────────────────────────────────────────
   Mark · the Cursor brand glyph — open C breaking into an arrow.
   "Acts, not just answers." Mono by default (uses currentColor for
   the C stroke and the arrowhead fill); pass `accent` to tint the
   arrowhead if/when a chromatic brand exception is intentional.
─────────────────────────────────────────────────────────────── */
export function Mark({ size = 16, accent }: { size?: number; accent?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      style={{ display: 'block', color: 'var(--ink)' }}
    >
      <path d="M 10 20 L 24 12 L 70 46 L 56 54 Z" fill={accent ?? 'currentColor'} />
      <path d="M 10 80 L 24 88 L 70 54 L 56 46 Z" fill={accent ?? 'currentColor'} />
      <circle cx="80" cy="50" r="8" fill={accent ?? 'currentColor'} />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   IconChip · 36×36 surface-grey squircle. The dashboard's atomic
   unit for any icon or logomark inside a card.
─────────────────────────────────────────────────────────────── */
export function IconChip({
  children,
  size = 36,
  className,
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cx('rounded-lg flex items-center justify-center flex-shrink-0', className)}
      style={{ width: size, height: size, backgroundColor: 'var(--surface)' }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Status · typographic LIVE / TRAINING / DOWN / DRAFT.
   Tick is the only colored pixel in chrome.
─────────────────────────────────────────────────────────────── */
export type StatusKind = 'live' | 'training' | 'down' | 'draft';

const STATUS_CFG: Record<StatusKind, { color: string; label: string; pulse: boolean; outline: boolean }> = {
  live:     { color: '#10B981', label: 'LIVE',     pulse: true,  outline: false },
  training: { color: '#F59E0B', label: 'TRAINING', pulse: true,  outline: false },
  down:     { color: '#EF4444', label: 'DOWN',     pulse: false, outline: false },
  draft:    { color: '#C4C4C4', label: 'DRAFT',    pulse: false, outline: true  },
};

export function Status({ kind = 'live', size = 'sm' }: { kind?: StatusKind; size?: 'sm' | 'lg' }) {
  const cfg = STATUS_CFG[kind] || STATUS_CFG.live;
  const tickW = size === 'lg' ? 5  : 4;
  const tickH = size === 'lg' ? 16 : 12;
  const fs    = size === 'lg' ? 12 : 11;
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <span
        className={cfg.pulse ? 'st-pulse' : ''}
        style={{
          width: tickW,
          height: tickH,
          borderRadius: 2,
          background: cfg.outline ? 'transparent' : cfg.color,
          border:     cfg.outline ? '1px solid #C4C4C4' : 'none',
          ['--st-c' as string]: cfg.color,
        }}
      />
      <span
        className="font-mono"
        style={{ fontSize: fs, fontWeight: 500, letterSpacing: '0.14em', color: 'var(--ink)', textTransform: 'uppercase' }}
      >
        {cfg.label}
      </span>
    </span>
  );
}

/**
 * Map backend status strings (ACTIVE / BUILDING / ERROR) to design kit kinds.
 */
export function statusFromBackend(s: string | undefined): StatusKind {
  switch ((s || '').toUpperCase()) {
    case 'ACTIVE':   return 'live';
    case 'BUILDING': return 'training';
    case 'ERROR':    return 'down';
    default:         return 'draft';
  }
}

/* ──────────────────────────────────────────────────────────────
   Stat · numbered editorial stat card.
─────────────────────────────────────────────────────────────── */
export function Stat({
  label,
  value,
  sub,
  hint,
  delay = 0,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  hint?: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="v4-card v4-animate-in p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <Eyebrow>{label}</Eyebrow>
        {hint ? (
          <span className="font-mono text-[10px] text-muted-soft">{hint}</span>
        ) : null}
      </div>
      <div
        className="font-display mt-3 text-[28px] font-medium leading-none text-ink"
      >
        {value}
      </div>
      {sub ? <div className="mt-1.5 text-[12px] text-muted">{sub}</div> : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Pill · capsule. default (white) / inverted (black) / soft (surface).
─────────────────────────────────────────────────────────────── */
export function Pill({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'inverted' | 'soft' | 'mono';
  className?: string;
}) {
  const styles: Record<string, string> = {
    default:  'bg-canvas border border-line text-ink',
    inverted: 'bg-ink text-white border border-ink',
    soft:     'bg-surface text-ink border border-transparent',
    mono:     'bg-canvas border border-line text-muted font-mono uppercase tracking-[0.14em] text-[10px]',
  };
  const size = variant === 'mono' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variant !== 'mono' && 'text-[11px]',
        size,
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Button · primary / secondary / ghost / danger.
─────────────────────────────────────────────────────────────── */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconAfter?: LucideIcon;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: Icon, iconAfter: IconAfter, children, className, ...props },
  ref,
) {
  const base    = 'inline-flex items-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';
  const sizes   = { sm: 'px-3 py-1.5 text-[13px]', md: 'px-4 py-2 text-[14px]', lg: 'px-5 py-2.5 text-[14px]' };
  const variants = {
    primary:   'bg-ink text-white hover:bg-ink-hover',
    secondary: 'bg-canvas text-ink border border-line hover:bg-surface shadow-sm',
    ghost:     'bg-transparent text-muted hover:bg-surface hover:text-ink',
    danger:    'bg-transparent text-muted hover:bg-[#FEF2F2] hover:text-[#EF4444]',
  };
  return (
    <button ref={ref} className={cx(base, sizes[size], variants[variant], className)} {...props}>
      {Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
      {IconAfter ? <IconAfter className="w-4 h-4" /> : null}
    </button>
  );
});

/* ──────────────────────────────────────────────────────────────
   ButtonLink · same styling as Button but renders <a>.
─────────────────────────────────────────────────────────────── */
type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconAfter?: LucideIcon;
};

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = 'primary', size = 'md', icon: Icon, iconAfter: IconAfter, children, className, ...props },
  ref,
) {
  const base    = 'inline-flex items-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-150 whitespace-nowrap';
  const sizes   = { sm: 'px-3 py-1.5 text-[13px]', md: 'px-4 py-2 text-[14px]', lg: 'px-5 py-2.5 text-[14px]' };
  const variants = {
    primary:   'bg-ink text-white hover:bg-ink-hover',
    secondary: 'bg-canvas text-ink border border-line hover:bg-surface shadow-sm',
    ghost:     'bg-transparent text-muted hover:bg-surface hover:text-ink',
    danger:    'bg-transparent text-muted hover:bg-[#FEF2F2] hover:text-[#EF4444]',
  };
  return (
    <a ref={ref} className={cx(base, sizes[size], variants[variant], className)} {...props}>
      {Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
      {IconAfter ? <IconAfter className="w-4 h-4" /> : null}
    </a>
  );
});

/* ──────────────────────────────────────────────────────────────
   Divider · 1px hairline matching the line token.
─────────────────────────────────────────────────────────────── */
export function Divider({ className }: { className?: string }) {
  return <div className={cx('h-px w-full bg-line', className)} />;
}
