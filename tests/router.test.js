import { describe, expect, it } from 'vitest'
import { parseRoute } from '../src/router.js'

describe('parseRoute', () => {
  it('maps known paths', () => {
    expect(parseRoute('/')).toEqual({ name: 'home' })
    expect(parseRoute('/about')).toEqual({ name: 'about' })
    expect(parseRoute('/products')).toEqual({ name: 'products' })
    expect(parseRoute('/contact')).toEqual({ name: 'contact' })
  })
  it('tolerates trailing slashes', () => {
    expect(parseRoute('/about/')).toEqual({ name: 'about' })
  })
  it('extracts product ids', () => {
    expect(parseRoute('/product/asus-rog-strix-g16')).toEqual({ name: 'product', id: 'asus-rog-strix-g16' })
  })
  it('maps the careers list and extracts posting ids', () => {
    expect(parseRoute('/careers')).toEqual({ name: 'careers' })
    expect(parseRoute('/careers/')).toEqual({ name: 'careers' })
    expect(parseRoute('/careers/sales-advisor-yangon')).toEqual({ name: 'careerDetail', id: 'sales-advisor-yangon' })
  })
  it('falls back to notFound', () => {
    expect(parseRoute('/nope')).toEqual({ name: 'notFound' })
    expect(parseRoute('/product/')).toEqual({ name: 'notFound' })
  })
})
