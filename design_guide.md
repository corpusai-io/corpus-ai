# Corpus AI — Design System Guide
**Version:** V4 (current production design)
**Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, Inter font
**Route:** All new pages live under `apps/website/src/app/(home)/` or `apps/website/src/app/(main)/`

---

## 1. Design Philosophy

The V4 design is inspired by **Linear.app** — ultra-dark, minimal, precision-focused. The aesthetic communicates "enterprise-grade AI tooling" rather than a friendly chatbot. Key principles:

- **Dark-first**: Everything lives on near-black. No light backgrounds.
- **Restraint over decoration**: Sparse use of color. Let content breathe.
- **Purple as the signal color**: `#BF56FF` is used *only* for active states, CTAs, and accents — never as background fill.
- **Micro-transparency**: Whites and borders are always fractional opacity (`white/[0.06]`, `white/[0.03]`), never solid.
- **Motion with purpose**: Animations reveal information or confirm state changes. No decorative spinning or bouncing.

---

## 2. Color Palette

### Backgrounds
| Role | Value | Tailwind |
|------|-------|----------|
| Page background | `#08080A` | `bg-[#08080A]` |
| Card surface | `rgba(255,255,255,0.03)` | `bg-white/[0.03]` |
| Card hover | `rgba(255,255,255,0.05)` | `bg-white/[0.05]` |
| Active card | `rgba(191,86,255,0.06)` | `bg-[#BF56FF]/[0.06]` |
| Input / control bg | `rgba(255,255,255,0.03)` | `bg-white/[0.03]` |
| Navbar bg | `rgba(8,8,10,0.80)` | `bg-[#08080A]/80` |

### Borders
| Role | Value | Tailwind |
|------|-------|----------|
| Default card border | `rgba(255,255,255,0.06)` | `border-white/[0.06]` |
| Subtle divider | `rgba(255,255,255,0.04)` | `border-white/[0.04]` |
| Hover border | `rgba(255,255,255,0.10–0.12)` | `border-white/[0.10]` |
| Active / lit border | `rgba(191,86,255,0.40)` | `border-[#BF56FF]/40` |
| Navbar bottom | `rgba(255,255,255,0.04)` | `border-white/[0.04]` |

### Brand Purple
| Role | Value | Tailwind |
|------|-------|----------|
| Primary brand | `#BF56FF` | `text-[#BF56FF]` / `bg-[#BF56FF]` |
| Hover (buttons) | `#A83DE8` | `hover:bg-[#A83DE8]` |
| Light (gradient mid) | `#D08AFF` | `text-[#D08AFF]` |
| Glow overlay | `rgba(191,86,255,0.12–0.20)` | used in radial-gradient |
| Icon bg (active) | `rgba(191,86,255,0.10–0.15)` | `bg-[#BF56FF]/10` |

### Text
| Role | Value | Tailwind |
|------|-------|----------|
| Heading / primary | `#FFFFFF` | `text-white` |
| Body / secondary | `#71717A` | `text-[#71717A]` (zinc-500) |
| Muted / placeholder | `#A1A1AA` | `text-[#A1A1AA]` (zinc-400) |
| Very muted / label | `#3F3F46` | `text-[#3F3F46]` (zinc-700) |
| Almost invisible | `#27272A` | `text-[#27272A]` (zinc-800) |
| Brand accent | `#BF56FF` | `text-[#BF56FF]` |

### Status / Semantic
| Role | Value | Tailwind |
|------|-------|----------|
| Success / Online | `#22C55E` | `text-[#22C55E]` |
| Warning / Highlight | `#F59E0B` | `text-[#F59E0B]` |
| Error / Danger | `#EC4899` | `text-[#EC4899]` |
| Info / Indigo | `#6366F1` | `text-[#6366F1]` |

### Gradient Recipes
```css
/* Hero headline accent — purple → pink */
background: linear-gradient(to right, #BF56FF, #D08AFF, #EC4899);

/* Page-wide hero glow (top of page, radial) — use class v4-glow-hero */
background:
  radial-gradient(ellipse 60% 40% at 50% 0%, rgba(191,86,255,0.12) 0%, transparent 70%),
  radial-gradient(ellipse 40% 30% at 30% 10%, rgba(99,102,241,0.08) 0%, transparent 60%),
  radial-gradient(ellipse 40% 30% at 70% 10%, rgba(236,72,153,0.06) 0%, transparent 60%);

/* Section divider line — subtle purple glow */
background: linear-gradient(to right, transparent, rgba(191,86,255,0.20), transparent);

/* Subtle white divider */
background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent);
```

---

## 3. Typography

**Font family:** Inter (Google Fonts)
**Weights used:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
**Base class on `<body>`:** `font-sans antialiased`

### Scale
| Role | Size | Weight | Class |
|------|------|--------|-------|
| Hero headline | 56–72px | Bold | `text-5xl md:text-6xl lg:text-7xl font-bold` |
| Section heading | 36–48px | Bold | `text-4xl md:text-5xl font-bold` |
| Sub-heading | 24–30px | Semibold | `text-2xl md:text-3xl font-semibold` |
| Card title | 18–20px | Semibold | `text-lg font-semibold` |
| Body | 16–18px | Regular | `text-base md:text-lg` |
| Small body | 14px | Regular | `text-sm` |
| Label / caption | 11–12px | Medium | `text-xs font-medium` |
| Eyebrow / tag | 11px | Medium | `text-sm font-medium uppercase tracking-widest` |

### Letter Spacing
- Headlines: `tracking-tight` (tighter than default)
- Eyebrow labels: `tracking-widest` (very wide)
- Body: default

### Headline Gradient Text (brand accent)
```tsx
<span className="bg-gradient-to-r from-[#BF56FF] via-[#D08AFF] to-[#EC4899] bg-clip-text text-transparent">
  acts
</span>
```

### Eyebrow Pattern (section label above heading)
```tsx
<p className="text-sm font-medium text-[#BF56FF] uppercase tracking-widest mb-4">
  Section Name
</p>
```

---

## 4. Layout & Spacing

### Page Container
```tsx
// Standard section wrapper
<section className="py-24 px-6 max-w-7xl mx-auto">

// Narrower content section
<section className="py-32 px-6 max-w-4xl mx-auto">

// Full-width section (for banners)
<section className="w-full py-20 px-6">
```

### Page Wrapper (every page must have this)
```tsx
<main className="relative min-h-screen bg-[#08080A] overflow-hidden">
  {/* Hero glow at top */}
  <div className="v4-glow-hero absolute inset-0 pointer-events-none" />

  {/* Content */}
</main>
```

### Section Spacing
- Section vertical padding: `py-24` to `py-32`
- Between sections: add a 1px gradient divider line:
  ```tsx
  <div className="h-px w-full bg-gradient-to-r from-transparent via-[#BF56FF]/20 to-transparent" />
  ```
- Section heading `mb`: `mb-12` to `mb-16`
- Card gap: `gap-4` to `gap-6`

---

## 5. Component Patterns

### Cards
Cards use the `.v4-card` CSS class or its inline equivalent:

```tsx
// Standard card
<div className="v4-card rounded-2xl p-6">

// Inline equivalent
<div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6
                hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-300">

// Active / highlighted card (e.g. lit integration card)
<div className="border border-[#BF56FF]/40 bg-[#BF56FF]/[0.06]
                shadow-md shadow-[#BF56FF]/10 rounded-xl">
```

**Border radius:** `rounded-xl` (12px) for smaller cards, `rounded-2xl` (16px) for larger panels.

### Buttons

#### Primary CTA
```tsx
<Link
  href="/Sign-In"
  className="bg-[#BF56FF] hover:bg-[#A83DE8] text-white rounded-lg
             px-4 py-2 text-sm font-medium transition-colors"
>
  Start Free
</Link>
```

#### White / Inverted CTA (used in hero)
```tsx
<Link
  href="/Sign-In"
  className="bg-white text-[#08080A] hover:bg-white/90 rounded-lg
             px-6 py-3 text-sm font-medium transition-colors"
>
  Get Started
</Link>
```

#### Ghost / Outline CTA (secondary action)
```tsx
<Link
  href="/demo"
  className="border border-white/[0.12] text-white hover:bg-white/[0.04]
             rounded-lg px-6 py-3 text-sm font-medium transition-colors"
>
  Watch Demo
</Link>
```

#### Text link (nav / tertiary)
```tsx
<Link href="/Sign-In" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">
  Sign In
</Link>
```

**No rounded-full buttons** — always `rounded-lg` (8px).

### Badge / Pill (hero badge, status tags)
```tsx
// Announcement badge
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                border border-[#BF56FF]/20 bg-[#BF56FF]/5
                text-[#BF56FF] text-sm font-medium">
  <span className="w-2 h-2 rounded-full bg-[#BF56FF] animate-pulse" />
  Introducing Agentic AI
</div>

// Status badge (e.g. "Online")
<div className="flex items-center gap-1.5">
  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
  <span className="text-[10px] text-[#3F3F46]">Online</span>
</div>
```

### Icon Containers
```tsx
// Default icon box
<div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
  <Icon className="w-4 h-4 text-[#A1A1AA]" />
</div>

// Active / branded icon box
<div className="w-9 h-9 rounded-lg bg-[#BF56FF]/10 flex items-center justify-center">
  <Icon className="w-4 h-4 text-[#BF56FF]" />
</div>
```

### Form Inputs (for sign-in, contact, etc.)
```tsx
// Text input
<input
  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
             px-4 py-3 text-sm text-white placeholder-[#3F3F46]
             focus:outline-none focus:border-[#BF56FF]/40 focus:bg-white/[0.05]
             transition-all duration-200"
  placeholder="you@company.com"
/>

// Input label
<label className="block text-sm font-medium text-[#A1A1AA] mb-2">
  Email
</label>

// Input wrapper card (the form container)
<div className="v4-card rounded-2xl p-8">
  {/* form fields */}
</div>
```

### Divider with text (e.g. "or continue with")
```tsx
<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-white/[0.06]" />
  <span className="text-xs text-[#3F3F46] font-medium">OR</span>
  <div className="flex-1 h-px bg-white/[0.06]" />
</div>
```

### Dropdown / Select
```tsx
<select className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                   px-4 py-3 text-sm text-[#A1A1AA]
                   focus:outline-none focus:border-[#BF56FF]/40
                   transition-all duration-200 appearance-none">
```

### Links inside body text
```tsx
<a className="text-[#BF56FF] hover:text-[#D08AFF] transition-colors underline-offset-2 hover:underline">
  link text
</a>
```

---

## 6. Navbar

The navbar is always **fixed**, full-width, with frosted-glass effect:

```tsx
<nav className="fixed top-0 w-full z-40 bg-[#08080A]/80 backdrop-blur-xl border-b border-white/[0.04]">
  <div className="max-w-6xl mx-auto px-6 py-4">
```

- Logo: `<img src="/logo.svg" className="h-8 brightness-0 invert opacity-80" />`
  *(The logo.svg is rendered white via CSS invert)*
- Nav links: `text-sm text-[#A1A1AA] hover:text-white`
- Active dropdown: uses Framer Motion `AnimatePresence`, dark card `bg-[#111113]`
- CTA buttons: ghost + primary (see button section above)
- **Always import `NavbarV4`** — do not create new navbars.

---

## 7. Footer

Always use `FooterV4`. It is dark, 5-column grid with:
- Brand column: logo + tagline + social icons
- Link columns: Product, Integrations, Solutions, Resources
- Bottom bar: copyright
- Background: `bg-[#08080A]` with `border-t border-white/[0.06]`

---

## 8. Animations (Framer Motion)

All animations use **Framer Motion**. Key patterns:

### Scroll-triggered reveal (use on every section)
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
>
```

### Stagger children (for grids of cards)
```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

<motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
```

### Fade/slide on enter (simple elements)
```tsx
// Fade up from 8px
initial={{ opacity: 0, y: 8 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.45 }}

// Fade in only
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

### Hover card lift
```tsx
<motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
```

### AnimatePresence (for conditional rendering / tabs)
```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="panel"
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
```

### Ease values
- **Standard reveal:** `ease: [0, 0, 0.2, 1]` (ease-out cubic-bezier)
- **Quick UI response:** `duration: 0.15–0.2`
- **Content reveal:** `duration: 0.45–0.55`
- **Never use:** `ease: 'easeOut'` as a string (TypeScript error with framer-motion Variants)

---

## 9. CSS Utility Classes (globals.css)

These classes are available globally in `apps/website/src/app/globals.css`:

| Class | Purpose |
|-------|---------|
| `.v4-card` | Standard dark card surface |
| `.v4-glow-hero` | Radial purple/indigo/pink glow for page top |
| `.v4-glow-purple` | Box shadow glow effect |
| `.v4-grid-bg` | Subtle dot-grid background texture |
| `.v4-shimmer` | Horizontal shimmer sweep animation |
| `.v4-logo-scroll` | Infinite horizontal scroll for logo bars |
| `.v4-typing-line` | Typewriter cursor blinking effect |

---

## 10. Background Texture (Noise Overlay)

Every V4 page has a fixed noise texture overlay rendered at `z-50` as a non-interactive layer:

```tsx
<div
  className="fixed inset-0 z-50 pointer-events-none opacity-[0.025]"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
    backgroundSize: "128px 128px",
  }}
/>
```

This is already included in the `(home)/layout.tsx`. Any new page layout must include it too.

---

## 11. Page Layout Template

Use this structure for any new page:

```tsx
// apps/website/src/app/(main)/your-page/page.tsx
"use client";

import NavbarV4 from "@/app/components/home-v4/NavbarV4";
import FooterV4 from "@/app/components/home-v4/FooterV4";
import { motion } from "framer-motion";

export default function YourPage() {
  return (
    <main className="relative min-h-screen bg-[#08080A] overflow-hidden">
      {/* Hero glow */}
      <div className="v4-glow-hero absolute inset-0 pointer-events-none" />

      <NavbarV4 />

      {/* Page content starts below navbar (pt-24 to clear fixed nav) */}
      <div className="relative pt-24">

        {/* Hero / header section */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-[#BF56FF] uppercase tracking-widest mb-4">
            Page Eyebrow
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Page Heading
          </h1>
          <p className="text-lg text-[#71717A] mt-4 max-w-xl mx-auto">
            Subheading / description text.
          </p>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#BF56FF]/20 to-transparent" />

        {/* Main content */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          {/* content */}
        </section>

      </div>

      <FooterV4 />
    </main>
  );
}
```

---

## 12. Sign-In Page Example

A Sign-In page in this design system would look like this:

```tsx
"use client";
import NavbarV4 from "@/app/components/home-v4/NavbarV4";
import FooterV4 from "@/app/components/home-v4/FooterV4";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignIn() {
  return (
    <main className="relative min-h-screen bg-[#08080A] overflow-hidden flex flex-col">
      <div className="v4-glow-hero absolute inset-0 pointer-events-none" />
      <NavbarV4 />

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#71717A] mt-2 text-sm">
              Sign in to your Corpus AI account
            </p>
          </div>

          {/* Form card */}
          <div className="v4-card rounded-2xl p-8">
            {/* Google SSO */}
            <button className="w-full flex items-center justify-center gap-3
                               border border-white/[0.08] rounded-lg px-4 py-3
                               text-sm text-[#A1A1AA] hover:bg-white/[0.04]
                               hover:border-white/[0.12] transition-all duration-200 mb-6">
              {/* Google icon */}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-[#3F3F46] font-medium">OR</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                           px-4 py-3 text-sm text-white placeholder-[#3F3F46]
                           focus:outline-none focus:border-[#BF56FF]/40
                           transition-all duration-200"
                placeholder="you@company.com"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Password</label>
                <Link href="/forgot-password"
                      className="text-xs text-[#BF56FF] hover:text-[#D08AFF] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                           px-4 py-3 text-sm text-white placeholder-[#3F3F46]
                           focus:outline-none focus:border-[#BF56FF]/40
                           transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <button className="w-full bg-[#BF56FF] hover:bg-[#A83DE8] text-white
                               rounded-lg px-4 py-3 text-sm font-medium
                               transition-colors">
              Sign In
            </button>
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-[#3F3F46] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/Sign-Up"
                  className="text-[#BF56FF] hover:text-[#D08AFF] transition-colors">
              Start free
            </Link>
          </p>
        </motion.div>
      </div>

      <FooterV4 />
    </main>
  );
}
```

---

## 13. Assets

| Asset | Path | Usage |
|-------|------|-------|
| White logotype | `/logo.svg` | Navbar (use with `brightness-0 invert opacity-80`) |
| Circular logo | `/logo_primary_circ.png` | Chat widget avatars, hub icons — always `rounded-full object-contain` |
| Integration icons | `/socials-icons/Slack.svg` etc. | Integration cards |
| Favicon | `/favicon.ico` | auto |

**Image sizing note:** When using `logo_primary_circ.png` always apply both `rounded-full` and `object-contain` to prevent vertical stretching:
```tsx
<img src="/logo_primary_circ.png" className="w-10 h-10 rounded-full object-contain" />
```

---

## 14. Do's and Don'ts

### ✅ Do
- Use `#08080A` as the page background on every page
- Use `v4-card` pattern for all content containers
- Keep white text for headings, `#71717A` for body, `#A1A1AA` for labels
- Use `border-white/[0.06]` as default card border
- Animate elements with `whileInView` + `viewport={{ once: true }}`
- Use the purple gradient (`from-[#BF56FF] via-[#D08AFF] to-[#EC4899]`) only on key headline words
- Always use `NavbarV4` and `FooterV4` — never create new nav/footer components
- Use `rounded-lg` (8px) for buttons and inputs — not `rounded-full`
- Use `transition-colors` or `transition-all duration-200` on all interactive elements

### ❌ Don't
- Use white or light backgrounds (that's the old design)
- Use `rounded-full` on buttons
- Use solid color fills for cards (should always be fractional white opacity)
- Use hard borders (`border-white` at full opacity)
- Create gratuitous animations — every motion should have a purpose
- Use `ease: 'easeOut'` as a string in Framer Motion variant objects (TypeScript error)
- Use the brand purple as a large area background fill
- Add shadows with solid colors — use `shadow-[#BF56FF]/10` style (with opacity)

---

## 15. Quick Reference Cheat Sheet

```
Background:    #08080A
Card:          bg-white/[0.03]  border-white/[0.06]  rounded-2xl
Card hover:    bg-white/[0.05]  border-white/[0.10]
Input:         bg-white/[0.03]  border-white/[0.08]  focus:border-[#BF56FF]/40
Active:        bg-[#BF56FF]/[0.06]  border-[#BF56FF]/40

Primary btn:   bg-[#BF56FF]  hover:bg-[#A83DE8]  text-white  rounded-lg
White btn:     bg-white  text-[#08080A]  hover:bg-white/90  rounded-lg
Ghost btn:     border-white/[0.12]  text-white  hover:bg-white/[0.04]  rounded-lg

Heading:       text-white  font-bold  tracking-tight
Body:          text-[#71717A]
Label:         text-[#A1A1AA]
Muted:         text-[#3F3F46]
Brand:         text-[#BF56FF]
Success:       text-[#22C55E]

Divider:       h-px bg-gradient-to-r from-transparent via-[#BF56FF]/20 to-transparent
Eyebrow:       text-sm font-medium text-[#BF56FF] uppercase tracking-widest
Reveal anim:   initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
```
