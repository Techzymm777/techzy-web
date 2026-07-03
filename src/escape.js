// Minimal HTML escaper for values interpolated into template strings.
// Product/catalog data is repo-controlled today, but escaping at the
// template boundary keeps the pages safe if it ever becomes CMS/API-fed.
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => MAP[c])
}
