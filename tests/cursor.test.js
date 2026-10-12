import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadShell, stubMatchMedia } from './helpers/dom.js'

let frames
async function boot({ reduced = false, hover = true } = {}) {
  vi.resetModules()
  stubMatchMedia((q) => (q.includes('reduce') ? reduced : q.includes('hover: hover') ? hover : false))
  frames = []
  vi.stubGlobal('requestAnimationFrame', (cb) => frames.push(cb))
  loadShell()
  const { initCursor } = await import('../src/motion/cursor.js')
  initCursor()
}
const tick = () => frames.shift()?.()
const ring = () => document.querySelector('.cursor-frame')
const dot = () => document.querySelector('.cursor')
const over = (el) => el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

afterEach(() => vi.unstubAllGlobals())

describe('custom cursor', () => {
  it('does nothing under reduced motion', async () => {
    await boot({ reduced: true })
    expect(frames).toHaveLength(0)
    expect(dot().style.transform).toBe('')
  })

  it('does nothing on touch devices', async () => {
    await boot({ hover: false })
    expect(frames).toHaveLength(0)
  })

  describe('with a fine pointer', () => {
    beforeEach(() => boot())

    it('dot tracks the pointer exactly; the frame lerps behind', () => {
      window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: 100, clientY: 50 }))
      tick()
      expect(dot().style.transform).toBe('translate(96px, 46px)')
      const first = ring().style.transform
      tick()
      expect(ring().style.transform).not.toBe(first) // still easing toward the pointer
      expect(frames).toHaveLength(1) // loop keeps scheduling itself
    })

    it('grows over interactive elements and shows VIEW over product cards', () => {
      document.body.insertAdjacentHTML('beforeend', '<button id="b">x</button><article data-card><a id="c" href="/product/x">c</a></article><p id="p">t</p>')
      over(document.getElementById('b'))
      expect(ring().classList.contains('is-hover')).toBe(true)
      over(document.getElementById('c'))
      expect(ring().classList.contains('is-label')).toBe(true)
      expect(ring().classList.contains('is-hover')).toBe(false)
      over(document.getElementById('p'))
      expect(ring().classList.contains('is-label')).toBe(false)
      expect(ring().classList.contains('is-hover')).toBe(false)
    })
  })
})
