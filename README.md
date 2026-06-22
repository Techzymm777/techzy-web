# Techzy — Official Website

The official website for **Techzy Tech Store**, a laptop and computer retailer based in Myanmar. Built as a clean, fast static site with bilingual support (English & Myanmar).

## Live Site

Deployed on [Netlify](https://www.netlify.com) — live at [techzymm.com](https://techzymm.com).

---

## Features

- **Bilingual (EN / မြန်မာ)** — full i18n support with a language toggle
- **Product catalogue** — 12 laptops with specs, badges, and imagery
- **Home hero carousel** — 3D rotating promotional slides
- **Testimonials carousel** — horizontal drag-to-scroll customer feedback section
- **Why Techzy section** — sticky layout with feature highlights
- **Responsive** — mobile-first design, works across all screen sizes
- **Accessible** — semantic HTML, ARIA labels, skip-to-content link
- **Amplitude Analytics** — web analytics and session replay

---

## Project Structure

```
techzymm-web/
├── index.html              # Home page
├── about.html              # About Us page
├── products.html           # Products listing page
├── contact.html            # Contact page (Netlify Forms)
├── 404.html                # Custom 404 page
└── assets/
    ├── styles.css          # All styles
    ├── main.js             # App logic, i18n, product data, carousels
    ├── amplitude-init.js   # Amplitude analytics + session replay init
    ├── techzy-logo.svg
    ├── favicon.svg         # Adaptive light/dark favicon
    └── images/
        ├── hero/           # Hero section images
        ├── products/       # Product images
        └── testmonials/    # Customer feedback images
```

---

## Getting Started

No build step required — this is a pure HTML/CSS/JS static site.

### Run locally

```bash
cd techzymm-web
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Deploy

Push to `main` — Netlify auto-deploys on every commit.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Logic | Vanilla JavaScript (ES2020+) |
| Fonts | Inter (Google Fonts) |
| Hosting | Netlify |
| Forms | Netlify Forms |
| Analytics | Amplitude (analytics + session replay) |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push and open a pull request

---

## License

MIT © Techzy Tech Store
