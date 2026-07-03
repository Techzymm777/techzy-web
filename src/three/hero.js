// Quiet field — a grid of white points, nearly still ambient wave, ripple
// following the cursor with lerp. Ported from the prototype, but using the
// npm three package with named imports so Vite tree-shakes the build.
// This module is loaded via dynamic import ONLY on the home route.
import {
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three'

// Creates the scene on the given canvas. Returns { destroy } — destroy MUST
// be called on route leave: it stops the loop, removes listeners, and
// disposes geometry, material, and renderer. `animate` is false under
// reduced motion (renders a single still frame).
export function createHero(canvas, { animate = true } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const scene = new Scene()
  const cam = new PerspectiveCamera(55, 1, 0.1, 100)
  cam.position.set(0, 2.2, 7)
  cam.lookAt(0, 0, 0)

  const COLS = 110
  const ROWS = 60
  const W = 22
  const H = 12
  const geo = new BufferGeometry()
  const pos = new Float32Array(COLS * ROWS * 3)
  let i = 0
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      pos[i++] = (x / (COLS - 1) - 0.5) * W
      pos[i++] = 0
      pos[i++] = (y / (ROWS - 1) - 0.5) * H
    }
  }
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  const mat = new PointsMaterial({ color: 0xffffff, size: 0.028, transparent: true, opacity: 0.75 })
  const points = new Points(geo, mat)
  points.position.y = -1.4
  scene.add(points)

  const mouse = { x: 0, z: 0, tx: 0, tz: 0 }
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect()
    mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * W
    mouse.tz = ((e.clientY - r.top) / r.height - 0.5) * H
  }
  window.addEventListener('pointermove', onMove)

  const resize = () => {
    const r = canvas.getBoundingClientRect()
    renderer.setSize(r.width, r.height, false)
    cam.aspect = r.width / r.height
    cam.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)
  resize()

  let raf
  let t = 0
  let alive = true
  const tick = () => {
    if (!alive) return
    t += 0.008
    mouse.x += (mouse.tx - mouse.x) * 0.06
    mouse.z += (mouse.tz - mouse.z) * 0.06
    const p = geo.attributes.position.array
    for (let k = 0; k < p.length; k += 3) {
      const x = p[k]
      const z = p[k + 2]
      const dx = x - mouse.x
      const dz = z - mouse.z
      const d = Math.sqrt(dx * dx + dz * dz)
      const ripple = Math.exp(-d * 0.9) * Math.sin(d * 3 - t * 6) * 0.5 // cursor ripple
      const ambient = Math.sin(x * 0.5 + t) * Math.cos(z * 0.6 + t * 0.7) * 0.06 // near-still field
      p[k + 1] = ambient + ripple
    }
    geo.attributes.position.needsUpdate = true
    renderer.render(scene, cam)
    raf = requestAnimationFrame(tick)
  }
  if (animate) tick()
  else renderer.render(scene, cam)

  return {
    destroy() {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
    },
  }
}
