// Ambient sound behind the nav toggle. OFF by default; starts only on user
// tap (satisfies autoplay policies). Plays the licensed loop from
// /public/audio/ ("Cinematic Space Journey – Interstellar Odyssey",
// Pixabay Content License — free for commercial use, no attribution; see
// DEPLOY.md) with the same fade-in/out and tab-blur suspend the original
// Web Audio drone had.

const TRACK = '/audio/ambient-loop.mp3'
const TARGET_VOLUME = 0.35

let el = null
let fadeRaf = 0
let on = false

function fadeTo(target, ms, done) {
  cancelAnimationFrame(fadeRaf)
  const from = el.volume
  const t0 = performance.now()
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms)
    el.volume = from + (target - from) * k
    if (k < 1) fadeRaf = requestAnimationFrame(step)
    else done?.()
  }
  fadeRaf = requestAnimationFrame(step)
}

function startAudio() {
  if (!el) {
    el = new Audio(TRACK)
    el.loop = true
    el.preload = 'auto'
  }
  el.volume = 0
  el.play().catch(() => {}) // fetch/decode failure = silence, never a crash
  fadeTo(TARGET_VOLUME, 2000)
}

function stopAudio() {
  if (!el) return
  fadeTo(0, 800, () => el.pause())
}

export function initSound() {
  const btn = document.getElementById('soundToggle')
  const label = document.getElementById('soundLabel')
  if (!btn || !label) return

  btn.addEventListener('click', () => {
    on = !on
    if (on) startAudio()
    else stopAudio()
    btn.setAttribute('aria-pressed', String(on))
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on')
    label.textContent = on ? 'Sound on' : 'Sound off'
  })

  // Suspend on tab blur, resume on focus.
  document.addEventListener('visibilitychange', () => {
    if (!el || !on) return
    if (document.hidden) el.pause()
    else el.play().catch(() => {})
  })
}
