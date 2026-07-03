import { getLang, t } from '../i18n.js'

export function getProductText(p) {
  const isMy = getLang() === 'my'
  return {
    name: isMy ? p.nameMy || p.name : p.name,
    badge: isMy ? p.badgeMy || p.badge : p.badge,
    desc: isMy ? p.descMy || p.desc : p.desc,
    specs: isMy ? p.specsMy || p.specs : p.specs,
  }
}

export function cardHTML(p, i) {
  const pt = getProductText(p)
  return `
  <article class="card" data-card>
    <a href="/product/${p.id}" aria-label="${pt.name}">
      <span class="idx">${String(i + 1).padStart(2, '0')} / ${pt.badge}</span>
      <div class="frame" style="aspect-ratio:4/3"><img src="/assets/images/products/${p.image}" alt="${pt.name}" loading="lazy"></div>
      <h3>${pt.name}</h3>
      <p class="spec muted">${pt.specs.slice(0, 4).join(' / ')}</p>
    </a>
    <div class="card-actions">
      <a class="btn" href="/contact" aria-label="${t('products.card.askAria', { name: pt.name })}"><span>${t('products.card.ask')}</span></a>
      <a class="btn solid" href="/contact" aria-label="${t('products.card.buyAria', { name: pt.name })}"><span>${t('products.card.buy')}</span></a>
    </div>
  </article>`
}
