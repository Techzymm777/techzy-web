// Post-build step (npm run build): writes a static HTML file per route with
// its own <head> (src/seo.js) and rendered page content, plus 404.html,
// sitemap.xml, robots.txt and llms.txt. Page modules are loaded through
// Vite's SSR loader (JSON + ?raw imports work as in the app) under a
// happy-dom window, since some read window/document at import time.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { injectPage, outputFile } from './prerender-lib.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const win = new Window({ url: 'https://techzymm.com/' })
globalThis.window = win
globalThis.document = win.document

const vite = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
})

try {
  const seo = await vite.ssrLoadModule('/src/seo.js')
  const { PAGES } = await vite.ssrLoadModule('/src/pages/index.js')
  const template = await readFile(join(dist, 'index.html'), 'utf8')

  const write = async (file, content) => {
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, content)
  }
  const page = (route) => injectPage(template, seo.renderHead(seo.getMeta(route)), PAGES[route.name].render(route))

  const routes = seo.allRoutes()
  for (const route of routes) await write(outputFile(dist, seo.routePath(route)), page(route))
  // Netlify serves 404.html with a 404 status for any path without a file.
  await write(join(dist, '404.html'), page({ name: 'notFound' }))
  await write(join(dist, 'sitemap.xml'), seo.sitemapXml(routes))
  await write(join(dist, 'robots.txt'), seo.robotsTxt())
  await write(join(dist, 'llms.txt'), seo.llmsTxt())

  console.log(`prerendered ${routes.length} pages + 404.html, sitemap.xml, robots.txt, llms.txt`)
} finally {
  await vite.close()
  await win.happyDOM.close()
}
