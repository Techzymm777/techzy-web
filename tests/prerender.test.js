import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { injectPage, outputFile } from '../scripts/prerender-lib.mjs'
import { getMeta, renderHead } from '../src/seo.js'
import { PAGES } from '../src/pages/index.js'
import { indexHTML } from './helpers/dom.js'

const TEMPLATE = `<html><head><meta charset="utf-8" /><!--seo:start--><title>dev</title><!--seo:end--><link rel="icon" href="/x" /></head>
<body><main id="app" tabindex="-1"></main></body></html>`

describe('injectPage', () => {
  it('replaces the marked head block and fills <main>', () => {
    const html = injectPage(TEMPLATE, '<title>Real</title>', '<h1>Hi</h1>')
    expect(html).toContain('<head><meta charset="utf-8" /><title>Real</title><link rel="icon" href="/x" /></head>')
    expect(html).toContain('<main id="app" tabindex="-1"><h1>Hi</h1></main>')
    expect(html).not.toContain('seo:start')
    expect(html).not.toContain('<title>dev</title>')
  })

  it('inserts page markup literally (no $& replacement patterns)', () => {
    expect(injectPage(TEMPLATE, '', '<p>$& $1 $$</p>')).toContain('<p>$& $1 $$</p>')
  })

  it('fails loudly if the template lost its markers or empty <main>', () => {
    expect(() => injectPage('<html></html>', '', '')).toThrow(/seo:start/)
    expect(() => injectPage('<!--seo:start--><!--seo:end--><main id="app"></main>', '', '')).toThrow(/main/)
  })

  it('works on the real index.html with a real page', () => {
    const html = injectPage(indexHTML(), renderHead(getMeta({ name: 'about' })), PAGES.about.render())
    document.documentElement.innerHTML = html.replace(/^<!doctype html>\s*<html[^>]*>/i, '').replace(/<\/html>\s*$/, '')
    expect(document.querySelectorAll('title')).toHaveLength(1)
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.querySelector('#app h1')).not.toBeNull()
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://techzymm.com/about')
  })
})

describe('outputFile', () => {
  it('maps routes to flat .html files (served by Netlify without a trailing-slash redirect)', () => {
    expect(outputFile('/d', '/')).toBe(join('/d', 'index.html'))
    expect(outputFile('/d', '/about')).toBe(join('/d', 'about.html'))
    expect(outputFile('/d', '/product/asus-rog-strix-g16')).toBe(join('/d', 'product', 'asus-rog-strix-g16.html'))
  })
})
