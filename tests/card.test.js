import { beforeEach, describe, expect, it } from 'vitest'
import { cardHTML, getProductText } from '../src/pages/card.js'
import { getPostingText } from '../src/pages/careers.js'
import { initI18n, setLang } from '../src/i18n.js'
import { resolvePostings } from '../src/careers.js'
import products from '../content/products.json'
import careers from '../content/careers.json'

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
})

describe('getProductText', () => {
  const p = products[0]
  it('returns English fields by default', () => {
    expect(getProductText(p)).toEqual({ name: p.name, badge: p.badge, desc: p.desc, specs: p.specs })
  })
  it('returns Myanmar fields when the language is my', () => {
    setLang('my')
    expect(getProductText(p)).toEqual({ name: p.nameMy, badge: p.badgeMy, desc: p.descMy, specs: p.specsMy })
  })
  it('falls back to English when a Myanmar field is missing', () => {
    setLang('my')
    const bare = { name: 'N', badge: 'B', desc: 'D', specs: ['S'] }
    expect(getProductText(bare)).toEqual(bare)
  })
})

describe('getPostingText', () => {
  const p = resolvePostings(careers)[0]
  it('switches between languages', () => {
    expect(getPostingText(p).title).toBe(p.title)
    setLang('my')
    expect(getPostingText(p)).toEqual({ title: p.titleMy, location: p.locationLabelMy, type: p.typeMy, summary: p.summaryMy })
  })
})

describe('cardHTML', () => {
  const p = products.find((x) => x.specs.length > 4) || products[0]
  const render = (...args) => {
    document.body.innerHTML = cardHTML(...args)
    return document.querySelector('[data-card]')
  }

  it('links to the product page and pads the index', () => {
    const card = render(p, 0)
    expect(card.querySelector('a').getAttribute('href')).toBe(`/product/${p.id}`)
    expect(card.querySelector('.idx').textContent).toBe(`01 / ${p.badge}`)
    expect(render(p, 11).querySelector('.idx').textContent.startsWith('12 / ')).toBe(true)
  })

  it('uses h3 by default and the requested heading level otherwise', () => {
    expect(render(p, 0).querySelector('h3.card-title')).not.toBeNull()
    expect(render(p, 0, 'h2').querySelector('h2.card-title')).not.toBeNull()
  })

  it('shows at most four specs', () => {
    expect(render(p, 0).querySelector('.spec').textContent).toBe(p.specs.slice(0, 4).join(' / '))
  })

  it('gives the ask button an accessible name that includes the product', () => {
    const btn = render(p, 0).querySelector('.card-actions a')
    expect(btn.getAttribute('href')).toBe('/contact')
    expect(btn.getAttribute('aria-label')).toContain(p.name)
    // Label in Name (SC 2.5.3): visible text is part of the accessible name.
    expect(btn.getAttribute('aria-label')).toContain(btn.textContent.trim())
  })

  it('lazy-loads the image', () => {
    expect(render(p, 0).querySelector('img').getAttribute('loading')).toBe('lazy')
  })
})
