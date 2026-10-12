import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PAGES } from '../src/pages/index.js'
import { parseRoute } from '../src/router.js'
import { initI18n, setLang } from '../src/i18n.js'
import { resolvePostings } from '../src/careers.js'
import products from '../content/products.json'
import careers from '../content/careers.json'

// Every route the site can render, with real catalog/careers ids.
const ROUTES = [
  { name: 'home' },
  { name: 'about' },
  { name: 'products' },
  { name: 'contact' },
  { name: 'careers' },
  { name: 'privacy' },
  { name: 'notFound' },
  ...products.map((p) => ({ name: 'product', id: p.id })),
  ...resolvePostings(careers).map((p) => ({ name: 'careerDetail', id: p.id })),
]

const label = (r) => (r.id ? `${r.name}:${r.id}` : r.name)

function renderInto(route) {
  document.body.innerHTML = `<main id="app">${PAGES[route.name].render(route)}</main>`
  return document.getElementById('app')
}

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
})
afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['en', 'my'])('every page renders cleanly in %s', (lang) => {
  beforeEach(() => setLang(lang))

  it.each(ROUTES.map((r) => [label(r), r]))('%s', (_label, route) => {
    const root = renderInto(route)

    // One h1 per page (document outline / SC 1.3.1).
    expect(root.querySelectorAll('h1')).toHaveLength(1)
    expect(root.querySelector('h1').textContent.trim()).not.toBe('')

    // No unresolved {vars} or missing-copy holes left by t().
    const text = root.textContent
    expect(text).not.toMatch(/\{[a-zA-Z]+\}/)
    expect(text).not.toContain('undefined')
    expect(text).not.toContain('[object Object]')

    // Every internal link resolves to a real route (no dead links).
    for (const a of root.querySelectorAll('a[href^="/"]')) {
      expect(parseRoute(a.getAttribute('href')).name, a.getAttribute('href')).not.toBe('notFound')
    }

    // External links that open a new tab can't reach window.opener.
    for (const a of root.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute('rel')).toMatch(/noopener/)
    }

    // Every image has an alt attribute (empty is fine for decorative ones).
    for (const img of root.querySelectorAll('img')) {
      expect(img.hasAttribute('alt'), img.getAttribute('src')).toBe(true)
    }

    // Every form control has an accessible name.
    for (const el of root.querySelectorAll('input:not([type=hidden]), select, textarea')) {
      if (el.closest('[hidden]')) continue
      const named = el.getAttribute('aria-label') || (el.id && root.querySelector(`label[for="${el.id}"]`)) || el.closest('label')
      expect(named, el.id || el.name).toBeTruthy()
    }

    // Duplicate ids break label/aria wiring.
    const ids = [...root.querySelectorAll('[id]')].map((el) => el.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('unknown ids fall back to the not-found page', () => {
  it('product', () => {
    const root = renderInto({ name: 'product', id: 'does-not-exist' })
    expect(root.innerHTML).toBe(renderInto({ name: 'notFound' }).innerHTML)
  })
  it('careerDetail', () => {
    const root = renderInto({ name: 'careerDetail', id: 'does-not-exist' })
    expect(root.innerHTML).toBe(renderInto({ name: 'notFound' }).innerHTML)
  })
})

describe('home', () => {
  it('features up to 8 products in featuredRank order, excluding productsOnly', () => {
    const root = renderInto({ name: 'home' })
    const ids = [...root.querySelectorAll('.grid-products [data-card] > a')].map((a) => a.getAttribute('href').split('/').pop())
    const expected = products.filter((p) => !p.productsOnly).sort((a, b) => a.featuredRank - b.featuredRank).slice(0, 8).map((p) => p.id)
    expect(ids).toEqual(expected)
  })

  it('renders the testimonial strip twice for the loop, with the clone hidden from AT', () => {
    const root = renderInto({ name: 'home' })
    const shots = root.querySelectorAll('#marquee .shot')
    expect(shots).toHaveLength(20)
    const clones = root.querySelectorAll('#marquee .shot[aria-hidden="true"]')
    expect(clones).toHaveLength(10)
    clones.forEach((c) => expect(c.querySelector('img').getAttribute('alt')).toBe(''))
    root.querySelectorAll('#marquee .shot[role="button"]').forEach((s) => expect(s.getAttribute('tabindex')).toBe('0'))
  })

  it('has the three.js canvas hidden from AT', () => {
    expect(renderInto({ name: 'home' }).querySelector('canvas#webgl').getAttribute('aria-hidden')).toBe('true')
  })
})

describe('product detail', () => {
  it('lists every spec plus warranty/shipping/support rows', () => {
    const p = products[0]
    const root = renderInto({ name: 'product', id: p.id })
    expect(root.querySelectorAll('.pd-specs tr')).toHaveLength(p.specs.length + 3)
    expect(root.querySelector('img').getAttribute('src')).toBe(`/assets/images/products/${p.image}`)
    expect(root.querySelector('img').getAttribute('alt')).toBe(p.name)
  })

  it('switches to Myanmar product copy', () => {
    setLang('my')
    const p = products[0]
    const root = renderInto({ name: 'product', id: p.id })
    expect(root.querySelector('h1').textContent).toBe(p.nameMy)
    expect(root.querySelector('.lede').textContent).toBe(p.descMy)
  })
})

describe('contact', () => {
  it('renders both shops with map embeds, tel/mailto links and safe directions links', () => {
    const root = renderInto({ name: 'contact' })
    const shops = root.querySelectorAll('.shop')
    expect(shops).toHaveLength(2)
    shops.forEach((shop) => {
      expect(shop.querySelector('iframe').getAttribute('src')).toMatch(/^https:\/\/maps\.google\.com\/maps\?q=.+&output=embed$/)
      expect(shop.querySelector('iframe').getAttribute('title')).toBeTruthy()
      expect(shop.querySelector('a[href^="tel:"]').getAttribute('href')).toBe('tel:+959783388913')
      expect(shop.querySelector('a[href^="mailto:"]').getAttribute('href')).toBe('mailto:techzymm@gmail.com')
    })
    // Yangon pins exact coords at z=17; Mandalay geocodes a text query at z=16.
    expect(shops[0].querySelector('iframe').src).toContain(`q=${encodeURIComponent('16.797709,96.154140')}&z=17`)
    expect(shops[1].querySelector('iframe').src).toContain('&z=16')
  })
})

describe('career detail', () => {
  it('renders every non-empty role section and the apply dialog', () => {
    const p = resolvePostings(careers)[0]
    const root = renderInto({ name: 'careerDetail', id: p.id })
    const sections = ['requirements', 'responsibilities', 'whoShouldApply', 'whatYoullLearn'].filter((k) => (p[k] || []).length)
    expect(root.querySelectorAll('.jd-section')).toHaveLength(sections.length)
    const dialog = root.querySelector('#applyModal')
    expect(dialog.getAttribute('role')).toBe('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-hidden')).toBe('true')
    expect(root.querySelector('input[name="job"]').value).toContain(p.title)
  })
})

describe('HTML escaping at the template boundary', () => {
  it('escapes catalog data so it cannot inject markup', async () => {
    const { cardHTML } = await import('../src/pages/card.js')
    const evil = { ...products[0], id: 'x"><script>', name: '<img src=x onerror=alert(1)>', badge: '"b"', specs: ['<b>s</b>'] }
    document.body.innerHTML = cardHTML(evil, 0)
    expect(document.querySelector('script')).toBeNull()
    expect(document.querySelector('[onerror]')).toBeNull()
    expect(document.querySelector('.card-title').textContent).toBe(evil.name)
  })
})
