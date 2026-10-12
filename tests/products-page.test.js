import { beforeEach, describe, expect, it } from 'vitest'
import * as page from '../src/pages/products.js'
import { initI18n } from '../src/i18n.js'
import products from '../content/products.json'

const $ = (s) => document.querySelector(s)
const ids = () => [...document.querySelectorAll('#productGrid [data-card] > a')].map((a) => a.getAttribute('href').split('/').pop())
const tab = (cat) => $(`.tab[data-cat="${cat}"]`)
const type = (value) => {
  $('#q').value = value
  $('#q').dispatchEvent(new Event('input'))
}
const sort = (value) => {
  $('#sortSel').value = value
  $('#sortSel').dispatchEvent(new Event('change'))
}

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
  document.body.innerHTML = `<main id="app">${page.render()}</main>`
  page.mount()
})

describe('products page', () => {
  it('initially lists the whole catalog in featured order with "All" pressed', () => {
    expect(ids()).toEqual([...products].sort((a, b) => a.featuredRank - b.featuredRank).map((p) => p.id))
    expect(tab('all').getAttribute('aria-pressed')).toBe('true')
    expect($('#emptyState').hidden).toBe(true)
  })

  it('category tabs filter and move aria-pressed', () => {
    tab('laptop').click()
    expect(ids().length).toBeGreaterThan(0)
    expect(ids().every((id) => products.find((p) => p.id === id).category === 'laptop')).toBe(true)
    expect(tab('laptop').getAttribute('aria-pressed')).toBe('true')
    expect(tab('all').getAttribute('aria-pressed')).toBe('false')
    expect(document.querySelectorAll('.tab[aria-pressed="true"]')).toHaveLength(1)
  })

  it('search narrows the grid', () => {
    type('rog strix')
    expect(ids()).toContain('asus-rog-strix-g16')
    expect(ids().length).toBeLessThan(products.length)
  })

  it('sort A→Z reorders the grid', () => {
    sort('nameAsc')
    const names = ids().map((id) => products.find((p) => p.id === id).name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('filtered cards are shown immediately (no pending clip reveal)', () => {
    type('a')
    const frames = document.querySelectorAll('#productGrid .frame')
    expect(frames.length).toBeGreaterThan(0)
    frames.forEach((f) => {
      expect(f.hasAttribute('data-clip')).toBe(false)
      expect(f.style.clipPath).toBe('none')
    })
  })

  it('shows the empty state when nothing matches, and reset restores everything', () => {
    tab('desktop').click()
    type('zzz-no-match')
    expect($('#productGrid').hidden).toBe(true)
    expect($('#emptyState').hidden).toBe(false)

    $('#resetFilters').click()
    expect($('#q').value).toBe('')
    expect($('#sortSel').value).toBe('featured')
    expect(tab('all').getAttribute('aria-pressed')).toBe('true')
    expect(tab('desktop').getAttribute('aria-pressed')).toBe('false')
    expect(ids()).toHaveLength(products.length)
    expect($('#emptyState').hidden).toBe(true)
    expect($('#productGrid').hidden).toBe(false)
  })

  it('combines category, search and sort', () => {
    tab('laptop').click()
    type('gaming')
    sort('nameAsc')
    const list = ids().map((id) => products.find((p) => p.id === id))
    expect(list.every((p) => p.category === 'laptop')).toBe(true)
    expect(list.map((p) => p.name)).toEqual([...list.map((p) => p.name)].sort((a, b) => a.localeCompare(b)))
  })
})
