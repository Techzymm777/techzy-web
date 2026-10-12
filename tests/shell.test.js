import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadShell, stubMatchMedia } from './helpers/dom.js'
import en from '../content/copy.en.json'
import my from '../content/copy.my.json'

let mm
let onLangChange
let i18n

beforeEach(async () => {
  vi.resetModules()
  window.localStorage.clear()
  document.body.style.overflow = ''
  mm = stubMatchMedia(() => false)
  loadShell()
  i18n = await import('../src/i18n.js')
  i18n.initI18n()
  const { initShell } = await import('../src/shell.js')
  onLangChange = vi.fn()
  initShell({ onLangChange })
})

const $ = (s) => document.querySelector(s)
const key = (k) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))

describe('language toggle', () => {
  it('both toggles (nav + dock) show the other language with a matching accessible name', () => {
    const btns = document.querySelectorAll('[data-lang-toggle]')
    expect(btns).toHaveLength(2)
    btns.forEach((b) => {
      expect(b.textContent).toBe('MY')
      expect(b.getAttribute('aria-label').startsWith('MY')).toBe(true)
      expect(b.getAttribute('aria-label')).toContain(en['common.langToggleAria'])
    })
  })

  it('switches language, updates both toggles, re-renders the route', () => {
    document.querySelectorAll('[data-lang-toggle]')[1].click()
    expect(i18n.getLang()).toBe('my')
    expect(document.documentElement.lang).toBe('my')
    document.querySelectorAll('[data-lang-toggle]').forEach((b) => expect(b.textContent).toBe('EN'))
    expect($('[data-nav="home"]').textContent).toBe(my['nav.home'])
    expect(onLangChange).toHaveBeenCalledTimes(1)

    $('[data-lang-toggle]').click()
    expect(i18n.getLang()).toBe('en')
    expect($('[data-lang-toggle]').textContent).toBe('MY')
  })
})

describe('off-canvas menu', () => {
  const btn = () => $('#menuToggle')
  const menu = () => $('#menu')

  it('opens: aria-expanded, scroll lock, focus moves into the menu', () => {
    btn().click()
    expect(menu().classList.contains('is-open')).toBe(true)
    expect(btn().getAttribute('aria-expanded')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(menu().querySelector('a'))
  })

  it('closes on second toggle click and returns focus to the toggle', () => {
    btn().click()
    btn().click()
    expect(menu().classList.contains('is-open')).toBe(false)
    expect(btn().getAttribute('aria-expanded')).toBe('false')
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(btn())
  })

  it('closes on Escape, only when open', () => {
    key('Escape')
    expect(btn().getAttribute('aria-expanded')).toBe('false')
    btn().click()
    key('Escape')
    expect(menu().classList.contains('is-open')).toBe(false)
  })

  it('closes when a menu link is clicked', () => {
    btn().click()
    menu().querySelector('a').click()
    expect(menu().classList.contains('is-open')).toBe(false)
  })

  it('releases the scroll lock when resized to desktop', () => {
    btn().click()
    mm.fire('(min-width: 1025px)', true)
    expect(menu().classList.contains('is-open')).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })
})

describe('scroll behaviour', () => {
  const scrollTo = (y) => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
    window.dispatchEvent(new Event('scroll'))
  }

  it('hides the nav scrolling down past 160px and shows it scrolling up', () => {
    scrollTo(100)
    expect($('#nav').classList.contains('is-hidden')).toBe(false)
    scrollTo(400)
    expect($('#nav').classList.contains('is-hidden')).toBe(true)
    scrollTo(300)
    expect($('#nav').classList.contains('is-hidden')).toBe(false)
  })

  it('drives the progress bar width', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 })
    scrollTo(500)
    expect($('#progress').style.width).toBe('50%')
  })

  it('progress stays 0 on pages shorter than the viewport', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 500 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 })
    scrollTo(0)
    expect($('#progress').style.width).toBe('0%')
  })
})

describe('footer', () => {
  it('shows the current year', () => {
    expect($('#year').textContent).toBe(String(new Date().getFullYear()))
  })

  it('back-to-top (footer + dock) scrolls up smoothly and focuses <main>', () => {
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const links = document.querySelectorAll('[data-back-to-top]')
    expect(links).toHaveLength(2)
    links.forEach((a) => {
      spy.mockClear()
      const e = new MouseEvent('click', { bubbles: true, cancelable: true })
      a.dispatchEvent(e)
      expect(e.defaultPrevented).toBe(true)
      expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
      expect(document.activeElement).toBe($('#app'))
    })
    spy.mockRestore()
  })

  it('back-to-top jumps instantly under reduced motion', async () => {
    vi.resetModules()
    stubMatchMedia((q) => q.includes('prefers-reduced-motion: reduce'))
    loadShell()
    const { initShell } = await import('../src/shell.js')
    initShell({ onLangChange: () => {} })
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    $('#backToTop').click()
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    spy.mockRestore()
  })
})
