import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { inline, parseMarkdown, renderBlocks } from '../src/markdown.js'
import * as page from '../src/pages/privacy.js'
import { initI18n, setLang } from '../src/i18n.js'
import { loadShell } from './helpers/dom.js'

const SOURCE = readFileSync(resolve(__dirname, '../content/privacy-policy.en.md'), 'utf8')

describe('markdown', () => {
  it('parses headings, paragraphs, lists, rules and tables', () => {
    const blocks = parseMarkdown(`# T\n\nline one\nline two\n\n---\n\n## A\n\n- x\n- y\n\n### B\n\n| H1 | H2 |\n|---|---|\n| a | b |\n| c | d |\n`)
    expect(blocks).toEqual([
      { type: 'h1', text: 'T' },
      { type: 'p', text: 'line one line two' },
      { type: 'hr' },
      { type: 'h2', text: 'A' },
      { type: 'ul', items: ['x', 'y'] },
      { type: 'h3', text: 'B' },
      { type: 'table', head: ['H1', 'H2'], rows: [['a', 'b'], ['c', 'd']] },
    ])
  })

  it('tolerates CRLF line endings', () => {
    expect(parseMarkdown('## A\r\n\r\ntext\r\n')).toEqual([{ type: 'h2', text: 'A' }, { type: 'p', text: 'text' }])
  })

  it('inline: escapes HTML, bolds, and links emails', () => {
    expect(inline('**Email:** a.b@techzymm.com <script>')).toBe(
      '<strong>Email:</strong> <a href="mailto:a.b@techzymm.com">a.b@techzymm.com</a> &lt;script&gt;',
    )
  })

  it('renders tables with header scope and per-cell labels for the mobile stack', () => {
    document.body.innerHTML = renderBlocks([{ type: 'table', head: ['**Data**', 'Period'], rows: [['CCTV', '30 days']] }])
    expect(document.querySelectorAll('th[scope="col"]')).toHaveLength(2)
    expect([...document.querySelectorAll('td')].map((td) => td.dataset.label)).toEqual(['Data', 'Period'])
  })
})

describe('privacy policy content', () => {
  const policy = page.parsePolicy()

  it('takes title and last-updated date from the source file', () => {
    expect(policy.title).toBe('Privacy Policy')
    expect(policy.updated).toBe('Last updated: 10 September 2026')
  })

  it('has the intro and all 14 numbered sections in order', () => {
    expect(policy.intro.filter((b) => b.type === 'p')).toHaveLength(3)
    expect(policy.sections.map((s) => s.title)).toEqual(
      [...SOURCE.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim()),
    )
    expect(policy.sections).toHaveLength(14)
    policy.sections.forEach((s, i) => expect(s.title.startsWith(`${i + 1}. `)).toBe(true))
  })

  it('section anchors are unique', () => {
    const ids = policy.sections.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('renders every word of the source (copy stays verbatim)', () => {
    document.body.innerHTML = page.render()
    const rendered = document.body.textContent.replace(/\s+/g, ' ')
    const words = SOURCE.replace(/[#*|]|^-{3,}$|^\s*-\s/gm, ' ').replace(/\s+/g, ' ').trim().split(' ')
    for (const w of new Set(words.filter((w) => !/^-+$/.test(w)))) expect(rendered, w).toContain(w)
  })
})

describe('privacy page', () => {
  beforeEach(() => {
    window.localStorage.clear()
    initI18n()
    document.body.innerHTML = `<main id="app">${page.render()}</main>`
    page.mount()
  })
  afterEach(() => vi.restoreAllMocks())

  it('lays out the head, contents rail and sections', () => {
    expect(document.querySelector('h1').textContent).toBe('Privacy Policy')
    expect(document.querySelectorAll('.policy-toc a')).toHaveLength(14)
    expect(document.querySelectorAll('.policy-section')).toHaveLength(14)
    expect(document.querySelectorAll('.policy-section h3')).toHaveLength(6)
    expect([...document.querySelectorAll('.policy-table')].map((t) => t.querySelectorAll('tbody tr').length)).toEqual([7, 9, 9])
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
    expect(document.querySelector('h1').textContent).toBe('Privacy Policy')
    document.querySelectorAll('#app > section').forEach((s) => expect(s.getAttribute('lang')).toBe('en'))
  })

  it('is linked from the footer', () => {
    loadShell()
    expect(document.querySelector('footer a[href="/privacy-policy"]')).not.toBeNull()
  })
})
