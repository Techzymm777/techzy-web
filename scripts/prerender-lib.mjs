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

// /about → dist/about/index.html, so the URL is served without a redirect.
export function outputFile(dist, path) {
  return path === '/' ? join(dist, 'index.html') : join(dist, ...path.slice(1).split('/'), 'index.html')
}
