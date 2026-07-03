import { getLang, t } from '../i18n.js'
import { esc } from '../escape.js'

export function getProductText(p) {
  const isMy = getLang() === 'my'
  return {
    name: isMy ? p.nameMy || p.name : p.name,
    badge: isMy ? p.badgeMy || p.badge : p.badge,
    desc: isMy ? p.descMy || p.desc : p.desc,
    specs: isMy ? p.specsMy || p.specs : p.specs,
  }
}

// heading defaults to h3 (cards sit under an h2 section on home); the
// products page passes h2 since its cards sit directly under the page h1.
export function cardHTML(p, i, heading = 'h3') {
  const pt = getProductText(p)
  return `
  <article class="card" data-card>
    <a href="/product/${esc(p.id)}">
      <span class="idx">${String(i + 1).padStart(2, '0')} / ${esc(pt.badge)}</span>
      <div class="frame" data-clip style="aspect-ratio:4/3"><img src="/assets/images/products/${esc(p.image)}" alt="" loading="lazy"></div>
      <${heading} class="card-title">${esc(pt.name)}</${heading}>
      <p class="spec muted">${pt.specs.slice(0, 4).map(esc).join(' / ')}</p>
    </a>
    <div class="card-actions">
      <a class="btn" href="/contact" aria-label="${esc(t('products.card.ask'))}: ${esc(pt.name)}"><span>${t('products.card.ask')}</span></a>
      <a class="btn solid" href="/contact" aria-label="${esc(t('products.card.buy'))}: ${esc(pt.name)}"><span>${t('products.card.buy')}</span></a>
    </div>
  </article>`
}
