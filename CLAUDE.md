# CLAUDE.md — Techzy Revamp

## What this project is
Revamp of techzymm.com (laptops & desktops retailer) into an award-grade motion
site. All existing copy stays verbatim; only design, motion, and structure change.
Hosted on Netlify from this repo. The approved design/motion reference is
`design/techzy-motion-prototype.html` — open it before building anything;
match its feel, timing, and structure.

## Non-negotiable design rules
1. **Typeface:** Inter only. Weight ramp: 800 (hero display) → 600 (section
   headlines) → 500 (card/step titles) → 400 (body).
2. **Color:** Binary palette. `#000000` and `#FFFFFF` only. No gray hex values
   anywhere. Intermediate values are expressed as black/white at opacity:
   secondary text `.62`, tertiary/disabled `.40`, hairlines `.18`.
3. **Radius:** `border-radius: 0` everywhere. No exceptions.
4. **Spacing:** 8px grid. All padding/margin/gap values are multiples of 8.
5. **Type scale:** golden ratio from 16px → 16 / 26 / 42 / 68 / 110 (clamp()
   for responsive). Tracking tightens as size grows (−0.045em at hero).
6. **Structure:** 1px hairline rules as layout devices (IBM Carbon influence).
7. **Never invent copy.** Site copy comes from the live site / content files.
   Product data comes from the real catalog, not placeholders.

## Motion system (the "seal cut")
Brand promise = factory-sealed, first-touch hardware. Motion expresses it:
- **Preloader (first load only):** TECHZY letters mask-reveal + 000→100 counter,
  a 1px white line draws across (the cut), black panels part top/bottom
  (the box opens). ~2.8s total, `power4.inOut`.
- **Page transitions (every route change):** abbreviated seal cut — line sweeps
  (0.45s), panels close (0.55s), swap page + scroll top, panels open (0.8s).
- **Scroll:** GSAP + ScrollTrigger. Masked word-by-word heading reveals
  (stagger 0.045), fade-up blocks (y:32→0), clip-path image reveals
  (inset bottom→0), infinite testimonial marquee (~28s loop).
- **Cursor:** native cursor hidden (`cursor:none`, scoped to
  `(hover:hover) and (prefers-reduced-motion:no-preference)`). Custom 8px dot
  + lerping 40px frame, `mix-blend-mode:difference`. Frame grows to 64px on
  interactive hover, 72px with "VIEW" label on product cards.
- **Sound:** ambient loop, OFF by default, toggle in nav with animated EQ bars,
  `aria-pressed`, fade in/out on toggle, suspend on tab blur. Track file lives
  in `/public/audio/` once licensed; until then use the Web Audio drone from
  the prototype.
- **Three.js hero (home only):** "quiet field" — grid of white points, nearly
  still ambient wave, ripple follows cursor with lerp. Dispose scene fully on
  route leave. Lazy-load three so it never blocks inner pages.
- **Easing vocabulary:** `power4.inOut` for structural motion, `power4.out`
  for reveals, `power3.out` for fades. No bounce, no elastic, ever.

## Accessibility (WCAG 2.2 AA — hard requirement)
- `prefers-reduced-motion`: kill ALL animation, show content statically,
  keep native cursor, no autoplaying marquee.
- Visible focus: 2px `currentColor` outline, offset 3px (auto-inverts on dark).
- Check SC 2.4.11 Focus Not Obscured — fixed nav must never cover a focused
  element (use `scroll-padding-top`).
- Touch targets ≥ 24×24 CSS px regardless of visual size (SC 2.5.8).
- Contrast is trivially AA (pure B/W) but verify opacity-reduced text ≥ 4.5:1
  effective contrast; `.40` opacity text is decorative-only, never informational.
- Sound toggle and filters fully keyboard-operable with correct ARIA state.

## Engineering conventions
- Keep the existing framework in this repo unless it blocks page transitions;
  propose before migrating anything.
- Kill/cleanup on every route change: all ScrollTriggers, tweens, three.js
  scene (geometry, material, renderer), and event listeners. No leaks.
- Transitions: intercept internal links, run seal-cut timeline around route
  change (Barba.js pattern or framework router hooks).
- Code-split: three.js and any heavy motion only on routes that use them.
- Images: grayscale + contrast treatment via CSS filter, real assets in repo.
- No CSS class specificity wars: tokens as CSS custom properties, one BEM-ish
  layer, no `!important` except the radius/cursor resets.
- Lighthouse budgets: Performance ≥ 90 mobile, CLS < 0.1, LCP < 2.5s. The
  preloader must not hide a slow LCP — hero text renders under it.
- Every PR: run build + lint before declaring done; deploy previews on Netlify.

## Netlify
- Keep existing site + build command; SPA routing needs a redirect rule
  (`/* /index.html 200` in `netlify.toml` or `_redirects`) if client-routed.
- Never commit secrets; env vars live in Netlify UI.

## Project docs
- Foundation decisions (stack, routing, i18n/Amplitude/Forms preservation):
  `docs/superpowers/specs/2026-07-03-techzy-rebuild-foundation-design.md`
- Phase plan: `BUILD-PLAN.md` (repo root)
- Bilingual EN/MY i18n, Amplitude analytics, Netlify Forms contact form, and
  the real 12-product catalog are shipped features of the live site and must
  survive every phase unchanged in behavior.
