import { gsap } from 'gsap'
import products from '../../content/products.json'
import { t } from '../i18n.js'
import { cardHTML } from './card.js'
import { reducedMotion } from '../motion/reduced.js'

const TESTIMONIALS = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'))

// The clone half of the marquee strip is presentation-only — hide it from
// the accessibility tree so screen readers hear each testimonial once.
const shotHTML = (n, clone = false) =>
  clone
    ? `<div class="frame shot" aria-hidden="true"><img src="/assets/images/testimonials/feedback-${n}.jpg" alt="" loading="lazy"></div>`
    : `<div class="frame shot"><img src="/assets/images/testimonials/feedback-${n}.jpg" alt="${t('home.testimonials.title')} ${n}" loading="lazy"></div>`

export function render() {
  const featured = [...products]
    .filter((p) => !p.productsOnly)
    .sort((a, b) => a.featuredRank - b.featuredRank)
    .slice(0, 6)

  // Marquee needs the strip twice for a seamless loop; under reduced motion
  // it renders once and becomes a plain horizontally scrollable strip.
  const shots = TESTIMONIALS.map((n) => shotHTML(n)).join('')
  const clones = TESTIMONIALS.map((n) => shotHTML(n, true)).join('')

  return `
  <section class="hero">
    <canvas id="webgl" aria-hidden="true"></canvas>
    <div class="wrap">
      <p class="label hero-eyebrow" data-reveal>${t('home.hero.kicker')}</p>
      <h1 class="split">${t('home.hero.title')}</h1>
      <p class="hero-sub" data-reveal>${t('home.hero.lede')}</p>
      <div class="hero-cta" data-reveal>
        <a class="btn" href="/products"><span>${t('home.hero.ctaPrimary')}</span></a>
        <a class="btn" href="/about"><span>${t('home.hero.ctaSecondary')}</span></a>
      </div>
      <div class="hero-meta" data-reveal role="group" aria-label="${t('home.metrics.aria')}">
        <div><span class="label">${t('home.metrics.warrantyLabel')}</span><strong>${t('home.metrics.warrantyValue')}</strong></div>
        <div><span class="label">${t('home.metrics.shippingLabel')}</span><strong>${t('home.metrics.shippingValue')}</strong></div>
        <div><span class="label">${t('home.metrics.supportLabel')}</span><strong>${t('home.metrics.supportValue')}</strong></div>
      </div>
    </div>
    <span class="hero-scroll" aria-hidden="true">Scroll</span>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="label" data-reveal>${t('home.featured.title')}</span>
          <h2 class="headline split">${t('home.featured.subtitle')}</h2>
        </div>
        <a class="btn" href="/products" data-reveal><span>${t('home.featured.link')}</span></a>
      </div>
      <div class="grid-products">${featured.map((p, i) => cardHTML(p, i)).join('')}</div>
    </div>
  </section>

  <section class="section why">
    <div class="wrap">
      <h2 class="headline split">${t('home.why.title')}</h2>
      <p class="lede muted" data-reveal>${t('home.why.body')}</p>
      <div class="why-items">
        <div class="why-item" data-reveal><span class="label">01</span><h3>${t('home.why.f1Title')}</h3><p>${t('home.why.f1Body')}</p></div>
        <div class="why-item" data-reveal><span class="label">02</span><h3>${t('home.why.f2Title')}</h3><p>${t('home.why.f2Body')}</p></div>
        <div class="why-item" data-reveal><span class="label">03</span><h3>${t('home.why.f3Title')}</h3><p>${t('home.why.f3Body')}</p></div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-bottom:var(--s8)">
    <div class="wrap">
      <span class="label" data-reveal>${t('home.testimonials.title')}</span>
      <h2 class="headline split">${t('home.testimonials.subtitle')}</h2>
    </div>
  </section>
  <div class="marquee" aria-label="${t('home.testimonials.title')}">
    <div class="marquee-track" id="marquee">${shots}${reducedMotion ? '' : clones}</div>
  </div>

  <section class="section cta-band">
    <div class="wrap">
      <h2 class="headline split">${t('about.cta.title')}</h2>
      <p class="muted" data-reveal>${t('about.cta.body')}</p>
      <a class="btn" href="/products" data-reveal><span>${t('about.cta.button')}</span></a>
    </div>
  </section>`
}

let three = null
let marqueeTween = null
let mounted = false

export function mount() {
  mounted = true

  // Testimonial marquee — ~28s seamless loop; skipped under reduced motion
  // (the strip is then scrollable via CSS overflow).
  if (!reducedMotion) {
    const track = document.getElementById('marquee')
    if (track) {
      const half = track.scrollWidth / 2
      marqueeTween = gsap.to(track, { x: -half, duration: 28, ease: 'none', repeat: -1 })
    }
  }

  // Three.js quiet field — lazy-loaded so it never blocks inner pages, and
  // guarded in case the user navigates away before the chunk arrives.
  // Double-rAF starts the fetch one frame after the hero text has painted,
  // so the ~500KB chunk is never on the first-paint critical path.
  const canvas = document.getElementById('webgl')
  if (canvas) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!mounted) return
      import('../three/hero.js').then(({ createHero }) => {
        if (!mounted || !document.getElementById('webgl')) return
        three = createHero(canvas, { animate: !reducedMotion })
      })
    }))
  }
}

export function unmount() {
  mounted = false
  if (three) {
    three.destroy()
    three = null
  }
  if (marqueeTween) {
    marqueeTween.kill()
    marqueeTween = null
  }
}
