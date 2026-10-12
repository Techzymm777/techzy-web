// Minimal Markdown → HTML for repo-controlled long-form copy (the privacy
// policy). Supports exactly what that copy uses: # / ## / ### headings,
// paragraphs, "-" lists, pipe tables, --- rules, **bold**, and bare email
// addresses (auto-linked). Everything is escaped before inline markup is added.
import { esc } from './escape.js'

export function inline(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, (m) => `<a href="mailto:${m}">${m}</a>`)
}

// Plain text with inline markup removed — for labels and attributes.
export function plain(text) {
  return String(text).replace(/\*\*(.+?)\*\*/g, '$1')
}

const HEADING = /^(#{1,3})\s+(.*)$/
const RULE = /^-{3,}\s*$/
const ITEM = /^\s*[-*]\s+/
const ROW = /^\s*\|/

const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())

export function parseMarkdown(md) {
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const h = line.match(HEADING)
    if (!line.trim()) {
      i++
    } else if (h) {
      blocks.push({ type: `h${h[1].length}`, text: h[2].trim() })
      i++
    } else if (RULE.test(line)) {
      blocks.push({ type: 'hr' })
      i++
    } else if (ITEM.test(line)) {
      const items = []
      while (i < lines.length && ITEM.test(lines[i])) items.push(lines[i++].replace(ITEM, '').trim())
      blocks.push({ type: 'ul', items })
    } else if (ROW.test(line)) {
      const rows = []
      while (i < lines.length && ROW.test(lines[i])) rows.push(cells(lines[i++]))
      const [head, ...rest] = rows
      // Drop the |---|---| separator row.
      const body = rest.filter((r) => !r.every((c) => /^:?-+:?$/.test(c)))
      blocks.push({ type: 'table', head, rows: body })
    } else {
      const para = []
      while (i < lines.length && lines[i].trim() && !HEADING.test(lines[i]) && !RULE.test(lines[i]) && !ITEM.test(lines[i]) && !ROW.test(lines[i])) {
        para.push(lines[i++].trim())
      }
      blocks.push({ type: 'p', text: para.join(' ') })
    }
  }
  return blocks
}

// Renders body blocks (h3, p, ul, table). Tables carry data-label on each
// cell so they can stack into label/value rows on narrow screens.
export function renderBlocks(blocks) {
  return blocks
    .map((b) => {
      if (b.type === 'h3') return `<h3>${inline(b.text)}</h3>`
      if (b.type === 'p') return `<p>${inline(b.text)}</p>`
      if (b.type === 'ul') return `<ul class="jd-list">${b.items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`
      if (b.type === 'table') {
        return `<table class="policy-table">
          <thead><tr>${b.head.map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead>
          <tbody>${b.rows.map((r) => `<tr>${r.map((c, k) => `<td data-label="${esc(plain(b.head[k] || ''))}">${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`
      }
      return ''
    })
    .join('')
}
