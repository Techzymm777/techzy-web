// Ambient sound behind the nav toggle (EQ bars only, no text label). ON by
// default: autoplay is attempted at boot, and when the browser blocks it
// (no user gesture yet) playback starts at the first interaction instead.
// Plays the licensed loop from /public/audio/ ("Cinematic Space Journey –
// Interstellar Odyssey", Pixabay Content License — free for commercial use,
// no attribution; see DEPLOY.md) with a 2s fade in / 0.8s fade out and
// suspend on tab blur.

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
    document.body.appendChild(el) // no UI of its own; in-DOM for inspectability
  }
  el.volume = 0
  const playing = el.play() ?? Promise.resolve()
  fadeTo(TARGET_VOLUME, 2000)
  return playing
}

function stopAudio() {
  if (!el) return
  fadeTo(0, 800, () => el.pause())
}

export function initSound() {
  const btn = document.getElementById('soundToggle')
  if (!btn) return

  const setState = (next) => {
    on = next
    btn.setAttribute('aria-pressed', String(on))
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on')
  }

  btn.addEventListener('click', () => {
    setState(!on)
    if (on) startAudio().catch(() => {})
    else stopAudio()
  })

  // Default ON. Browsers reject play() before any user gesture — in that
  // case arm one-shot listeners and start at the first interaction, unless
  // the user has toggled sound off (or the toggle itself is the gesture:
  // its own click handler owns the state then).
  setState(true)
  startAudio().catch(() => {
    const cleanup = () => {
      window.removeEventListener('pointerdown', arm, true)
      window.removeEventListener('keydown', arm, true)
    }
    const arm = (e) => {
      cleanup()
      if (!on || btn.contains(e.target)) return
      startAudio().catch(() => {})
    }
    window.addEventListener('pointerdown', arm, true)
    window.addEventListener('keydown', arm, true)
  })

  // Suspend on tab blur, resume on focus.
  document.addEventListener('visibilitychange', () => {
    if (!el || !on) return
    if (document.hidden) el.pause()
    else el.play().catch(() => {})
  })
}
