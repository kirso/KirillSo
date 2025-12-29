# Quiet Archive Design System

A synthesis of Scandinavian clarity, Japanese restraint, and editorial rigor.
Every element earns its place through purpose, not decoration.

---

## Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Quiet Density** | Information-rich, but calm. No visual noise. |
| **Ma (間)** | Intentional negative space as a design element. |
| **Kanso (簡素)** | Simplicity through elimination, not addition. |
| **Functional Restraint** | Ornament serves function, or doesn't exist. |
| **Nordic Index** | Catalog rigor meets Scandinavian calm. |
| **Geometric Stillness** | Sharp, precise, tranquil. |

### Aesthetic References

| Reference | Influence |
|-----------|-----------|
| [Vercel](https://vercel.com) | Clean neutrals, modern professional |
| [Stripe Press](https://press.stripe.com) | Editorial elegance, geometric quotes |
| [Linear](https://linear.app) | Dense but breathable UI |
| [Aesthete](https://aesthete.site) | Catalog minimalism, index typography |
| [Kinfolk](https://kinfolk.com) | Nordic restraint, generous white space |

---

## Typography

### Font Stack

```css
--font-sans: "Geist", system-ui, sans-serif;
--font-mono: "Geist Mono", ui-monospace, monospace;
```

**Geist** by Vercel — Clean, tight, excellent for dense UI and catalog aesthetics.

### Type Scale (1.25 Major Third)

| Token | Size | Usage |
|-------|------|-------|
| `--text-hero` | 40px | Hero headlines (optional) |
| `--text-display` | 32px | Page titles (h1) |
| `--text-title` | 24px | Section headings (h2, h3) |
| `--text-large` | 18px | Emphasis, lead paragraphs |
| `--text-body` | 15px | ALL content (bio, posts, notes, cards) |
| `--text-micro` | 12px | Metadata: dates, labels, section rules |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--leading-tight` | 1.2 | Headings |
| `--leading-snug` | 1.4 | Titles |
| `--leading-normal` | 1.5 | UI text |
| `--leading-relaxed` | 1.65 | Body/prose |

### Measure

- **Optimal reading width:** 65ch max
- Prose content constrained to comfortable measure

---

## Color System

OKLCH pure neutrals (chroma = 0) — Modern black/white/gray with no warmth or sepia.
Optimized for reduced eye strain: 2-3% dimmer than typical pure values.

### Light Mode

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--color-paper` | `oklch(0.96 0 0)` | `#F5F5F5` | Background |
| `--color-ink` | `oklch(0.20 0 0)` | `#262626` | Headings, titles (darkest) |
| `--color-ink-secondary` | `oklch(0.42 0 0)` | `#636363` | Body text, descriptions |
| `--color-ink-tertiary` | `oklch(0.52 0 0)` | `#7A7A7A` | Metadata, labels, dates |
| `--color-rule` | `oklch(0.82 0 0)` | `#C9C9C9` | Borders, dividers |
| `--color-rule-light` | `oklch(0.89 0 0)` | `#E0E0E0` | Subtle borders |
| `--color-surface` | `oklch(0.93 0 0)` | `#EDEDED` | Cards, code blocks |

### Dark Mode

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--color-paper` | `oklch(0.12 0 0)` | `#1A1A1A` | Background |
| `--color-ink` | `oklch(0.87 0 0)` | `#DBDBDB` | Headings, titles (lightest) |
| `--color-ink-secondary` | `oklch(0.69 0 0)` | `#A3A3A3` | Body text, descriptions |
| `--color-ink-tertiary` | `oklch(0.55 0 0)` | `#828282` | Metadata, labels, dates |
| `--color-rule` | `oklch(0.25 0 0)` | `#363636` | Borders, dividers |
| `--color-rule-light` | `oklch(0.19 0 0)` | `#282828` | Subtle borders |
| `--color-surface` | `oklch(0.15 0 0)` | `#1F1F1F` | Cards, code blocks |

### Text Hierarchy

```
--color-ink           → Headings, titles, bold, links
--color-ink-secondary → Body text, descriptions, prose
--color-ink-tertiary  → Metadata, labels, bullets, dates
```

---

## Spacing

4px grid for vertical rhythm.

| Token | Value |
|-------|-------|
| `--space-0-5` | 2px |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-24` | 96px |

---

## Component Vocabulary

### Core Elements

| Element | Class | Description |
|---------|-------|-------------|
| Page title | `.page-title` | Display size, tight leading |
| Section label | `.section-label` | Uppercase, micro, tertiary |
| Monospace | `.mono` | Tabular numbers, dates, codes |
| Link | `.link` | Underline on hover |
| Link muted | `.link-muted` | Tertiary color, subtle |

### Geometric Dividers

#### Section Rule
Horizontal line with right-aligned label.

```html
<div class="section-rule"><span>2024</span></div>
```
```
2024 ────────────────────────────────────────────
```

#### Post Row with Leader
Title connected to date via dot leaders.

```html
<li class="post-row">
  <a class="post-title link" href="#">Article Title</a>
  <span class="post-leader"></span>
  <span class="post-date mono">6 Jun 2025</span>
</li>
```
```
Article Title · · · · · · · · · · · · · · 6 Jun 2025
```

#### Double Rule
Two thin parallel lines.

```html
<div class="double-rule"></div>
```
```
════════════════════════════════════════════════
```

#### Broken Rule (Ensen 縁線)
Line with intentional gap.

```html
<div class="broken-rule"></div>
```
```
─────────────────────    ─────────────────────
```

#### Hash Divider
Diagonal marks separator.

```html
<div class="hash-divider"></div>
```
```
                         ///
```

### Japanese-Inspired

#### End Mark
Section/page termination symbol.

```html
<div class="end-mark"></div>
```
```
                          ◆
```

#### Corner Brackets
Partial borders at corners for featured content.

```html
<div class="corner-brackets">
  Featured content here
</div>
```
```
┌                                               ┐
  Featured content here
                                                ┘
```

#### Axis Corner
Graph paper style corner mark.

```html
<div class="axis-corner">
  Content with corner accent
</div>
```

### Scandinavian-Inspired

#### Timeline Entry
Vertical line linking entries.

```html
<div class="timeline-entry">
  <span class="timeline-year mono">2024</span>
  <div class="timeline-content">Content here</div>
</div>
```

#### Index Numbers
Catalog-style numbering.

```html
<span class="idx">01</span> First item
<span class="idx">02</span> Second item
```
```
№ 01  First item
№ 02  Second item
```

#### Chevron List
Angular list markers.

```html
<ul class="chevron-list">
  <li>First item</li>
  <li>Second item</li>
</ul>
```
```
› First item
› Second item
```

#### Coordinate Marker
Map-style location/numbering.

```html
<span class="coord">51.5° N</span>
```

#### Cross Mark
Decorative + separator.

```html
<span class="cross-mark"></span>
```

#### Bracket Quote
Japanese「」corner marks for pullquotes.

```html
<blockquote class="bracket-quote">
  Wisdom deserving emphasis
</blockquote>
```
```
「
  Wisdom deserving emphasis
                           」
```

#### Dot Grid
Subtle engineering paper texture background.

```html
<div class="dot-grid">
  Featured content here
</div>
```

#### Ruler Notch
Small tick mark on left edge for measurement feel.

```html
<div class="ruler-notch">Progress item</div>
```
```
─ Progress item
```

#### Registration Mark
Editorial ⊕ alignment marker.

```html
<span class="reg-mark">Aligned content</span>
```
```
⊕ Aligned content
```

### Interactive

#### Reading Progress Bar
Scroll progress indicator for articles.

```html
<div class="reading-progress" id="reading-progress"></div>

<script>
  const bar = document.getElementById("reading-progress");
  window.addEventListener("scroll", () => {
    const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.setProperty("--scroll-progress", progress);
  }, { passive: true });
</script>
```

---

## Usage Patterns

### Page Header

```html
<header class="mb-12">
  <h1 class="page-title">Page Title</h1>
  <p class="mt-2 text-text-secondary">Subtitle or description</p>
</header>
```

### Section with Rule

```html
<section class="mb-12">
  <div class="section-rule"><span>Section Name</span></div>
  <!-- Content -->
</section>
```

### Post List

```html
<ul class="space-y-1">
  <li class="post-row">
    <a class="post-title link" href="#">Post Title</a>
    <span class="post-leader"></span>
    <span class="post-date mono">6 Jun 2025</span>
  </li>
</ul>
```

### Tag Navigation Bar

```html
<nav class="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-4"
     style="font-size: var(--text-micro);">
  <span class="text-text-tertiary uppercase tracking-wide">Topics</span>
  <span class="text-text-tertiary">/</span>
  <a class="link-muted" href="/tags/topic/">topic</a>
  <span class="text-text-tertiary">·</span>
  <a class="link-muted" href="/tags/">all →</a>
</nav>
```

### Breadcrumb

```html
<nav class="mb-4 text-text-tertiary" style="font-size: var(--text-micro);">
  <a class="link-muted" href="/section/">Section</a>
  <span class="mx-2">/</span>
  <span class="text-text-secondary">Current Page</span>
</nav>
```

---

## Files

| File | Purpose |
|------|---------|
| `src/styles/global.css` | Design tokens, utilities, components |
| `tailwind.config.ts` | Prose typography configuration |
| `public/fonts/` | Geist font files (woff2) |
| `src/data/books.ts` | Influential books data for /reading page |
| `DS.md` | This design system documentation |

---

## Page Patterns

Where geometric elements are used across the site:

| Page | Elements Used |
|------|---------------|
| `/posts` | section-rule, post-row, post-leader, topics bar |
| `/posts/[slug]` | end-mark, reading-progress, prose |
| `/tags` | section-rule, post-row, post-leader |
| `/notes` | section-rule, note-card with № marker |
| `/reading` | section-rule, post-row, idx (favorites), Goodreads RSS |
| `/uses` | section-rule, geo-table hover cards |
| `/about` | corner-brackets (optional), timeline |

---

## Principles Checklist

When adding new elements, ask:

- [ ] Does it serve a clear function?
- [ ] Is it the simplest solution?
- [ ] Does it use existing tokens (colors, spacing, type)?
- [ ] Does it maintain quiet density?
- [ ] Does it respect Ma (negative space)?
- [ ] Is it sharp, precise, geometric?
