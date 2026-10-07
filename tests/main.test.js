import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadShell, stubMatchMedia } from './helpers/dom.js'
import products from '../content/products.json'
import careers from '../content/careers.json'
import en from '../content/copy.en.json'
import my from '../content/copy.my.json'

// main.js is the composition root: boot order, route rendering, titles,
// nav state, page cleanup and the seal-cut transition handshake. Motion
// modules are stubbed so the wiring itself is what's under test.
const revert = vi.fn()
const applyReveals = vi.fn(() => ({ revert }))
const transitionTo = vi.fn()
const runPreloader = vi.fn()
const initCursor = vi.fn()
const initSound = vi.fn()
vi.mock('../src/motion/reveals.js', () => ({ applyReveals: (...a) => applyReveals(...a) }))
vi.mock('../src/motion/transitions.js', () => ({ transitionTo: (...a) => transitionTo(...a), runPreloader: () => runPreloader() }))
vi.mock('../src/motion/cursor.js', () => ({ initCursor: () => initCursor() }))
vi.mock('../src/motion/sound.js', () => ({ initSound: () => initSound() }))
vi.mock('../src/three/hero.js', () => ({ createHero: () => ({ destroy() {} }) }))

let main
async function boot(path = '/', { reduced = false } = {}) {
  vi.resetModules()
  vi.clearAllMocks()
  window.localStorage.clear()
  stubMatchMedia((q) => q.includes('reduce') && reduced)
  window.history.replaceState({}, '', path)
  loadShell()
  main = await import('../src/main.js')
}

const $ = (s) => document.querySelector(s)
const clickLink = (href) => {
  const a = document.createElement('a')
  a.setAttribute('href', href)
  $('#app').appendChild(a)
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
}
const current = () => [...document.querySelectorAll('[data-nav][aria-current="page"]')].map((a) => a.dataset.nav)

// Each boot re-imports main.js, which wires document/window listeners
// (router, shell). Track them so one test's app can't react to the next one's clicks.
let added
beforeEach(() => {
  added = []
  for (const target of [document, window]) {
    const orig = target.addEventListener
    vi.spyOn(target, 'addEventListener').mockImplementation(function (...args) {
      added.push([target, ...args])
      return orig.apply(target, args)
    })
  }
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.stubGlobal('requestAnimationFrame', () => 1)
})
afterEach(() => {
  vi.restoreAllMocks()
  for (const [target, type, fn, opts] of added) target.removeEventListener(type, fn, opts)
  vi.unstubAllGlobals()
})

describe('boot', () => {
  it('initialises every subsystem and renders the landing route instantly', async () => {
    await boot('/about')
    expect(initSound).toHaveBeenCalledTimes(1)
    expect(initCursor).toHaveBeenCalledTimes(1)
    expect(runPreloader).toHaveBeenCalledTimes(1)
    expect($('#app h1').textContent).toBe(en['about.hero.title'])
    expect(transitionTo).not.toHaveBeenCalled() // the preloader covers the first render
    expect(applyReveals).toHaveBeenCalledWith($('#app'), true)
    expect(main.getCurrentRoute()).toEqual({ name: 'about' })
  })

  it('restores the saved language before the first render', async () => {
    window.localStorage.setItem('lang', 'my')
    vi.resetModules()
    stubMatchMedia(() => false)
    window.history.replaceState({}, '', '/')
    loadShell()
    await import('../src/main.js')
    expect(document.documentElement.lang).toBe('my')
    expect($('[data-nav="home"]').textContent).toBe(my['nav.home'])
  })
})

describe('document titles', () => {
  const titleFor = async (path) => {
    await boot(path)
    return document.title
  }
  it.each([
    ['/', 'Techzy'],
    ['/about', `${en['nav.about']} | Techzy`],
    ['/products', `${en['nav.products']} | Techzy`],
    ['/contact', `${en['nav.contact']} | Techzy`],
    ['/careers', `${en['careers.hero.kicker']} | Techzy`],
    ['/nope', `${en['notFound.title']} | Techzy`],
    [`/product/${products[0].id}`, `${products[0].name} | Techzy`],
    ['/product/missing', `${en['notFound.title']} | Techzy`],
    [`/careers/${careers.postings[0].id}`, `${careers.roles[careers.postings[0].role].title} | Techzy`],
    ['/careers/missing', `${en['notFound.title']} | Techzy`],
  ])('%s → %s', async (path, title) => {
    expect(await titleFor(path)).toBe(title)
  })
})

describe('nav state', () => {
  it.each([
    ['/', ['home', 'home']],
    ['/about', ['about', 'about']],
    [`/product/${products[0].id}`, ['products', 'products']], // detail highlights its section
    ['/careers/' + careers.postings[0].id, []], // careers isn't in the main nav
    ['/nope', []],
  ])('%s marks %j as the current page (nav + menu)', async (path, expected) => {
    await boot(path)
    expect(current()).toEqual(expected)
  })
})

describe('route changes', () => {
  it('run through the seal-cut transition, swapping the page behind the veil', async () => {
    await boot('/')
    clickLink('/contact')
    expect(transitionTo).toHaveBeenCalledTimes(1)
    expect($('#app h1').textContent).toBe(en['home.hero.title']) // not swapped yet

    const [swap, done] = transitionTo.mock.calls[0]
    swap()
    expect($('#contactForm')).not.toBeNull() // contact page mounted
    expect(document.activeElement).toBe($('#app')) // focus lands on <main>
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    expect(revert).toHaveBeenCalledTimes(1) // old page's tweens/ScrollTriggers killed
    expect(applyReveals).toHaveBeenLastCalledWith($('#app'), false)
    done()
  })

  it('a second navigation mid-transition swaps instantly instead of stacking veils', async () => {
    await boot('/')
    clickLink('/about')
    clickLink('/products')
    expect(transitionTo).toHaveBeenCalledTimes(1)
    expect($('#productGrid')).not.toBeNull()

    transitionTo.mock.calls[0][1]() // first transition completes
    clickLink('/contact')
    expect(transitionTo).toHaveBeenCalledTimes(2)
  })

  it('swap instantly under reduced motion', async () => {
    await boot('/', { reduced: true })
    clickLink('/about')
    expect(transitionTo).not.toHaveBeenCalled()
    expect($('#app h1').textContent).toBe(en['about.hero.title'])
    expect(document.activeElement).toBe($('#app'))
  })

  it('leaving home unmounts it (no lingering lightbox key handler)', async () => {
    await boot('/', { reduced: true })
    $('#marquee .shot[role="button"]').click()
    expect(document.body.classList.contains('modal-open')).toBe(true)
    clickLink('/about')
    expect(document.body.classList.contains('modal-open')).toBe(false)
  })

  it('back/forward re-renders', async () => {
    await boot('/', { reduced: true })
    window.history.pushState({}, '', '/careers')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect($('#jobGrid')).not.toBeNull()
  })
})

describe('language switch', () => {
  it('re-renders the current page in the new language without a transition', async () => {
    await boot('/about', { reduced: true })
    $('[data-lang-toggle]').click()
    expect($('#app h1').textContent).toBe(my['about.hero.title'])
    expect(document.title).toBe(`${my['nav.about']} | Techzy`)
    expect(transitionTo).not.toHaveBeenCalled()
  })
})
