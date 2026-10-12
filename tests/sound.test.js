import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadShell } from './helpers/dom.js'

// Fake <audio>: play() resolves or rejects (autoplay policy) per test.
let autoplayAllowed
let audios
class FakeAudio {
  constructor(src) {
    this.src = src
    this.volume = 1
    this.paused = true
    this.play = vi.fn(() => {
      if (!autoplayAllowed) return Promise.reject(new DOMException('blocked', 'NotAllowedError'))
      this.paused = false
      return Promise.resolve()
    })
    this.pause = vi.fn(() => {
      this.paused = true
    })
    audios.push(this)
  }
}

let initSound
const btns = () => [...document.querySelectorAll('[data-sound-toggle]')]
const flush = () => new Promise((r) => setTimeout(r, 0))

beforeEach(async () => {
  vi.resetModules()
  audios = []
  autoplayAllowed = true
  vi.stubGlobal('Audio', FakeAudio)
  // Fades complete in a single synchronous frame.
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    cb(performance.now() + 10_000)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
  // document.body.appendChild(el) needs a real Node; keep the fake out of the DOM.
  vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n)
  loadShell()
  ;({ initSound } = await import('../src/motion/sound.js'))
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('sound', () => {
  it('is a no-op without toggles', () => {
    document.querySelectorAll('[data-sound-toggle]').forEach((b) => b.remove())
    initSound()
    expect(audios).toHaveLength(0)
  })

  it('defaults ON: both toggles pressed, ambient loop plays and fades to 0.35', () => {
    initSound()
    btns().forEach((b) => {
      expect(b.getAttribute('aria-pressed')).toBe('true')
      expect(b.getAttribute('aria-label')).toBe('Turn sound off')
    })
    expect(audios).toHaveLength(1)
    expect(audios[0].src).toBe('/audio/ambient-loop.m4a')
    expect(audios[0].loop).toBe(true)
    expect(audios[0].play).toHaveBeenCalled()
    expect(audios[0].volume).toBeCloseTo(0.35)
  })

  it('the track file exists in /public', async () => {
    const { existsSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    expect(existsSync(resolve(__dirname, '../public/audio/ambient-loop.m4a'))).toBe(true)
  })

  it('toggle off fades out and pauses; toggle on resumes; both toggles stay in sync', () => {
    initSound()
    btns()[0].click()
    btns().forEach((b) => {
      expect(b.getAttribute('aria-pressed')).toBe('false')
      expect(b.getAttribute('aria-label')).toBe('Turn sound on')
    })
    expect(audios[0].volume).toBe(0)
    expect(audios[0].pause).toHaveBeenCalled()

    btns()[1].click()
    btns().forEach((b) => expect(b.getAttribute('aria-pressed')).toBe('true'))
    expect(audios).toHaveLength(1) // reuses the same element
    expect(audios[0].play).toHaveBeenCalledTimes(2)
  })

  it('when autoplay is blocked, starts on the first user interaction', async () => {
    autoplayAllowed = false
    initSound()
    await flush()
    autoplayAllowed = true
    audios[0].play.mockClear()
    window.dispatchEvent(new Event('pointerdown'))
    expect(audios[0].play).toHaveBeenCalledTimes(1)
    // One-shot: later interactions don't restart it.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(audios[0].play).toHaveBeenCalledTimes(1)
  })

  it('a first interaction does not start sound if the user turned it off', async () => {
    autoplayAllowed = false
    initSound()
    await flush()
    btns()[0].click() // off — this click is itself the gesture
    autoplayAllowed = true
    audios[0].play.mockClear()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(audios[0].play).not.toHaveBeenCalled()
  })

  it('pauses when the tab is hidden and resumes when visible', () => {
    initSound()
    const hidden = (v) => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: v })
      document.dispatchEvent(new Event('visibilitychange'))
    }
    hidden(true)
    expect(audios[0].pause).toHaveBeenCalled()
    audios[0].play.mockClear()
    hidden(false)
    expect(audios[0].play).toHaveBeenCalled()
  })

  it('stays paused on return to the tab when sound is off', () => {
    initSound()
    btns()[0].click()
    audios[0].play.mockClear()
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(audios[0].play).not.toHaveBeenCalled()
  })
})
