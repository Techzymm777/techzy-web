import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as page from '../src/pages/terms.js'
import { initI18n, setLang } from '../src/i18n.js'
import { loadShell } from './helpers/dom.js'

const SOURCE = readFileSync(resolve(__dirname, '../content/terms-and-conditions.en.md'), 'utf8')

describe('terms and conditions content', () => {
  const terms = page.parseTerms()

  it('takes title and effective date from the source file', () => {
    expect(terms.title).toBe('Terms and Conditions')
    expect(terms.updated).toBe('Effective date: 29 October 2026')
  })

  it('has all 16 numbered sections in order', () => {
    expect(terms.sections.map((s) => s.title)).toEqual(
      [...SOURCE.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim()),
    )
    expect(terms.sections).toHaveLength(16)
    terms.sections.forEach((s, i) => expect(s.title.startsWith(`${i + 1}. `)).toBe(true))
  })

  it('section anchors are unique', () => {
    const ids = terms.sections.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('renders every word of the source (copy stays verbatim)', () => {
    document.body.innerHTML = page.render()
    const rendered = document.body.textContent.replace(/\s+/g, ' ')
    const words = SOURCE.replace(/[#*|]|^-{3,}$|^\s*-\s/gm, ' ').replace(/\s+/g, ' ').trim().split(' ')
    for (const w of new Set(words.filter((w) => !/^-+$/.test(w)))) expect(rendered, w).toContain(w)
  })
})

describe('terms page', () => {
  beforeEach(() => {
    window.localStorage.clear()
    initI18n()
    document.body.innerHTML = `<main id="app">${page.render()}</main>`
    page.mount()
  })
  afterEach(() => vi.restoreAllMocks())

  it('lays out the head, contents rail and sections', () => {
    expect(document.querySelector('h1').textContent).toBe('Terms and Conditions')
    expect(document.querySelectorAll('.policy-toc a')).toHaveLength(16)
    expect(document.querySelectorAll('.policy-section')).toHaveLength(16)
  })

  it('each contents link targets a focusable section heading', () => {
    for (const a of document.querySelectorAll('.policy-toc a')) {
      const target = document.getElementById(a.getAttribute('href').slice(1))
      expect(target, a.textContent).not.toBeNull()
      expect(target.tagName).toBe('H2')
      expect(target.getAttribute('tabindex')).toBe('-1')
    }
  })

  it('contents links scroll + focus in place without a hash navigation', () => {
    const a = document.querySelectorAll('.policy-toc a')[6]
    const target = document.getElementById(a.getAttribute('href').slice(1))
    target.scrollIntoView = vi.fn()
    const e = new MouseEvent('click', { bubbles: true, cancelable: true })
    a.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(document.activeElement).toBe(target)
  })

  it('stays English (and says so) when the site is in Myanmar', () => {
    setLang('my')
    document.body.innerHTML = `<main id="app">${page.render()}</main>`
    expect(document.querySelector('h1').textContent).toBe('Terms and Conditions')
    document.querySelectorAll('#app > section').forEach((s) => expect(s.getAttribute('lang')).toBe('en'))
  })

  it('is linked from the footer', () => {
    loadShell()
    expect(document.querySelector('footer a[href="/terms-and-conditions"]')).not.toBeNull()
  })
})
