// Search + share metadata for every route: title, description, canonical,
// social image, and schema.org structured data. One source for both the
// build-time prerender (scripts/prerender.mjs writes it into each page's
// <head>) and client-side route changes (applyHead). Copy lives in
// content/seo.json; product and job data come from the real catalogs.
import seo from '../content/seo.json'
import products from '../content/products.json'
import careers from '../content/careers.json'
import { findPosting, resolvePostings } from './careers.js'
import { esc } from './escape.js'
import { title as privacyTitle } from './pages/privacy.js'

export const SITE = seo.site

const abs = (path) => new URL(path, SITE + '/').href
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')

// Cut at a word boundary so descriptions stay within what results pages show.
export function clip(text, max = 155) {
  const s = String(text).replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  let cut = s.slice(0, max - 1)
  if (s[max - 1] !== ' ') cut = cut.slice(0, cut.lastIndexOf(' ')) // don't end mid-word
  return cut.replace(/[,;:.\s—-]+$/, '') + '…'
}

// The product's own sentence, plus the factory-sealed line when it fits whole.
export function productDescription(desc, suffix, max = 155) {
  const full = `${desc} ${suffix}`
  return full.length <= max ? full : clip(desc, max)
}

const BRANDS = { asus: 'ASUS', acer: 'Acer', lenovo: 'Lenovo' }
export const brandOf = (p) => BRANDS[p.id.split('-')[0]] || p.name.split(' ')[0]

export function routePath(route) {
  if (route.name === 'home') return '/'
  if (route.name === 'product') return `/product/${route.id}`
  if (route.name === 'careerDetail') return `/careers/${route.id}`
  if (route.name === 'privacy') return '/privacy-policy'
  return `/${route.name}`
}

// Every indexable route, in sitemap order.
export function allRoutes() {
  return [
    { name: 'home' },
    { name: 'products' },
    ...products.map((p) => ({ name: 'product', id: p.id })),
    { name: 'about' },
    { name: 'contact' },
    { name: 'careers' },
    ...resolvePostings(careers).map((p) => ({ name: 'careerDetail', id: p.id })),
    { name: 'privacy' },
  ]
}

// ---- structured data -------------------------------------------------------

const ORG_ID = `${SITE}/#organization`

function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: seo.name,
    alternateName: seo.legalName,
    url: SITE + '/',
    logo: abs(seo.logo),
    slogan: seo.slogan,
    email: seo.email,
    telephone: seo.telephone,
    ...(seo.sameAs.length ? { sameAs: seo.sameAs } : {}),
  }
}

function website() {
  return { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE + '/', name: seo.name, publisher: { '@id': ORG_ID }, inLanguage: ['en', 'my'] }
}

function stores() {
  return seo.shops.map((s) => ({
    '@type': 'ElectronicsStore',
    '@id': `${SITE}/contact#${s.id}`,
    name: s.name,
    url: abs('/contact'),
    image: abs(seo.defaultImage),
    telephone: seo.telephone,
    email: seo.email,
    parentOrganization: { '@id': ORG_ID },
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.streetAddress,
      addressLocality: s.locality,
      addressRegion: s.region,
      ...(s.postalCode ? { postalCode: s.postalCode } : {}),
      addressCountry: 'MM',
    },
    ...(s.latitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: s.latitude, longitude: s.longitude } } : {}),
  }))
}

function breadcrumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  }
}

function productData(p) {
  return {
    '@type': 'Product',
    '@id': abs(`/product/${p.id}`) + '#product',
    name: p.name,
    description: p.desc,
    sku: p.id,
    category: 'Laptops',
    brand: { '@type': 'Brand', name: brandOf(p) },
    image: [abs(productImage(p)), abs(`/assets/images/products/${p.image}`)],
    url: abs(`/product/${p.id}`),
    additionalProperty: p.specs.map((value) => ({ '@type': 'PropertyValue', name: 'Specification', value })),
  }
}

function jobData(p) {
  const list = (heading, items) => (items?.length ? `<p><strong>${esc(heading)}</strong></p><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '')
  return {
    '@type': 'JobPosting',
    title: p.title,
    description:
      `<p>${esc(p.summary)}</p>` +
      list('Requirements', p.requirements) +
      list('Responsibilities', p.responsibilities) +
      list('Who should apply', p.whoShouldApply) +
      list("What you'll learn", p.whatYoullLearn),
    datePosted: p.datePosted,
    employmentType: /full/i.test(p.type) ? 'FULL_TIME' : /part/i.test(p.type) ? 'PART_TIME' : undefined,
    totalJobOpenings: p.openings,
    directApply: true,
    hiringOrganization: { '@type': 'Organization', name: seo.name, sameAs: SITE + '/', logo: abs(seo.logo) },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: p.locationLabel, addressCountry: 'MM' },
    },
    url: abs(`/careers/${p.id}`),
  }
}

// ---- per-route metadata ----------------------------------------------------

export const productImage = (p) => `/og/products/${p.id}.jpg`

export function getMeta(route) {
  const page = seo.pages
  const base = {
    path: routePath(route),
    image: seo.defaultImage,
    imageAlt: seo.defaultImageAlt,
    type: 'website',
    noindex: false,
    jsonLd: [organization(), website()],
  }

  switch (route.name) {
    case 'home':
      return { ...base, ...page.home, jsonLd: [...base.jsonLd, ...stores()] }
    case 'contact':
      return { ...base, ...page.contact, jsonLd: [...base.jsonLd, ...stores()] }
    case 'about':
    case 'products':
    case 'careers':
      return { ...base, ...page[route.name] }
    case 'privacy':
      return { ...base, ...page.privacy, title: `${privacyTitle()} | ${seo.name}` }
    case 'product': {
      const p = products.find((x) => x.id === route.id)
      if (!p) break
      return {
        ...base,
        title: fill(page.product.title, { name: p.name }),
        description: productDescription(p.desc, page.product.suffix),
        image: productImage(p),
        imageAlt: p.name,
        jsonLd: [...base.jsonLd, productData(p), breadcrumbs([['Home', '/'], ['Products', '/products'], [p.name, `/product/${p.id}`]])],
      }
    }
    case 'careerDetail': {
      const p = findPosting(careers, route.id)
      if (!p) break
      return {
        ...base,
        title: fill(page.careerDetail.title, { title: p.title, location: p.locationLabel }),
        description: clip(`${p.title} in ${p.locationLabel}: ${p.openings} openings, ${p.type.toLowerCase()}. ${p.summary}`),
        jsonLd: [...base.jsonLd, jobData(p), breadcrumbs([['Home', '/'], ['Careers', '/careers'], [p.title, `/careers/${p.id}`]])],
      }
    }
  }
  return { ...base, ...page.notFound, path: routePath(route), noindex: true, jsonLd: [] }
}

// ---- rendering -------------------------------------------------------------

const json = (data) => JSON.stringify({ '@context': 'https://schema.org', '@graph': data }).replace(/</g, '\\u003c')

// The <head> block the prerender writes for a route.
export function renderHead(meta) {
  const url = abs(meta.path)
  const image = abs(meta.image)
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${esc(seo.name)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${esc(meta.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    meta.jsonLd.length ? `<script type="application/ld+json">${json(meta.jsonLd)}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ')
}

// Keep the live <head> in step on client-side route changes, so a link
// copied or shared after navigating carries the right title and URL.
export function applyHead(meta, title = meta.title, doc = document) {
  doc.title = title
  const set = (selector, attr, value) => doc.head.querySelector(selector)?.setAttribute(attr, value)
  set('meta[name="description"]', 'content', meta.description)
  set('meta[property="og:title"]', 'content', meta.title)
  set('meta[property="og:description"]', 'content', meta.description)
  set('meta[property="og:url"]', 'content', abs(meta.path))
  set('meta[property="og:image"]', 'content', abs(meta.image))
  set('meta[name="twitter:title"]', 'content', meta.title)
  set('meta[name="twitter:description"]', 'content', meta.description)
  set('meta[name="twitter:image"]', 'content', abs(meta.image))

  let canonical = doc.head.querySelector('link[rel="canonical"]')
  let robots = doc.head.querySelector('meta[name="robots"]')
  if (meta.noindex) {
    canonical?.remove()
    if (!robots) {
      robots = doc.createElement('meta')
      robots.setAttribute('name', 'robots')
      doc.head.appendChild(robots)
    }
    robots.setAttribute('content', 'noindex')
  } else {
    robots?.remove()
    if (!canonical) {
      canonical = doc.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      doc.head.appendChild(canonical)
    }
    canonical.setAttribute('href', abs(meta.path))
  }
}

// ---- crawler files -----------------------------------------------------------

export function sitemapXml(routes = allRoutes()) {
  const urls = routes.map((r) => `  <url><loc>${esc(abs(routePath(r)))}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function robotsTxt() {
  return `# Search engines and AI assistants are welcome to read the whole site.\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
}

// llms.txt (llmstxt.org): a plain summary AI tools can read in one request.
export function llmsTxt() {
  const shop = (s) => `- ${s.name}: ${s.streetAddress}, ${s.locality}, Myanmar`
  const product = (p) => `- [${p.name}](${abs(`/product/${p.id}`)}): ${p.badge}. ${p.specs.slice(0, 4).join(', ')}.`
  const job = (p) => `- [${p.title}, ${p.locationLabel}](${abs(`/careers/${p.id}`)}): ${p.openings} openings, ${p.type}.`
  return [
    `# ${seo.name}`,
    '',
    `> ${seo.summary}`,
    '',
    '## Shops',
    '',
    ...seo.shops.map(shop),
    `- Phone: ${seo.telephoneDisplay}`,
    `- Email: ${seo.email}`,
    '',
    '## Pages',
    '',
    `- [Home](${abs('/')}): what Techzy sells and why it is factory sealed`,
    `- [Products](${abs('/products')}): the full laptop catalog, with search and filters`,
    `- [About](${abs('/about')}): how Techzy selects and sells laptops`,
    `- [Contact](${abs('/contact')}): shop addresses, maps, phone, email and a contact form`,
    `- [Careers](${abs('/careers')}): open jobs`,
    `- [Privacy Policy](${abs('/privacy-policy')})`,
    '',
    '## Laptops',
    '',
    ...[...products].sort((a, b) => a.featuredRank - b.featuredRank).map(product),
    '',
    '## Careers',
    '',
    ...resolvePostings(careers).map(job),
    '',
  ].join('\n')
}
