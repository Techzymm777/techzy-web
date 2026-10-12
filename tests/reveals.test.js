import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { stubMatchMedia } from './helpers/dom.js'

async function load({ reduced = false } = {}) {
  vi.resetModules()
  stubMatchMedia((q) => q.includes('reduce') && reduced)
  // main.js registers ScrollTrigger at boot; mirror that here.
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)
  const mod = await import('../src/motion/reveals.js')
  return { ...mod, gsap, ScrollTrigger }
}

function page() {
  document.body.innerHTML = `
    <main id="app">
      <h1 class="split" id="h">Laptops  for modern work</h1>
      <p data-reveal id="r">text</p>
      <div data-clip id="c"></div>
      <h2 class="split" id="below">Below the fold</h2>
    </main>`
  return document.getElementById('app')
}

// Only the h1/p/div are in the first viewport; #below is far down.
function layout() {
  for (const el of document.querySelectorAll('#app > *')) {
    const top = el.id === 'below' ? 5000 : 10
    el.getBoundingClientRect = () => ({ top, bottom: top + 50 })
  }
}

beforeEach(() => {
  document.documentElement.lang = 'en'
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
})
afterEach(() => vi.restoreAllMocks())

describe('splitAll', () => {
  it('wraps each word in a mask span, collapsing whitespace', async () => {
    const { splitAll } = await load()
    const root = page()
    splitAll(root)
    const words = [...root.querySelectorAll('#h .w > i')].map((i) => i.textContent)
    expect(words).toEqual(['Laptops', 'for', 'modern', 'work'])
    expect(root.querySelector('#h').textContent).toBe('Laptops for modern work')
  })
})

describe('applyReveals', () => {
  it('returns null and leaves markup alone under reduced motion', async () => {
    const { applyReveals } = await load({ reduced: true })
    const root = page()
    const before = root.innerHTML
    expect(applyReveals(root)).toBeNull()
    expect(root.innerHTML).toBe(before)
  })

  it('returns a gsap context whose revert() is the cleanup contract', async () => {
    const { applyReveals, ScrollTrigger } = await load()
    ScrollTrigger.getAll().forEach((st) => st.kill())
    const root = page()
    const ctx = applyReveals(root)
    expect(ctx).not.toBeNull()
    // One scroll-triggered tween per split heading, reveal block and clip frame.
    expect(ctx.getTweens()).toHaveLength(4)
    expect(ScrollTrigger.getAll()).toHaveLength(4)
    ctx.revert()
    // Route-change cleanup: no tween or ScrollTrigger survives.
    expect(ctx.getTweens()).toHaveLength(0)
    expect(ScrollTrigger.getAll()).toHaveLength(0)
  })

  it('on the hard load, first-viewport content renders settled (LCP is never hidden)', async () => {
    const { applyReveals } = await load()
    const root = page()
    layout()
    applyReveals(root, true)
    expect(root.querySelector('#h').classList.contains('split')).toBe(false)
    expect(root.querySelector('#r').hasAttribute('data-reveal')).toBe(false)
    expect(root.querySelector('#c').hasAttribute('data-clip')).toBe(false)
    // Below-fold keeps its reveal.
    expect(root.querySelector('#below').classList.contains('split')).toBe(true)
    expect(root.querySelectorAll('#below .w')).toHaveLength(3)
  })

  it('SPA navigations keep the full reveal treatment', async () => {
    const { applyReveals } = await load()
    const root = page()
    layout()
    applyReveals(root, false)
    expect(root.querySelector('#h').classList.contains('split')).toBe(true)
    expect(root.querySelector('#r').hasAttribute('data-reveal')).toBe(true)
  })

  it('Burmese headings fall back to fade-up (word masks clip stacked marks)', async () => {
    const { applyReveals } = await load()
    document.documentElement.lang = 'my'
    const root = page()
    applyReveals(root)
    const h = root.querySelector('#h')
    expect(h.classList.contains('split')).toBe(false)
    expect(h.hasAttribute('data-reveal')).toBe(true)
    expect(h.querySelector('.w')).toBeNull()
  })
})
