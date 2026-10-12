import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { stubMatchMedia } from './helpers/dom.js'

// quickTo is replaced with a recorder: each (target, prop) gets a setter
// that stores the latest value, so the pull can be asserted without ticking.
const values = new Map()
const key = (el, prop) => `${el.dataset.k}.${prop}`
vi.mock('gsap', () => ({
  gsap: {
    quickTo: (target, prop) => (v) => values.set(key(target, prop), v),
    getProperty: (target, prop) => values.get(key(target, prop)) ?? 0,
  },
}))

let mod
async function boot({ reduced = false, hover = true } = {}) {
  vi.resetModules()
  values.clear()
  stubMatchMedia((q) => (q.includes('reduce') ? reduced : q.includes('hover: hover') && q.includes('pointer: fine') ? hover : false))
  document.documentElement.classList.remove('cursor-hidden')
  document.body.innerHTML = `
    <nav class="nav"><button class="lang" data-k="lang">MY</button></nav>
    <a class="btn" href="/products" data-k="btn"><span data-k="label">Browse</span></a>
    <button class="tab" data-k="tab">All</button>
    <button class="btn" disabled data-k="off"><span>Off</span></button>
    <p data-k="p">text</p>`
  // Every element is a 200×40 box at (100, 100) — centre (200, 120).
  document.querySelectorAll('[data-k]').forEach((el) => {
    el.getBoundingClientRect = () => ({ left: 100, top: 100, width: 200, height: 40 })
  })
  mod = await import('../src/motion/magnetic.js')
  mod.initMagnetic()
}

const el = (k) => document.querySelector(`[data-k="${k}"]`)
const move = (target, x, y, pointerType = 'mouse') =>
  target.dispatchEvent(Object.assign(new Event('pointermove', { bubbles: true }), { clientX: x, clientY: y, pointerType }))
const hidden = () => document.documentElement.classList.contains('cursor-hidden')

// Each boot re-imports the module, which wires document/window listeners;
// track and remove them so earlier boots can't react to later tests' events.
let added = []
beforeEach(() => {
  added = []
  for (const target of [document, window]) {
    const orig = target.addEventListener
    vi.spyOn(target, 'addEventListener').mockImplementation(function (...args) {
      added.push([target, ...args])
      return orig.apply(target, args)
    })
  }
})
afterEach(() => {
  mod?.releaseMagnetic()
  vi.restoreAllMocks()
  for (const [target, type, fn, opts] of added) target.removeEventListener(type, fn, opts)
})

describe('magnetic buttons', () => {
  beforeEach(() => boot())

  it('hides the cursor and pulls a .btn toward the pointer, label further', () => {
    move(el('label'), 230, 130) // 30px right, 10px below centre
    expect(hidden()).toBe(true)
    expect(values.get('btn.x')).toBeCloseTo(9)
    expect(values.get('btn.y')).toBeCloseTo(3)
    expect(values.get('label.x')).toBeCloseTo(4.5)
    expect(values.get('label.y')).toBeCloseTo(1.5)
  })

  it('caps the pull for big offsets', () => {
    move(el('btn'), 300, 140) // 100px right
    expect(values.get('btn.x')).toBe(16)
    expect(values.get('label.x')).toBe(8)
  })

  it('measures from the resting box, not the pulled one', () => {
    values.set('btn.x', 16) // already pulled 16px right
    el('btn').getBoundingClientRect = () => ({ left: 116, top: 100, width: 200, height: 40 })
    move(el('btn'), 230, 120)
    expect(values.get('btn.x')).toBeCloseTo(9)
  })

  it('also applies to filter tabs and nav icon buttons (no label layer)', () => {
    move(el('tab'), 220, 120)
    expect(values.get('tab.x')).toBeCloseTo(6)
    move(el('lang'), 180, 120)
    expect(values.get('lang.x')).toBeCloseTo(-6)
    expect(values.get('tab.x')).toBe(0) // the previous one settled back
  })

  it('leaving a button settles it back and restores the cursor', () => {
    move(el('btn'), 230, 130)
    move(el('p'), 230, 130)
    expect(hidden()).toBe(false)
    expect(values.get('btn.x')).toBe(0)
    expect(values.get('btn.y')).toBe(0)
    expect(values.get('label.x')).toBe(0)
  })

  it('leaving the window or losing focus releases too', () => {
    move(el('btn'), 230, 130)
    document.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: null }))
    expect(hidden()).toBe(false)
    move(el('btn'), 230, 130)
    window.dispatchEvent(new Event('blur'))
    expect(hidden()).toBe(false)
  })

  it('ignores disabled buttons, plain content, and touch/pen pointers', () => {
    move(el('off'), 230, 130)
    expect(hidden()).toBe(false)
    expect(values.has('off.x')).toBe(false)
    move(el('p'), 230, 130)
    expect(hidden()).toBe(false)
    move(el('btn'), 230, 130, 'touch')
    move(el('btn'), 230, 130, 'pen')
    expect(values.has('btn.x')).toBe(false)
  })

  it('releaseMagnetic (route change) restores the cursor even if the button is gone', () => {
    move(el('btn'), 230, 130)
    el('btn').remove()
    mod.releaseMagnetic()
    expect(hidden()).toBe(false)
  })
})

describe('magnetic buttons are off', () => {
  it('under reduced motion', async () => {
    await boot({ reduced: true })
    values.clear()
    move(el('label'), 230, 130)
    expect(values.size).toBe(0)
  })

  it('on touch-only devices', async () => {
    await boot({ hover: false })
    values.clear()
    move(el('label'), 230, 130)
    expect(values.size).toBe(0)
  })
})
