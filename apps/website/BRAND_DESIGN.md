# Corpus AI — Website Brand Design Guide

Quick reference for building new pages in `apps/website`.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#171717` | Headlines, buttons, icons, dark sections |
| Secondary | `#737373` | Body text, descriptions, muted labels |
| Background | `#F7F7F7` | Page background, section backgrounds, hover states |
| Border | `#E8E8E8` | All borders, dividers, card outlines |
| White | `#FFFFFF` | Cards, input backgrounds, button text |
| Dark Hover | `#2a2a2a` | Button hover on dark backgrounds |

### Dark Section Colors (Footer, CTA)

| Token | Value | Usage |
|-------|-------|-------|
| Section BG | `#171717` | Dark section background |
| Text Primary | `text-white` | Headings on dark bg |
| Text Secondary | `text-white/60` | Body text on dark bg |
| Text Muted | `text-white/40` | Fine print on dark bg |
| Links | `text-white/50` | Footer links |
| Border | `border-white/10` | Dividers on dark bg |

---

## Typography

### Fonts

| Font | Variable | Usage |
|------|----------|-------|
| **Geist Sans** | Default body class | Headings, UI elements |
| **Inter** | `--font-inter` | Body text, paragraphs |

Apply Inter on body text: `font-[family-name:var(--font-inter)]`

### Scale

| Element | Classes |
|---------|---------|
| H1 (Hero) | `text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.02em] leading-none` |
| H2 (Section) | `text-4xl md:text-5xl font-medium tracking-[-0.02em]` |
| H3 (Card title) | `text-xl font-medium` |
| Body | `text-base font-normal text-[#737373] leading-relaxed` |
| Small | `text-sm text-[#737373]` |
| Caption | `text-xs text-[#737373]` |

---

## Buttons

### Primary (Dark)

```
bg-[#171717] text-white rounded-md px-6 py-3.5 text-sm font-medium
hover: hover:bg-[#171717]/90
```

### Secondary (Outline)

```
border border-[#E8E8E8] text-[#171717] rounded-md px-6 py-3.5 text-sm font-medium bg-white shadow-sm
hover: hover:bg-[#F7F7F7]
```

### On Dark Background

```
Primary:   border border-white text-white rounded-md px-8 py-4 text-sm font-medium
           hover: hover:bg-white hover:text-[#171717]

Secondary: bg-[#2a2a2a] text-white/80 rounded-md px-8 py-4 text-sm font-medium
           hover: hover:bg-[#333333] hover:text-white
```

### Navbar Buttons

```
Log In:  text-sm text-[#171717] border border-[#E8E8E8] rounded-[7px] px-4 py-2.5 shadow-[0_4px_4px_rgba(23,23,23,0.04)]
Sign Up: text-sm font-medium bg-[#171717] text-white rounded-md px-4 py-2.5
```

---

## Badges & Pills

### Section Badge

```
inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#737373] shadow-sm
```

### Inline Pill (inside text)

```
inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#E8E8E8] bg-white text-sm text-[#171717]
```

### Tag (e.g. "Most Popular")

```
bg-[#171717] text-white text-xs font-medium px-4 py-1.5 rounded-full
```

---

## Cards

### Light Background Card

```
bg-white rounded-2xl p-8
hover: hover:shadow-md transition-shadow
```

No border needed — white cards contrast against `#F7F7F7` page bg.

### Highlighted Card (e.g. Popular pricing)

```
bg-white rounded-2xl p-8 border-2 border-[#171717]
```

---

## Shadows

| Name | Value | Usage |
|------|-------|-------|
| Soft | `shadow-sm` | Buttons, badges |
| Card hover | `shadow-md` | Card hover state |
| Dropdown | `shadow-lg shadow-black/[0.06]` | Navbar dropdowns |
| Subtle | `shadow-[0_4px_4px_rgba(23,23,23,0.04)]` | Navbar buttons |

---

## Border Radius

| Value | Usage |
|-------|-------|
| `rounded-full` | Badges, pills, avatars |
| `rounded-2xl` | Cards, large containers |
| `rounded-xl` | Dropdowns, inner panels |
| `rounded-lg` | Nav items, small cards |
| `rounded-md` | Buttons |

---

## Section Layout

### Spacing

| Section Type | Padding |
|-------------|---------|
| Standard | `py-28 px-6` |
| Hero | `pt-40 pb-20 px-6` |
| Footer | `py-16 px-6` |
| Navbar | `px-6 py-4` |

### Container

```
max-w-7xl mx-auto     (full-width sections)
max-w-5xl mx-auto     (content sections)
max-w-4xl mx-auto     (text-heavy sections)
max-w-3xl mx-auto     (FAQ, narrow content)
```

### Section Header Pattern

```tsx
<div className="text-center mb-16">
  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#737373] shadow-sm mb-6">
    Section Label
  </span>
  <h2 className="text-4xl md:text-5xl font-medium text-[#171717] tracking-[-0.02em]">
    Section Heading
  </h2>
  <p className="text-lg font-normal text-[#737373] mt-4 max-w-2xl mx-auto">
    Section description text goes here.
  </p>
</div>
```

---

## Icons

- Library: **Lucide React** (`lucide-react`)
- Default size: `w-4 h-4`
- Small: `w-3 h-3`
- Icon containers: `bg-[#F7F7F7]` with icon `text-[#171717]`

---

## Animations (Framer Motion)

### Scroll reveal

```tsx
initial={{ opacity: 0, y: 12 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-40px' }}
transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
```

### Button interaction

```tsx
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.97 }}
transition={{ type: 'spring', stiffness: 400, damping: 20 }}
```

### Stagger children

```tsx
// Parent
variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}

// Child
variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
```

---

## Quick Rules

1. **No purple.** The entire palette is monochrome black/gray/white.
2. **Cards have no border** on light backgrounds — they stand out via white-on-gray contrast.
3. **Use Geist for headings**, Inter for body paragraphs.
4. **Headlines are font-normal (400)** or font-medium (500), never bold.
5. **All sections use `py-28 px-6`** for consistent vertical rhythm.
6. **Dark sections** (`#171717` bg) use white text with opacity for hierarchy.
