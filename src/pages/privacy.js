import policy from '../../content/privacy-policy.en.md?raw'
import { esc } from '../escape.js'
import { inline, parseMarkdown, plain, renderBlocks } from '../markdown.js'
import { reducedMotion } from '../motion/reduced.js'

// The policy is authored in Markdown (content/privacy-policy.en.md) and kept
// verbatim; this page only lays it out. It exists in English only, so the
// copy is marked lang="en" even when the site language is Myanmar (SC 3.1.2).

const slug = (s) => 'policy-' + plain(s).toLowerCase().replace(/^\d+\.\s*/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function parsePolicy(md = policy) {
  const blocks = parseMarkdown(md).filter((b) => b.type !== 'hr')
  const title = blocks.find((b) => b.type === 'h1')?.text || ''
  const updated = blocks.find((b) => b.type === 'p' && /^\*\*Last updated/i.test(b.text))
  const intro = []
  const sections = []
  for (const b of blocks) {
    if (b.type === 'h1' || b === updated) continue
    if (b.type === 'h2') sections.push({ id: slug(b.text), title: b.text, blocks: [] })
    else if (sections.length) sections.at(-1).blocks.push(b)
    else intro.push(b)
  }
  return { title, updated: updated ? plain(updated.text) : '', intro, sections }
}

export function title() {
  return plain(parsePolicy().title)
}

export function render() {
  const { title: heading, updated, intro, sections } = parsePolicy()
  return `
  <section class="page-head" lang="en">
    <div class="wrap">
      ${updated ? `<span class="label" data-reveal>${esc(updated)}</span>` : ''}
      <h1 class="display split">${esc(plain(heading))}</h1>
      <div class="policy-intro" data-reveal>${renderBlocks(intro)}</div>
    </div>
  </section>
  <section class="wrap section policy-grid" style="padding-top:0" lang="en">
    <nav class="policy-toc" aria-label="${esc(plain(heading))}" data-reveal>
      <ol>
        ${sections.map((s) => `<li><a href="#${s.id}">${inline(s.title)}</a></li>`).join('')}
      </ol>
    </nav>
    <div class="policy-body">
      ${sections
        .map(
          (s) => `
      <section class="policy-section" aria-labelledby="${s.id}" data-reveal>
        <h2 class="jd-heading" id="${s.id}" tabindex="-1">${inline(s.title)}</h2>
        ${renderBlocks(s.blocks)}
      </section>`,
        )
        .join('')}
    </div>
  </section>`
}

// Contents links scroll in place instead of changing the URL hash: a hash
// navigation fires popstate, which the router would treat as a route change.
export function mount() {
  const toc = document.querySelector('.policy-toc')
  if (!toc) return
  toc.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const target = document.getElementById(a.getAttribute('href').slice(1))
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    target.focus({ preventScroll: true })
  })
}
