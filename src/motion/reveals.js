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
export function applyReveals(root) {
  if (reducedMotion) return null
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
