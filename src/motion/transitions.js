import { gsap } from 'gsap'
import { reducedMotion } from './reduced.js'

// Abbreviated seal cut around a route change: line sweeps (0.45s), panels
// close (0.55s), swap happens behind them, panels open (0.8s). Timing and
// easing match the prototype exactly.
export function transitionTo(swap, done) {
  const tl = gsap.timeline({ onComplete: done })
  tl.set('#veil', { pointerEvents: 'auto' })
    .to('.veil-line', { scaleX: 1, duration: 0.45, ease: 'power3.inOut' })
    .to('.veil-panel', { scaleY: 1, duration: 0.55, ease: 'power4.inOut' }, '-=.15')
    .set('.veil-line', { scaleX: 0 })
    .add(swap)
    .to('.veil-panel', { scaleY: 0, duration: 0.8, ease: 'power4.inOut', delay: 0.1 })
    .set('#veil', { pointerEvents: 'none' })
}

// Full seal cut, once per hard load: TECHZY letters mask-reveal, 000→100
// counter, the 1px cut line, then the box opens. Content is already
// rendered underneath so the preloader never hides a slow LCP.
export function runPreloader() {
  const loader = document.getElementById('loader')
  if (!loader) return
  const mark = document.getElementById('loaderMark')
  mark.innerHTML = 'TECHZY'.split('').map((c) => `<span>${c}</span>`).join('')
  if (reducedMotion) {
    loader.remove()
    return
  }
  document.body.style.overflow = 'hidden'
  const count = { v: 0 }
  const countEl = document.getElementById('loaderCount')
  const tl = gsap.timeline({
    onComplete() {
      loader.remove()
      document.body.style.overflow = ''
    },
  })
  tl.to(mark.children, { y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.05 }, 0.2)
    .to(count, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        countEl.textContent = String(Math.round(count.v)).padStart(3, '0')
      },
    }, 0.2)
    .to('.loader-line', { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, '-=.5')
    // masked slide-out (not a fade): text is either fully white or gone, so
    // no transient low-contrast frame for an accessibility scan to catch
    .to([...mark.children, countEl, '.loader-tag span'], { yPercent: -115, duration: 0.35, ease: 'power4.in' }, '-=.2')
    .to('.loader-panel.top', { yPercent: -100, duration: 1, ease: 'power4.inOut' })
    .to('.loader-panel.bottom', { yPercent: 100, duration: 1, ease: 'power4.inOut' }, '<')
    .set('.loader-line', { opacity: 0 }, '<+.1')
}
