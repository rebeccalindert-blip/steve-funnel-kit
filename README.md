# Steve's Funnel Kit

Simple landing pages that actually convert. Built on a proper design system so AI can't produce slop.

---

## WHAT IS THIS

A starter kit for building landing pages with AI. You clone the repo, tell your AI coding tool what you want, and it builds pages that look like you hired a designer. Nine templates, 33 UI components, GoHighLevel CRM integration, free hosting on Cloudflare.

The whole thing is designed so non-technical people can ship production-quality landing pages in under an hour.

---

## WHAT YOU GET

→ **9 page templates** … Sales letter, squeeze, VSL, PAS, workshop, lead magnet (2 variants), multi-step form, success page
→ **33 UI components** … Buttons, cards, forms, modals, accordions, badges, the works
→ **GoHighLevel integration** … Lead capture + qualification data goes straight to your CRM
→ **Free hosting** … Cloudflare Pages. Free SSL. Free CDN. $0/month
→ **Design token system** … One number change updates your brand color everywhere
→ **Security hardened** … CORS, rate limiting, encrypted secrets, input sanitization
→ **Mobile-first** … Every page responsive. Inputs are 16px so iOS doesn't zoom
→ **Dark mode** … Real dark mode that actually works
→ **Analytics ready** … Drop in your GA4 or GTM ID

---

## GET STARTED — ZERO TO LIVE IN AN HOUR

### Step 1: Get Claude Code

Go to [claude.ai/code](https://claude.ai/code) and install it. Claude Code is an AI coding tool that runs in your terminal. It reads the design system files in this repo and knows exactly how to build pages correctly.

Other AI tools work too ([Cursor](https://cursor.com), [Windsurf](https://windsurf.com), [Codex](https://openai.com/index/introducing-codex/)) but Claude Code is currently the best at this.

### Step 2: Clone this repo

Open your terminal and run:

```bash
git clone https://github.com/stvbutlr/steve-funnel-kit.git
cd steve-funnel-kit
npm install
npm run dev
```

Open `http://localhost:4321` in your browser. You'll see the template gallery with live previews and a theme customizer to play with colors, fonts, and radius.

### Step 3: Brand it

The fastest way — open Claude Code in the project folder and type:

```
/brand-setup
```

It walks you through setting your company name, colors, logo, and fonts. Five minutes.

Or do it manually:

→ **Company name:** Edit `src/config/site.config.ts`
→ **Brand color:** Change `--brand-hue` in `src/styles/tokens/primitives.css` (e.g. `240` for blue, `25` for red)
→ **Logos:** Drop your SVGs into `src/assets/branding/`
→ **Font:** Update the import in `src/styles/global.css` and font name in `src/styles/themes/default.css`

### Step 4: Pick a template and customise

Every file in `src/pages/` becomes a URL. `squeeze.astro` → `yourdomain.com/squeeze`.

→ Browse the templates at `http://localhost:4321`
→ Find the closest one to what you need
→ Copy the file, rename it, change the content
→ Or just tell Claude Code: *"Create a new landing page for my coaching program"*

Type `/new-landing-page` in Claude Code for a guided walkthrough.

### Step 5: Connect GoHighLevel

Every form submits to GHL. Here's how to wire it up:

**5a. Get your credentials:**
1. Log into [GoHighLevel](https://app.gohighlevel.com)
2. **Settings > Business Profile** → copy your **Location ID**
3. **Settings > API Keys** → create a key → copy the **API Key**

**5b. Create your .env file:**

Copy `.env.example` to `.env` and fill in:

```env
GHL_API_KEY=your-api-key-here
GHL_LOCATION_ID=your-location-id-here
SITE_URL=https://yourdomain.com
```

> This file is gitignored. It never gets committed. Your keys stay local.

**5c. Update allowed domains:**

Open these files and add your domain to `ALLOWED_ORIGINS`:

→ `src/pages/api/lead.ts`
→ `src/pages/api/contact.ts`
→ `src/pages/api/newsletter.ts`
→ `src/pages/api/qualify.ts`

```typescript
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];
```

**5d. Test it:**

Submit a test lead on `http://localhost:4321/squeeze`. Check GoHighLevel — the contact should appear with your tags.

### Step 6: Add analytics (optional)

Add to your `.env`:

```env
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Or for GTM:

```env
PUBLIC_GTM_ID=GTM-XXXXXXX
```

Done. The analytics component picks it up automatically.

### Step 7: Deploy to Cloudflare (free)

Type `/deploy-setup` in Claude Code for the guided version. Or manually:

**7a.** Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up (free)

**7b.** **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select this repo

**7c.** Build settings:
→ Build command: `npm run build`
→ Output directory: `dist`

**7d.** Add environment variables in **Settings > Environment Variables**:

| Variable | Value | Encrypt? |
|----------|-------|----------|
| `GHL_API_KEY` | Your API key | **Yes** |
| `GHL_LOCATION_ID` | Your location ID | **Yes** |
| `SITE_URL` | `https://yourdomain.com` | No |
| `PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` (optional) | No |

> Encrypted = one-way. Nobody can read it back. That's the point.

**7e.** Add your custom domain. SSL is automatic.

**7f.** Push to deploy:

```bash
git push origin main
```

Every push deploys automatically. Your site is live. $0/month.

---

## TEMPLATES

| Template | URL | What it does |
|----------|-----|-------------|
| **Sales Letter** | `/sales-letter` | Long-form editorial with sticky sidebar CTA |
| **Squeeze** | `/squeeze` | Minimal single-screen lead capture |
| **VSL** | `/vsl` | Video embed + lead capture |
| **PAS** | `/pas` | Problem-Agitate-Solution sales page |
| **Workshop** | `/workshop` | Video embed + editorial + floating CTA + signup form |
| **Lead Magnet (Form)** | `/abt-form` | Lead magnet with inline form |
| **Lead Magnet (CTA)** | `/abt-page` | Lead magnet with CTA button |
| **Multi-Step Form** | `/form` | Step 1: lead capture → Step 2: qualification → GHL notes |
| **Success** | `/success` | Thank-you page (supports resource delivery via URL params) |

---

## MULTI-STEP FORMS

The kit includes a two-step form flow:

→ **Step 1** (`/form`) — Captures name, email, phone. Creates contact in GHL. Redirects to step 2 with email in URL.
→ **Step 2** (`/form/step-2`) — Asks qualification questions (biggest challenge, revenue range, how they found you). Saves responses as a **note on the GHL contact record**. No custom fields setup required.

### How qualification data lands in GHL

All step 2 responses are formatted into a single contact note:

```
--- Qualification (2026-03-26) ---
Biggest Challenge: Not enough leads
Revenue Range: $20k–$100k/mo
How Found: LinkedIn
```

To customise the questions, edit `src/components/forms/QualifyForm.tsx`. The default questions are placeholders — change them to whatever makes sense for your offer.

### Resource delivery on success

The `LeadCaptureForm` component supports showing a resource link after submission:

```astro
<LeadCaptureForm
  client:load
  formTags={['lead_magnet']}
  submitLabel="Get the Playbook"
  successLinkUrl="https://example.com/my-guide.pdf"
  successLinkLabel="Read the Playbook"
/>
```

Form submits → inline success state appears with a button linking directly to the resource. No redirect. No "check your inbox."

---

## AI SLASH COMMANDS

| Command | What it does |
|---------|-------------|
| `/brand-setup` | Colors, fonts, logos, site config — guided setup |
| `/new-landing-page` | Create a new page from any template |
| `/deploy-setup` | Connect GHL + deploy to Cloudflare |

### Example prompts

→ *"Create a new squeeze page for my free guide"*
→ *"Add a testimonial section to the PAS page"*
→ *"Make a workshop page for my webinar next Thursday"*
→ *"Create a multi-step form that asks about their business size and goals"*

---

## SECURITY

All hardened out of the box:

→ **CORS** … only your whitelisted domain(s) can submit forms
→ **Rate limiting** … 10/min for leads, 5/min for contact/newsletter/qualify
→ **Encrypted secrets** … GHL keys stored encrypted on Cloudflare, never in frontend code
→ **Origin validation** … blocks requests without valid Origin header
→ **Input sanitization** … HTML stripped, length limits enforced
→ **Tag allowlisting** … only pre-approved tags reach GHL
→ **Honeypot fields** … silent bot detection
→ **Security headers** … CSP, HSTS, X-Frame-Options via `public/_headers`

---

## TECH STACK

| Tool | Version | Purpose |
|------|---------|---------|
| [Astro](https://astro.build) | 5.x | Static site generator, islands architecture |
| [React](https://react.dev) | 19 | Interactive components (forms) |
| [Tailwind CSS](https://tailwindcss.com) | 4.0 | Utility-first styling with design tokens |
| [Cloudflare Pages](https://pages.cloudflare.com) | — | Free edge hosting with Workers for APIs |
| [GoHighLevel](https://www.gohighlevel.com) | — | CRM for lead capture and automation |
| [TypeScript](https://typescriptlang.org) | 5.7 | Type safety |

---

## COMMANDS

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## PROJECT STRUCTURE

```
src/
├── pages/                  # Each .astro file = a URL
│   ├── api/                # Server endpoints (lead, contact, newsletter, qualify)
│   ├── form/               # Multi-step form (step 1 + step 2)
│   └── blog/               # Blog listing + posts
├── components/
│   ├── ui/                 # Design system (buttons, cards, forms, etc.)
│   ├── forms/              # LeadCaptureForm, QualifyForm, MobileFormSheet
│   ├── layout/             # Header, Footer
│   ├── hero/               # Hero section component
│   └── seo/                # SEO metadata
├── layouts/                # Page wrappers (Marketing, Landing, Lead, Blog)
├── styles/
│   ├── tokens/             # Design tokens (colors, typography, spacing)
│   └── themes/             # Theme files (default, midnight)
├── config/                 # Site config, navigation
├── lib/                    # GHL client, validation, utilities
└── assets/branding/        # Your logo SVGs
```

---
