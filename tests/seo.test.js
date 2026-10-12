import { beforeEach, describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
  SITE, allRoutes, applyHead, brandOf, clip, getMeta, llmsTxt, productDescription, productImage, renderHead, robotsTxt, routePath, sitemapXml,
} from '../src/seo.js'
import { parseRoute } from '../src/router.js'
import { resolvePostings } from '../src/careers.js'
import seo from '../content/seo.json'
import products from '../content/products.json'
import careers from '../content/careers.json'

const PUBLIC = resolve(__dirname, '../public')
const graph = (meta, type) => meta.jsonLd.filter((n) => n['@type'] === type)
const label = (r) => (r.id ? `${r.name}:${r.id}` : r.name)

describe('routes', () => {
  it('covers every page, product and job posting', () => {
    const routes = allRoutes()
    expect(routes).toHaveLength(6 + products.length + careers.postings.length)
    expect(routes.filter((r) => r.name === 'product').map((r) => r.id)).toEqual(products.map((p) => p.id))
  })

  it.each(allRoutes().map((r) => [label(r), r]))('%s: path round-trips through the router', (_l, route) => {
    expect(parseRoute(routePath(route))).toEqual(route)
  })
})

describe('getMeta: every indexable page', () => {
  const metas = allRoutes().map((r) => [label(r), getMeta(r)])

  it.each(metas)('%s has a title ≤ 60 and a description ≤ 155 characters', (_l, m) => {
    expect(m.title.length).toBeGreaterThan(10)
    expect(m.title.length).toBeLessThanOrEqual(60)
    expect(m.title).toMatch(/Techzy/)
    expect(m.description.length).toBeGreaterThan(50)
    expect(m.description.length).toBeLessThanOrEqual(155)
    expect(m.noindex).toBe(false)
  })

  it.each(metas)('%s share image exists in public/', (_l, m) => {
    expect(existsSync(join(PUBLIC, m.image)), m.image).toBe(true)
  })

  it.each(metas)('%s carries Organization + WebSite structured data', (_l, m) => {
    expect(graph(m, 'Organization')).toHaveLength(1)
    expect(graph(m, 'WebSite')).toHaveLength(1)
  })

  it('titles and descriptions are unique across pages', () => {
    const titles = metas.map(([, m]) => m.title)
    const descs = metas.map(([, m]) => m.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descs).size).toBe(descs.length)
  })
})

describe('getMeta: page specifics', () => {
  it('home and contact list both shops as ElectronicsStore', () => {
    for (const name of ['home', 'contact']) {
      const shops = graph(getMeta({ name }), 'ElectronicsStore')
      expect(shops.map((s) => s.address.addressLocality)).toEqual(['Yangon', 'Mandalay'])
      shops.forEach((s) => {
        expect(s.address.addressCountry).toBe('MM')
        expect(s.telephone).toBe(seo.telephone)
      })
    }
    expect(graph(getMeta({ name: 'contact' }), 'ElectronicsStore')[0].geo).toEqual({ '@type': 'GeoCoordinates', latitude: 16.797709, longitude: 96.15414 })
  })

  it.each(products.map((p) => [p.id, p]))('product %s: Product data, brand, image, breadcrumbs', (_id, p) => {
    const m = getMeta({ name: 'product', id: p.id })
    const [data] = graph(m, 'Product')
    expect(data.name).toBe(p.name)
    expect(['ASUS', 'Acer', 'Lenovo']).toContain(data.brand.name)
    expect(data.additionalProperty).toHaveLength(p.specs.length)
    expect(data.offers).toBeUndefined() // quote-based catalog: never invent a price
    expect(m.image).toBe(productImage(p))
    expect(graph(m, 'BreadcrumbList')[0].itemListElement.map((i) => i.name)).toEqual(['Home', 'Products', p.name])
  })

  it.each(resolvePostings(careers).map((p) => [p.id, p]))('job %s: JobPosting with the fields Google Jobs requires', (_id, p) => {
    const [job] = graph(getMeta({ name: 'careerDetail', id: p.id }), 'JobPosting')
    expect(job.title).toBe(p.title)
    expect(job.datePosted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(job.description).toContain(p.summary)
    expect(job.hiringOrganization.name).toBe('Techzy')
    expect(job.jobLocation.address.addressLocality).toBe(p.locationLabel)
    expect(job.employmentType).toBe('FULL_TIME')
  })

  it('unknown pages are noindex with no canonical or structured data', () => {
    for (const route of [{ name: 'notFound' }, { name: 'product', id: 'nope' }, { name: 'careerDetail', id: 'nope' }]) {
      const m = getMeta(route)
      expect(m.noindex).toBe(true)
      expect(m.title).toBe(seo.pages.notFound.title)
      expect(m.jsonLd).toEqual([])
    }
  })
})

describe('text helpers', () => {
  it('clip cuts at a word boundary with an ellipsis', () => {
    expect(clip('short')).toBe('short')
    const out = clip('one two three four five', 14)
    expect(out).toBe('one two three…')
    expect(out.length).toBeLessThanOrEqual(14)
  })

  it('productDescription adds the suffix only when it fits whole', () => {
    expect(productDescription('Short.', 'Suffix.', 50)).toBe('Short. Suffix.')
    expect(productDescription('A much longer sentence here.', 'Suffix that will not fit.', 40)).toBe('A much longer sentence here.')
  })

  it('brandOf normalises brand casing', () => {
    expect(brandOf({ id: 'asus-vivobook-v16', name: 'Asus Vivobook V16' })).toBe('ASUS')
  })
})

describe('renderHead', () => {
  it('writes canonical, Open Graph, Twitter and JSON-LD tags with absolute URLs', () => {
    document.head.innerHTML = renderHead(getMeta({ name: 'product', id: products[0].id }))
    const $ = (s) => document.head.querySelector(s)
    expect($('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE}/product/${products[0].id}`)
    expect($('meta[property="og:image"]').content).toBe(`${SITE}/og/products/${products[0].id}.jpg`)
    expect($('meta[name="twitter:card"]').content).toBe('summary_large_image')
    const ld = JSON.parse($('script[type="application/ld+json"]').textContent)
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@graph'].map((n) => n['@type'])).toContain('Product')
  })

  it('escapes HTML in attributes and "<" inside JSON-LD', () => {
    const html = renderHead({
      path: '/x', title: 'A "quoted" <b>title</b>', description: 'd', image: '/og/techzy.jpg', imageAlt: 'a', type: 'website', noindex: false,
      jsonLd: [{ '@type': 'Thing', name: '</script><script>alert(1)</script>' }],
    })
    expect(html).not.toContain('<b>')
    expect(html.match(/<\/script>/g)).toHaveLength(1) // only the real closing tag
  })

  it('noindex pages get a robots tag instead of a canonical', () => {
    const html = renderHead(getMeta({ name: 'notFound' }))
    expect(html).toContain('<meta name="robots" content="noindex" />')
    expect(html).not.toContain('rel="canonical"')
    expect(html).not.toContain('ld+json')
  })
})

describe('applyHead (client-side navigation)', () => {
  beforeEach(() => {
    document.head.innerHTML = renderHead(getMeta({ name: 'home' }))
  })

  it('updates title, description, canonical and social tags', () => {
    applyHead(getMeta({ name: 'about' }))
    expect(document.title).toBe(seo.pages.about.title)
    expect(document.head.querySelector('meta[name="description"]').content).toBe(seo.pages.about.description)
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE}/about`)
    expect(document.head.querySelector('meta[property="og:url"]').content).toBe(`${SITE}/about`)
  })

  it('accepts a localized tab title', () => {
    applyHead(getMeta({ name: 'about' }), 'Myanmar title')
    expect(document.title).toBe('Myanmar title')
  })

  it('toggles noindex/canonical when entering and leaving a missing page', () => {
    applyHead(getMeta({ name: 'notFound' }))
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.head.querySelector('meta[name="robots"]').content).toBe('noindex')
    applyHead(getMeta({ name: 'products' }))
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE}/products`)
  })
})

describe('crawler files', () => {
  it('sitemap lists every indexable URL once', () => {
    const xml = sitemapXml()
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs).toEqual(allRoutes().map((r) => SITE + (routePath(r) === '/' ? '/' : routePath(r))))
    expect(new Set(locs).size).toBe(locs.length)
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/)
  })

  it('robots.txt allows everything and points to the sitemap', () => {
    expect(robotsTxt()).toMatch(/User-agent: \*\nAllow: \//)
    expect(robotsTxt()).toContain(`Sitemap: ${SITE}/sitemap.xml`)
    expect(robotsTxt()).not.toMatch(/Disallow/)
  })

  it('llms.txt summarises the business with every product and job', () => {
    const txt = llmsTxt()
    expect(txt.startsWith('# Techzy\n\n> ')).toBe(true)
    for (const p of products) expect(txt).toContain(`[${p.name}](${SITE}/product/${p.id})`)
    for (const p of resolvePostings(careers)) expect(txt).toContain(`${SITE}/careers/${p.id}`)
    expect(txt).toContain(seo.email)
  })
})

describe('icons and images', () => {
  it.each(['icons/logo-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-48.png', 'og/techzy.jpg'])('%s exists', (f) => {
    expect(existsSync(join(PUBLIC, f))).toBe(true)
  })

  it('every product has a share image (re-run scripts/share-images/make.py after adding one)', () => {
    for (const p of products) expect(existsSync(join(PUBLIC, productImage(p))), p.id).toBe(true)
  })
})
