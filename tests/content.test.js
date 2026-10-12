import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import en from '../content/copy.en.json'
import my from '../content/copy.my.json'
import careers from '../content/careers.json'
import products from '../content/products.json'
import { resolvePostings } from '../src/careers.js'
import { PAGES } from '../src/pages/index.js'
import { indexHTML } from './helpers/dom.js'

const ROOT = resolve(__dirname, '..')
const srcFiles = (dir = join(ROOT, 'src')) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? srcFiles(join(dir, d.name)) : d.name.endsWith('.js') ? [join(dir, d.name)] : [],
  )

describe('copy keys', () => {
  // Every literal t('…') key and data-i18n(-attr) key used anywhere.
  const used = new Set()
  for (const file of srcFiles()) {
    for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(m[1])
    for (const m of readFileSync(file, 'utf8').matchAll(/\[\s*'\w+'\s*,\s*'(\w+\.[\w.]+)'\s*\]/g)) used.add(m[1]) // TABS tables
    for (const m of readFileSync(file, 'utf8').matchAll(/(?:name|address):\s*'([\w.]+\.[\w.]+)'/g)) used.add(m[1]) // SHOPS
  }
  for (const m of indexHTML().matchAll(/data-i18n="([\w.]+)"/g)) used.add(m[1])
  for (const m of indexHTML().matchAll(/data-i18n-attr="([^"]+)"/g)) {
    m[1].split(/\s+/).forEach((p) => p.includes(':') && used.add(p.split(':')[1]))
  }

  it('finds the keys it is checking', () => {
    expect(used.size).toBeGreaterThan(50)
  })

  it.each([...used].sort())('%s exists in en and my', (key) => {
    expect(en[key], `en: ${key}`).toBeTruthy()
    expect(my[key], `my: ${key}`).toBeTruthy()
  })

  it('placeholders match between languages', () => {
    const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
    for (const key of Object.keys(en)) expect(vars(my[key]), key).toEqual(vars(en[key]))
  })

  it('no empty strings in either dictionary', () => {
    for (const [k, v] of Object.entries(en)) expect(String(v).trim(), `en ${k}`).not.toBe('')
    for (const [k, v] of Object.entries(my)) expect(String(v).trim(), `my ${k}`).not.toBe('')
  })
})

describe('careers data', () => {
  const postings = resolvePostings(careers)

  it('posting ids are unique and URL-safe', () => {
    const ids = careers.postings.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[A-Za-z0-9-]+$/))
  })

  it('every posting references an existing role', () => {
    careers.postings.forEach((p) => expect(careers.roles[p.role], p.id).toBeDefined())
  })

  it('every posting has a filterable location and a positive opening count', () => {
    postings.forEach((p) => {
      expect(['yangon', 'mandalay'], p.id).toContain(p.location)
      expect(Number.isInteger(p.openings) && p.openings > 0, p.id).toBe(true)
    })
  })

  it('every posting has bilingual title/summary/location/type', () => {
    for (const p of postings) {
      for (const f of ['title', 'titleMy', 'summary', 'summaryMy', 'locationLabel', 'locationLabelMy', 'type', 'typeMy']) {
        expect(p[f], `${p.id}.${f}`).toBeTruthy()
      }
    }
  })
})

describe('products data', () => {
  it('ids are URL-safe so /product/:id routes match', () => {
    products.forEach((p) => expect(p.id).toMatch(/^[A-Za-z0-9-]+$/))
  })
  it('categories are ones the products filter offers', () => {
    products.forEach((p) => expect(['laptop', 'desktop', 'accessory'], p.id).toContain(p.category))
  })
  it('featuredRank values are unique numbers', () => {
    const ranks = products.map((p) => p.featuredRank)
    ranks.forEach((r) => expect(typeof r).toBe('number'))
    expect(new Set(ranks).size).toBe(ranks.length)
  })
})

describe('Netlify Forms contract', () => {
  // Netlify only accepts fields it saw in the static build-time form, so the
  // client-rendered forms must not submit anything the registration lacks.
  const doc = new DOMParser().parseFromString(indexHTML(), 'text/html')
  const fieldsOf = (form) => new Set([...form.querySelectorAll('[name]')].map((el) => el.getAttribute('name')))
  const render = (html) => {
    const d = document.createElement('div')
    d.innerHTML = html
    return d
  }

  it.each([
    ['contact', () => render(PAGES.contact.render()).querySelector('form')],
    ['career-application', () => render(PAGES.careerDetail.render({ id: careers.postings[0].id })).querySelector('form')],
  ])('%s: every rendered field is registered in index.html', (name, getForm) => {
    const registered = doc.querySelector(`form[name="${name}"]`)
    expect(registered, `static ${name} form`).not.toBeNull()
    expect(registered.getAttribute('data-netlify')).toBe('true')
    const live = getForm()
    expect(live.getAttribute('name')).toBe(name)
    const reg = fieldsOf(registered)
    for (const field of fieldsOf(live)) expect(reg.has(field), `${name}.${field}`).toBe(true)
  })

  it('career-application is registered as multipart (resume upload)', () => {
    expect(doc.querySelector('form[name="career-application"]').getAttribute('enctype')).toBe('multipart/form-data')
  })
})

describe('static assets referenced by pages', () => {
  it('testimonial images 01–10 exist', () => {
    for (let i = 1; i <= 10; i++) {
      const n = String(i).padStart(2, '0')
      expect(existsSync(join(ROOT, 'public/assets/images/testimonials', `feedback-${n}.jpg`)), n).toBe(true)
    }
  })
  it('the about hero image exists', () => {
    expect(existsSync(join(ROOT, 'public/assets/images/hero/hero-about.svg'))).toBe(true)
  })
})

describe('Netlify routing', () => {
  it('publishes the prerendered build', () => {
    expect(readFileSync(join(ROOT, 'netlify.toml'), 'utf8')).toMatch(/publish\s*=\s*"dist"/)
    expect(JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts.build).toMatch(/vite build && node scripts\/prerender\.mjs/)
  })

  it('has no catch-all rewrite: unknown paths get 404.html with a real 404 status', () => {
    // Every real route is a prerendered file; a "/* /index.html 200" rule would
    // serve the homepage for typos and dead links (a soft 404).
    const redirects = join(ROOT, 'public/_redirects')
    if (existsSync(redirects)) expect(readFileSync(redirects, 'utf8')).not.toMatch(/^\/\*\s+\/index\.html\s+200/m)
  })
})
