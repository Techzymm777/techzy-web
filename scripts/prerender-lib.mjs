import { join } from 'node:path'

const START = '<!--seo:start-->'
const END = '<!--seo:end-->'
const MAIN = '<main id="app" tabindex="-1"></main>'

// Builds one page's HTML from the built index.html: swaps the marked <head>
// block for the route's metadata and fills <main> with the rendered page, so
// crawlers and link previews see real content without running JavaScript.
// The client renders the same markup over it on boot.
export function injectPage(template, head, body) {
  const s = template.indexOf(START)
  const e = template.indexOf(END)
  if (s < 0 || e < s) throw new Error(`index.html is missing the ${START} / ${END} markers`)
  if (!template.includes(MAIN)) throw new Error(`index.html is missing an empty ${MAIN}`)
  const html = template.slice(0, s) + head + template.slice(e + END.length)
  return html.replace(MAIN, () => `<main id="app" tabindex="-1">${body}</main>`)
}

// /about → dist/about.html. Netlify serves that at /about directly; a
// directory index (about/index.html) would 301 /about to /about/ instead,
// putting a redirect in front of every canonical URL and internal link.
export function outputFile(dist, path) {
  if (path === '/') return join(dist, 'index.html')
  const parts = path.slice(1).split('/')
  parts[parts.length - 1] += '.html'
  return join(dist, ...parts)
}
