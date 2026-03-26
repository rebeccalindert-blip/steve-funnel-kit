import { useState, useCallback, useEffect } from 'react';

const BRAND_HUES: Record<string, number> = {
  Red: 25, Orange: 55, Amber: 75, Yellow: 95, Lime: 130,
  Emerald: 162, Teal: 180, Cyan: 200, Blue: 240,
  Indigo: 260, Violet: 295, Pink: 340,
};

// Google Fonts — curated list
const GOOGLE_FONTS: Record<string, string> = {
  'Plus Jakarta Sans': '',
  'Inter': 'Inter:wght@400;500;600;700',
  'DM Sans': 'DM+Sans:wght@400;500;600;700',
  'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
  'Sora': 'Sora:wght@400;500;600;700',
  'Outfit': 'Outfit:wght@400;500;600;700',
  'Manrope': 'Manrope:wght@400;500;600;700',
  'Poppins': 'Poppins:wght@400;500;600;700',
  'Geist': 'Geist:wght@400;500;600;700',
  'Nunito Sans': 'Nunito+Sans:wght@400;600;700',
  'Lato': 'Lato:wght@400;700',
  'Raleway': 'Raleway:wght@400;500;600;700',
  'Work Sans': 'Work+Sans:wght@400;500;600;700',
  'Bricolage Grotesque': 'Bricolage+Grotesque:wght@400;600;700;800',
  'DM Serif Display': 'DM+Serif+Display',
  'Playfair Display': 'Playfair+Display:wght@400;700',
  'Fraunces': 'Fraunces:wght@400;600;700',
  'Libre Baskerville': 'Libre+Baskerville:wght@400;700',
};

const SERIF_FONTS = new Set(['DM Serif Display', 'Playfair Display', 'Fraunces', 'Libre Baskerville']);

function fontStack(name: string): string {
  return SERIF_FONTS.has(name)
    ? `'${name}', ui-serif, Georgia, serif`
    : `'${name}', ui-sans-serif, system-ui, sans-serif`;
}

// Radius presets — keys match Tailwind's --radius-* variables
const RADIUS_SUFFIXES = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
// sm=inputs/badges, md=buttons, lg=cards, xl=modals, 2xl=sections, full=avatars/pills
const RADIUS_PRESETS: Record<string, string[]> = {
  '0':     ['0',        '0',        '0',        '0',        '0',        '0'],
  '4px':   ['0.125rem', '0.25rem',  '0.25rem',  '0.375rem', '0.5rem',   '0.5rem'],
  '8px':   ['0.25rem',  '0.375rem', '0.5rem',   '0.75rem',  '1rem',     '1rem'],
  '12px':  ['0.375rem', '0.5rem',   '0.75rem',  '1rem',     '1.5rem',   '9999px'],
  '16px':  ['0.5rem',   '0.625rem', '1rem',     '1.25rem',  '1.75rem',  '9999px'],
  '24px':  ['0.75rem',  '1rem',     '1.5rem',   '2rem',     '2.5rem',   '9999px'],
};

function hueToHex(hue: number): string {
  const el = document.createElement('div');
  el.style.color = `oklch(64% 0.17 ${hue})`;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);
  const m = computed.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return '#3ECF8E';
  return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return Math.round(h * 360);
}

const loadedFonts = new Set<string>();
function loadGoogleFont(name: string) {
  const spec = GOOGLE_FONTS[name];
  if (!spec || loadedFonts.has(name)) return;
  loadedFonts.add(name);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  document.head.appendChild(link);
}

export default function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(162);
  const [hexColor, setHexColor] = useState('#3ECF8E');
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [radiusKey, setRadiusKey] = useState('12px');
  const [headingFont, setHeadingFont] = useState('Plus Jakarta Sans');
  const [bodyFont, setBodyFont] = useState('Plus Jakarta Sans');
  const [headingWeight, setHeadingWeight] = useState('700');
  const [headingUppercase, setHeadingUppercase] = useState(false);
  const [btnWeight, setBtnWeight] = useState('500');
  const [btnUppercase, setBtnUppercase] = useState(false);

  // Sync hex display when hue changes
  useEffect(() => {
    if (typeof document !== 'undefined') setHexColor(hueToHex(hue));
  }, [hue]);

  // Restore saved settings on mount (UI state only — CSS is restored by inline script in BaseLayout)
  useEffect(() => {
    const savedHue = localStorage.getItem('sfk-hue');
    if (savedHue) setHue(Number(savedHue));
    const savedDark = localStorage.getItem('sfk-dark');
    if (savedDark) setDark(savedDark === '1');
    const savedRadius = localStorage.getItem('sfk-radius');
    if (savedRadius) setRadiusKey(savedRadius);
    const savedHeading = localStorage.getItem('sfk-heading-font');
    if (savedHeading) setHeadingFont(savedHeading);
    const savedBody = localStorage.getItem('sfk-body-font');
    if (savedBody) setBodyFont(savedBody);
    const savedHW = localStorage.getItem('sfk-heading-weight');
    if (savedHW) setHeadingWeight(savedHW);
    const savedHU = localStorage.getItem('sfk-heading-uppercase');
    if (savedHU === '1') setHeadingUppercase(true);
    const savedBW = localStorage.getItem('sfk-btn-weight');
    if (savedBW) setBtnWeight(savedBW);
    const savedBU = localStorage.getItem('sfk-btn-uppercase');
    if (savedBU === '1') setBtnUppercase(true);
  }, []);

  const applyHue = useCallback((newHue: number) => {
    setHue(newHue);
    const root = document.documentElement;
    root.style.setProperty('--brand-hue', String(newHue));
    const rotation = newHue - 162;
    if (rotation === 0) {
      root.style.removeProperty('--sfk-logo-filter');
    } else {
      root.style.setProperty('--sfk-logo-filter', `hue-rotate(${rotation}deg)`);
    }
    localStorage.setItem('sfk-hue', String(newHue));
  }, []);

  const handleHexInput = useCallback((hex: string) => {
    setHexColor(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) applyHue(hexToHue(hex));
  }, [applyHue]);

  const toggleDark = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('sfk-dark', next ? '1' : '0');
  }, [dark]);

  const applyRadius = useCallback((key: string) => {
    setRadiusKey(key);
    const values = RADIUS_PRESETS[key];
    if (!values) return;
    const root = document.documentElement;
    RADIUS_SUFFIXES.forEach((suffix, i) => {
      // Set both layers to guarantee Tailwind picks it up
      root.style.setProperty(`--theme-radius-${suffix}`, values[i]);
      root.style.setProperty(`--radius-${suffix}`, values[i]);
    });
    localStorage.setItem('sfk-radius', key);
  }, []);

  const applyHeadingFont = useCallback((name: string) => {
    setHeadingFont(name);
    loadGoogleFont(name);
    const stack = fontStack(name);
    const root = document.documentElement;
    root.style.setProperty('--font-display', stack);
    root.style.setProperty('--theme-font-display', stack);
    localStorage.setItem('sfk-heading-font', name);
  }, []);

  const applyBodyFont = useCallback((name: string) => {
    setBodyFont(name);
    loadGoogleFont(name);
    const stack = fontStack(name);
    const root = document.documentElement;
    root.style.setProperty('--font-sans', stack);
    root.style.setProperty('--theme-font-sans', stack);
    root.style.fontFamily = stack;
    localStorage.setItem('sfk-body-font', name);
  }, []);

  const applyHeadingWeight = useCallback((w: string) => {
    setHeadingWeight(w);
    document.documentElement.style.setProperty('--sfk-heading-weight', w);
    localStorage.setItem('sfk-heading-weight', w);
  }, []);

  const toggleHeadingUppercase = useCallback(() => {
    const next = !headingUppercase;
    setHeadingUppercase(next);
    document.documentElement.style.setProperty('--sfk-heading-transform', next ? 'uppercase' : 'none');
    localStorage.setItem('sfk-heading-uppercase', next ? '1' : '0');
  }, [headingUppercase]);

  const applyBtnWeight = useCallback((w: string) => {
    setBtnWeight(w);
    document.documentElement.style.setProperty('--sfk-btn-weight', w);
    localStorage.setItem('sfk-btn-weight', w);
  }, []);

  const toggleBtnUppercase = useCallback(() => {
    const next = !btnUppercase;
    setBtnUppercase(next);
    document.documentElement.style.setProperty('--sfk-btn-transform', next ? 'uppercase' : 'none');
    localStorage.setItem('sfk-btn-uppercase', next ? '1' : '0');
  }, [btnUppercase]);

  const reset = useCallback(() => {
    const root = document.documentElement;
    root.style.removeProperty('--brand-hue');
    RADIUS_SUFFIXES.forEach((suffix) => {
      root.style.removeProperty(`--theme-radius-${suffix}`);
      root.style.removeProperty(`--radius-${suffix}`);
    });
    root.style.removeProperty('--font-sans');
    root.style.removeProperty('--font-display');
    root.style.removeProperty('--theme-font-sans');
    root.style.removeProperty('--theme-font-display');
    root.style.fontFamily = '';
    root.classList.remove('dark');
    root.style.removeProperty('--sfk-logo-filter');
    root.style.removeProperty('--sfk-heading-weight');
    root.style.removeProperty('--sfk-heading-transform');
    root.style.removeProperty('--sfk-btn-weight');
    root.style.removeProperty('--sfk-btn-transform');
    setHue(162); setHexColor('#3ECF8E'); setDark(false);
    setRadiusKey('12px');
    setHeadingFont('Plus Jakarta Sans');
    setBodyFont('Plus Jakarta Sans');
    setHeadingWeight('700'); setHeadingUppercase(false);
    setBtnWeight('500'); setBtnUppercase(false);
    ['sfk-hue', 'sfk-dark', 'sfk-radius', 'sfk-heading-font', 'sfk-body-font', 'sfk-heading-weight', 'sfk-heading-uppercase', 'sfk-btn-weight', 'sfk-btn-uppercase'].forEach(k => localStorage.removeItem(k));
  }, []);

  const labelCls = "text-xs font-semibold text-[var(--foreground)] block mb-1.5 uppercase tracking-wider";
  const selectCls = "w-full h-8 rounded-md border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] px-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-colors flex items-center justify-center"
        aria-label="Open theme customizer"
        title="Customise theme"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-bold text-[var(--foreground)]">Customise Theme</span>
        <button onClick={() => setOpen(false)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-1" aria-label="Close">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--foreground)]">Dark Mode</span>
          <button
            onClick={toggleDark}
            className={`relative h-6 w-11 rounded-full transition-colors ${dark ? 'bg-[var(--brand-500)]' : 'bg-[var(--border)]'}`}
            role="switch" aria-checked={dark}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* Brand Color */}
        <div>
          <label className={labelCls}>Brand Color</label>
          <div className="flex items-center gap-2 mb-2">
            <input type="color" value={hexColor} onChange={(e) => handleHexInput(e.target.value)} className="h-8 w-8 rounded-md border border-[var(--border)] cursor-pointer p-0" />
            <input type="text" value={hexColor} onChange={(e) => handleHexInput(e.target.value)} className="flex-1 h-8 rounded-md border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] px-2 uppercase focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" maxLength={7} />
            <span className="text-[10px] text-[var(--foreground-muted)] font-mono w-7 text-right">{hue}°</span>
          </div>
          <input type="range" min={0} max={360} value={hue} onChange={(e) => applyHue(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: 'linear-gradient(to right, oklch(64% 0.17 0), oklch(64% 0.17 60), oklch(64% 0.17 120), oklch(64% 0.17 180), oklch(64% 0.17 240), oklch(64% 0.17 300), oklch(64% 0.17 360))' }}
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(BRAND_HUES).map(([name, h]) => (
              <button key={name} onClick={() => applyHue(h)}
                className={`h-5 w-5 rounded-full border-2 transition-all ${hue === h ? 'border-[var(--foreground)] scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ background: `oklch(64% 0.17 ${h})` }} title={name}
              />
            ))}
          </div>
        </div>

        {/* Heading Font */}
        <div>
          <label className={labelCls}>Heading Font</label>
          <select value={headingFont} onChange={(e) => applyHeadingFont(e.target.value)} className={selectCls}>
            {Object.keys(GOOGLE_FONTS).map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Body Font */}
        <div>
          <label className={labelCls}>Body Font</label>
          <select value={bodyFont} onChange={(e) => applyBodyFont(e.target.value)} className={selectCls}>
            {Object.keys(GOOGLE_FONTS).map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Heading Style */}
        <div>
          <label className={labelCls}>Heading Style</label>
          <div className="flex gap-2 items-center">
            <select value={headingWeight} onChange={(e) => applyHeadingWeight(e.target.value)} className={selectCls + ' flex-1'}>
              {['400', '500', '600', '700', '800', '900'].map((w) => (
                <option key={w} value={w}>{w === '400' ? '400 Regular' : w === '500' ? '500 Medium' : w === '600' ? '600 Semi' : w === '700' ? '700 Bold' : w === '800' ? '800 Extra' : '900 Black'}</option>
              ))}
            </select>
            <button
              onClick={toggleHeadingUppercase}
              className={`shrink-0 px-2 py-1 text-[10px] font-bold border rounded-md transition-colors ${headingUppercase ? 'border-[var(--brand-500)] text-[var(--brand-500)] bg-[var(--brand-500)]/10' : 'border-[var(--border)] text-[var(--foreground-muted)]'}`}
            >AA</button>
          </div>
        </div>

        {/* Button Style */}
        <div>
          <label className={labelCls}>Button Style</label>
          <div className="flex gap-2 items-center">
            <select value={btnWeight} onChange={(e) => applyBtnWeight(e.target.value)} className={selectCls + ' flex-1'}>
              {['400', '500', '600', '700', '800'].map((w) => (
                <option key={w} value={w}>{w === '400' ? '400 Regular' : w === '500' ? '500 Medium' : w === '600' ? '600 Semi' : w === '700' ? '700 Bold' : '800 Extra'}</option>
              ))}
            </select>
            <button
              onClick={toggleBtnUppercase}
              className={`shrink-0 px-2 py-1 text-[10px] font-bold border rounded-md transition-colors ${btnUppercase ? 'border-[var(--brand-500)] text-[var(--brand-500)] bg-[var(--brand-500)]/10' : 'border-[var(--border)] text-[var(--foreground-muted)]'}`}
            >AA</button>
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className={labelCls}>Border Radius</label>
          <div className="flex gap-1.5">
            {Object.keys(RADIUS_PRESETS).map((name) => (
              <button key={name} onClick={() => applyRadius(name)}
                className={`flex-1 py-1.5 text-[10px] font-medium border transition-colors ${name === radiusKey ? 'border-[var(--brand-500)] text-[var(--brand-500)] bg-[var(--brand-500)]/10' : 'border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--foreground-muted)]'}`}
                style={{ borderRadius: name === '0' ? '0' : '6px' }}
              >{name}</button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-[var(--foreground-muted)] leading-relaxed">
          Preview only. Run <code className="font-mono text-[var(--brand-500)]">/brand-setup</code> to apply permanently.
        </p>

        <button onClick={reset} className="w-full text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] underline underline-offset-2 py-1">
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
