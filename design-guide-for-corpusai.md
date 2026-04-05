# Corpus AI — Design Guide

> Extracted from the V4 landing page. All new pages and redesigned pages must follow this guide exactly.

---

## 1. Visual Identity

**Aesthetic:** Modern, minimal, monochrome. Clean whitespace, sharp type, no visual clutter.

**Rule:** No colored accents (no purple, no gradients) in the main UI. The brand speaks through layout, type, and restraint — not color.

---

## 2. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#171717` | Headlines, primary buttons, dark sections, footer |
| **Secondary** | `#737373` | Body text, descriptions, muted headlines |
| **Background** | `#F7F7F7` | Page background, section background |
| **Surface** | `#FFFFFF` | Cards, inputs, modals, form containers |
| **Border** | `#E8E8E8` | All borders, dividers, input strokes |
| **White** | `#FFFFFF` | Text on dark backgrounds |
| **Muted text** | `#737373` | Captions, helper text, secondary labels |

### Dark sections (Footer, CTA bands)

| Token | Hex | Usage |
|-------|-----|-------|
| **Dark BG** | `#171717` | Footer, final CTA, dark bands |
| **Dark text** | `#FFFFFF` | Primary text on dark |
| **Dark muted** | `rgba(255,255,255,0.5)` | Secondary text on dark |
| **Dark border** | `rgba(255,255,255,0.1)` | Borders on dark |

---

## 3. Typography

**Fonts:**
- **Geist Sans** — headings, navigation, buttons (loaded via `geist/font/sans`)
- **Inter** — body text, descriptions, form labels (loaded via `next/font/google`, CSS var `--font-inter`)

### Scale

| Level | Classes | Weight |
|-------|---------|--------|
| **H1 (Hero)** | `text-5xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-none` | `font-normal` |
| **H2 (Section)** | `text-4xl md:text-5xl tracking-[-0.02em]` | `font-medium` |
| **H3 (Card title)** | `text-xl` | `font-medium` |
| **Body** | `text-base leading-relaxed` | `font-normal` |
| **Small body** | `text-sm` | `font-normal` |
| **Caption** | `text-xs` | `font-normal` or `font-medium` |
| **Badge / label** | `text-[11px] tracking-wide uppercase` | `font-semibold` |
| **Nav links** | `text-[14px] tracking-[-0.2px]` | `font-normal` |

### Rules

- Headlines are **never bold**. Use `font-normal` or `font-medium`.
- Two-tone headlines: first line `text-[#171717]`, second line `text-[#737373]`.
- Body text always uses Inter: `font-[family-name:var(--font-inter)]`.
- Negative letter-spacing on headings: `tracking-[-0.02em]`.

---

## 4. Buttons

### Primary (dark)
```
bg-[#171717] text-white rounded-md px-6 py-3.5 text-sm font-medium
hover:bg-[#171717]/90
```
Motion: `whileHover={{ scale: 1.03 }}` `whileTap={{ scale: 0.97 }}`

### Secondary (outline)
```
border border-[#E8E8E8] text-[#171717] bg-white rounded-md px-6 py-3.5 text-sm font-medium
shadow-sm hover:bg-[#F7F7F7]
```

### Small (nav)
```
text-sm border border-[#E8E8E8] shadow-[0_4px_4px_rgba(23,23,23,0.04)] rounded-[7px] px-4 py-2.5
hover:bg-[#F7F7F7]
```

### Small primary (nav CTA)
```
text-sm font-medium bg-[#171717] hover:bg-[#171717]/90 text-white rounded-md px-4 py-2.5
tracking-[-0.28px]
```

### On dark backgrounds
```
border border-white text-white hover:bg-white hover:text-[#171717]
```

---

## 5. Cards

### Standard card
```
bg-white rounded-2xl p-8 hover:shadow-md transition-shadow
```
- **No border** on light backgrounds (the white surface against #F7F7F7 provides contrast).
- Subtle hover shadow only.
- Inner label: `text-xs font-medium text-[#737373] uppercase tracking-widest mb-3`

### Highlighted card (e.g. pricing)
```
border-2 border-[#171717] bg-white
```

---

## 6. Inputs

```
w-full bg-white border border-[#E8E8E8] rounded-lg px-4 py-3 text-sm text-[#171717]
placeholder-[#A1A1AA]
focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717]/10
transition-all
```

- Icon prefix: 16px Lucide icon at `left-3.5`, `text-[#A1A1AA]`
- Labels: `text-sm font-medium text-[#171717] mb-2`
- Helper text: `text-xs text-[#737373] mt-1.5`

---

## 7. Badges / Pills

```
inline-flex items-center gap-2 px-4 py-1.5 rounded-full
border border-[#E8E8E8] bg-white text-[#171717]
text-[11px] font-semibold tracking-wide uppercase shadow-sm
```

Section badges (softer):
```
inline-flex items-center px-4 py-1.5 rounded-full
bg-white border border-[#E8E8E8] text-sm text-[#737373] shadow-sm
```

---

## 8. Layout & Spacing

| Element | Value |
|---------|-------|
| **Page max width** | `max-w-7xl` (1280px) or `max-w-6xl` (1152px) for nav |
| **Content max width** | `max-w-5xl` (960px) for hero text |
| **Form max width** | `max-w-md` (448px) |
| **Section padding** | `py-28 px-6` |
| **Horizontal padding** | `px-6` |
| **Card gap** | `gap-4` to `gap-8` |
| **Component spacing** | `mb-6` between title group elements |
| **Section title → content** | `mb-16` |

---

## 9. Section Anatomy

Every section follows:
1. **Badge** — centered pill with section label
2. **Heading** — two-tone H2 centered
3. **Subheading** — single-line `text-lg text-[#737373]` centered
4. **Content** — cards, grids, etc. with `mb-16` gap below header block

```tsx
<section className="py-28 px-6 bg-[#F7F7F7]">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#737373] shadow-sm mb-6">
        Section Label
      </span>
      <h2 className="text-4xl md:text-5xl font-medium text-[#171717] tracking-[-0.02em]">
        Headline. <span className="text-[#737373]">Muted part.</span>
      </h2>
      <p className="text-lg font-normal text-[#737373] mt-4">
        One-line description.
      </p>
    </div>
    {/* content */}
  </div>
</section>
```

---

## 10. Navigation

- Fixed top, transparent → `bg-white/80 backdrop-blur-xl border-b border-[#E8E8E8]` on scroll
- Logo: `h-8 brightness-0 opacity-90`
- Desktop: centered links, right-aligned CTAs (Log In outline + Sign Up dark)
- Mobile: full-screen overlay, accordion dropdowns
- Dropdown: `bg-white border border-[#E8E8E8] rounded-xl p-4 shadow-lg shadow-black/[0.06]`

---

## 11. Animation

**Library:** Framer Motion

### Scroll reveal
```tsx
const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0, 0, 0.2, 1] } },
};
```

### Stagger children
```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
```

### Card reveal
```tsx
delay: i * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1]
```

### Button interaction
```tsx
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.97 }}
transition={{ type: 'spring', stiffness: 400, damping: 20 }}
```

### Page transitions
```tsx
initial={{ opacity: 0, y: 16 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
```

---

## 12. Trust Signals

Dot-separated inline text:
```tsx
{['500+ teams', 'SOC 2 compliant', 'No credit card', 'Free forever plan'].map((text, i, arr) => (
  <span className="text-xs text-[#737373]">
    {text}{i < arr.length - 1 && <span className="mx-2">&middot;</span>}
  </span>
))}
```

---

## 13. Footer

- Background: `bg-[#171717]`
- 5-column grid: Brand + 4 link columns
- Column titles: `text-sm font-medium text-white mb-4`
- Links: `text-sm text-white/50 hover:text-white`
- Bottom bar: `border-t border-white/10 mt-12 pt-8`
- Copyright: `text-xs text-white/30`

---

## 14. What NOT to Use

- No purple (#BF56FF) — this was old v3 accent, removed in V4
- No dark theme for main pages (dark is footer/CTA only)
- No glassmorphism on light pages
- No bold headings
- No colored borders or shadows
- No gradients on buttons
- No excessive border-radius (use `rounded-md` for buttons, `rounded-2xl` for cards, `rounded-lg` for inputs)

---

## 15. Auth Pages (Target Design)

Auth pages should use the **light theme** matching the landing page, not a dark theme.

- Background: `bg-[#F7F7F7]`
- Card: `bg-white rounded-2xl p-8 shadow-sm` (no border on light bg)
- Inputs: white bg, `border-[#E8E8E8]`, focus `border-[#171717]`
- Primary button: `bg-[#171717] text-white` (same as landing page CTA)
- Links/toggles: `text-[#737373] hover:text-[#171717]`
- Error: `bg-red-50 border-red-200 text-red-600`
- Success: `bg-green-50 border-green-200 text-green-700`
- Google button: outline style matching secondary button pattern
