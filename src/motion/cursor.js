import { reducedMotion } from './reduced.js'

// Custom cursor: 8px dot follows the pointer directly; 40px frame lerps
// behind it (factor .14, matching the prototype). Frame grows to 64px over
// interactive elements, 72px with the VIEW label over product cards.
// Uses event delegation so nothing needs rebinding on route changes.
export function initCursor() {
  if (reducedMotion || !window.matchMedia('(hover: hover)').matches) return

  const dot = document.querySelector('.cursor')
  const ring = document.querySelector('.cursor-frame')
  if (!dot || !ring) return

  let cx = window.innerWidth / 2
  let cy = window.innerHeight / 2
  let rx = cx
  let ry = cy

  window.addEventListener('pointermove', (e) => {
    cx = e.clientX
    cy = e.clientY
  })

  ;(function cursorLoop() {
    rx += (cx - rx) * 0.14
    ry += (cy - ry) * 0.14
    dot.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`
    ring.style.transform = `translate(${rx - ring.offsetWidth / 2}px, ${ry - ring.offsetHeight / 2}px)`
    requestAnimationFrame(cursorLoop)
  })()

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('a, button, input, textarea, .tab')
    ring.classList.remove('is-hover', 'is-label')
    if (!el) return
    ring.classList.add(el.closest('[data-card]') ? 'is-label' : 'is-hover')
  })
}
