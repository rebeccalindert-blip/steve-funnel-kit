# Permissions

When the user gives explicit approval, you may:
- Push directly to `main`
- Run the deploy command: `npm run build && npx wrangler pages deploy dist --project-name steve-funnel-kit`
- Run any other command the user explicitly asks for

# Steve's Funnel Kit … AI Instructions

Astro 5 marketing site with Tailwind CSS v4, React 19, and GoHighLevel CRM. Design tokens, CVA component variants, semantic color architecture.

## Golden Rules

1. **Use the design system.** Never create raw HTML for something a component already handles.
2. **Use design tokens.** Never hardcode hex/rgb colors, pixel font sizes, or pixel spacing. Always use token variables or Tailwind classes that map to tokens.
3. **Preserve responsive behavior.** Every page must work at mobile (320px), tablet (768px), and desktop (1024px+). Never remove responsive classes or breakpoint logic.
4. **Use existing layouts.** New pages MUST use one of the layouts in `src/layouts/`. Never write a standalone `<!doctype html>` page without a layout.
5. **Use existing components.** Check `src/components/ui/` before building anything custom. 33 components across 8 categories.
6. **Never use Tailwind's default color palette.** No `bg-slate-*`, `text-zinc-*`, `bg-gray-*`, `text-emerald-*`, `bg-blue-*`, `text-red-*`, etc. The ONLY color classes allowed are our token classes (`bg-background`, `text-foreground`, `text-brand-500`, etc.). If it's a color name from tailwindcss.com/docs/colors … it's wrong.
7. **No scoped `<style>` for things Tailwind handles.** Only use `<style>` blocks for complex CSS animations or third-party widget overrides. Colors, spacing, typography, layout … always Tailwind classes.

## Architecture

```
src/pages/my-page.astro          # Route (URL)
  └── imports a Layout           # BaseLayout, MarketingLayout, LandingLayout, LeadLayout, PageLayout, BlogLayout
       └── uses Components       # From src/components/ui/, hero/, forms/, patterns/
            └── styled by Tokens # From src/styles/tokens/ and themes/
```

### Key Directories

-> `src/pages/` … file-based routing. `foo.astro` → `/foo`
-> `src/layouts/` … page wrappers. Always wrap pages in a layout
-> `src/components/ui/` … the component library. 33 components across 8 categories
-> `src/components/_demo/` … demo-only (ThemeCustomizer). Only renders when `PUBLIC_DEMO_MODE=true`
-> `src/components/forms/` … `LeadCaptureForm.tsx` (React) and `MobileFormSheet.tsx`
-> `src/components/hero/` … Hero section with `layout`, `size`, variant props
-> `src/components/patterns/` … composed patterns (ContactForm, StatCard, etc.)
-> `src/styles/tokens/` … design tokens (colors, typography, spacing)
-> `src/styles/themes/` … theme files (default.css, midnight.css)
-> `src/config/site.config.ts` … site name, URL, branding metadata
-> `src/lib/ghl.ts` … GoHighLevel API client
-> `src/lib/cn.ts` … `cn()` utility for merging Tailwind classes

## Color System … NEVER Use Raw Colors

Three layers:

1. **Primitives** (`tokens/primitives.css`) … raw OKLCH scales: `--gray-*`, `--brand-*`, `--orange-*`, `--blue-*`
2. **Semantic tokens** (`themes/default.css`) … purpose-based: `--background`, `--foreground`, `--border`, `--primary`
3. **Tailwind classes** (`global.css @theme`) … `bg-background`, `text-foreground`, `border-border`, `text-brand-500`

### What to Use

```
bg-background          text-foreground         border-border
bg-secondary           text-foreground-muted   border-strong
bg-card                text-brand-500          text-primary
var(--foreground)      var(--background)       var(--border)
```

### What NOT to Use

```
bg-white               text-gray-500           border-gray-200
bg-black               text-[#333]             color: #ff0000
bg-slate-100           text-zinc-400           style="color: red"
```

### BANNED … Tailwind Default Palette

These are Tailwind's built-in colors. Never use them. They bypass our token system.

```
slate-*, gray-*, zinc-*, neutral-*, stone-*
red-*, orange-*, amber-*, yellow-*, lime-*
green-*, emerald-*, teal-*, cyan-*, sky-*
blue-*, indigo-*, violet-*, purple-*, fuchsia-*
pink-*, rose-*
```

The ONLY named color scales in this project:
-> `brand-*` (50-900) … maps to `--brand-hue` in primitives.css
-> `gray-*` … our custom OKLCH gray, NOT Tailwind's gray
-> `orange-*` … accent only (500, 600)
-> `blue-*` … accent only (500, 600)

Raw colors break dark mode, inverted sections, and theme switching. Token-based colors adapt automatically.

### Brand Color Classes

Use `text-brand-500`, `bg-brand-300`, etc. for accent colors. The brand scale (50-900) is defined in `primitives.css` via `--brand-hue` and can be changed by the user. Never reference the specific color (e.g., "emerald") … always use `brand-*`.

### Inverted Sections

For dark sections on light pages, add `class="invert-section"` to the container. All child token classes automatically remap. Never manually override colors inside inverted sections.

```astro
<section class="invert-section bg-background py-20">
  <!-- text-foreground is now light text, bg-secondary is now dark -->
</section>
```

## Token Cascade (how values flow)

```
primitives.css (raw OKLCH scales: --brand-hue, --gray-*, --brand-*)
  → themes/default.css (semantic remapping: --background, --foreground, --primary, --theme-font-*)
    → global.css @theme block (Tailwind registration: --color-background, --font-sans, --font-size-*)
      → Tailwind utility classes (bg-background, text-foreground, font-sans, text-3xl)
```

**CSS layer specificity (lowest → highest for normal rules):**
1. `@layer base` (element defaults in global.css)
2. `@layer utilities` (Tailwind utility classes)
3. Unlayered styles (page-level `<style is:global>`)

If you change a token value and don't see the effect:
1. **Check localStorage** — the demo customizer saves `sfk-*` keys that override CSS variables via JavaScript on every page load. Clear them or use incognito.
2. **Check the @theme block** — the variable must be registered in `global.css` `@theme` for Tailwind to generate a utility class.
3. **Check specificity** — a Tailwind utility in `@layer utilities` beats a base style in `@layer base`, but unlayered inline styles beat both.

## Typography … NEVER Use Raw Sizes

### Font Families

```
font-sans       → var(--theme-font-sans)     … body text
font-display    → var(--theme-font-display)   … headings
font-mono       → var(--theme-font-mono)      … code, prices, labels
```

### Font Sizes

Tailwind's standard size classes use fluid `clamp()` values that scale smoothly between mobile and desktop viewports:

```
text-xs  text-sm  text-base  text-lg  text-xl  text-2xl  text-3xl  text-4xl  text-5xl  text-6xl  text-7xl
```

Each maps to a `clamp(min, preferred, max)` token defined in `typography.css` and wired through the `@theme` block. For example, `text-3xl` resolves to `clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)`.

Never use `text-[14px]`, `text-[1.2rem]`, or `style="font-size: 18px"`.

### Base Heading Styles (automatic)

All `h1`-`h6` elements automatically receive from `@layer base` in `global.css`:
- `font-weight: var(--theme-heading-weight)` → 700 (bold) by default
- `line-height: 1.1`
- `letter-spacing: var(--theme-heading-tracking)` → -0.03em by default

What is **NOT** automatic:
- `font-family` — headings inherit the body font. Add the `font-display` class explicitly for display font.
- `text-transform` — not set in the base layer. Add `uppercase` class explicitly if needed.

### Heading Pattern

```astro
<h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
  Section Title
</h2>
```

Always use `font-display` + `tracking-tight` on headings. `font-bold` (700) for headings, `font-semibold` (600) for subheadings.

## Changing Fonts — Four Steps

All four steps are required. Missing any one breaks the chain.

1. **Install the font:** `npm install @fontsource-variable/your-font`
2. **Import it** in `src/styles/global.css` (lines 13-14):
   `@import '@fontsource-variable/your-font';`
3. **Define the stack** in `src/styles/themes/default.css` (lines 83-86):
   `--theme-font-sans: 'Your Font Variable', 'Your Font', ui-sans-serif, system-ui, ...;`
4. **Verify registration** in `src/styles/global.css` `@theme` block (lines 68-71):
   `--font-sans: var(--theme-font-sans);` must exist (it does by default — just confirm it's there)

To change the display font (headings), update `--theme-font-display` in step 3. To change the mono font (code, prices), update `--theme-font-mono` and its `@import`.

## Spacing … Use the Token Scale

### Section Spacing

```
py-[var(--space-section)]         … standard section padding
py-[var(--space-section-lg)]      … large section padding
mb-[var(--space-section-header)]  … gap between section title and content
pt-[var(--space-page-top)]        … top of page (clears fixed header)
```

### General Spacing

Use Tailwind spacing utilities (`p-4`, `gap-6`, `mt-8`). These map to a 4px base scale. For section-level spacing, use the `--space-*` variables above.

Never use `style="margin-top: 47px"` or `p-[23px]`.

## Component Library

### How Components Work

```
src/components/ui/form/Button/
├── Button.astro          # Astro server component
├── Button.tsx            # React interactive component
├── button.variants.ts    # CVA variant definitions
└── index.ts              # Barrel export
```

### Import Pattern

```astro
---
import Button from '@/components/ui/form/Button/Button.astro';
import Card from '@/components/ui/data-display/Card/Card.astro';
import Badge from '@/components/ui/data-display/Badge/Badge.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import Alert from '@/components/ui/feedback/Alert/Alert.astro';
import Accordion from '@/components/ui/overlay/Accordion/Accordion.astro';
import CTA from '@/components/ui/marketing/CTA/CTA.astro';
---
```

### Available Components

**Form:** Button, Input, Textarea, Select, Checkbox, Radio, Switch
**Data Display:** Card, Badge, Avatar, AvatarGroup, Table, Pagination, Progress, Skeleton, GoogleMap
**Feedback:** Alert, Toast, Tooltip
**Overlay:** Dialog, Dropdown, Accordion, Tabs, VerticalTabs, ConsentBanner
**Marketing:** Logo, CTA, NpmCopyButton, SocialProof, TerminalDemo
**Content:** CodeBlock
**Layout:** Separator
**Primitives:** Icon

### Component Variants (CVA)

```astro
<!-- Button variants -->
<Button variant="primary" size="lg">Primary Large</Button>
<Button variant="secondary" size="md">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<!-- Card variants -->
<Card variant="default" padding="lg">Default card</Card>
<Card variant="solid">Solid background</Card>
<Card variant="outline">Outlined</Card>

<!-- Badge variants (6 variants + pill + pulse props) -->
<Badge variant="brand" pill>Label</Badge>           <!-- Brand colors, monospace font, rounded pill -->
<Badge variant="brand" pill pulse>Live</Badge>       <!-- With animated pulsing dot indicator -->
<Badge variant="default">Default</Badge>             <!-- Neutral background -->
<Badge variant="success">Active</Badge>              <!-- Green status -->
<Badge variant="warning">Pending</Badge>             <!-- Amber status -->
<Badge variant="error">Failed</Badge>                <!-- Red status -->
<Badge variant="info">Note</Badge>                   <!-- Blue status -->

<!-- Alert variants -->
<Alert variant="info">Info message</Alert>
<Alert variant="success">Success</Alert>
<Alert variant="warning">Warning</Alert>
<Alert variant="error">Error</Alert>
```

### Class Merging with cn()

```typescript
import { cn } from '@/lib/cn';
cn('px-4 py-2', isActive && 'bg-primary', className);
```

## Layouts

| Layout | When to use |
|--------|------------|
| `MarketingLayout` | Standard pages with header + footer |
| `LandingLayout` | Full-width landing pages |
| `LeadLayout` | Lead capture / squeeze pages |
| `PageLayout` | Content pages (non-landing) with header + footer |
| `BlogLayout` | Blog posts |
| `BaseLayout` | Raw HTML shell (rarely used directly) |

```astro
---
import MarketingLayout from '@/layouts/MarketingLayout.astro';
---
<MarketingLayout title="Page Title" description="SEO description">
  <!-- page content -->
</MarketingLayout>
```

## Hero Component

```astro
---
import Hero from '@/components/hero/Hero.astro';
---
<Hero layout="centered" size="lg">
  <Badge slot="badge" variant="brand" pill>New</Badge>
  <h1 slot="title">Your Headline</h1>
  <p slot="description">Supporting text</p>
  <Fragment slot="actions">
    <Button size="lg" href="#cta">Get Started</Button>
  </Fragment>
</Hero>
```

**Layout options:** `centered`, `split`
**Size options:** `sm`, `md`, `lg`, `xl`

## Lead Capture Forms

```astro
---
import LeadCaptureForm from '@/components/forms/LeadCaptureForm.tsx';
---
<LeadCaptureForm
  client:load
  formTags={['your_tag']}
  submitLabel="Get Started"
  termsHtml="<p>Terms text</p>"
/>
```

Always use `client:load` for React components. The form submits to `/api/lead` which forwards to GoHighLevel.

For mobile sticky forms:
```astro
<div class="lg:hidden">
  <MobileFormSheet client:load formTags={['tag']} submitLabel="CTA Text" />
</div>
```

## Responsive Breakpoints

```
sm:   640px   … small phones → larger phones
md:   768px   … phones → tablets
lg:  1024px   … tablets → desktop
xl:  1280px   … desktop → wide desktop
```

### Patterns

```astro
<!-- Text sizes scale up -->
<h1 class="text-2xl md:text-3xl lg:text-5xl">

<!-- Grid columns increase -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Show/hide at breakpoints -->
<div class="hidden lg:block">Desktop only</div>
<div class="lg:hidden">Mobile/tablet only</div>

<!-- Padding increases -->
<section class="px-6 md:px-10 lg:px-16">
```

Mobile-first: write base styles for mobile, then add `md:` and `lg:` overrides. Never use `@media` queries in inline styles. The `container` class is max-width 1280px with responsive padding.

## SEO

```astro
---
import SEO from '@/components/seo/SEO.astro';
---
<head>
  <SEO title="Page Title" description="Description for Google" />
</head>
```

Every page must have a unique `title` and `description`.

## API Endpoints

-> `POST /api/lead` … GHL lead capture (JSON body, rate limited 10/min)
-> `POST /api/contact` … contact form (FormData, rate limited 5/min)
-> `POST /api/newsletter` … newsletter signup (FormData, rate limited 5/min)
-> `POST /api/qualify` … qualification questions (JSON body, rate limited 5/min)

All endpoints validate origin, enforce body size limits, and sanitize input. The `ALLOWED_ORIGINS` array in each file controls which domains can submit.

## Files You Should NOT Modify

-> `src/styles/global.css` … Tailwind config, animations, base layer
-> `src/styles/tokens/spacing.css` … spacing scale
-> `src/styles/tokens/typography.css` … fluid type scale
-> `src/lib/cn.ts` … class merge utility
-> Component `*.variants.ts` files … CVA variant definitions

## Files to Modify with Caution

-> `astro.config.mjs` … build configuration. **Safe to change:** `site` URL, `output` mode (`'static'` vs `'server'`). **Do NOT remove:** the `react-dom/server.edge` alias (build-only, required for Cloudflare Workers), the cloudflare adapter config, or the `vite.ssr.resolve.conditions` settings. The edge alias is wrapped in an `isBuild` check so it only applies during `astro build`, not `astro dev`.

## Files Safe to Modify

-> `src/pages/*` … add/edit page content freely
-> `src/config/site.config.ts` … site name, URL, branding
-> `src/config/nav.config.ts` … navigation menu items
-> `src/styles/tokens/primitives.css` … brand color hue (change `--brand-hue: 162` to your hue)
-> `src/styles/themes/default.css` … font family, shadows, border radius
-> `src/styles/tokens/colors.css` … theme switcher (line 9)
-> `src/assets/branding/*` … logo SVG files
-> `src/pages/api/*` … `ALLOWED_ORIGINS` and `ALLOWED_TAGS` arrays
-> `src/content/*` … blog posts, FAQs, author data

## Adding a New Design Token

All four steps are required. If you skip step 3, no Tailwind utility is generated.

1. **Define the raw value** in the appropriate tokens file:
   - Colors → `src/styles/tokens/primitives.css`
   - Fonts → `src/styles/themes/default.css`
   - Spacing → `src/styles/tokens/spacing.css`
2. **Map to a semantic token** in `src/styles/themes/default.css` (and the `.dark` block if it needs a dark mode variant)
3. **Register in the `@theme` block** of `src/styles/global.css`:
   `--color-your-token: var(--your-token);` or `--font-your-token: var(--theme-font-your-token);`
4. **Use as a Tailwind class:** `bg-your-token`, `text-your-token`, `font-your-token`, etc.

## Common Patterns

### Section with heading + content

```astro
<section class="py-[var(--space-section-lg)]">
  <div class="mx-auto max-w-6xl px-6">
    <div class="text-center mb-[var(--space-section-header)]">
      <p class="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Label</p>
      <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        Section Title
      </h2>
      <p class="mt-4 text-base leading-relaxed text-foreground-muted max-w-2xl mx-auto">
        Description text
      </p>
    </div>
    <!-- section content here -->
  </div>
</section>
```

### Feature grid

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card variant="default" padding="lg">
    <Icon name="zap" class="w-10 h-10 text-brand-500" />
    <h3 class="mt-4 text-lg font-bold text-foreground">Feature Title</h3>
    <p class="mt-2 text-sm text-foreground-muted">Description</p>
  </Card>
</div>
```

### CTA section

```astro
<CTA variant="invert" size="lg">
  <Badge slot="logo" variant="brand" pill>Label</Badge>
  <h2 slot="heading">Call to Action</h2>
  <p slot="description">Supporting text</p>
</CTA>
```

### Benefits list with checkmarks

```astro
<ul class="space-y-3">
  {benefits.map((item) => (
    <li class="flex gap-3 items-start text-foreground-secondary text-sm">
      <Icon name="check-circle" size="sm" class="text-brand-500 mt-0.5 shrink-0" />
      <span>{item}</span>
    </li>
  ))}
</ul>
```

## Background Utilities

Available in `global.css` for decorative backgrounds. Add to a container with `position: relative`.

| Class | Effect | Use for |
|-------|--------|---------|
| `.bg-grid-pattern` | Mesh gradient with grain overlay | Hero sections |
| `.bg-glow` | Radial brand-colored glow (light mode) | Accent behind content |
| `.bg-glow-dark` | Stronger radial brand glow (dark mode) | Dark mode accent |
| `.bg-grid` | 24px grid line pattern | Subtle technical feel |
| `.bg-dots` | 16px dot pattern | Subtle texture |
| `.bg-gradient-subtle` | Top-to-bottom gradient | Section transitions |
| `.border-gradient` | Gradient border effect | Featured cards |

These use `::before`/`::after` pseudo-elements with `pointer-events: none`.

**Warning:** Do NOT add `overflow: hidden` to containers that have `position: sticky` children — it breaks the sticky behavior entirely.

## Creating or Modifying Pages

When creating new pages or modifying existing ones, follow these rules exactly:

1. **Always use a layout.** Every page must import and wrap content in one of: `MarketingLayout`, `LandingLayout`, `LeadLayout`, `PageLayout`, `BlogLayout`. Never write standalone HTML.
2. **Always use existing components.** Check `src/components/ui/` before building custom elements. Use `Card`, `Button`, `Badge`, `Icon`, `Alert`, `Accordion`, etc.
3. **Never hardcode colors.** No hex values, no `rgb()`, no Tailwind default palette (`bg-blue-500`, `text-gray-700`). Only token classes: `bg-background`, `text-foreground`, `text-brand-500`, `border-border`, etc.
4. **Use section spacing tokens.** Sections use `py-[var(--space-section)]` or `py-[var(--space-section-lg)]`. Section headers get `mb-[var(--space-section-header)]`. Never use arbitrary padding like `py-[47px]`.
5. **Use `container` for max-width.** Content containers use `mx-auto max-w-6xl px-6` or the `container` class. Never set arbitrary max-widths.
6. **Follow the heading pattern.** Headings use `font-display tracking-tight text-foreground` with responsive sizing (`text-3xl md:text-4xl`). Never skip these classes.
7. **Balance all repeated content.** See Copy Balance Rules below.
8. **Use `invert-section` for dark sections.** Add `class="invert-section"` to the container. Never manually override colors inside inverted sections.

## Design Awareness

These are defaults for when the user gives general instructions like "make me a landing page." They produce good output without specific direction. **If the user asks for something specific that conflicts with these guidelines, do what the user asks** — these are awareness, not rules. The only hard constraints are the Golden Rules at the top of this file.

### Visual Hierarchy

Establish importance through four levers mapped to kit tokens:

| Lever | Stronger | Moderate | Subtler |
|-------|----------|----------|---------|
| Size | `text-5xl`+ / Hero `size="lg"+` | `text-xl` to `text-3xl` | `text-sm` to `text-base` |
| Weight | `font-bold` (700) + `font-display` | `font-semibold` (600) | `font-normal` (400) |
| Color | `text-foreground` | `text-foreground-secondary` | `text-foreground-muted` |
| Spacing | `--space-section-lg` / `--space-section-xl` | `--space-section` / `--space-section-md` | `gap-4` to `gap-6` |

When everything on a page uses the same size, weight, and color, nothing stands out. Vary at least two levers between heading levels. A section label (`Badge variant="brand" pill` or `text-sm uppercase text-brand-600`) above a heading creates a third tier without competing. When a section has one primary and one secondary action, use `Button variant="primary"` for the main one and `variant="secondary"` or `variant="outline"` for the other.

### Section Rhythm and Contrast

**Background variation** — Pages feel more dynamic when consecutive sections have different backgrounds. Options: `bg-background`, `bg-secondary`, or `invert-section bg-background` for a dark break. Stacking identical backgrounds can work for long-form prose but tends to blur section boundaries in grid-based layouts.

**Content density variation** — After a dense text section, a card grid or image gives the eye a break. After a visual-heavy section, a centered text block with breathing room resets attention.

**Spacing awareness:**
- `--space-section-lg` is the workhorse — good default for most sections
- `--space-section-xl` creates emphasis — suits heroes and final CTAs
- `--space-section-sm` or `--space-section-md` keeps utility sections tight (trust bars, testimonial bands)

**Page length awareness:**
- Short pages (1-2 sections): Every element visible without scrolling. High-density, high-intent.
- Medium pages (3-5 sections): Room to build a narrative. Alternate background treatments.
- Long pages (6-10 sections): Need visual landmarks — inverted sections, background changes, and spacing variation prevent scroll fatigue.

### Component Selection by Intent

Choose components by what you're trying to communicate:

**Organizing information:**
-> 2-4 equal items → Card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, Card `variant="default" padding="lg"`)
-> 5+ items with brief content → Benefits checklist (Icon `check-circle` + text, `space-y-3`)
-> Long answers/explanations → Accordion (`variant="default"` for clean, `variant="card"` for boxed)
-> Parallel categories → Tabs or VerticalTabs
-> Single key metric → StatCard pattern (label + large number + trend)

**Creating emphasis:**
-> Page-level call to action → CTA component (`variant="invert" size="lg"`)
-> Inline call to action → Button (`variant="primary" size="lg"`)
-> Status/availability → Badge (`variant="brand" pill pulse`)
-> Important notice → Alert (`variant="warning"` or `variant="info"`)

**Building trust:**
-> Customer faces → SocialProof component (overlapping avatars + count)
-> Testimonial quotes → Inverted section with avatar + name + quote
-> Feature proof → Card grid with Icon + heading + description

**Capturing leads:**
-> Desktop → LeadCaptureForm inline in page or sidebar
-> Mobile → MobileFormSheet (sticky bottom button → expanding sheet)
-> Low-commitment → Dialog modal triggered by Button (workshop pattern)
-> Long-form pages → Sticky sidebar with form Card (sales letter pattern)

**Decorative backgrounds:**
-> Hero sections → `.bg-grid-pattern` (mesh gradient + grain)
-> Accent behind content → `.bg-glow` / `.bg-glow-dark`
-> Subtle texture → `.bg-grid` or `.bg-dots`
-> Container needs `position: relative`. Avoid `overflow: hidden` if children need `position: sticky`.

### Layout Selection by Page Purpose

| Page purpose | Layout | Hero config | Why |
|-------------|--------|-------------|-----|
| Lead capture (minimal) | `LeadLayout` | split or custom grid | No nav distractions, focus on form |
| Lead capture (educational) | `LeadLayout` | `centered, size="md"` | Room for content below hero |
| Sales/conversion | `BaseLayout` + custom header | `split` or custom | Control over nav, long-form support |
| Content/authority | `PageLayout` | `centered, size="sm"` | Standard nav, content-first |
| Full-screen single purpose | `LandingLayout` | `centered, size="xl"` | Maximum hero impact |
| Blog post | `BlogLayout` | n/a (ArticleHero) | Optimized for reading |

Hero size as a general guide:
-> `xl`: Homepage or primary landing page where the hero IS the page
-> `lg`: Standard landing pages (good default)
-> `md`: Subpages, workshops, educational content
-> `sm`: About pages, utility pages, content-first pages

### How Copy Fits Into Layouts

Copy is a structural element — its length and density affect layout balance. These are typical ranges that work well with the kit's containers and responsive behavior. Adjust based on the user's content.

**Headlines — awareness of container fit:**
-> Hero h1 works best when it fits 1 line at desktop, 2 lines at mobile. Longer headlines are fine but may need smaller text size.
-> Section h2s that work as standalone scannable labels help users who scroll quickly.
-> Card h3s within a grid look most balanced when siblings are similar length.

**Body text — container and readability awareness:**

| Context | Typical container | Text style |
|---------|------------------|------------|
| Hero description | `max-w-xl` or `max-w-2xl` | `text-lg text-foreground-muted` |
| Section description | `max-w-2xl mx-auto` | `text-base text-foreground-muted` |
| Card description | Within Card padding | `text-sm text-foreground-muted` |
| Prose paragraphs | `max-w-3xl` or narrower | `text-base text-foreground-secondary` |
| CTA description | Below heading | `text-lg text-foreground-muted` |

**Readability awareness:**
-> Prose text wider than ~768px (`max-w-3xl`) becomes hard to read — long line lengths cause eye tracking fatigue.
-> Long blocks of text (3+ paragraphs) benefit from subheadings (`h3 font-display`), lists, or visual breaks.
-> Section headers (label + h2 + description) typically center-align with `text-center mb-[var(--space-section-header)]`.
-> Long-form content (articles, sales letters) typically left-aligns for easier reading.

### Responsive Awareness

**Common responsive patterns in this kit:**
-> Grids: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3` (stepping up gradually)
-> Text: Scale one step per breakpoint (e.g., `text-2xl md:text-3xl lg:text-4xl`)
-> Spacing: `px-6 md:px-10 lg:px-16` for horizontal padding
-> Layout direction: `flex-col lg:flex-row` for split layouts
-> Desktop forms → `hidden lg:block`. Mobile form sheet → `lg:hidden`.
-> Decorative elements → `hidden md:block` if they crowd mobile viewport.

**Touch-friendliness:**
-> Interactive elements should be comfortably tappable — `h-10` (40px) minimum is standard.
-> Button `size="lg"` (`h-12`) for primary CTAs gives generous touch area.
-> `gap-3` or `gap-4` between list items prevents accidental taps.

### Technical Constraints (things that actually break)

| Constraint | Why | Mitigation |
|-----------|-----|------------|
| `overflow: hidden` on container with sticky children | Kills `position: sticky` entirely | Use `overflow: visible` or restructure |
| Hardcoded colors (`#fff`, `bg-white`, `text-gray-500`) | Breaks dark mode, themes, inverted sections | Token classes only: `bg-background`, `text-foreground-muted` |
| Custom `<style>` for colors/spacing/typography | Fights Tailwind, breaks token consistency | Tailwind classes only. `<style>` for CSS animations only. |
| Skipping section spacing tokens | Inconsistent vertical rhythm across page | `py-[var(--space-section-*)]` on `<section>` elements |
| Creating new components for things that exist | Diverges from design system, adds maintenance burden | Check 33 components in `src/components/ui/` first |
| Prose text in containers wider than `max-w-3xl` | Line lengths too long for comfortable reading | Constrain reading content to `max-w-3xl` or narrower |

## Copy Balance Rules

Professional design requires visual symmetry. When writing content for repeated components:

-> **Card grids**: All card descriptions within ±2 words of each other. All card titles within ±1 word.
-> **Bullet/checklist items**: All items within ±2 words of each other.
-> **Testimonial quotes**: All quotes within ±10 words of each other.
-> **Feature descriptions**: All descriptions within ±2 words of each other.

Before finishing a page, count words in every repeated group. If any item is noticeably shorter or longer than its siblings, rewrite it to match. A card grid where one card has 42 words and another has 20 is unacceptable.

## Brand-Setup Check

Before creating pages for a user, check `src/config/site.config.ts`. If `name` still says "Damn Good Funnels" and the user is building for a different brand, prompt them to run `/brand-setup` first. Creating pages before branding means the AI instructions, site metadata, and token colors won't match the user's brand.

## Demo Content … Replace Before Going Live

The kit ships with example content. Replace these before deploying:

| What | Where | Action |
|------|-------|--------|
| About page | `src/pages/about.astro` | Replace with your own story or delete |
| Component gallery | `src/pages/components.astro` | Dev reference. Remove from nav for production |
| Homepage social proof | `src/pages/index.astro` (lines 211-285) | Replace LinkNinja/SFC examples or remove |
| Lead magnet social proof | `src/pages/lead-magnet.astro` (lines 117-119) | Replace Steve Butler / LinkNinja |
| Logo SVGs | `src/assets/branding/` | Replace with your own logo files |
| Site config | `src/config/site.config.ts` | Update company name, URL, author |
| Navigation | `src/config/nav.config.ts` | Update links |
| Product mockup | `public/images/product-mockup.webp` | Replace with your actual product |
| Placeholder images | `public/images/steve-b.jpg`, `linkninja-*`, `sfc-*` | Replace or delete |

Fastest way: run `/brand-setup` in Claude Code.

## Demo Mode (Theme Customizer)

The theme customizer widget is gated behind `PUBLIC_DEMO_MODE=true`. It does NOT render unless this env var is set.

-> **To enable** (demo/preview site): add `PUBLIC_DEMO_MODE=true` to `.env` or Cloudflare env vars
-> **To disable** (production): don't set the env var (default)
-> The customizer lives in `src/components/_demo/` … safe to delete if you never need it

## Demo Customizer Override

The kit ships with a theme customizer (`src/components/_demo/`) that saves settings to localStorage and re-applies them on every page load via `DemoRestore.astro`. **This overrides your CSS token changes.**

**localStorage keys** (all prefixed `sfk-`): `sfk-hue`, `sfk-dark`, `sfk-radius`, `sfk-heading-font`, `sfk-body-font`, `sfk-heading-weight`, `sfk-heading-uppercase`, `sfk-btn-weight`, `sfk-btn-uppercase`

**If you change `--brand-hue` or fonts and see no effect**, the demo customizer is the cause:
1. Clear localStorage: open browser console → `Object.keys(localStorage).filter(k => k.startsWith('sfk-')).forEach(k => localStorage.removeItem(k))`
2. Or use incognito mode
3. Or run `/brand-setup` Step 6 to remove the customizer permanently

**The demo customizer is imported in two layouts:**
- `src/layouts/BaseLayout.astro` — `ThemeCustomizer` + `DemoRestore` imports
- `src/layouts/LeadLayout.astro` — `ThemeCustomizer` + `DemoRestore` imports

Both must be cleaned when removing. **Keep the dark mode script** (the first `<script is:inline>` block that checks `prefers-color-scheme`) — only remove the demo-related imports and the DemoRestore component.
