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
      <p class="label hero-eyebrow" data-reveal>${t('home.hero.kicker')}</p>
      <h1 class="display split">${t('home.hero.title')}</h1>
      <p class="hero-sub muted" data-reveal>${t('home.hero.lede')}</p>
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
      <div class="grid-products">${featured.map(cardHTML).join('')}</div>
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

  <section class="section">
    <div class="wrap">
      <span class="label" data-reveal>${t('home.testimonials.title')}</span>
      <h2 class="headline split">${t('home.testimonials.subtitle')}</h2>
      <div class="testimonials">
        ${TESTIMONIALS.map((n) => `<div class="frame testimonial" data-clip><img src="/assets/images/testimonials/feedback-${n}.jpg" alt="${t('home.testimonials.title')} ${n}" loading="lazy"></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="wrap">
      <h2 class="headline split">${t('about.cta.title')}</h2>
      <p class="muted" data-reveal>${t('about.cta.body')}</p>
      <a class="btn" href="/products" data-reveal><span>${t('about.cta.button')}</span></a>
    </div>
  </section>`
}
