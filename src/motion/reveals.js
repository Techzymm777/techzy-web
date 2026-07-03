import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from './reduced.js'

// Masked word reveal: wrap each word of a .split element in an
// overflow-hidden span so GSAP can slide it up into view.
export function splitAll(root) {
  root.querySelectorAll('.split').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/)
    el.innerHTML = words.map((w) => `<span class="w"><i>${w}</i></span>`).join(' ')
  })
}

// Apply the three shared reveal patterns to a freshly rendered page.
// Returns a gsap.context whose revert() is the page's cleanup contract —
// it kills every tween and ScrollTrigger created here. Returns null under
// reduced motion (CSS keeps everything visible and static).
//
// On the hard load (initial=true) anything inside the first viewport renders
// settled: the preloader is the entrance for that content, and hiding it
// behind reveal states would push LCP past budget (CLAUDE.md: the preloader
// must not hide a slow LCP). Below-fold content and SPA navigations keep
// the full reveal treatment.
export function applyReveals(root, initial = false) {
  if (reducedMotion) return null
  if (initial) {
    const vh = window.innerHeight
    const inView = (el) => {
      const r = el.getBoundingClientRect()
      return r.top < vh && r.bottom > 0
    }
    root.querySelectorAll('.split').forEach((el) => {
      if (inView(el)) el.classList.remove('split')
    })
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      if (inView(el)) el.removeAttribute('data-reveal')
    })
    root.querySelectorAll('[data-clip]').forEach((el) => {
      if (inView(el)) el.removeAttribute('data-clip')
    })
  }
  splitAll(root)
  const ctx = gsap.context(() => {
    root.querySelectorAll('.split').forEach((el) => {
      gsap.to(el.querySelectorAll('.w i'), {
        y: 0, duration: 1, ease: 'power4.out', stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    })
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
      })
    })
    root.querySelectorAll('[data-clip]').forEach((el) => {
      gsap.to(el, {
        clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      })
    })
  }, root)
  ScrollTrigger.refresh()
  return ctx
}
