# Techzy Rebuild — Foundation Design

Date: 2026-07-03 (revised after auditing the real repo)

## Context

Techzy (techzymm.com) is being rebuilt into an award-grade motion site for a
laptops/desktops retailer. Reference documents define the product and design
requirements and are treated as source of truth for everything not covered
here:

- `CLAUDE.md` (repo root, once copied in during Phase 1) — non-negotiable
  design tokens, the "seal cut" motion system, accessibility requirements,
  and engineering conventions.
- `BUILD-PLAN.md` (repo root, once copied in during Phase 1) — the 7-phase
  execution plan (Foundation → Motion core → Home → Products → Remaining
  pages → Accessibility/performance → Ship), one branch/PR per phase.
- `design/techzy-motion-prototype.html` — a working single-file prototype
  implementing the full motion system (preloader, page transitions, custom
  cursor, sound toggle, three.js hero, scroll reveals). This is the
  visual/motion reference; its JS is a starting point for the real
  implementation, not a copy-paste target.

**Revision note:** this design was first written assuming a greenfield
build, because the local working directory was empty. It was not — the
real, live production code lives in GitHub repo `Techzymm777/techzy-web`
(deployed to techzymm.com via Netlify), last pushed 2026-06-22. That repo
was audited (read-only clone) before continuing, and the findings below
replace the assumptions in the original version of this section. This is a
**revamp of a real, working site**, not a from-scratch build — CLAUDE.md's
and BUILD-PLAN.md's original framing ("audit the current repo," "keep the
existing framework unless it blocks transitions") was correct all along;
it was pointed at the wrong (empty) directory.

Also found on the remote: a branch `feat/awwwards-redesign` (last commit
2026-06-11, never merged) containing an earlier, different motion-site
attempt — dark theme, lime-green accent, Space Grotesk/IBM Plex Sans,
rounded corners. It directly conflicts with CLAUDE.md's binary-palette /
Inter-only / zero-radius rules and is very likely the reason CLAUDE.md was
written with such strict constraints. Left untouched on the remote; not a
basis for this design, though its `three-hero.js` particle-field technique
and GSAP-choreography structure may be worth a quick look purely as
implementation reference when Phase 2/3 are planned.

## Audit findings: `Techzymm777/techzy-web`

- **Structure**: plain static HTML per route, no build step —
  `index.html`, `about.html`, `products.html`, `contact.html`, `404.html`,
  all under a `techzymm-web/` subfolder, plus `assets/` (styles.css,
  main.js, amplitude-init.js, logo/favicon SVGs, `images/{hero,products,
  testimonials}/`). No `netlify.toml`; build/publish settings live in the
  Netlify UI (base + publish directory = `techzymm-web`).
- **Bilingual (EN / Myanmar)**: full i18n via a key→string dictionary
  (`I18N.en`, `I18N.my`) in `main.js`, applied through `data-i18n` /
  `data-i18n-attr` HTML attributes and a `t(key, vars)` lookup function.
  Language choice persists in `localStorage`, defaults to
  `navigator.language`. **Not mentioned anywhere in CLAUDE.md or
  BUILD-PLAN.md** — must be preserved; losing it would be a regression on
  a shipped feature.
- **Real product catalog**: 12 laptops hardcoded in `main.js`, each with
  bilingual fields (`name`/`nameMy`, `badge`/`badgeMy`, `desc`/`descMy`,
  `specs`/`specsMy`), `category`, `image` (filename under
  `assets/images/products/`), `featuredRank`, and an optional
  `productsOnly` flag. **No price field** — cards show "Ask about this" /
  "Buy / Quote" CTAs linking to Contact, not a price.
- **Amplitude Analytics + Session Replay**: loaded via CDN in
  `amplitude-init.js` (autocapture: page views, sessions, form
  interactions, file downloads, element interactions; session replay at
  100% sample rate). The embedded key is Amplitude's public browser SDK
  key, meant to be client-side visible (not a secret to rotate). Not
  mentioned in CLAUDE.md — must be preserved.
- **Contact form uses Netlify Forms**: static `<form data-netlify="true"
  data-netlify-honeypot="bot-field">` with a hidden `form-name` field,
  submitted via `fetch("/", {method:"POST", body: urlencoded FormData})`.
  Netlify's build-time crawler registers forms by parsing static HTML —
  it does not execute JS. This matters for our routing decision (see
  below).
- **Existing assets**: logo (`techzy-logo.svg`), adaptive favicon
  (`favicon.svg`), and all 12 product images already exist in the repo.
- The footer copy literally says "Built in black, gray, and white." —
  this describes the *current* (non-binary) visual system and will read
  as false once CLAUDE.md's binary-palette rule ships. This is a factual
  copy correction forced by the design-system change, not invented copy;
  update to "Built in black and white." in both `en` and `my`.

## Decisions

### 1. Stack

Vite + vanilla JS, no UI framework. `gsap` and `three` become npm
dependencies (not CDN `<script>` tags), so Vite can code-split them —
three.js must lazy-load only on the home route per CLAUDE.md.

Rejected: Next.js — its SSR/hydration model actively fights the
prototype's direct-DOM motion techniques (`mix-blend-mode` cursor,
GSAP-owned styles) for no benefit; this site has no server-side logic
needs. Rejected: Astro — reasonable alternative, but Vite preserves more
of both the prototype's and the real site's existing vanilla JS.

### 2. Routing & transitions

Client-side router using `history.pushState` with real paths (`/products`,
`/about`, `/product/:id`), replacing the real site's separate `.html`
files and the prototype's hash routes (`#/products`). One render function
per route (ported from the prototype's `PAGES` pattern), same seal-cut
transition timeline on navigation.

`netlify.toml` gets the SPA catch-all redirect (`/* /index.html 200`).

**Netlify Forms compatibility**: since routes render via JS instead of
being separate static HTML files, the contact form's markup won't exist
in any static file at build time, so Netlify's crawler won't auto-register
it — this would silently break the live contact form. Fix: keep a hidden,
statically-present copy of the exact form markup (matching `name`
attributes) in the built `index.html`, purely for Netlify's build-time
form detection; the JS-rendered contact page uses the real interactive
version. This is Netlify's documented pattern for SPA forms, not a novel
workaround.

Rejected (for now): static multi-page generation + AJAX fetch/swap
transitions (true Barba.js pattern) — would sidestep the Forms issue
entirely and improve SEO, but requires a build-time static-generation
step per catalog product and more transition-code complexity. Deferred to
Phase 6 as a candidate hardening step if SEO turns out to matter more than
the hidden-form workaround handles.

### 3. Project structure

```
techzy-website/
  index.html
  src/
    main.js              # boot, router, cursor, sound, transitions
    pages/                # one module per route (home.js, products.js, product.js, about.js, contact.js)
    three/hero.js         # quiet-field scene, lazy-imported only on home
    i18n.js                # t(key, vars), lang persistence, data-i18n binding — ported from the real site
    styles/
      tokens.css          # CSS custom properties from CLAUDE.md
      base.css
      components.css
  content/
    copy.en.json           # per-page static copy, English
    copy.my.json           # per-page static copy, Myanmar
    products.json           # catalog: id, name/nameMy, category, badge/badgeMy, desc/descMy, specs/specsMy, image, featuredRank
  public/
    assets/images/         # logo, favicon, hero/product/testimonial images — carried over from techzy-web as-is
    audio/                  # licensed ambient track, once available
  netlify.toml
  docs/superpowers/specs/  # design docs (this file and future ones)
```

### 4. Content & data conventions

`content/copy.en.json` / `copy.my.json` and `content/products.json` are
the single source of truth for copy and catalog data — no hardcoded
strings inside page templates. Seeded directly from the real site's
`I18N.en`/`I18N.my` dictionaries and `PRODUCTS` array (the authoritative,
already-live source — supersedes the earlier plain-fetch summary of
techzymm.com, which couldn't see JS-rendered content and is kept below
only as a secondary cross-check). No copy is invented per CLAUDE.md's
"never invent copy" rule; the one intentional edit is the black/gray/white
→ black/white footer correction noted above.

Testimonial quotes are still not available (JS-rendered, not present in
the audited `main.js`, and not yet provided) — flagged as a placeholder in
`copy.*.json` until the client supplies real quotes.

Product cards follow the real site's model: no price field, "Ask about
this" / "Buy or Quote" CTAs to Contact. Logo, favicon, and product images
are carried over from `techzy-web` as-is; updated versions can replace
them later without any structural change.

### 5. Design system

Adopted verbatim from CLAUDE.md, no reinterpretation: binary `#000`/`#FFF`
palette with opacity steps for secondary/tertiary/hairline text
(.62/.40/.18), Inter weights 800/600/500/400, golden-ratio type scale
(16/26/42/68/110 via `clamp()`), 8px spacing grid, `border-radius: 0`
everywhere, easing vocabulary limited to `power4.inOut` / `power4.out` /
`power3.out`. This supersedes the real site's current (non-binary) visual
system entirely — CLAUDE.md is explicit that only design/motion/structure
change, not functionality, so i18n, Amplitude, Netlify Forms, and the real
catalog all carry forward unchanged in behavior.

### 6. Accessibility & performance

WCAG 2.2 AA per CLAUDE.md's checklist (full reduced-motion fallback, 2px
focus-visible outlines, SC 2.4.11 focus-not-obscured given the fixed nav,
SC 2.5.8 24px touch targets). Lighthouse budgets (Performance ≥90 mobile,
CLS <0.1, LCP <2.5s) are a build requirement from Phase 3 onward and are
formally audited in Phase 6.

### 7. Phasing & delivery

BUILD-PLAN.md's 7 phases are adopted as-is (one git branch + PR per
phase, Netlify deploy preview reviewed before merge), now correctly
understood as phases against the real `techzy-web` codebase. Adjustments
to Phase 1: scaffold Vite in place of the current no-build static setup,
wire this local repo to the existing `Techzymm777/techzy-web` remote, add
the `netlify.toml` SPA redirect, port `i18n.js` and `amplitude-init.js`
over unchanged, and add the hidden static Netlify Forms snapshot described
above. Phase 3 (Home) and Phase 4 (Products) additionally cover porting
the real `PRODUCTS` catalog and hero/testimonial carousels' *content* into
the new motion system (the carousels' interaction pattern is superseded by
CLAUDE.md's scroll-reveal/marquee treatment, per CLAUDE.md's
design-changes-not-functionality framing — flagged here for confirmation
when Phase 3 is planned, not decided in this document).

## Out of scope for this design

- The actual content of `copy.*.json` beyond what's already extracted
  from the real site — testimonial quotes are still outstanding.
- Anything already fully specified in CLAUDE.md (exact motion timings,
  token values, accessibility checklist) — referenced, not restated.
- Whether the hero/testimonial carousels' interaction model (vs.
  CLAUDE.md's marquee/scroll-reveal) carries forward — noted as an open
  question for Phase 3 planning, not resolved here.
- Phases 2–7's implementation detail — each gets its own plan via
  writing-plans when that phase starts, per BUILD-PLAN.md's existing
  structure.

## Appendix: secondary cross-check from a plain fetch of techzymm.com

Fetched from techzymm.com early in this design session, before the real
repo was found; used only as a sanity check against `main.js`'s `I18N.en`
dictionary, which is authoritative. Some strings differ slightly (e.g.
the live hero copy is actually "Brand New. Factory Sealed. Only at
Techzy." / "For those who want to unbox their brand new laptop
themselves." per `main.js`, not "Minimal hardware. Maximum focus." as
this fetch reported) — `main.js` wins in every case.

- Nav: Home, About Us, Products, Contact
- Trust badges: Warranty "2 years", Shipping "Fast + insured", Support
  "Real humans"
- Why Techzy guarantees: 100% Authenticity, 30-Day Instant Replacement,
  First-Hand Experience
- About: three pillars (Quality checks, Straight pricing, Repair mindset)
  plus a three-step "how it works" process
- Contact: hours "Mon to Fri, 9:00 to 18:00", no public email/phone listed
