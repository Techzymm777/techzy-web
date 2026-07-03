import { beforeEach, describe, expect, it } from 'vitest'
import { getLang, initI18n, normalizeLang, setLang, t } from '../src/i18n.js'

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
})

describe('normalizeLang', () => {
  it('maps my/mm prefixes to my, everything else to en', () => {
    expect(normalizeLang('my')).toBe('my')
    expect(normalizeLang('mm-MM')).toBe('my')
    expect(normalizeLang('en-US')).toBe('en')
    expect(normalizeLang(null)).toBe('en')
  })
})

describe('t', () => {
  it('returns English strings by default', () => {
    expect(t('nav.home')).toBe('Home')
  })
  it('substitutes {vars}', () => {
    expect(t('products.card.askAria', { name: 'Aera 14' })).toBe('Ask about Aera 14 via the contact page')
  })
  it('returns empty string for unknown keys', () => {
    expect(t('nope.missing')).toBe('')
  })
})

describe('setLang', () => {
  it('switches strings and persists the choice', () => {
    setLang('my')
    expect(getLang()).toBe('my')
    expect(t('nav.home')).toBe('ပင်မစာမျက်နှာ')
    expect(window.localStorage.getItem('lang')).toBe('my')
    expect(document.documentElement.lang).toBe('my')
  })
  it('is restored by initI18n', () => {
    setLang('my')
    initI18n()
    expect(getLang()).toBe('my')
  })
})
