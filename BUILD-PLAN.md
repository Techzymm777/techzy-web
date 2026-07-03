# BUILD-PLAN.md — Techzy Revamp with Claude Code

Work one phase per session, one branch per phase (`revamp/01-foundation` etc.),
merge via PR so Netlify gives you a deploy preview to review each stage.
Prompts below are written to paste directly into Claude Code.

---

## Phase 0 — Audit (start here, read-only)
> Read this entire repo and CLAUDE.md. Report: the framework and router in use,
> how pages are currently structured, where content/copy lives, how images are
> stored, the Netlify build settings, and any blockers for implementing GSAP
> page transitions and a three.js hero as specified in CLAUDE.md. Also open
> design/techzy-motion-prototype.html and summarize its motion system back to
> me so I know you've absorbed it. Do not change any files yet.

Review the report. Correct anything it got wrong before Phase 1.

**Status: done 2026-07-03** — findings recorded in
`docs/superpowers/specs/2026-07-03-techzy-rebuild-foundation-design.md`.

## Phase 1 — Foundation (tokens + shell)
> Create branch revamp/01-foundation. Implement the design tokens from
> CLAUDE.md as CSS custom properties (colors, opacity steps, type scale,
> weight ramp, 8px spacing, easing). Load Inter 400/500/600/800. Rebuild the
> global shell: fixed nav with difference blend, hide-on-scroll-down, scroll
> progress bar, sound-toggle button (UI only for now), and the footer. Keep
> all existing page content rendering, unstyled is fine. Verify the build
> passes and nothing 404s.

Additional Phase 1 scope per the foundation spec: Vite scaffold, netlify.toml
with context-scoped publish (production keeps the current site until Phase 7),
i18n + Amplitude ported unchanged, hidden static Netlify Forms snapshot,
content JSONs seeded from the real catalog.

## Phase 2 — Motion core
> Branch revamp/02-motion-core. Add GSAP + ScrollTrigger. Implement, matching
> the prototype's timing exactly: (1) the seal-cut preloader on first load,
> (2) seal-cut transitions on every route change with full
> ScrollTrigger/listener cleanup, (3) the custom cursor with cursor:none
> scoping and card VIEW state, (4) the sound engine behind the toggle
> (Web Audio drone for now, structured to swap in an <audio> track), and
> (5) shared scroll-reveal utilities: masked word reveal, fade-up, clip
> reveal. Respect prefers-reduced-motion for all five.

## Phase 3 — Home
> Branch revamp/03-home. Rebuild the homepage per the prototype: three.js
> "quiet field" hero (lazy-loaded, fully disposed on route leave), Inter 800
> hero title, featured products grid wired to our real catalog data, the
> black "Why Techzy" section with the three guarantees verbatim, testimonial
> marquee, CTA band. Hit the Lighthouse budgets in CLAUDE.md.

Open question flagged in the foundation spec: the live site's testimonials
are customer-feedback screenshots (10 JPGs), not text quotes — decide at
Phase 3 planning how they fit the marquee treatment.

## Phase 4 — Products + product detail
> Branch revamp/04-products. Rebuild the products page with the toolbar
> (category tabs + search, keyboard accessible, aria-pressed states) filtering
> the real catalog. Build the product detail route as one template driven by
> product data, with the spec table and clip-reveal imagery. Card hover
> inverts to black; cursor shows VIEW.

Note: real catalog is quote-based — no prices. Cards keep the live site's
"Ask about this" / "Buy / Quote" CTAs to Contact.

## Phase 5 — Remaining pages
> Branch revamp/05-pages. Rebuild About (belief section, pull quote, numbered
> process steps) and Contact (form fields with underline style, info blocks)
> with existing copy verbatim, plus the remaining pages of the site using the
> same section vocabulary. Every page gets the shared transitions and reveals
> automatically.

## Phase 6 — Accessibility + performance pass
> Branch revamp/06-quality. Audit every page against the WCAG 2.2 AA section
> of CLAUDE.md, including SC 2.4.11 (fixed nav vs focused elements) and 2.5.8
> (24px targets). Test full keyboard navigation through transitions. Verify
> reduced-motion renders everything statically. Run Lighthouse on mobile for
> every route and fix anything under budget. List every issue found and fixed.

## Phase 7 — Ship
> Branch revamp/07-ship. Flip netlify.toml production context to publish the
> new build (`dist`), remove the legacy `techzymm-web/` folder, confirm deploy
> preview matches local. Write a short DEPLOY.md noting build settings and how
> to swap the audio track. Then we merge to main.

---

## Session habits that pay off
- Start big phases with Plan Mode (Shift+Tab in Claude Code) so it proposes
  before it edits.
- After each phase: open the Netlify deploy preview on your phone and desktop
  before merging.
- If Claude Code drifts from the design system, say "check CLAUDE.md" — it
  re-reads it.
- Feed it real assets early: product catalog (JSON/CSV), product photos,
  testimonial text, licensed audio track.
