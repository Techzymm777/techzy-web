import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadShell, stubMatchMedia } from './helpers/dom.js'

// Recording fake of gsap.timeline: captures every step so the seal-cut
// choreography (targets, durations, easing) can be asserted without running it.
let timelines
vi.mock('gsap', () => {
  const timeline = (vars = {}) => {
    const tl = { vars, steps: [] }
    for (const m of ['to', 'set', 'add']) {
      tl[m] = (...args) => {
        tl.steps.push([m, ...args])
        if (m === 'add' && typeof args[0] === 'function') args[0]()
        return tl
      }
    }
    timelines.push(tl)
    return tl
  }
  return { gsap: { timeline } }
})

async function load({ reduced = false } = {}) {
  vi.resetModules()
  stubMatchMedia((q) => q.includes('reduce') && reduced)
  return import('../src/motion/transitions.js')
}

const NO_BOUNCE = /bounce|elastic|back/i

beforeEach(() => {
  timelines = []
  loadShell()
  document.body.style.overflow = ''
})
afterEach(() => vi.restoreAllMocks())

describe('transitionTo (abbreviated seal cut)', () => {
  it('sweeps the line, closes panels, swaps behind them, then opens', async () => {
    const { transitionTo } = await load()
    const swap = vi.fn()
    const done = vi.fn()
    transitionTo(swap, done)
    const [tl] = timelines
    expect(tl.vars.onComplete).toBe(done)
    expect(swap).toHaveBeenCalledTimes(1)

    const to = tl.steps.filter((s) => s[0] === 'to').map(([, target, v]) => [target, v.duration, v.ease])
    expect(to).toEqual([
      ['.veil-line', 0.45, 'power3.inOut'],
      ['.veil-panel', 0.55, 'power4.inOut'],
      ['.veil-panel', 0.8, 'power4.inOut'],
    ])
    // Swap happens after the panels are closed and before they reopen.
    const order = tl.steps.map((s) => (s[0] === 'add' ? 'swap' : `${s[0]}:${s[1]}`))
    expect(order.indexOf('swap')).toBeGreaterThan(order.indexOf('to:.veil-panel'))
    expect(order.indexOf('swap')).toBeLessThan(order.lastIndexOf('to:.veil-panel'))
    // Veil blocks clicks only while it is up.
    expect(tl.steps[0]).toEqual(['set', '#veil', { pointerEvents: 'auto' }])
    expect(tl.steps.at(-1)).toEqual(['set', '#veil', { pointerEvents: 'none' }])
  })
})

describe('runPreloader (full seal cut)', () => {
  it('is a no-op without a loader element', async () => {
    const { runPreloader } = await load()
    document.getElementById('loader').remove()
    expect(() => runPreloader()).not.toThrow()
    expect(timelines).toHaveLength(0)
  })

  it('under reduced motion, removes the loader immediately with no animation', async () => {
    const { runPreloader } = await load({ reduced: true })
    runPreloader()
    expect(document.getElementById('loader')).toBeNull()
    expect(timelines).toHaveLength(0)
    expect(document.body.style.overflow).toBe('')
  })

  it('splits TECHZY into letters, locks scroll, and cleans up on complete', async () => {
    const { runPreloader } = await load()
    runPreloader()
    const letters = [...document.querySelectorAll('#loaderMark span')].map((s) => s.textContent)
    expect(letters).toEqual(['T', 'E', 'C', 'H', 'Z', 'Y'])
    expect(document.body.style.overflow).toBe('hidden')

    timelines[0].vars.onComplete()
    expect(document.getElementById('loader')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('counts 000 → 100 with zero padding', async () => {
    const { runPreloader } = await load()
    runPreloader()
    const counter = timelines[0].steps.find((s) => s[0] === 'to' && s[2].v === 100)
    const obj = counter[1]
    obj.v = 7.4
    counter[2].onUpdate()
    expect(document.getElementById('loaderCount').textContent).toBe('007')
    obj.v = 100
    counter[2].onUpdate()
    expect(document.getElementById('loaderCount').textContent).toBe('100')
  })

  it('opens the box: top panel up, bottom panel down, structural easing, no bounce', async () => {
    const { runPreloader } = await load()
    runPreloader()
    const steps = timelines[0].steps.filter((s) => s[0] === 'to')
    expect(steps.find((s) => s[1] === '.loader-panel.top')[2]).toMatchObject({ yPercent: -100, ease: 'power4.inOut' })
    expect(steps.find((s) => s[1] === '.loader-panel.bottom')[2]).toMatchObject({ yPercent: 100, ease: 'power4.inOut' })
    steps.forEach((s) => expect(String(s[2].ease)).not.toMatch(NO_BOUNCE))
  })
})
