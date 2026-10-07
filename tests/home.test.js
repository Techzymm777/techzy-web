import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { stubMatchMedia, flush } from './helpers/dom.js'

// Fake marquee tween + gsap property store so pause/resume/drag are observable.
const tween = { pause: vi.fn(), resume: vi.fn(), kill: vi.fn(), progress: vi.fn() }
const props = new WeakMap()
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(() => tween),
    set: vi.fn((el, v) => props.set(el, { ...props.get(el), ...v })),
    getProperty: vi.fn((el, k) => props.get(el)?.[k] ?? 0),
  },
}))
const destroy = vi.fn()
const createHero = vi.fn(() => ({ destroy }))
vi.mock('../src/three/hero.js', () => ({ createHero }))

let home
let gsap
async function boot({ reduced = false } = {}) {
  vi.resetModules()
  stubMatchMedia((q) => q.includes('reduce') && reduced)
  ;({ gsap } = await import('gsap'))
  const i18n = await import('../src/i18n.js')
  i18n.initI18n()
  home = await import('../src/pages/home.js')
  document.body.innerHTML = `<main id="app">${home.render()}</main>`
  const track = document.getElementById('marquee')
  Object.defineProperty(track, 'scrollWidth', { configurable: true, value: 2000 })
  home.mount()
}

const $ = (s) => document.querySelector(s)
const lightbox = () => $('#lightbox')
const isOpen = () => lightbox().classList.contains('is-open')
const firstShot = () => $('#marquee .shot[role="button"]')
const pointer = (type, init) => {
  const e = new Event(type, { bubbles: true })
  Object.assign(e, { pointerId: 1, button: 0, ...init })
  $('#marqueeWrap').dispatchEvent(e)
}

beforeEach(() => {
  window.localStorage.clear()
  vi.clearAllMocks()
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    cb()
    return 1
  })
})
afterEach(() => {
  home?.unmount()
  vi.unstubAllGlobals()
  document.body.className = ''
})

describe('home marquee', () => {
  beforeEach(() => boot())

  it('loops the strip by half its width over 28s, linear, forever', () => {
    expect(gsap.to).toHaveBeenCalledWith($('#marquee'), { x: -1000, duration: 28, ease: 'none', repeat: -1 })
  })

  it('pauses on hover/focus and resumes on leave', () => {
    $('#marqueeWrap').dispatchEvent(new Event('mouseenter'))
    expect(tween.pause).toHaveBeenCalled()
    $('#marqueeWrap').dispatchEvent(new Event('mouseleave'))
    expect(tween.resume).toHaveBeenCalled()
    tween.pause.mockClear()
    firstShot().dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(tween.pause).toHaveBeenCalled()
  })

  it('dragging moves the strip, wraps seamlessly, and the drag does not open the lightbox', () => {
    pointer('pointerdown', { clientX: 500 })
    expect(tween.pause).toHaveBeenCalled()
    expect($('#marqueeWrap').classList.contains('is-dragging')).toBe(true)
    pointer('pointermove', { clientX: 300 })
    expect(gsap.set).toHaveBeenLastCalledWith($('#marquee'), { x: -200 })
    pointer('pointermove', { clientX: 1700 }) // +1200 wraps into (-1000, 0]
    expect(gsap.set).toHaveBeenLastCalledWith($('#marquee'), { x: -800 })
    pointer('pointerup', {})
    expect($('#marqueeWrap').classList.contains('is-dragging')).toBe(false)
    expect(tween.progress).toHaveBeenCalled()
    firstShot().click()
    expect(isOpen()).toBe(false)
    // The suppression is one-shot: the next real tap opens it.
    firstShot().click()
    expect(isOpen()).toBe(true)
  })

  it('a tiny pointer wobble still counts as a tap', () => {
    pointer('pointerdown', { clientX: 500 })
    pointer('pointermove', { clientX: 510 })
    pointer('pointerup', {})
    firstShot().click()
    expect(isOpen()).toBe(true)
  })

  it('ignores moves from other pointers and non-primary buttons', () => {
    pointer('pointerdown', { clientX: 500, button: 2 })
    expect($('#marqueeWrap').classList.contains('is-dragging')).toBe(false)
    pointer('pointerdown', { clientX: 500 })
    gsap.set.mockClear()
    pointer('pointermove', { clientX: 100, pointerId: 9 })
    expect(gsap.set).not.toHaveBeenCalled()
  })
})

describe('testimonial lightbox', () => {
  beforeEach(() => boot())

  it('opens on click with the testimonial image, focuses close, pauses the marquee', () => {
    const shot = firstShot()
    shot.focus()
    shot.click()
    expect(isOpen()).toBe(true)
    expect(lightbox().getAttribute('aria-hidden')).toBe('false')
    expect(document.body.classList.contains('modal-open')).toBe(true)
    expect($('#lightboxImg').getAttribute('src')).toContain('/assets/images/testimonials/feedback-01.jpg')
    expect($('#lightboxImg').alt).toBe(shot.querySelector('img').alt)
    expect(document.activeElement).toBe($('.lightbox-close'))
    expect(tween.pause).toHaveBeenCalled()
  })

  it.each(['Enter', ' '])('opens from the keyboard with %j', (key) => {
    const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    firstShot().dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
    expect(isOpen()).toBe(true)
  })

  it.each([
    ['the close button', () => $('.lightbox-close').click()],
    ['the backdrop', () => lightbox().click()],
    ['Escape', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))],
  ])('closes via %s and returns focus to the testimonial', (_n, closeIt) => {
    const shot = firstShot()
    shot.focus()
    shot.click()
    closeIt()
    expect(isOpen()).toBe(false)
    expect(lightbox().getAttribute('aria-hidden')).toBe('true')
    expect(document.body.classList.contains('modal-open')).toBe(false)
    expect($('#lightboxImg').getAttribute('src')).toBe('')
    expect(document.activeElement).toBe(shot)
  })

  it('clicking the image itself does not close', () => {
    firstShot().click()
    $('#lightboxImg').click()
    expect(isOpen()).toBe(true)
  })

  it('traps Tab on the close button while open', () => {
    firstShot().click()
    const e = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
    document.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe($('.lightbox-close'))
  })

  it('leaves Tab alone while closed', () => {
    const e = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
    document.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(false)
  })
})

describe('three.js hero lifecycle', () => {
  it('lazy-loads the quiet field after first paint and destroys it on leave', async () => {
    await boot()
    await flush()
    await flush()
    expect(createHero).toHaveBeenCalledWith($('#webgl'), { animate: true })
    home.unmount()
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(tween.kill).toHaveBeenCalled()
    home = null
  })

  it('does not create the scene if the user navigated away before the chunk arrived', async () => {
    await boot()
    home.unmount()
    await flush()
    await flush()
    expect(createHero).not.toHaveBeenCalled()
    home = null
  })

  it('unmount removes the document key listener and the scroll lock', async () => {
    await boot()
    firstShot().click()
    home.unmount()
    home = null
    expect(document.body.classList.contains('modal-open')).toBe(false)
    const e = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
    document.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(false)
  })
})

describe('home under reduced motion', () => {
  beforeEach(() => boot({ reduced: true }))

  it('renders the strip once, with no loop tween', () => {
    expect($('#marquee').querySelectorAll('.shot')).toHaveLength(10)
    expect(gsap.to).not.toHaveBeenCalled()
  })

  it('renders a single still frame of the field', async () => {
    await flush()
    await flush()
    expect(createHero).toHaveBeenCalledWith($('#webgl'), { animate: false })
  })

  it('dragging is left to native scrolling', () => {
    pointer('pointerdown', { clientX: 500 })
    expect($('#marqueeWrap').classList.contains('is-dragging')).toBe(false)
  })

  it('the lightbox still works', () => {
    firstShot().click()
    expect(isOpen()).toBe(true)
  })
})
