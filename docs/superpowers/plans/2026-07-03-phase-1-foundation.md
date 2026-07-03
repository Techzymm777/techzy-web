# Phase 1 — Foundation (Vite scaffold + tokens + shell) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the no-build static site with a Vite + vanilla JS SPA shell that renders every existing page's real content (bilingual), carries the design tokens from CLAUDE.md, and deploys as a Netlify preview without touching production.

**Architecture:** Client-side router (`history.pushState`) renders page modules into `#app` inside a static shell (nav/footer) in `index.html`. Copy and catalog live in `content/*.json`, consumed by a ported i18n module. Production Netlify context keeps publishing the legacy `techzymm-web/` folder until Phase 7; deploy previews publish the new `dist/`.

**Tech Stack:** Vite 6, Vitest 3 (happy-dom), vanilla JS ES modules. No GSAP/three yet (Phase 2/3).

## Global Constraints

From CLAUDE.md — these apply to every task:

- Typeface: Inter only; weights 800 / 600 / 500 / 400.
- Color: `#000000` and `#FFFFFF` only. No gray hex values anywhere. Intermediates = black/white at opacity `.62` (secondary), `.40` (tertiary), `.18` (hairline).
- `border-radius: 0` everywhere (`!important` reset allowed for this).
- Spacing: 8px grid only.
- Type scale: 16 / 26 / 42 / 68 / 110 with `clamp()`; tracking −0.045em at hero size.
- **Never invent copy.** All strings come from `techzymm-web/assets/main.js` (`I18N`, `PRODUCTS`) or `techzymm-web/404.html`. The only authorized edit: footer `themeLine` drops "gray" (spec §Audit).
- Preserve shipped behavior: bilingual EN/MY, Amplitude analytics, Netlify Forms contact form, 12-product quote-based catalog (no prices).
- Focus visible: `outline: 2px solid currentColor; outline-offset: 3px`.
- Never commit secrets. (The Amplitude browser key is public by design — not a secret.)
- Working branch: `revamp/01-foundation`, branched from `main`. Commit after every task.

---

### Task 1: Branch + Vite scaffold

**Files:**
- Create: `package.json`, `vite.config.js`
- Create: `index.html` (repo root — minimal for now, expanded in Tasks 3/8/9)
- Create: `src/main.js` (stub)
- Copy: `techzymm-web/assets/favicon.svg` → `public/assets/favicon.svg`, `techzymm-web/assets/techzy-logo.svg` → `public/assets/techzy-logo.svg`

**Interfaces:**
- Produces: `npm run dev` / `build` / `preview` / `test` scripts; `#app` element that all later tasks render into.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b revamp/01-foundation
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "techzy-web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "vite": "^6.3.0",
    "vitest": "^3.1.0",
    "happy-dom": "^17.0.0"
  }
}
```

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
})
```

- [ ] **Step 4: Write minimal `index.html` at repo root**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Brand new, factory-sealed laptops and desktops. Only at Techzy." />
    <title>Techzy</title>
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  </head>
  <body>
    <main id="app" tabindex="-1"></main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 5: Write stub `src/main.js`**

```js
document.getElementById('app').textContent = 'Techzy — Phase 1 scaffold'
```

- [ ] **Step 6: Copy brand assets**

```bash
mkdir -p public/assets
cp techzymm-web/assets/favicon.svg public/assets/favicon.svg
cp techzymm-web/assets/techzy-logo.svg public/assets/techzy-logo.svg
```

- [ ] **Step 7: Install and verify build**

```bash
npm install
npm run build
```

Expected: `vite v6.x building for production... ✓ built in <time>` and `dist/index.html` exists. `package-lock.json` is created.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/main.js public/assets
git commit -m "feat: scaffold Vite app alongside legacy techzymm-web site"
```

---

### Task 2: Netlify configuration

**Files:**
- Create: `netlify.toml` (repo root)
- Create: `public/_redirects`

**Interfaces:**
- Produces: production deploys keep serving `techzymm-web/`; PR deploy previews build and serve `dist/` with SPA fallback.

- [ ] **Step 1: Write `netlify.toml`**

```toml
# Production keeps publishing the current live site (techzymm-web/) until
# Phase 7 flips it to the new Vite build. Deploy previews and branch
# deploys build the new site so every phase PR can be reviewed live.
# NOTE: this file overrides base/publish settings configured in the
# Netlify UI.

[build]
  publish = "techzymm-web"
  command = "echo 'production publishes the legacy static site until Phase 7'"

[context.deploy-preview]
  command = "npm run build"
  publish = "dist"

[context.branch-deploy]
  command = "npm run build"
  publish = "dist"
```

- [ ] **Step 2: Write `public/_redirects`** (ships only inside `dist/`, so the SPA fallback never affects the legacy production site)

```
/*  /index.html  200
```

- [ ] **Step 3: Verify the redirect file lands in the build**

```bash
npm run build && cat dist/_redirects
```

Expected output: `/*  /index.html  200`

- [ ] **Step 4: Commit**

```bash
git add netlify.toml public/_redirects
git commit -m "feat: add Netlify config — previews build new site, production untouched"
```

---

### Task 3: Design tokens + base styles + Inter

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`
- Modify: `index.html` (font links), `src/main.js` (style imports)

**Interfaces:**
- Produces: CSS custom properties `--ink`, `--paper`, `--alpha-secondary/tertiary/hairline`, `--t-0…--t-4`, `--t-label`, `--s1…--s20`, `--gutter`, `--ease`; utility classes `.label`, `.hairline`, `.wrap`, `.muted`, `.btn`, `.btn.solid`, `.frame`. All page/shell markup in Tasks 7–8 relies on these class names.

- [ ] **Step 1: Write `src/styles/tokens.css`** (verbatim from the prototype's `:root`)

```css
/* Techzy Design System tokens — see CLAUDE.md. Binary palette; opacity
   carries every intermediate value. 8px grid. Golden-ratio type scale. */
:root {
  --ink: #000000;
  --paper: #FFFFFF;
  /* opacity steps (the "no grays" rule) */
  --alpha-secondary: .62;
  --alpha-tertiary: .40;
  --alpha-hairline: .18;
  /* golden-ratio scale from 16 */
  --t-0: 1rem;                             /* 16 */
  --t-1: 1.625rem;                         /* 26 */
  --t-2: clamp(2rem, 3.4vw, 2.625rem);     /* 42 */
  --t-3: clamp(2.5rem, 5.6vw, 4.25rem);    /* 68 */
  --t-4: clamp(3rem, 8.6vw, 6.875rem);     /* 110 */
  --t-label: .6875rem;                     /* 11 — utility */
  /* 8px grid */
  --s1: 8px; --s2: 16px; --s3: 24px; --s4: 32px; --s6: 48px;
  --s8: 64px; --s12: 96px; --s16: 128px; --s20: 160px;
  --gutter: clamp(16px, 4vw, 48px);
  --ease: cubic-bezier(.76, 0, .24, 1);
}
```

- [ ] **Step 2: Write `src/styles/base.css`** (reset, typography, shared utilities — ported from the prototype minus motion-only rules, which land in Phase 2)

```css
* { margin: 0; padding: 0; box-sizing: border-box; border-radius: 0 !important; }
html { scroll-behavior: auto; scroll-padding-top: 96px; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: var(--t-0);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
::selection { background: var(--ink); color: var(--paper); }
img { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; background: none; border: none; color: inherit; cursor: pointer; }
:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }

.skip-link {
  position: absolute; left: -999px; top: 0; z-index: 9999;
  background: var(--ink); color: var(--paper); padding: var(--s1) var(--s2);
}
.skip-link:focus { left: 0; }

.label {
  font-size: var(--t-label);
  font-weight: 500;
  letter-spacing: .14em;
  text-transform: uppercase;
  opacity: var(--alpha-secondary);
}
.hairline { border-top: 1px solid var(--ink); opacity: var(--alpha-hairline); }
.wrap { padding-left: var(--gutter); padding-right: var(--gutter); max-width: 1440px; margin: 0 auto; }
.muted { opacity: var(--alpha-secondary); }

h1, h2, h3 { font-weight: 500; letter-spacing: -.03em; line-height: 1.05; }
.display { font-size: var(--t-4); }
.headline { font-size: var(--t-3); font-weight: 600; }
.title { font-size: var(--t-2); }
.lede { font-size: var(--t-1); line-height: 1.4; font-weight: 400; letter-spacing: -.01em; max-width: 34ch; }

.btn {
  display: inline-flex; align-items: center; gap: var(--s2);
  padding: var(--s2) var(--s4);
  border: 1px solid var(--ink);
  font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
  position: relative; overflow: hidden; background: var(--paper); color: var(--ink);
}
.btn::before {
  content: ""; position: absolute; inset: 0; background: var(--ink);
  transform: scaleY(0); transform-origin: bottom; transition: transform .4s var(--ease);
}
.btn span { position: relative; z-index: 1; transition: color .3s; }
.btn:hover::before { transform: scaleY(1); }
.btn:hover span { color: var(--paper); }
.btn.solid { background: var(--ink); color: var(--paper); }
.btn.solid::before { background: var(--paper); }
.btn.solid:hover span { color: var(--ink); }

.frame { position: relative; overflow: hidden; background: var(--ink); }
.frame img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.08); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 3: Add Inter to `index.html` `<head>`** (weights 400/500/600/800 per CLAUDE.md — insert after the viewport meta)

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet" />
```

- [ ] **Step 4: Import styles at the top of `src/main.js`**

```js
import './styles/tokens.css'
import './styles/base.css'
```

- [ ] **Step 5: Verify**

```bash
npm run dev
```

Open http://localhost:5173 — the stub text renders in Inter on white. Kill the server.

- [ ] **Step 6: Commit**

```bash
git add src/styles index.html src/main.js
git commit -m "feat: add CLAUDE.md design tokens and base styles, load Inter"
```

---

### Task 4: Content data + image assets

**Files:**
- Create: `content/copy.en.json`, `content/copy.my.json`, `content/products.json`
- Create: `tests/products.test.js`
- Copy: `techzymm-web/assets/images/**` → `public/assets/images/**` (products and testimonials renamed to URL-safe slugs)

**Interfaces:**
- Produces: `content/copy.en.json` / `copy.my.json` — flat key→string dictionaries consumed by `src/i18n.js` (Task 5). `content/products.json` — array of 12 objects `{ id, name, nameMy, category, badge, badgeMy, desc, descMy, specs[], specsMy[], image, featuredRank, productsOnly? }` consumed by page modules (Task 7). Product images at `/assets/images/products/<id>.png`; testimonial screenshots at `/assets/images/testimonials/feedback-01.jpg` … `feedback-10.jpg`; hero photos at `/assets/images/hero/`.

- [ ] **Step 1: Write `content/copy.en.json`**

Source: the `I18N.en` object in `techzymm-web/assets/main.js` (lines 16–145), converted to JSON verbatim, plus the four `notFound.*` keys whose strings come verbatim from `techzymm-web/404.html`, and the authorized `footer.themeLine` correction ("black, gray, and white" → "black and white").

```json
{
  "common.skip": "Skip to content",
  "common.brandHomeAria": "Techzy home",
  "common.langToggleAria": "Switch language",
  "common.menuToggleAria": "Open menu",

  "nav.home": "Home",
  "nav.about": "About Us",
  "nav.products": "Products",
  "nav.contact": "Contact",

  "footer.tagline": "Minimalist laptops and desktops for modern work.",
  "footer.about": "About",
  "footer.products": "Products",
  "footer.contact": "Contact",
  "footer.backToTop": "Back to top",
  "footer.copyrightName": "Techzy",
  "footer.themeLine": "Built in black and white.",

  "home.hero.kicker": "Brand New. Factory Sealed. Only at Techzy.",
  "home.hero.title": "For those who want to unbox their brand new laptop themselves.",
  "home.hero.lede": "Discover top-quality brand new laptops for office, school, and business. From everyday use to enterprise performance.",
  "home.hero.ctaPrimary": "Browse Products",
  "home.hero.ctaSecondary": "How We Work",
  "home.metrics.aria": "Key metrics",
  "home.metrics.warrantyLabel": "Warranty",
  "home.metrics.warrantyValue": "2 years",
  "home.metrics.shippingLabel": "Shipping",
  "home.metrics.shippingValue": "Fast + insured",
  "home.metrics.supportLabel": "Support",
  "home.metrics.supportValue": "Real humans",
  "home.featured.title": "Featured picks",
  "home.featured.subtitle": "A quick look at what customers are buying this week.",
  "home.featured.link": "See all products",
  "home.why.title": "Why choose Techzy?",
  "home.why.body": "Every device is 100% genuine, factory-sealed, and backed by our no-questions guarantee. Real peace of mind from unboxing to beyond.",
  "home.why.f1Title": "100% Authenticity",
  "home.why.f1Body": "Every laptop is 100% brand new and genuine. If not, we refund 2x the purchase price. Guaranteed.",
  "home.why.f2Title": "30-Day Instant Replacement",
  "home.why.f2Body": "Manufacturer defect within the first month? We replace it immediately. No repairs, no delays.",
  "home.why.f3Title": "First-Hand Experience",
  "home.why.f3Body": "Every device arrives factory-sealed. You will be the very first person to open and experience your new tech.",
  "home.testimonials.title": "What Our Customers Say",
  "home.testimonials.subtitle": "Real feedback from real buyers.",

  "about.hero.kicker": "About us",
  "about.hero.title": "A minimalist approach to computers.",
  "about.hero.lede": "We sell carefully selected laptops and desktops that prioritize reliability, clean design, and quiet performance.",
  "about.beliefs.title": "What we believe",
  "about.beliefs.body": "Technology should fade into the background. Your machine should be fast, stable, and understated. That is the whole point.",
  "about.beliefs.quote": "“The best spec is the one you never have to think about.”",
  "about.beliefs.byline": "Techzy team",
  "about.cards.qTitle": "Quality checks",
  "about.cards.qBody": "Each model is validated for thermals, performance consistency, and daily-driver reliability.",
  "about.cards.pTitle": "Straight pricing",
  "about.cards.pBody": "Clear configurations, no confusing bundles, and no gimmicks.",
  "about.cards.rTitle": "Repair mindset",
  "about.cards.rBody": "We support upgrades and repairs where it makes sense, to extend the life of your machine.",
  "about.how.title": "How it works",
  "about.how.subtitle": "A simple process from selection to delivery.",
  "about.steps.s1Title": "Pick a category",
  "about.steps.s1Body": "Browse laptops, desktops, and accessories in one place.",
  "about.steps.s2Title": "Choose a configuration",
  "about.steps.s2Body": "Select a build that matches your workload: work, studio, or performance.",
  "about.steps.s3Title": "Get support",
  "about.steps.s3Body": "Ask a question, confirm compatibility, and get post-purchase help.",
  "about.cta.title": "Ready to browse?",
  "about.cta.body": "Explore our lineup of minimalist machines and clean builds.",
  "about.cta.button": "View Products",

  "products.hero.kicker": "Products",
  "products.hero.title": "Clean machines. Clear choices.",
  "products.hero.lede": "Use search, filters, and sorting to find your next laptop or desktop.",
  "products.filters.searchLabel": "Search",
  "products.filters.searchPlaceholder": "e.g. 16-inch, studio, RTX, ultralight",
  "products.filters.all": "All",
  "products.filters.laptops": "Laptops",
  "products.filters.desktops": "Desktops",
  "products.filters.accessories": "Accessories",
  "products.filters.sortLabel": "Sort",
  "products.sort.featured": "Featured",
  "products.sort.nameAsc": "Name: A to Z",
  "products.empty.title": "No matches",
  "products.empty.body": "Try a different search term, or reset filters to see everything.",
  "products.empty.reset": "Reset filters",
  "products.card.ask": "Ask about this",
  "products.card.buy": "Buy / Quote",
  "products.card.askAria": "Ask about {name} via the contact page",
  "products.card.buyAria": "Request a quote for {name}",

  "contact.hero.kicker": "Contact",
  "contact.hero.title": "Talk to a human.",
  "contact.hero.lede": "Questions about specs, shipping, warranties, or the right build? Send a message and we will respond soon.",
  "contact.form.title": "Send a message",
  "contact.form.subtitle": "Fill in the form and we will get back to you by email.",
  "contact.form.nameLabel": "Name",
  "contact.form.emailLabel": "Email",
  "contact.form.messageLabel": "Message",
  "contact.form.messagePlaceholder": "Tell us what you need (use-case, budget, screen size, etc.)",
  "contact.form.submit": "Send message",
  "contact.form.reset": "Clear",
  "contact.form.sending": "Sending your message...",
  "contact.form.success": "Thanks! Your message has been sent. We will reply by email soon.",
  "contact.form.error": "Sorry, something went wrong. Please try again or email us directly.",
  "contact.form.direct": "Or email directly:",
  "contact.aside.hoursTitle": "Hours",
  "contact.aside.hoursBody": "Mon to Fri, 9:00 to 18:00",
  "contact.aside.supportTitle": "Support",
  "contact.aside.supportBody": "Include your model name and order number (if you have one).",
  "contact.aside.locationTitle": "Location",
  "contact.aside.locationBody": "We ship nationwide. Local pickup available by appointment.",

  "contact.err.name": "Please enter your name.",
  "contact.err.email": "Please enter a valid email.",
  "contact.err.message": "Please enter a message.",
  "contact.mail.subject": "Techzy inquiry from {name}",
  "contact.mail.footer": "Sent from the Techzy website.",

  "notFound.kicker": "404",
  "notFound.title": "Page not found.",
  "notFound.goHome": "Go Home",
  "notFound.browse": "Browse Products"
}
```

- [ ] **Step 2: Write `content/copy.my.json`**

Source: the `I18N.my` object in `techzymm-web/assets/main.js` (lines 146–274) converted to JSON verbatim — preserve every Myanmar string exactly, including the `।` character inside `about.beliefs.quote` (present in the live site; do not "fix" it). Two exceptions: (a) `footer.themeLine` drops the gray term per the authorized correction: `"အနက်၊ အဖြူ အရောင်စနစ်ဖြင့် တည်ဆောက်ထားသည်။"`; (b) the four `notFound.*` keys reuse the English strings from Step 1 verbatim (the live 404 page is English-only — do not invent a Myanmar translation).

The full key set MUST be identical to `copy.en.json` (same 100 keys). Extract the Myanmar values by opening `techzymm-web/assets/main.js` and transcribing the `my:` block key-for-key; do not retype from memory.

- [ ] **Step 3: Write `content/products.json`**

Source: the `PRODUCTS` array in `techzymm-web/assets/main.js` (lines 401–571), converted to JSON verbatim with one change: every `image` value becomes `"<id>.png"` (the files are renamed to match in Step 4). All 12 products, all bilingual fields, `featuredRank` preserved, `productsOnly: true` only on `lenovo-ideapad-slim-3`. Example of the first entry (repeat the pattern for all 12, transcribing from `main.js`):

```json
[
  {
    "id": "asus-rog-strix-g16",
    "name": "ASUS ROG Strix G16",
    "nameMy": "ASUS ROG Strix G16",
    "category": "laptop",
    "badge": "ROG Gaming",
    "badgeMy": "ROG Gaming",
    "desc": "Powerhouse gaming laptop featuring the ROG Nebula Display, AMD Ryzen 9 processor and RTX 4080 GPU for unstoppable performance.",
    "descMy": "ROG Nebula Display၊ AMD Ryzen 9 နှင့် RTX 4080 GPU ပါဝင်သော ထိပ်တန်း gaming laptop။",
    "specs": ["RTX 4080 12GB", "AMD Ryzen 9 8945H", "32GB DDR5", "1TB NVMe SSD", "16\" QHD+ 240Hz"],
    "specsMy": ["RTX 4080 12GB", "AMD Ryzen 9 8945H", "32GB DDR5", "1TB NVMe SSD", "16\" QHD+ 240Hz"],
    "image": "asus-rog-strix-g16.png",
    "featuredRank": 1
  }
]
```

- [ ] **Step 4: Copy and rename image assets** (renames make URLs safe — originals contain spaces/parens)

```bash
mkdir -p public/assets/images/products public/assets/images/testimonials
cp -R techzymm-web/assets/images/hero public/assets/images/hero

cp "techzymm-web/assets/images/products/ASUS ROG Strix16.png"        public/assets/images/products/asus-rog-strix-g16.png
cp "techzymm-web/assets/images/products/Asus V16.png"                public/assets/images/products/asus-vivobook-v16.png
cp "techzymm-web/assets/images/products/TUF Gaming F16.png"          public/assets/images/products/asus-tuf-gaming-f16.png
cp "techzymm-web/assets/images/products/acer aspire lite 15.png"     public/assets/images/products/acer-aspire-lite-15.png
cp "techzymm-web/assets/images/products/acer nitro v15.png"          public/assets/images/products/acer-nitro-v15.png
cp "techzymm-web/assets/images/products/asus tuf gaminga16.png"      public/assets/images/products/asus-tuf-gaming-a16.png
cp "techzymm-web/assets/images/products/expertbook-b9.png"           public/assets/images/products/asus-expertbook-b9.png
cp "techzymm-web/assets/images/products/legion 7pro.png"             public/assets/images/products/lenovo-legion-7-pro.png
cp "techzymm-web/assets/images/products/loq 15irx10.png"             public/assets/images/products/lenovo-loq-15irx10.png
cp "techzymm-web/assets/images/products/loq 15irx9.png"              public/assets/images/products/lenovo-loq-15irx9.png
cp "techzymm-web/assets/images/products/lenovo ideapad slim 3.png"   public/assets/images/products/lenovo-ideapad-slim-3.png
cp "techzymm-web/assets/images/products/tuf gaming a15.png"          public/assets/images/products/asus-tuf-gaming-a15.png

i=1
for f in techzymm-web/assets/images/testmonials/*.jpg; do
  cp "$f" "$(printf 'public/assets/images/testimonials/feedback-%02d.jpg' "$i")"
  i=$((i+1))
done
ls public/assets/images/products | wc -l   # expect 12
ls public/assets/images/testimonials | wc -l  # expect 10
```

- [ ] **Step 5: Write the failing data-validation test `tests/products.test.js`**

```js
import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import products from '../content/products.json'
import en from '../content/copy.en.json'
import my from '../content/copy.my.json'

describe('products catalog', () => {
  it('has 12 products with unique ids', () => {
    expect(products).toHaveLength(12)
    expect(new Set(products.map((p) => p.id)).size).toBe(12)
  })

  it('every product has the required bilingual fields and no price', () => {
    for (const p of products) {
      for (const field of ['id', 'name', 'nameMy', 'category', 'badge', 'badgeMy', 'desc', 'descMy', 'image', 'featuredRank']) {
        expect(p[field], `${p.id}.${field}`).toBeDefined()
      }
      expect(Array.isArray(p.specs) && p.specs.length > 0, `${p.id}.specs`).toBe(true)
      expect(Array.isArray(p.specsMy) && p.specsMy.length > 0, `${p.id}.specsMy`).toBe(true)
      expect(p.price, `${p.id} must not have a price (quote-based catalog)`).toBeUndefined()
    }
  })

  it('every product image file exists', () => {
    for (const p of products) {
      const file = resolve(__dirname, '../public/assets/images/products', p.image)
      expect(existsSync(file), p.image).toBe(true)
    }
  })
})

describe('copy dictionaries', () => {
  it('en and my have identical key sets', () => {
    expect(Object.keys(my).sort()).toEqual(Object.keys(en).sort())
  })
})
```

- [ ] **Step 6: Run the test**

```bash
npm test
```

Expected: PASS (if any assertion fails, the JSON transcription or the file copies are wrong — fix the data, not the test).

- [ ] **Step 7: Commit**

```bash
git add content tests/products.test.js public/assets/images
git commit -m "feat: seed content JSONs from real catalog and copy image assets"
```

---

### Task 5: i18n module

**Files:**
- Create: `src/i18n.js`
- Test: `tests/i18n.test.js`

**Interfaces:**
- Consumes: `content/copy.en.json`, `content/copy.my.json` (Task 4).
- Produces: `normalizeLang(l): 'en'|'my'`, `initI18n(): void` (reads localStorage, sets `document.documentElement.lang`, applies shell bindings), `setLang(lang): void` (persists + reapplies), `getLang(): 'en'|'my'`, `t(key, vars?): string`, `applyI18n(root?): void` (binds `[data-i18n]` / `[data-i18n-attr]`). Behavior matches the live site: default language is `en` unless a choice was saved.

- [ ] **Step 1: Write the failing tests `tests/i18n.test.js`**

```js
import { beforeEach, describe, expect, it } from 'vitest'
import { getLang, initI18n, normalizeLang, setLang, t } from '../src/i18n.js'

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
})

describe('normalizeLang', () => {
  it('maps my/mm prefixes to my, everything else to en', () => {
    expect(normalizeLang('my')).toBe('my')
    expect(normalizeLang('mm-MM')).toBe('my')
    expect(normalizeLang('en-US')).toBe('en')
    expect(normalizeLang(null)).toBe('en')
  })
})

describe('t', () => {
  it('returns English strings by default', () => {
    expect(t('nav.home')).toBe('Home')
  })
  it('substitutes {vars}', () => {
    expect(t('products.card.askAria', { name: 'Aera 14' })).toBe('Ask about Aera 14 via the contact page')
  })
  it('returns empty string for unknown keys', () => {
    expect(t('nope.missing')).toBe('')
  })
})

describe('setLang', () => {
  it('switches strings and persists the choice', () => {
    setLang('my')
    expect(getLang()).toBe('my')
    expect(t('nav.home')).toBe('ပင်မစာမျက်နှာ')
    expect(window.localStorage.getItem('lang')).toBe('my')
    expect(document.documentElement.lang).toBe('my')
  })
  it('is restored by initI18n', () => {
    setLang('my')
    initI18n()
    expect(getLang()).toBe('my')
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../src/i18n.js'` (products tests still pass).

- [ ] **Step 3: Write `src/i18n.js`** (ported from `techzymm-web/assets/main.js` `t`/`normalizeLang`/`applyI18n`, dictionaries moved to JSON)

```js
import en from '../content/copy.en.json'
import my from '../content/copy.my.json'

const DICTS = { en, my }
let activeLang = 'en'

export function normalizeLang(l) {
  const s = String(l || '').toLowerCase()
  if (s.startsWith('my') || s.startsWith('mm')) return 'my'
  return 'en'
}

export function getLang() {
  return activeLang
}

export function t(key, vars) {
  const dict = DICTS[activeLang] || DICTS.en
  let out = dict[key] ?? DICTS.en[key] ?? ''
  if (!out) return ''
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v))
    }
  }
  return out
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    const value = t(node.getAttribute('data-i18n'))
    if (value) node.textContent = value
  })
  root.querySelectorAll('[data-i18n-attr]').forEach((node) => {
    const parts = (node.getAttribute('data-i18n-attr') || '').split(/\s+/).filter(Boolean)
    for (const p of parts) {
      const idx = p.indexOf(':')
      if (idx === -1) continue
      const attr = p.slice(0, idx).trim()
      const key = p.slice(idx + 1).trim()
      const value = t(key)
      if (attr && value) node.setAttribute(attr, value)
    }
  })
}

export function setLang(lang) {
  activeLang = normalizeLang(lang)
  window.localStorage.setItem('lang', activeLang)
  document.documentElement.lang = activeLang
  applyI18n()
}

export function initI18n() {
  // Live-site behavior: default 'en' unless the user saved a choice.
  activeLang = normalizeLang(window.localStorage.getItem('lang'))
  document.documentElement.lang = activeLang
  applyI18n()
}
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: PASS (all files).

- [ ] **Step 5: Commit**

```bash
git add src/i18n.js tests/i18n.test.js
git commit -m "feat: port bilingual i18n module with JSON dictionaries"
```

---

### Task 6: Router

**Files:**
- Create: `src/router.js`
- Test: `tests/router.test.js`

**Interfaces:**
- Produces: `parseRoute(pathname): { name: 'home'|'about'|'products'|'contact'|'product'|'notFound', id?: string }`; `initRouter(onRoute): void` (intercepts internal `<a>` clicks, handles popstate, fires `onRoute` once for the initial URL); `navigate(path): void`. Task 7's `renderRoute` is the `onRoute` callback. Phase 2 will wrap `navigate` in the seal-cut timeline — keep it the single choke point for route changes.

- [ ] **Step 1: Write the failing tests `tests/router.test.js`**

```js
import { describe, expect, it } from 'vitest'
import { parseRoute } from '../src/router.js'

describe('parseRoute', () => {
  it('maps known paths', () => {
    expect(parseRoute('/')).toEqual({ name: 'home' })
    expect(parseRoute('/about')).toEqual({ name: 'about' })
    expect(parseRoute('/products')).toEqual({ name: 'products' })
    expect(parseRoute('/contact')).toEqual({ name: 'contact' })
  })
  it('tolerates trailing slashes', () => {
    expect(parseRoute('/about/')).toEqual({ name: 'about' })
  })
  it('extracts product ids', () => {
    expect(parseRoute('/product/asus-rog-strix-g16')).toEqual({ name: 'product', id: 'asus-rog-strix-g16' })
  })
  it('falls back to notFound', () => {
    expect(parseRoute('/nope')).toEqual({ name: 'notFound' })
    expect(parseRoute('/product/')).toEqual({ name: 'notFound' })
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../src/router.js'`.

- [ ] **Step 3: Write `src/router.js`**

```js
let handler = null

export function parseRoute(pathname) {
  const path = String(pathname || '/').replace(/\/+$/, '') || '/'
  if (path === '/') return { name: 'home' }
  if (path === '/about') return { name: 'about' }
  if (path === '/products') return { name: 'products' }
  if (path === '/contact') return { name: 'contact' }
  const m = path.match(/^\/product\/([A-Za-z0-9-]+)$/)
  if (m) return { name: 'product', id: m[1] }
  return { name: 'notFound' }
}

export function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path)
  }
  handler?.(parseRoute(path))
}

export function initRouter(onRoute) {
  handler = onRoute

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]')
    if (!a) return
    const href = a.getAttribute('href')
    // Only intercept same-origin path links; leave #anchors, external
    // URLs, downloads, and modified clicks to the browser.
    if (!href || !href.startsWith('/')) return
    if (a.target === '_blank' || a.hasAttribute('download')) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    navigate(href)
  })

  window.addEventListener('popstate', () => {
    handler?.(parseRoute(window.location.pathname))
  })

  handler(parseRoute(window.location.pathname))
}
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/router.js tests/router.test.js
git commit -m "feat: add pushState router with internal-link interception"
```

---

### Task 7: Page modules rendering real content

**Files:**
- Create: `src/pages/index.js`, `src/pages/card.js`, `src/pages/home.js`, `src/pages/products.js`, `src/pages/product.js`, `src/pages/about.js`, `src/pages/contact.js`, `src/pages/not-found.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `t`, `getLang` (Task 5); `content/products.json` (Task 4); `navigate` via plain `<a href="/...">` links (Task 6 intercepts them).
- Produces: `PAGES` map in `src/pages/index.js` — each page module exports `render(route): string` and optionally `mount(route): void` (post-render listeners). `renderRoute(route)` in `src/main.js` — later tasks (lang toggle, Phase 2 transitions) call it.

- [ ] **Step 1: Write `src/pages/card.js`** (shared product card — quote-based, no prices)

```js
import { getLang, t } from '../i18n.js'

export function getProductText(p) {
  const isMy = getLang() === 'my'
  return {
    name: isMy ? p.nameMy || p.name : p.name,
    badge: isMy ? p.badgeMy || p.badge : p.badge,
    desc: isMy ? p.descMy || p.desc : p.desc,
    specs: isMy ? p.specsMy || p.specs : p.specs,
  }
}

export function cardHTML(p, i) {
  const pt = getProductText(p)
  return `
  <article class="card" data-card>
    <a href="/product/${p.id}" aria-label="${pt.name}">
      <span class="idx">${String(i + 1).padStart(2, '0')} / ${pt.badge}</span>
      <div class="frame" style="aspect-ratio:4/3"><img src="/assets/images/products/${p.image}" alt="${pt.name}" loading="lazy"></div>
      <h3>${pt.name}</h3>
      <p class="spec muted">${pt.specs.slice(0, 4).join(' / ')}</p>
    </a>
    <div class="card-actions">
      <a class="btn" href="/contact" aria-label="${t('products.card.askAria', { name: pt.name })}"><span>${t('products.card.ask')}</span></a>
      <a class="btn solid" href="/contact" aria-label="${t('products.card.buyAria', { name: pt.name })}"><span>${t('products.card.buy')}</span></a>
    </div>
  </article>`
}
```

- [ ] **Step 2: Write `src/pages/home.js`**

```js
import products from '../../content/products.json'
import { t } from '../i18n.js'
import { cardHTML } from './card.js'

const TESTIMONIALS = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'))

export function render() {
  const featured = [...products]
    .filter((p) => !p.productsOnly)
    .sort((a, b) => a.featuredRank - b.featuredRank)
    .slice(0, 6)

  return `
  <section class="hero section">
    <div class="wrap">
      <p class="label hero-eyebrow">${t('home.hero.kicker')}</p>
      <h1 class="display">${t('home.hero.title')}</h1>
      <p class="hero-sub muted">${t('home.hero.lede')}</p>
      <div class="hero-cta">
        <a class="btn" href="/products"><span>${t('home.hero.ctaPrimary')}</span></a>
        <a class="btn" href="/about"><span>${t('home.hero.ctaSecondary')}</span></a>
      </div>
      <div class="hero-meta" role="group" aria-label="${t('home.metrics.aria')}">
        <div><span class="label">${t('home.metrics.warrantyLabel')}</span><strong>${t('home.metrics.warrantyValue')}</strong></div>
        <div><span class="label">${t('home.metrics.shippingLabel')}</span><strong>${t('home.metrics.shippingValue')}</strong></div>
        <div><span class="label">${t('home.metrics.supportLabel')}</span><strong>${t('home.metrics.supportValue')}</strong></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="label">${t('home.featured.title')}</span>
          <h2 class="headline">${t('home.featured.subtitle')}</h2>
        </div>
        <a class="btn" href="/products"><span>${t('home.featured.link')}</span></a>
      </div>
      <div class="grid-products">${featured.map(cardHTML).join('')}</div>
    </div>
  </section>

  <section class="section why">
    <div class="wrap">
      <h2 class="headline">${t('home.why.title')}</h2>
      <p class="lede muted">${t('home.why.body')}</p>
      <div class="why-items">
        <div class="why-item"><span class="label">01</span><h3>${t('home.why.f1Title')}</h3><p>${t('home.why.f1Body')}</p></div>
        <div class="why-item"><span class="label">02</span><h3>${t('home.why.f2Title')}</h3><p>${t('home.why.f2Body')}</p></div>
        <div class="why-item"><span class="label">03</span><h3>${t('home.why.f3Title')}</h3><p>${t('home.why.f3Body')}</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <span class="label">${t('home.testimonials.title')}</span>
      <h2 class="headline">${t('home.testimonials.subtitle')}</h2>
      <div class="testimonials">
        ${TESTIMONIALS.map((n) => `<div class="frame testimonial"><img src="/assets/images/testimonials/feedback-${n}.jpg" alt="${t('home.testimonials.title')} ${n}" loading="lazy"></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="wrap">
      <h2 class="headline">${t('about.cta.title')}</h2>
      <p class="muted">${t('about.cta.body')}</p>
      <a class="btn" href="/products"><span>${t('about.cta.button')}</span></a>
    </div>
  </section>`
}
```

- [ ] **Step 3: Write `src/pages/products.js`** (full grid; toolbar/filtering arrives in Phase 4)

```js
import products from '../../content/products.json'
import { t } from '../i18n.js'
import { cardHTML } from './card.js'

export function render() {
  const list = [...products].sort((a, b) => a.featuredRank - b.featuredRank)
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${t('products.hero.kicker')}</span>
      <h1 class="display">${t('products.hero.title')}</h1>
      <p class="lede muted">${t('products.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap section">
    <div class="grid-products">${list.map(cardHTML).join('')}</div>
  </section>`
}
```

- [ ] **Step 4: Write `src/pages/product.js`**

```js
import products from '../../content/products.json'
import { t } from '../i18n.js'
import { getProductText } from './card.js'
import * as notFound from './not-found.js'

export function render(route) {
  const p = products.find((x) => x.id === route.id)
  if (!p) return notFound.render()
  const pt = getProductText(p)
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${pt.badge}</span>
      <h1 class="display">${pt.name}</h1>
    </div>
  </section>
  <section class="wrap section pd-grid">
    <div class="frame" style="aspect-ratio:4/3"><img src="/assets/images/products/${p.image}" alt="${pt.name}"></div>
    <div>
      <p class="lede">${pt.desc}</p>
      <ul class="pd-specs">${pt.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div class="pd-actions">
        <a class="btn solid" href="/contact" aria-label="${t('products.card.buyAria', { name: pt.name })}"><span>${t('products.card.buy')}</span></a>
        <a class="btn" href="/contact" aria-label="${t('products.card.askAria', { name: pt.name })}"><span>${t('products.card.ask')}</span></a>
      </div>
    </div>
  </section>`
}
```

- [ ] **Step 5: Write `src/pages/about.js`**

```js
import { t } from '../i18n.js'

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${t('about.hero.kicker')}</span>
      <h1 class="display">${t('about.hero.title')}</h1>
      <p class="lede muted">${t('about.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap"><div class="frame" style="aspect-ratio:21/9"><img src="/assets/images/hero/hero-about.jpg" alt="${t('about.hero.title')}"></div></section>

  <section class="section wrap">
    <div class="belief">
      <div>
        <span class="label">${t('about.beliefs.title')}</span>
        <p class="lede">${t('about.beliefs.body')}</p>
      </div>
      <div>
        <p class="pull">${t('about.beliefs.quote')}</p>
        <p class="label pull-by">${t('about.beliefs.byline')}</p>
      </div>
    </div>
    <div class="why-items">
      <div class="why-item"><h3>${t('about.cards.qTitle')}</h3><p class="muted">${t('about.cards.qBody')}</p></div>
      <div class="why-item"><h3>${t('about.cards.pTitle')}</h3><p class="muted">${t('about.cards.pBody')}</p></div>
      <div class="why-item"><h3>${t('about.cards.rTitle')}</h3><p class="muted">${t('about.cards.rBody')}</p></div>
    </div>
  </section>

  <section class="section wrap">
    <span class="label">${t('about.how.title')}</span>
    <h2 class="headline">${t('about.how.subtitle')}</h2>
    <div class="steps">
      <div class="step"><span class="step-num">01</span><div><h3>${t('about.steps.s1Title')}</h3><p>${t('about.steps.s1Body')}</p></div></div>
      <div class="step"><span class="step-num">02</span><div><h3>${t('about.steps.s2Title')}</h3><p>${t('about.steps.s2Body')}</p></div></div>
      <div class="step"><span class="step-num">03</span><div><h3>${t('about.steps.s3Title')}</h3><p>${t('about.steps.s3Body')}</p></div></div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="wrap">
      <h2 class="headline">${t('about.cta.title')}</h2>
      <p class="muted">${t('about.cta.body')}</p>
      <a class="btn" href="/products"><span>${t('about.cta.button')}</span></a>
    </div>
  </section>`
}
```

- [ ] **Step 6: Write `src/pages/contact.js`** (form behavior ported from `mountContactForm` in `techzymm-web/assets/main.js` — same field names, honeypot, AJAX POST to `/`)

```js
import { t } from '../i18n.js'

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${t('contact.hero.kicker')}</span>
      <h1 class="display">${t('contact.hero.title')}</h1>
      <p class="lede muted">${t('contact.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap section contact-grid">
    <div>
      <h2 class="title">${t('contact.form.title')}</h2>
      <p class="muted">${t('contact.form.subtitle')}</p>
      <form id="contactForm" name="contact" method="POST" action="/" data-netlify="true" data-netlify-honeypot="bot-field" novalidate>
        <input type="hidden" name="form-name" value="contact" />
        <p hidden aria-hidden="true"><label>Don't fill this out if you're human: <input name="bot-field" tabindex="-1" autocomplete="off" /></label></p>
        <div class="field">
          <label for="cName">${t('contact.form.nameLabel')}</label>
          <input id="cName" name="name" type="text" autocomplete="name" aria-describedby="err-cName" required />
          <span class="field-help" id="err-cName" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="cEmail">${t('contact.form.emailLabel')}</label>
          <input id="cEmail" name="email" type="email" autocomplete="email" inputmode="email" aria-describedby="err-cEmail" required />
          <span class="field-help" id="err-cEmail" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="cMsg">${t('contact.form.messageLabel')}</label>
          <textarea id="cMsg" name="message" rows="5" required aria-describedby="err-cMsg" placeholder="${t('contact.form.messagePlaceholder')}"></textarea>
          <span class="field-help" id="err-cMsg" role="alert" aria-live="polite"></span>
        </div>
        <div class="form-actions">
          <button class="btn solid" type="submit"><span>${t('contact.form.submit')}</span></button>
          <button class="btn" type="reset"><span>${t('contact.form.reset')}</span></button>
        </div>
        <p class="field-help" id="formStatus" role="status" aria-live="polite"></p>
      </form>
    </div>
    <aside>
      <div class="info-block"><h3>${t('contact.aside.hoursTitle')}</h3><p class="muted">${t('contact.aside.hoursBody')}</p></div>
      <div class="info-block"><h3>${t('contact.aside.supportTitle')}</h3><p class="muted">${t('contact.aside.supportBody')}</p></div>
      <div class="info-block"><h3>${t('contact.aside.locationTitle')}</h3><p class="muted">${t('contact.aside.locationBody')}</p></div>
    </aside>
  </section>`
}

export function mount() {
  const form = document.getElementById('contactForm')
  if (!form) return
  const status = document.getElementById('formStatus')
  const submitBtn = form.querySelector('button[type="submit"]')

  const setErr = (id, message) => {
    const help = document.getElementById(`err-${id}`)
    if (help) help.textContent = message || ''
  }
  const setStatus = (message) => {
    if (status) status.textContent = message || ''
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const n = form.elements.name.value.trim()
    const em = form.elements.email.value.trim()
    const m = form.elements.message.value.trim()

    setErr('cName', n ? '' : t('contact.err.name'))
    setErr('cEmail', isValidEmail(em) ? '' : t('contact.err.email'))
    setErr('cMsg', m ? '' : t('contact.err.message'))
    if (!n || !isValidEmail(em) || !m) return

    setStatus(t('contact.form.sending'))
    if (submitBtn) submitBtn.disabled = true
    try {
      const body = new URLSearchParams(new FormData(form)).toString()
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (res.ok) {
        form.reset()
        setStatus(t('contact.form.success'))
      } else {
        setStatus(t('contact.form.error'))
      }
    } catch {
      setStatus(t('contact.form.error'))
    } finally {
      if (submitBtn) submitBtn.disabled = false
    }
  })

  form.addEventListener('reset', () => {
    setErr('cName', '')
    setErr('cEmail', '')
    setErr('cMsg', '')
    setStatus('')
  })
}
```

- [ ] **Step 7: Write `src/pages/not-found.js`**

```js
import { t } from '../i18n.js'

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${t('notFound.kicker')}</span>
      <h1 class="display">${t('notFound.title')}</h1>
      <div class="hero-cta">
        <a class="btn solid" href="/"><span>${t('notFound.goHome')}</span></a>
        <a class="btn" href="/products"><span>${t('notFound.browse')}</span></a>
      </div>
    </div>
  </section>`
}
```

- [ ] **Step 8: Write `src/pages/index.js`**

```js
import * as home from './home.js'
import * as products from './products.js'
import * as product from './product.js'
import * as about from './about.js'
import * as contact from './contact.js'
import * as notFound from './not-found.js'

export const PAGES = { home, products, product, about, contact, notFound }
```

- [ ] **Step 9: Rewrite `src/main.js`** (replace the stub)

```js
import './styles/tokens.css'
import './styles/base.css'
import { initI18n, t } from './i18n.js'
import { initRouter } from './router.js'
import { PAGES } from './pages/index.js'
import products from '../content/products.json'
import { getProductText } from './pages/card.js'

const app = document.getElementById('app')
let currentRoute = { name: 'home' }

function pageTitle(route) {
  if (route.name === 'home') return 'Techzy'
  if (route.name === 'product') {
    const p = products.find((x) => x.id === route.id)
    return p ? `${getProductText(p).name} | Techzy` : `${t('notFound.title')} | Techzy`
  }
  const key = { about: 'nav.about', products: 'nav.products', contact: 'nav.contact', notFound: 'notFound.title' }[route.name]
  return `${t(key)} | Techzy`
}

export function renderRoute(route) {
  currentRoute = route
  const page = PAGES[route.name] || PAGES.notFound
  app.innerHTML = page.render(route)
  page.mount?.(route)
  window.scrollTo(0, 0)
  document.title = pageTitle(route)
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const active = a.dataset.nav === (route.name === 'product' ? 'products' : route.name)
    if (active) a.setAttribute('aria-current', 'page')
    else a.removeAttribute('aria-current')
  })
}

export function getCurrentRoute() {
  return currentRoute
}

initI18n()
initRouter(renderRoute)
```

- [ ] **Step 10: Verify all routes in the dev server**

```bash
npm run dev
```

Visit `/`, `/about`, `/products`, `/contact`, `/product/asus-rog-strix-g16`, `/nope`. Each renders its real content (English); product images load; contact form fields present; unknown path shows the 404 content. Run `npm test` — all pass. Kill the server.

- [ ] **Step 11: Commit**

```bash
git add src/pages src/main.js
git commit -m "feat: render all routes from real bilingual content data"
```

---

### Task 8: Global shell — nav, footer, scroll behaviors, toggles

**Files:**
- Modify: `index.html` (full shell markup)
- Create: `src/shell.js`
- Modify: `src/main.js` (wire shell)
- Modify: `src/styles/base.css` (append shell styles)

**Interfaces:**
- Consumes: `applyI18n`, `setLang`, `getLang` (Task 5); `renderRoute`, `getCurrentRoute` (Task 7).
- Produces: `initShell({ onLangChange })` from `src/shell.js`. Fixed nav with `mix-blend-mode: difference`, hide-on-scroll-down, scroll progress bar, sound toggle (UI only — Phase 2 adds audio; keep ids `soundToggle`/`soundLabel`), language toggle (`langToggle`), footer.

- [ ] **Step 1: Replace `index.html` `<body>`** (keep head as-is)

```html
  <body>
    <a class="skip-link" href="#app" data-i18n="common.skip">Skip to content</a>
    <div class="progress" id="progress" aria-hidden="true"></div>

    <nav class="nav" id="nav" aria-label="Main">
      <a href="/" class="nav-logo" data-i18n-attr="aria-label:common.brandHomeAria">TECHZY</a>
      <ul class="nav-links">
        <li><a href="/" data-nav="home" data-i18n="nav.home">Home</a></li>
        <li><a href="/about" data-nav="about" data-i18n="nav.about">About Us</a></li>
        <li><a href="/products" data-nav="products" data-i18n="nav.products">Products</a></li>
        <li><a href="/contact" data-nav="contact" data-i18n="nav.contact">Contact</a></li>
        <li>
          <button class="lang" id="langToggle" type="button" data-i18n-attr="aria-label:common.langToggleAria">MY</button>
        </li>
        <li>
          <button class="sound" id="soundToggle" type="button" aria-pressed="false" aria-label="Turn sound on">
            <span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            <span id="soundLabel">Sound off</span>
          </button>
        </li>
      </ul>
    </nav>

    <main id="app" tabindex="-1"></main>

    <footer>
      <div class="wrap foot">
        <div>
          <span class="nav-logo">TECHZY</span>
          <small><span data-i18n="footer.tagline">Minimalist laptops and desktops for modern work.</span><br>© <span id="year"></span> <span data-i18n="footer.copyrightName">Techzy</span>. <span data-i18n="footer.themeLine">Built in black and white.</span></small>
        </div>
        <ul class="foot-links">
          <li><a href="/about" data-i18n="footer.about">About</a></li>
          <li><a href="/products" data-i18n="footer.products">Products</a></li>
          <li><a href="/contact" data-i18n="footer.contact">Contact</a></li>
          <li><a href="#app" id="backToTop" data-i18n="footer.backToTop">Back to top</a></li>
        </ul>
      </div>
    </footer>

    <script type="module" src="/src/main.js"></script>
  </body>
```

- [ ] **Step 2: Write `src/shell.js`**

```js
import { applyI18n, getLang, setLang } from './i18n.js'

export function initShell({ onLangChange }) {
  const nav = document.getElementById('nav')
  const progress = document.getElementById('progress')

  // Hide nav on scroll down, show on scroll up; drive the progress bar.
  let lastY = 0
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY
      nav.classList.toggle('is-hidden', y > lastY && y > 160)
      lastY = y
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%'
    },
    { passive: true },
  )

  // Sound toggle — UI state only in Phase 1; Phase 2 wires the audio engine.
  const soundBtn = document.getElementById('soundToggle')
  const soundLabel = document.getElementById('soundLabel')
  soundBtn.addEventListener('click', () => {
    const on = soundBtn.getAttribute('aria-pressed') === 'true'
    soundBtn.setAttribute('aria-pressed', String(!on))
    soundBtn.setAttribute('aria-label', on ? 'Turn sound on' : 'Turn sound off')
    soundLabel.textContent = on ? 'Sound off' : 'Sound on'
  })

  // Language toggle — persists and re-renders the current route.
  const langBtn = document.getElementById('langToggle')
  const syncLangBtn = () => {
    langBtn.textContent = getLang() === 'my' ? 'EN' : 'MY'
  }
  langBtn.addEventListener('click', () => {
    setLang(getLang() === 'my' ? 'en' : 'my')
    syncLangBtn()
    onLangChange()
  })
  syncLangBtn()

  // Footer bits.
  document.getElementById('year').textContent = String(new Date().getFullYear())
  document.getElementById('backToTop').addEventListener('click', (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  applyI18n()
}
```

- [ ] **Step 3: Wire the shell in `src/main.js`** — replace the last two lines (`initI18n()` / `initRouter(renderRoute)`) with:

```js
import { initShell } from './shell.js'

initI18n()
initShell({ onLangChange: () => renderRoute(getCurrentRoute()) })
initRouter(renderRoute)
```

(Move the `import { initShell } from './shell.js'` line up with the other imports.)

- [ ] **Step 4: Append shell styles to `src/styles/base.css`** (from the prototype's nav/sound/progress/footer blocks)

```css
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 7000;
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--s3) var(--gutter);
  mix-blend-mode: difference; color: #fff;
  transition: transform .5s var(--ease);
}
.nav.is-hidden { transform: translateY(-100%); }
.nav-logo { font-weight: 600; font-size: 18px; letter-spacing: -.02em; }
.nav-links { display: flex; gap: var(--s4); list-style: none; align-items: center; }
.nav-links a, .nav-links .lang {
  font-size: 13px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
  position: relative; padding: 4px 0;
}
.nav-links a::after {
  content: ""; position: absolute; left: 0; bottom: 0; height: 1px; width: 100%;
  background: currentColor; transform: scaleX(0); transform-origin: right;
  transition: transform .4s var(--ease);
}
.nav-links a:hover::after, .nav-links a[aria-current="page"]::after { transform: scaleX(1); transform-origin: left; }
@media (max-width: 720px) { .nav-links { gap: var(--s2); } .nav-links a, .nav-links .lang { font-size: 11px; } }

.sound {
  display: flex; align-items: center; gap: 10px;
  font-size: 11px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase;
  color: #fff; padding: 6px 0;
}
.sound-bars { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
.sound-bars i {
  width: 2px; height: 100%; background: #fff; transform-origin: bottom;
  animation: eq 1s ease-in-out infinite; animation-play-state: paused; transform: scaleY(.2);
}
.sound-bars i:nth-child(2) { animation-delay: .2s; }
.sound-bars i:nth-child(3) { animation-delay: .4s; }
.sound-bars i:nth-child(4) { animation-delay: .1s; }
.sound[aria-pressed="true"] .sound-bars i { animation-play-state: running; }
@keyframes eq { 0%, 100% { transform: scaleY(.2); } 50% { transform: scaleY(1); } }

.progress { position: fixed; top: 0; left: 0; height: 2px; background: var(--ink); width: 0; z-index: 7100; mix-blend-mode: difference; }

main { min-height: 100vh; padding-top: var(--s12); }
.section { padding: var(--s16) 0; }
.page-head { padding: var(--s20) 0 var(--s8); }
.section-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s3); margin-bottom: var(--s8); flex-wrap: wrap; }

.grid-products {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1px;
  background: rgba(0, 0, 0, var(--alpha-hairline)); border: 1px solid rgba(0, 0, 0, var(--alpha-hairline));
}
.card { background: var(--paper); padding: var(--s4); display: flex; flex-direction: column; gap: var(--s3); }
.card .idx { font-size: var(--t-label); letter-spacing: .14em; opacity: var(--alpha-tertiary); display: block; margin-bottom: var(--s2); }
.card h3 { font-size: var(--t-1); letter-spacing: -.02em; margin-top: var(--s2); }
.card .spec { font-size: 13px; }
.card-actions { display: flex; gap: var(--s1); margin-top: auto; flex-wrap: wrap; }

.why { background: var(--ink); color: var(--paper); }
.why-items { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--s8) var(--s6); margin-top: var(--s8); }
.why-item h3 { font-size: var(--t-1); margin: var(--s2) 0; }
.why-item p { opacity: var(--alpha-secondary); font-size: 15px; max-width: 36ch; }

.testimonials { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--s2); margin-top: var(--s6); }

.cta-band { background: var(--ink); color: var(--paper); }
.cta-band .btn { margin-top: var(--s6); background: transparent; color: var(--paper); border-color: var(--paper); }
.cta-band .btn::before { background: var(--paper); }
.cta-band .btn:hover span { color: var(--ink); }

.belief { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s8); align-items: start; }
.pull { font-size: var(--t-2); line-height: 1.15; letter-spacing: -.02em; font-weight: 500; max-width: 18ch; }
.steps .step { display: grid; grid-template-columns: 120px 1fr; gap: var(--s4); padding: var(--s6) 0; border-top: 1px solid rgba(0, 0, 0, var(--alpha-hairline)); }
.step-num { font-size: var(--t-3); font-weight: 500; letter-spacing: -.03em; line-height: 1; }
@media (max-width: 720px) { .belief { grid-template-columns: 1fr; } .steps .step { grid-template-columns: 64px 1fr; } }

.contact-grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: var(--s8); }
@media (max-width: 820px) { .contact-grid { grid-template-columns: 1fr; } }
.field { display: flex; flex-direction: column; gap: var(--s1); margin-bottom: var(--s4); }
.field label { font-size: var(--t-label); font-weight: 500; letter-spacing: .14em; text-transform: uppercase; }
.field input, .field textarea {
  border: none; border-bottom: 1px solid var(--ink); padding: var(--s2) 0;
  font: inherit; background: transparent; color: inherit; outline: none;
}
.field input:focus, .field textarea:focus { border-bottom-width: 2px; }
.form-actions { display: flex; gap: var(--s2); }
.info-block { padding: var(--s4) 0; border-top: 1px solid rgba(0, 0, 0, var(--alpha-hairline)); }
.info-block h3 { font-size: var(--t-0); font-weight: 600; }

.pd-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: var(--s8); align-items: start; }
@media (max-width: 820px) { .pd-grid { grid-template-columns: 1fr; } }
.pd-specs { list-style: none; margin-top: var(--s4); }
.pd-specs li { padding: var(--s2) 0; border-top: 1px solid rgba(0, 0, 0, var(--alpha-hairline)); font-size: 14px; }
.pd-actions { display: flex; gap: var(--s2); margin-top: var(--s6); }

.hero-cta { display: flex; gap: var(--s2); margin-top: var(--s6); flex-wrap: wrap; }
.hero-meta {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s3);
  margin-top: var(--s12); padding-top: var(--s3);
  border-top: 1px solid rgba(0, 0, 0, var(--alpha-hairline));
}
.hero-meta strong { display: block; font-weight: 500; margin-top: var(--s1); }
.hero-sub { margin-top: var(--s4); max-width: 44ch; }
.hero-eyebrow { margin-bottom: var(--s3); }

footer { border-top: 1px solid var(--ink); padding: var(--s8) 0; }
.foot { display: flex; justify-content: space-between; gap: var(--s4); flex-wrap: wrap; align-items: flex-start; }
.foot-links { display: flex; gap: var(--s4); list-style: none; flex-wrap: wrap; }
.foot-links a { font-size: 13px; letter-spacing: .06em; text-transform: uppercase; font-weight: 500; }
.foot small { display: block; margin-top: var(--s6); font-size: 12px; opacity: var(--alpha-tertiary); }
```

Note: the home hero is white-on-white for now — the black hero with the three.js field is Phase 3. The nav's difference blend already renders correctly against both.

- [ ] **Step 5: Verify shell behaviors in the dev server**

```bash
npm run dev
```

Check: nav fixed and visible over both white and black sections; nav hides scrolling down, returns scrolling up; progress bar fills; sound toggle animates bars and flips label/aria-pressed; MY toggle switches every visible string to Myanmar (nav, page content, footer) and persists across reload; footer year is current; `npm test` still passes. Kill the server.

- [ ] **Step 6: Commit**

```bash
git add index.html src/shell.js src/main.js src/styles/base.css
git commit -m "feat: global shell — difference-blend nav, progress bar, toggles, footer"
```

---

### Task 9: Amplitude + Netlify Forms registration

**Files:**
- Copy: `techzymm-web/assets/amplitude-init.js` → `src/amplitude-init.js` (unchanged)
- Modify: `src/main.js`, `index.html`

**Interfaces:**
- Produces: analytics fire on production builds only; Netlify's build-time crawler finds a static `contact` form in `dist/index.html` so the JS-rendered contact form keeps working.

- [ ] **Step 1: Copy the Amplitude init file unchanged**

```bash
cp techzymm-web/assets/amplitude-init.js src/amplitude-init.js
```

- [ ] **Step 2: Import it in `src/main.js`, gated to production** (the legacy site had no build step so it always fired; gating keeps localhost out of analytics without changing production behavior). Add after the other imports:

```js
if (import.meta.env.PROD) {
  import('./amplitude-init.js')
}
```

- [ ] **Step 3: Add the hidden static form snapshot to `index.html`** — Netlify registers forms by parsing static HTML at deploy time; it never executes JS, so the real form rendered by `contact.js` is invisible to it. Field names MUST match `contact.js` exactly. Insert just before `</body>`:

```html
    <!-- Netlify Forms build-time registration only. The interactive form
         is rendered client-side on /contact with these exact field names. -->
    <form name="contact" data-netlify="true" data-netlify-honeypot="bot-field" hidden aria-hidden="true">
      <input type="hidden" name="form-name" value="contact" />
      <input name="bot-field" />
      <input type="text" name="name" />
      <input type="email" name="email" />
      <textarea name="message"></textarea>
    </form>
```

- [ ] **Step 4: Verify**

```bash
npm run build
grep -c 'data-netlify' dist/index.html
grep -c 'amplitude' dist/assets/*.js | head -1
```

Expected: `1` from the first grep (form present in built HTML); the second shows the Amplitude chunk exists in the bundle.

- [ ] **Step 5: Commit**

```bash
git add src/amplitude-init.js src/main.js index.html
git commit -m "feat: preserve Amplitude analytics and Netlify Forms registration"
```

---

### Task 10: Full verification, push, PR

**Files:** none new.

- [ ] **Step 1: Run the full test suite and build**

```bash
npm test && npm run build
```

Expected: all tests pass, build succeeds.

- [ ] **Step 2: Verify the production preview serves every route (SPA fallback included)**

```bash
npm run preview &
sleep 2
for p in / /about /products /contact /product/asus-rog-strix-g16 /nope; do
  echo "== $p: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4173$p)"
done
kill %1
```

Expected: `200` for every path (Vite preview serves the SPA fallback; `/nope` renders the 404 page client-side — a real 404 status is a known SPA trade-off, revisited in Phase 6).

- [ ] **Step 3: Manual click-through** — `npm run preview`, open http://localhost:4173: navigate via nav links (URL changes without full reload), browser back/forward works, language toggle persists, all 12 products render with images on /products.

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin revamp/01-foundation
gh pr create --base main --title "Phase 1 — Foundation: Vite scaffold, tokens, shell" --body "$(cat <<'EOF'
## Summary
- Vite + vanilla JS scaffold alongside the untouched legacy techzymm-web/ site
- CLAUDE.md design tokens as CSS custom properties; Inter 400/500/600/800
- pushState router + page modules rendering all real content (EN/MY)
- Global shell: difference-blend fixed nav, hide-on-scroll, progress bar, sound toggle (UI only), footer
- i18n, Amplitude, Netlify Forms, and the 12-product quote-based catalog preserved
- netlify.toml: deploy previews build the new site; production keeps serving the legacy folder until Phase 7

## Test plan
- [ ] `npm test` and `npm run build` pass
- [ ] Netlify deploy preview: all routes render, language toggle works, no 404s
- [ ] Production (techzymm.com) unaffected

Per docs/superpowers/plans/2026-07-03-phase-1-foundation.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Confirm the Netlify deploy preview** — open the preview URL from the PR checks; verify routes, images, language toggle, and that the preview banner shows it's building `dist` (not the legacy folder). Report the URL to the user for phone + desktop review per BUILD-PLAN.md.

---

## Self-review notes

- Spec coverage: Vite scaffold (T1), Netlify context split + SPA redirect (T2), tokens/Inter (T3), content JSONs + no-price catalog + asset carry-over (T4), i18n preservation (T5), pushState routing (T6), all pages with real copy (T7), shell per BUILD-PLAN Phase 1 (T8), Amplitude + Forms snapshot (T9), build/404/PR verification (T10). Footer themeLine correction applied in T4 Step 1/2. Three.js hero, GSAP, cursor, transitions intentionally absent — Phases 2–3.
- The `my` dictionary and remaining 11 products are transcribed from `techzymm-web/assets/main.js` in-repo rather than reprinted in full here; the tests in T4 Step 5 (identical key sets, 12 products, images exist) mechanically catch transcription gaps.
- Type consistency: `PAGES` map keys match `parseRoute` names (`notFound` camelCase in both); `renderRoute`/`getCurrentRoute` exported from main.js and consumed by shell.js via the `onLangChange` closure.
