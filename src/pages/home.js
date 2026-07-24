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
    : `<div class="frame shot" role="button" tabindex="0" aria-label="${t('home.testimonials.title')} ${n} — ${t('home.testimonials.view')}"><img src="/assets/images/testimonials/feedback-${n}.jpg" alt="${t('home.testimonials.title')} ${n}" loading="lazy"></div>`

export function render() {
  const featured = [...products]
    .filter((p) => !p.productsOnly)
    .sort((a, b) => a.featuredRank - b.featuredRank)
    .slice(0, 8)

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
  <div class="marquee" id="marqueeWrap" aria-label="${t('home.testimonials.title')}">
    <div class="marquee-track" id="marquee">${shots}${reducedMotion ? '' : clones}</div>
  </div>
  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="${t('home.testimonials.title')}">
    <button class="lightbox-close" type="button" aria-label="${t('home.testimonials.close')}">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5 19 19 M19 5 5 19"/></svg>
    </button>
    <img class="lightbox-img" id="lightboxImg" src="" alt="">
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
let teardownTestimonials = null

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

  teardownTestimonials = wireTestimonials()

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

// Marquee pauses on hover/focus/touch; clicking a testimonial opens it in a
// lightbox. Returns a teardown for the document/body-level listeners (the
// element-scoped ones are GC'd when the page DOM is swapped out on route change).
function wireTestimonials() {
  const marquee = document.getElementById('marqueeWrap')
  const lightbox = document.getElementById('lightbox')
  if (!marquee || !lightbox) return null
  const lightboxImg = document.getElementById('lightboxImg')
  const closeBtn = lightbox.querySelector('.lightbox-close')

  const track = document.getElementById('marquee')

  let hovering = false
  let modalOpen = false
  let dragging = false
  let lastFocused = null

  const syncMarquee = () => {
    if (!marqueeTween) return
    if (hovering || modalOpen || dragging) marqueeTween.pause()
    else marqueeTween.resume()
  }

  const open = (img) => {
    if (!img) return
    lightboxImg.src = img.currentSrc || img.src
    lightboxImg.alt = img.alt || ''
    lastFocused = document.activeElement
    lightbox.classList.add('is-open')
    lightbox.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')
    modalOpen = true
    syncMarquee()
    closeBtn.focus()
  }
  const close = () => {
    if (!modalOpen) return
    lightbox.classList.remove('is-open')
    lightbox.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    lightboxImg.src = ''
    modalOpen = false
    syncMarquee()
    if (lastFocused && lastFocused.focus) lastFocused.focus()
  }

  const shotImg = (e) => e.target.closest('.shot')?.querySelector('img')
  const onClick = (e) => {
    if (suppressClick) { suppressClick = false; return } // it was a drag, not a tap
    open(shotImg(e))
  }
  const onKeydownShot = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.shot')) {
      e.preventDefault()
      open(shotImg(e))
    }
  }
  const setHover = (v) => () => { hovering = v; syncMarquee() }
  const onLightboxClick = (e) => {
    if (e.target === lightbox || e.target.closest('.lightbox-close')) close()
  }
  // Escape closes; Tab is trapped on the close button (the only control).
  const onDocKey = (e) => {
    if (!modalOpen) return
    if (e.key === 'Escape') close()
    else if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus() }
  }

  // Drag-to-scroll (mouse + touch via Pointer Events). Only wired when the
  // loop tween exists; under reduced motion the strip stays a native scroller.
  // The track holds the strip twice, so wrapping x into (-half, 0] keeps it
  // seamless while dragging. Movement past a small threshold is treated as a
  // drag and suppresses the click that would otherwise open the lightbox.
  let suppressClick = false
  let dragId = null
  let startPointerX = 0
  let startX = 0
  let movedX = 0
  const half = track ? track.scrollWidth / 2 : 0
  const wrapX = (v) => { let r = v % half; if (r > 0) r -= half; return r }

  const onPointerDown = (e) => {
    if (!marqueeTween || e.button > 0) return
    dragId = e.pointerId
    startPointerX = e.clientX
    startX = Number(gsap.getProperty(track, 'x')) || 0
    movedX = 0
    dragging = true
    syncMarquee()
    marquee.classList.add('is-dragging')
    try { marquee.setPointerCapture(e.pointerId) } catch { /* no active pointer */ }
  }
  const onPointerMove = (e) => {
    if (dragId !== e.pointerId) return
    movedX = e.clientX - startPointerX
    gsap.set(track, { x: wrapX(startX + movedX) })
  }
  const endDrag = (e) => {
    if (dragId !== e.pointerId) return
    dragId = null
    dragging = false
    marquee.classList.remove('is-dragging')
    try { marquee.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    // Re-sync the loop tween to the dragged position so resume() is seamless.
    if (marqueeTween && half) marqueeTween.progress((-Number(gsap.getProperty(track, 'x')) % half) / half)
    // Require > 16px movement to suppress click (allows reliable lightbox opens)
    if (Math.abs(movedX) > 16) suppressClick = true
    syncMarquee()
  }

  marquee.addEventListener('click', onClick)
  marquee.addEventListener('keydown', onKeydownShot)
  marquee.addEventListener('mouseenter', setHover(true))
  marquee.addEventListener('mouseleave', setHover(false))
  marquee.addEventListener('focusin', setHover(true))
  marquee.addEventListener('focusout', setHover(false))
  marquee.addEventListener('touchstart', setHover(true), { passive: true })
  marquee.addEventListener('touchend', setHover(false), { passive: true })
  marquee.addEventListener('pointerdown', onPointerDown)
  marquee.addEventListener('pointermove', onPointerMove)
  marquee.addEventListener('pointerup', endDrag)
  marquee.addEventListener('pointercancel', endDrag)
  lightbox.addEventListener('click', onLightboxClick)
  document.addEventListener('keydown', onDocKey)

  return () => {
    document.removeEventListener('keydown', onDocKey)
    document.body.classList.remove('modal-open')
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
  if (teardownTestimonials) {
    teardownTestimonials()
    teardownTestimonials = null
  }
}
