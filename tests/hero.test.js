import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// WebGL isn't available in happy-dom, so three is replaced with light fakes
// that record construction, rendering and disposal.
const created = {}
vi.mock('three', () => {
  const track = (name, extra = {}) =>
    class {
      constructor(...args) {
        this.args = args
        Object.assign(this, { dispose: vi.fn() }, typeof extra === 'function' ? extra.call(this) : extra)
        created[name] = this
      }
    }
  return {
    WebGLRenderer: track('renderer', () => ({ setPixelRatio: vi.fn(), setSize: vi.fn(), render: vi.fn() })),
    Scene: track('scene', () => ({ add: vi.fn() })),
    PerspectiveCamera: track('camera', () => ({ position: { set: vi.fn() }, lookAt: vi.fn(), updateProjectionMatrix: vi.fn() })),
    BufferGeometry: track('geometry', function () {
      return { attributes: {}, setAttribute: (k, v) => (this.attributes[k] = v) }
    }),
    BufferAttribute: class {
      constructor(array, size) {
        Object.assign(this, { array, size, needsUpdate: false })
      }
    },
    PointsMaterial: track('material'),
    Points: track('points', { position: { y: 0 } }),
  }
})

const { createHero } = await import('../src/three/hero.js')

let frames
let canvas
beforeEach(() => {
  frames = []
  vi.stubGlobal('requestAnimationFrame', (cb) => frames.push(cb))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  canvas = document.createElement('canvas')
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1100, height: 600 })
  document.body.appendChild(canvas)
})
afterEach(() => vi.unstubAllGlobals())

describe('createHero (quiet field)', () => {
  it('builds a 110×60 grid of white points on a transparent canvas', () => {
    createHero(canvas, { animate: false }).destroy()
    expect(created.renderer.args[0]).toMatchObject({ canvas, alpha: true })
    const pos = created.geometry.attributes.position
    expect(pos.array).toHaveLength(110 * 60 * 3)
    expect(pos.size).toBe(3)
    expect(created.material.args[0]).toMatchObject({ color: 0xffffff })
  })

  it('caps pixel ratio at 2 and sizes to the canvas box', () => {
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 })
    createHero(canvas, { animate: false }).destroy()
    expect(created.renderer.setPixelRatio).toHaveBeenCalledWith(2)
    expect(created.renderer.setSize).toHaveBeenCalledWith(1100, 600, false)
    expect(created.camera.aspect).toBeCloseTo(1100 / 600)
  })

  it('renders exactly one still frame when not animating (reduced motion)', () => {
    createHero(canvas, { animate: false }).destroy()
    expect(created.renderer.render).toHaveBeenCalledTimes(1)
    expect(frames).toHaveLength(0)
  })

  it('animates the field, and the cursor ripple displaces points', () => {
    const hero = createHero(canvas)
    const y = () => Array.from(created.geometry.attributes.position.array.filter((_, i) => i % 3 === 1))
    const before = y()
    window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: 550, clientY: 300 }))
    for (let i = 0; i < 20; i++) frames.shift()()
    expect(created.renderer.render.mock.calls.length).toBeGreaterThan(20)
    expect(created.geometry.attributes.position.needsUpdate).toBe(true)
    expect(y()).not.toEqual(before)
    // Nearly still: no point is displaced more than the ripple + ambient amplitude.
    expect(Math.max(...y().map(Math.abs))).toBeLessThanOrEqual(0.56)
    hero.destroy()
  })

  it('destroy stops the loop, removes listeners, and disposes GPU resources', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const hero = createHero(canvas)
    hero.destroy()
    expect(cancelAnimationFrame).toHaveBeenCalled()
    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(created.geometry.dispose).toHaveBeenCalled()
    expect(created.material.dispose).toHaveBeenCalled()
    expect(created.renderer.dispose).toHaveBeenCalled()
    // A frame already queued before destroy does nothing.
    const renders = created.renderer.render.mock.calls.length
    frames.shift()?.()
    expect(created.renderer.render.mock.calls.length).toBe(renders)
    remove.mockRestore()
  })

  it('re-sizes on window resize', () => {
    const hero = createHero(canvas, { animate: false })
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 400 })
    window.dispatchEvent(new Event('resize'))
    expect(created.renderer.setSize).toHaveBeenLastCalledWith(400, 400, false)
    expect(created.camera.aspect).toBe(1)
    hero.destroy()
  })
})
