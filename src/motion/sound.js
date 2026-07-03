// Ambient sound engine behind the nav toggle. OFF by default; starts only
// on user tap (satisfies autoplay policies). Currently a Web Audio drone
// (two detuned sines + a low triangle behind a slowly breathing lowpass),
// ported from the prototype.
//
// To swap in a licensed track later: replace startAudio/stopAudio with an
// <audio loop src="/audio/track.mp3"> element and call .play()/.pause(),
// keeping the same fade-in/out and the visibilitychange suspend below.

let audio = null

function startAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 520
  filter.Q.value = 0.4
  filter.connect(master)

  const voices = [[110, 'sine', 0.5], [110.7, 'sine', 0.5], [55, 'triangle', 0.35]].map(([f, type, g]) => {
    const o = ctx.createOscillator()
    const vg = ctx.createGain()
    o.type = type
    o.frequency.value = f
    vg.gain.value = g
    o.connect(vg)
    vg.connect(filter)
    o.start()
    return o
  })

  // Slow breathing on the filter so the pad never feels static.
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.05
  lfoGain.gain.value = 180
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2) // gentle fade in
  audio = { ctx, master, voices, lfo }
}

function stopAudio() {
  if (!audio) return
  const { ctx, master } = audio
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
  setTimeout(() => ctx.close(), 900)
  audio = null
}

export function initSound() {
  const btn = document.getElementById('soundToggle')
  const label = document.getElementById('soundLabel')
  if (!btn || !label) return

  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') === 'true'
    if (on) stopAudio()
    else startAudio()
    btn.setAttribute('aria-pressed', String(!on))
    btn.setAttribute('aria-label', on ? 'Turn sound on' : 'Turn sound off')
    label.textContent = on ? 'Sound off' : 'Sound on'
  })

  // Suspend on tab blur, resume on focus.
  document.addEventListener('visibilitychange', () => {
    if (!audio) return
    if (document.hidden) audio.ctx.suspend()
    else audio.ctx.resume()
  })
}
