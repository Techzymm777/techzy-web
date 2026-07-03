import { describe, expect, it } from 'vitest'
import { filterProducts, sortProducts } from '../src/catalog.js'
import { esc } from '../src/escape.js'
import products from '../content/products.json'

describe('filterProducts', () => {
  it('returns everything for all/no-term', () => {
    expect(filterProducts(products)).toHaveLength(products.length)
  })

  it('filters by category', () => {
    const laptops = filterProducts(products, { category: 'laptop' })
    expect(laptops.length).toBeGreaterThan(0)
    expect(laptops.every((p) => p.category === 'laptop')).toBe(true)
    expect(filterProducts(products, { category: 'desktop' })).toHaveLength(0)
  })

  it('matches search terms against name and specs, case-insensitive', () => {
    const rog = filterProducts(products, { term: 'rog strix' })
    expect(rog.some((p) => p.id === 'asus-rog-strix-g16')).toBe(true)
    const rtx = filterProducts(products, { term: 'RTX 4080' })
    expect(rtx.length).toBeGreaterThan(0)
    expect(rtx.every((p) => [...p.specs, p.desc, p.name].join(' ').includes('4080'))).toBe(true)
  })

  it('matches Myanmar text', () => {
    const my = filterProducts(products, { term: 'gaming laptop' })
    expect(my.length).toBeGreaterThan(0)
  })

  it('returns empty for nonsense terms', () => {
    expect(filterProducts(products, { term: 'zzzznope' })).toHaveLength(0)
  })
})

describe('sortProducts', () => {
  it('featured sorts by featuredRank ascending without mutating input', () => {
    const input = [...products]
    const sorted = sortProducts(input, 'featured')
    expect(sorted.map((p) => p.featuredRank)).toEqual([...sorted.map((p) => p.featuredRank)].sort((a, b) => a - b))
    expect(input).toEqual(products)
  })

  it('nameAsc sorts alphabetically', () => {
    const names = sortProducts(products, 'nameAsc').map((p) => p.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
})

describe('esc', () => {
  it('escapes HTML-significant characters', () => {
    expect(esc(`<img src=x onerror="alert('1')" & more>`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot; &amp; more&gt;',
    )
  })
  it('passes plain text through', () => {
    expect(esc('ASUS ROG Strix G16')).toBe('ASUS ROG Strix G16')
  })
})
