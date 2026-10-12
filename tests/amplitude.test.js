import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const scripts = () => [...document.head.querySelectorAll('script')]
const load = async () => {
  vi.resetModules()
  await import('../src/amplitude-init.js')
}

// happy-dom (with file loading stubbed) fires each script's onload by itself,
// so the CDN globals must exist before the module runs.
beforeEach(() => {
  document.head.innerHTML = ''
  delete window._amplitudeInitialised
  window.amplitude = { init: vi.fn(), add: vi.fn() }
  window.sessionReplayPlugin = { plugin: vi.fn(() => ({})) }
})
afterEach(() => vi.restoreAllMocks())

describe('amplitude-init', () => {
  it('injects the Browser SDK script once', async () => {
    const sdk = () => scripts().filter((s) => s.src.includes('analytics-browser'))
    await load()
    expect(sdk()).toHaveLength(1)
    expect(sdk()[0].src).toMatch(/^https:\/\/cdn\.amplitude\.com\/libs\/analytics-browser-.*\.js\.gz$/)
    await load() // a second import (e.g. HMR) must not double-initialise
    expect(sdk()).toHaveLength(1)
  })

  it('initialises with the project key and autocapture, then adds Session Replay', async () => {
    await load()
    scripts()[0].onload()
    expect(window.amplitude.init).toHaveBeenCalledWith(
      '78e7be51a3d5672edae8cce7d6960b7e',
      expect.objectContaining({
        defaultTracking: true,
        autocapture: expect.objectContaining({ pageViews: true, sessions: true, formInteractions: true }),
      }),
    )
    expect(scripts().length).toBeGreaterThanOrEqual(2)
    expect(scripts()[1].src).toContain('plugin-session-replay-browser')

    const plugin = {}
    window.sessionReplayPlugin = { plugin: vi.fn(() => plugin) }
    scripts()[1].onload()
    expect(window.sessionReplayPlugin.plugin).toHaveBeenCalledWith({ sampleRate: 1 })
    expect(window.amplitude.add).toHaveBeenCalledWith(plugin)
  })

  it('keeps core analytics running if Session Replay fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await load()
    scripts()[0].onload()
    window.sessionReplayPlugin = undefined
    expect(() => scripts()[1].onload()).not.toThrow()
    expect(warn).toHaveBeenCalled()
    expect(window.amplitude.init).toHaveBeenCalled()
  })

  it('is only loaded in production builds', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const src = readFileSync(resolve(__dirname, '../src/main.js'), 'utf8')
    expect(src).toMatch(/if \(import\.meta\.env\.PROD\) \{\s*import\('\.\/amplitude-init\.js'\)/)
  })
})
