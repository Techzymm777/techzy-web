import { gsap } from 'gsap'
import { reducedMotion } from './reduced.js'

// Magnetic buttons: while the mouse is over one, the custom cursor hides and
// the button is pulled toward the pointer (its label a little further, for
// depth); on leave it settles back to rest. Event delegation on document, so
// buttons rendered by any route or filter re-render are covered without
// rebinding. Desktop mouse/trackpad only — phones, tablets, touch/pen input
// and reduced motion keep static buttons.
export const MAGNETIC = '.btn, .tab, .dock-btn, .nav .lang, .nav .sound, .menu-btn'

const PULL = 0.3 // button travel, as a share of the pointer's offset from centre
const LABEL_PULL = 0.15 // extra travel for the label inside a .btn
const MAX = 16 // px cap so wide buttons don't drift far
const clamp = (v, max) => Math.max(-max, Math.min(max, v))

const movers = new WeakMap()
function moversFor(el) {
  let m = movers.get(el)
  if (!m) {
    const label = el.matches('.btn') ? el.querySelector(':scope > span') : null
    const to = (target, prop) => gsap.quickTo(target, prop, { duration: 0.5, ease: 'power3.out' })
    m = { x: to(el, 'x'), y: to(el, 'y'), lx: label && to(label, 'x'), ly: label && to(label, 'y') }
    movers.set(el, m)
  }
  return m
}

function move(el, x, y, lx = 0, ly = 0) {
  const m = moversFor(el)
  m.x(x)
  m.y(y)
  m.lx?.(lx)
  m.ly?.(ly)
}

let active = null

// Settle the hovered button back to rest and bring the cursor back. Also
// called on route change, since a button swapped out from under a still
// pointer never receives a pointer event.
export function releaseMagnetic() {
  if (!active) return
  if (active.isConnected) move(active, 0, 0)
  active = null
  document.documentElement.classList.remove('cursor-hidden')
}

export function initMagnetic() {
  // Desktop only: a real hover-capable, precise pointer (mouse/trackpad).
  if (reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    const hit = e.target.closest?.(MAGNETIC)
    const el = hit && !hit.disabled && hit.getAttribute('aria-disabled') !== 'true' ? hit : null
    if (el !== active) {
      releaseMagnetic()
      if (el) document.documentElement.classList.add('cursor-hidden')
      active = el
    }
    if (!el) return
    // Measure the button's resting box: the rect includes the current pull,
    // which would otherwise feed back into the next offset.
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2 - (Number(gsap.getProperty(el, 'x')) || 0)
    const cy = r.top + r.height / 2 - (Number(gsap.getProperty(el, 'y')) || 0)
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    move(el, clamp(dx * PULL, MAX), clamp(dy * PULL, MAX), clamp(dx * LABEL_PULL, MAX / 2), clamp(dy * LABEL_PULL, MAX / 2))
  })

  // Pointer left the window entirely, or the tab lost focus.
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) releaseMagnetic()
  })
  window.addEventListener('blur', releaseMagnetic)
}
