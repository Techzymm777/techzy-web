# Techzy — Official Website

The official website for **Techzy Tech Store**, a laptop and computer retailer based in Myanmar. A black-and-white motion site built with Vite and vanilla JavaScript, with bilingual support (English & Myanmar).

## Live Site

Deployed on [Netlify](https://www.netlify.com) — live at [techzymm.com](https://techzymm.com). See [DEPLOY.md](DEPLOY.md) for build settings.

---

## Features

- **Bilingual (EN / မြန်မာ)** — full i18n support with a language toggle
- **Product catalogue** — 12 laptops with specs, badges, and imagery, with category tabs, search, and sorting
- **Motion system** — seal-cut preloader and page transitions, masked scroll reveals, custom cursor, ambient sound toggle (GSAP + ScrollTrigger)
- **Three.js hero** — "quiet field" particle grid on the home page, lazy-loaded and fully disposed on route leave
- **Accessible** — WCAG 2.2 AA: full `prefers-reduced-motion` support, keyboard-operable throughout, visible focus, ≥24px targets
- **Fast** — Lighthouse mobile 95–100 per route, CLS 0, self-hosted fonts, WebP imagery
- **Amplitude Analytics** — web analytics and session replay
- **Netlify Forms** — contact form with spam honeypot

---

## Project Structure

```
index.html              # Static shell: nav, footer, preloader, form registration
netlify.toml            # Build settings (command, publish dir, Node version)
content/
├── copy.en.json        # English copy (all UI strings)
├── copy.my.json        # Myanmar copy (same key set)
└── products.json       # The 12-product catalog (bilingual fields)
public/
├── _redirects          # SPA fallback (/* → /index.html 200)
├── fonts/              # Self-hosted Inter (variable, latin subset)
└── assets/images/      # Hero, product (WebP), and testimonial imagery
src/
├── main.js             # Boot, route rendering, reveal orchestration
├── router.js           # pushState router with link interception
├── i18n.js             # Language switching + dictionary lookup
├── shell.js            # Nav, progress bar, language toggle, footer
├── catalog.js          # Pure product filter/sort functions
├── pages/              # One module per route (render + mount/unmount)
├── motion/             # Preloader, transitions, reveals, cursor, sound
├── three/hero.js       # Quiet-field hero scene (code-split)
└── styles/             # tokens.css, base.css, motion.css
tests/                  # Vitest unit tests
design/                 # Approved motion prototype (reference)
```

---

## Getting Started

```bash
nvm use 22
npm ci
npm run dev       # dev server
npm run test      # unit tests
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite |
| Logic | Vanilla JavaScript (ES modules) |
| Motion | GSAP + ScrollTrigger, three.js (home hero) |
| Styling | CSS custom properties, grid, flexbox |
| Fonts | Inter (self-hosted variable font) |
| Hosting | Netlify |
| Forms | Netlify Forms |
| Analytics | Amplitude (analytics + session replay) |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push and open a pull request

Design rules (typography, palette, spacing, motion vocabulary, accessibility) are non-negotiable and live in [CLAUDE.md](CLAUDE.md).

---

## License

MIT © Techzy Tech Store
