import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { initRouter, navigate } from '../src/router.js'

// initRouter wires document/window listeners for the module's lifetime, so
// it is initialised once and the handler mock is cleared between tests.
const onRoute = vi.fn()

beforeAll(() => {
  window.history.replaceState({}, '', '/')
  initRouter(onRoute)
})
beforeEach(() => {
  onRoute.mockClear()
  window.history.replaceState({}, '', '/')
  document.body.innerHTML = ''
})

function link(attrs) {
  const a = document.createElement('a')
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v)
  a.innerHTML = '<span>inner</span>'
  document.body.appendChild(a)
  return a
}
// The router listens on document; this window listener runs after it, records
// whether the router claimed the click, then cancels the browser's own
// navigation so happy-dom doesn't actually follow external links.
let routerPrevented = null
window.addEventListener('click', (e) => {
  routerPrevented = e.defaultPrevented
  e.preventDefault()
})
function click(el, init = {}) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }))
  return { defaultPrevented: routerPrevented }
}

describe('initRouter', () => {
  it('renders the current location immediately', () => {
    // First call happened in beforeAll before the mock was cleared.
    window.history.replaceState({}, '', '/about')
    const fresh = vi.fn()
    initRouter(fresh)
    expect(fresh).toHaveBeenCalledWith({ name: 'about' })
    initRouter(onRoute) // restore the shared handler
  })

  it('intercepts internal links (including clicks on nested elements)', () => {
    const a = link({ href: '/products' })
    const e = click(a.querySelector('span'))
    expect(e.defaultPrevented).toBe(true)
    expect(window.location.pathname).toBe('/products')
    expect(onRoute).toHaveBeenCalledWith({ name: 'products' })
  })

  it.each([
    ['hash anchors', { href: '#app' }, {}],
    ['external URLs', { href: 'https://example.com/' }, {}],
    ['mailto links', { href: 'mailto:a@b.c' }, {}],
    ['target=_blank', { href: '/about', target: '_blank' }, {}],
    ['downloads', { href: '/file.pdf', download: '' }, {}],
    ['cmd-click', { href: '/about' }, { metaKey: true }],
    ['ctrl-click', { href: '/about' }, { ctrlKey: true }],
    ['shift-click', { href: '/about' }, { shiftKey: true }],
    ['alt-click', { href: '/about' }, { altKey: true }],
    ['middle-click', { href: '/about' }, { button: 1 }],
  ])('leaves %s to the browser', (_name, attrs, init) => {
    const e = click(link(attrs), init)
    expect(e.defaultPrevented).toBe(false)
    expect(onRoute).not.toHaveBeenCalled()
  })

  it('ignores clicks outside links', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    expect(click(div).defaultPrevented).toBe(false)
    expect(onRoute).not.toHaveBeenCalled()
  })

  it('re-routes on back/forward', () => {
    window.history.replaceState({}, '', '/careers/sales-advisor-yangon')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(onRoute).toHaveBeenCalledWith({ name: 'careerDetail', id: 'sales-advisor-yangon' })
  })
})

describe('navigate', () => {
  it('pushes history and calls the handler', () => {
    const before = window.history.length
    navigate('/contact')
    expect(window.location.pathname).toBe('/contact')
    expect(window.history.length).toBe(before + 1)
    expect(onRoute).toHaveBeenCalledWith({ name: 'contact' })
  })

  it('does not push a duplicate entry for the current path', () => {
    navigate('/contact')
    const before = window.history.length
    navigate('/contact')
    expect(window.history.length).toBe(before)
    expect(onRoute).toHaveBeenCalledTimes(2)
  })
})
