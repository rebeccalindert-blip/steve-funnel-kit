<!-- This is a Claude Code custom command. Users invoke it by typing /new-landing-page in the Claude Code prompt. Claude reads this file and follows the instructions below as a guided workflow. -->

Create a new landing page using the design system. Follow every step below exactly.

$ARGUMENTS

## Step 1: Gather Requirements

Ask the user for:
1. **Page name** … will become the URL slug (e.g., "webinar" → `/webinar`)
2. **Page type** … which template is closest to what they want:
   -> `squeeze` … minimal lead capture (email + name only)
   -> `sales-letter` … long-form editorial with sticky sidebar CTA
   -> `vsl` … video embed + lead capture form
   -> `pas` … Problem-Agitate-Solution sales page
   -> `abt-form` … lead magnet with inline form
   -> `abt-page` … lead magnet with CTA button (no inline form)
   -> `workshop` … video embed + sticky signup form + social proof
   -> `form` … multi-step form (lead capture → qualification questions → GHL notes)
   -> `payment` … branded checkout page with CTA to GHL payment link
   -> `success` … thank-you / confirmation page
   -> `custom` … start from scratch with MarketingLayout
3. **Headline** … the main H1 text
4. **Subheadline** … supporting text under the headline
5. **CTA label** … button text (e.g., "Get Instant Access", "Reserve My Spot")
6. **Form tags** … GHL tags for this page's leads (e.g., `['webinar_signup']`)

If the user provided these details in $ARGUMENTS, skip asking and proceed.

## Step 2: Choose the Right Layout

Based on the page type, select the layout:

| Page Type | Layout | Why |
|-----------|--------|-----|
| squeeze | `LeadLayout` | Minimal, no header/footer distractions |
| sales-letter | `MarketingLayout` | Full site chrome for credibility |
| vsl | `LeadLayout` | Focus on video + form |
| pas | `MarketingLayout` | Long-form needs navigation |
| abt-form | `MarketingLayout` | Lead magnet with full site |
| abt-page | `MarketingLayout` | Lead magnet with full site |
| workshop | `LandingLayout` | Video + sticky form needs landing chrome |
| form | `LeadLayout` | Multi-step form, minimal distractions |
| lead-magnet | `LeadLayout` | Focus on the offer |
| payment | `MarketingLayout` | Checkout needs trust signals |
| success | `MarketingLayout` | Confirmation with navigation back |
| custom | `MarketingLayout` | Default safe choice |

## Step 3: Read the Closest Template

Read the existing page that matches the selected page type from `src/pages/`. Use it as the structural reference … copy its layout, component imports, and section pattern.

## Step 4: Create the Page File

Create `src/pages/{page-name}.astro` with:

### Required Imports
```astro
---
import {LayoutName} from '@/layouts/{LayoutName}.astro';
import SEO from '@/components/seo/SEO.astro';
// Add component imports based on sections needed
---
```

### Rules for the Page Content

1. **Colors** … only use token classes: `bg-background`, `text-foreground`, `text-brand-500`, `border-border`, etc. NEVER use `bg-white`, `text-gray-*`, or hex values.

2. **Tailwind palette** … NEVER use Tailwind's built-in color names (`slate-*`, `zinc-*`, `stone-*`, `emerald-*`, `sky-*`, `blue-*`, `red-*`, etc.). Only use our token classes (`bg-background`, `text-foreground`, `text-brand-500`). If it's a color name from tailwindcss.com/docs/colors … it's wrong.

3. **Typography** … use `font-display` + `tracking-tight` on all headings. Use standard Tailwind sizes (`text-xl`, `text-3xl`, etc.). NEVER use raw pixel sizes.

4. **Spacing** … use `py-[var(--space-section)]` or `py-[var(--space-section-lg)]` for sections. Use `mb-[var(--space-section-header)]` between section titles and content. Use `pt-[var(--space-page-top)]` at the top of the page.

5. **Responsive** … write mobile-first. Add `md:` and `lg:` breakpoint overrides. Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

6. **Components** … import from `@/components/ui/` categories:
   -> Buttons: `@/components/ui/form/Button/Button.astro`
   -> Cards: `@/components/ui/data-display/Card/Card.astro`
   -> Badges: `@/components/ui/data-display/Badge/Badge.astro` (6 variants: default, brand, success, warning, error, info. Props: `pill` for rounded, `pulse` for animated dot. Use `variant="brand" pill` for section labels above headings.)
   -> Icons: `@/components/ui/primitives/Icon/Icon.astro`
   -> Alerts: `@/components/ui/feedback/Alert/Alert.astro`
   -> CTA: `@/components/ui/marketing/CTA/CTA.astro`

7. **Lead Forms** … use `LeadCaptureForm` with `client:load`:
   ```astro
   <LeadCaptureForm client:load formTags={['your_tag']} submitLabel="CTA Text" />
   ```

8. **Mobile Form** … for pages with sidebar forms, add `MobileFormSheet` for mobile:
   ```astro
   <div class="lg:hidden">
     <MobileFormSheet client:load formTags={['tag']} submitLabel="CTA Text" />
   </div>
   ```

9. **Inverted Sections** … for dark sections on light pages, use `class="invert-section bg-background"`. Never manually override foreground colors inside.

10. **SEO** … include unique `title` and `description` via the layout's props or the SEO component.

11. **Section Pattern** … follow this structure for every section:
    ```astro
    <section class="py-[var(--space-section-lg)]">
      <div class="mx-auto max-w-6xl px-6">
        <!-- section content -->
      </div>
    </section>
    ```

12. **No scoped styles** … don't use `<style>` blocks for colors, spacing, typography, or layout. Use Tailwind classes. Scoped styles are only for complex CSS animations or third-party widget overrides.

## Step 5: Update Form Tags (if needed)

If the user specified custom form tags, check `src/pages/api/lead.ts` and add them to the `ALLOWED_TAGS` array if they're not already present.

**IMPORTANT:** Tags not in the `ALLOWED_TAGS` array will be silently dropped. Always verify new tags are in the allowlist before testing the form.

## Step 6: Add to Navigation (optional)

Ask the user if they want this page in the site navigation. If yes, update `src/config/nav.config.ts`.

## Step 7: Summary

Print:
-> File created: `src/pages/{page-name}.astro`
-> URL: `http://localhost:4321/{page-name}`
-> Any files modified (lead.ts tags, nav config)
-> Remind user to test manually at the URL above
