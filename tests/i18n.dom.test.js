import { beforeEach, describe, expect, it } from 'vitest'
import { applyI18n, initI18n, setLang, t } from '../src/i18n.js'
import en from '../content/copy.en.json'
import my from '../content/copy.my.json'

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
})

describe('applyI18n', () => {
  it('fills [data-i18n] text and leaves unknown keys untouched', () => {
    document.body.innerHTML = '<a data-i18n="nav.about">x</a><span data-i18n="nope.missing">keep</span>'
    applyI18n()
    expect(document.querySelector('a').textContent).toBe(en['nav.about'])
    expect(document.querySelector('span').textContent).toBe('keep')
  })

  it('sets one or more attributes from [data-i18n-attr]', () => {
    document.body.innerHTML = '<button data-i18n-attr="aria-label:common.menuToggleAria title:footer.backToTop  junk"></button>'
    applyI18n()
    const b = document.querySelector('button')
    expect(b.getAttribute('aria-label')).toBe(en['common.menuToggleAria'])
    expect(b.getAttribute('title')).toBe(en['footer.backToTop'])
    expect(b.hasAttribute('junk')).toBe(false)
  })

  it('only touches the given root', () => {
    document.body.innerHTML = '<div id="a"><i data-i18n="nav.home">a</i></div><div id="b"><i data-i18n="nav.home">b</i></div>'
    applyI18n(document.getElementById('a'))
    expect(document.querySelector('#a i').textContent).toBe(en['nav.home'])
    expect(document.querySelector('#b i').textContent).toBe('b')
  })

  it('setLang re-applies the whole document', () => {
    document.body.innerHTML = '<a data-i18n="nav.contact">Contact</a>'
    setLang('my')
    expect(document.querySelector('a').textContent).toBe(my['nav.contact'])
    setLang('en')
    expect(document.querySelector('a').textContent).toBe(en['nav.contact'])
  })
})

describe('t', () => {
  it('replaces every occurrence of a var', () => {
    const key = Object.keys(en).find((k) => /\{(\w+)\}/.test(en[k]))
    const name = en[key].match(/\{(\w+)\}/)[1]
    expect(t(key, { [name]: 'ZZ' })).not.toContain(`{${name}}`)
  })

  it('normalises an unknown saved language to English', () => {
    window.localStorage.setItem('lang', 'fr')
    initI18n()
    expect(document.documentElement.lang).toBe('en')
    expect(t('nav.home')).toBe(en['nav.home'])
  })
})
