import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import products from '../content/products.json'
import en from '../content/copy.en.json'
import my from '../content/copy.my.json'

describe('products catalog', () => {
  it('has 12 products with unique ids', () => {
    expect(products).toHaveLength(12)
    expect(new Set(products.map((p) => p.id)).size).toBe(12)
  })

  it('every product has the required bilingual fields and no price', () => {
    for (const p of products) {
      for (const field of ['id', 'name', 'nameMy', 'category', 'badge', 'badgeMy', 'desc', 'descMy', 'image', 'featuredRank']) {
        expect(p[field], `${p.id}.${field}`).toBeDefined()
      }
      expect(Array.isArray(p.specs) && p.specs.length > 0, `${p.id}.specs`).toBe(true)
      expect(Array.isArray(p.specsMy) && p.specsMy.length > 0, `${p.id}.specsMy`).toBe(true)
      expect(p.price, `${p.id} must not have a price (quote-based catalog)`).toBeUndefined()
    }
  })

  it('every product image file exists', () => {
    for (const p of products) {
      const file = resolve(__dirname, '../public/assets/images/products', p.image)
      expect(existsSync(file), p.image).toBe(true)
    }
  })
})

describe('copy dictionaries', () => {
  it('en and my have identical key sets', () => {
    expect(Object.keys(my).sort()).toEqual(Object.keys(en).sort())
  })
})
