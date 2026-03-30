<!-- This is a Claude Code custom command. Users invoke it by typing /brand-setup in the Claude Code prompt. Claude reads this file and follows the instructions below as a guided workflow. -->

Walk the user through branding their Steve's Funnel Kit site. Follow every step below in order.

$ARGUMENTS

## Step 1: Company Info

Ask the user for:
1. **Company name** … appears in headers, footers, legal text
2. **Tagline / description** … shows in Google search results
3. **Website URL** … their live domain (e.g., `https://example.com`)
4. **Author name** … for meta tags
5. **Contact email** … for footer and legal pages

If the user provided these in $ARGUMENTS, skip asking and proceed.

Then update `src/config/site.config.ts`:
-> Set `name` to the company name
-> Set `description` to the tagline
-> Set `url` to the live domain
-> Set `author` to the author name
-> Set `email` to the contact email

## Step 2: Brand Color

Show the user the available hue options:

| Color | Hue |
|-------|-----|
| Red | `25` |
| Orange | `55` |
| Amber/Gold | `75` |
| Yellow | `95` |
| Lime | `130` |
| Green/Emerald | `162` (default) |
| Teal | `180` |
| Cyan | `200` |
| Blue | `240` |
| Indigo | `260` |
| Violet/Purple | `295` |
| Pink | `340` |

Ask which color they want. Then update `src/styles/tokens/primitives.css`:

Change `--brand-hue: 162;` to `--brand-hue: <new-value>;` on line 33. That's it … one number, one line. All 10 `--brand-*` variables reference `var(--brand-hue)` and pick up the change automatically.

**Important:** Do NOT touch the individual `--brand-50` through `--brand-900` lines. They use `var(--brand-hue)` … changing the hue variable is all you need.

## Step 3: Logo Files

Tell the user to place their logo files in `src/assets/branding/`:

| File | Purpose |
|------|---------|
| `logo-full.svg` | Full logo for light backgrounds |
| `logo-full-dark.svg` | Full logo for dark backgrounds |
| `logomark.svg` | Icon/symbol for light backgrounds |
| `logomark-dark.svg` | Icon/symbol for dark backgrounds |

Also: replace `public/favicon.svg` with their browser tab icon.

If they only have one logo, use the same file for both light and dark variants. No drama.

Do NOT create or generate logo files … the user must provide their own SVGs.

## Step 4: Font (Optional)

Show the pre-installed font options:

| Font | Style | Import path |
|------|-------|------------|
| `Plus Jakarta Sans Variable` | Geometric, premium (default) | `@fontsource-variable/plus-jakarta-sans` |
| `Inter Variable` | Clean, neutral | `@fontsource-variable/inter` |
| `Manrope Variable` | Geometric, modern | `@fontsource-variable/manrope` |
| `Outfit Variable` | Friendly, rounded | `@fontsource-variable/outfit` |

Ask if they want to change from the default. If yes, or if they want a font not in the list:

1. **Install the font:** `npm install @fontsource-variable/<font-name>`
2. **Update the `@import`** in `src/styles/global.css` (lines 13-14) to the new font package
3. **Update `--theme-font-sans`** in `src/styles/themes/default.css` (lines 83-86) to the new font name with full fallback stack:
   `--theme-font-sans: 'New Font Variable', 'New Font', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;`
4. **Verify `@theme` registration** in `src/styles/global.css` (line 69): `--font-sans: var(--theme-font-sans);` must exist (it does by default)
5. If they want a different display font for headings, also update `--theme-font-display` in `default.css`

All four steps are required — skip any one and the Tailwind `font-sans` class won't pick up the new font.

The monospace font (`JetBrains Mono Variable`) is for code and prices … leave it unless specifically asked.

## Step 5: Theme (Optional)

Two themes are included:
-> `default.css` … clean, brand-neutral (active by default)
-> `midnight.css` … deep purple with violet accents

Ask if they want to switch. If yes, update `src/styles/tokens/colors.css` line 9:
```css
/* @import '../themes/default.css'; */
@import '../themes/midnight.css';
```

## Step 6: Remove Demo Components

Remove demo components and their imports. **Do imports first, then delete the directory.**

**Important:** The demo customizer saves settings to localStorage (`sfk-*` keys) that override CSS variables on every page load. If you changed brand colors or fonts and saw no effect, this is why.

1. In `src/layouts/BaseLayout.astro`:
   -> Remove the `import ThemeCustomizer from '@/components/_demo/ThemeCustomizer.tsx';` line
   -> Remove the `import DemoRestore from '@/components/_demo/DemoRestore.astro';` line
   -> Remove the `<DemoRestore />` component (in `<head>`)
   -> Remove the `<ThemeCustomizer client:only="react" />` component (in `<body>`)
   -> In the first `<script is:inline>` block, remove the `sfk-dark` localStorage check and simplify to:
   ```javascript
   (function () {
     var mq = window.matchMedia('(prefers-color-scheme: dark)');
     function apply(dark) { document.documentElement.classList.toggle('dark', dark); }
     apply(mq.matches);
     mq.addEventListener('change', function (e) { apply(e.matches); });
     document.addEventListener('astro:after-swap', function () { apply(mq.matches); });
   })();
   ```

2. In `src/layouts/LeadLayout.astro`:
   -> Remove the `import ThemeCustomizer` line
   -> Remove the `import DemoRestore` line
   -> Remove the `<DemoRestore />` component
   -> Remove the `<ThemeCustomizer client:only="react" />` component
   -> Simplify the dark mode script the same way as BaseLayout

3. Delete the entire `src/components/_demo/` directory

4. Tell the user to clear leftover localStorage in their browser:
   -> Open browser console → `Object.keys(localStorage).filter(k => k.startsWith('sfk-')).forEach(k => localStorage.removeItem(k))`

**Keep the dark mode script** (the first `<script is:inline>` in each layout). It detects system dark mode preference. Only remove the `sfk-dark` check from it.

## Step 7: Summary

Print what was changed:
-> Site config: company name, URL, etc.
-> Brand color: old hue → new hue (color name)
-> Font: old → new (if changed)
-> Theme: old → new (if changed)
-> Logo files: remind user to place SVGs in `src/assets/branding/`

Print the test URL:
-> App: http://localhost:4321

Tell the user to check:
-> Header shows their company name and logo
-> Brand color appears on buttons, links, and accents
-> Dark mode toggle works (top right) and colors adapt
-> Footer has correct company info
