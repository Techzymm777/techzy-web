import products from '../../content/products.json'
import { t } from '../i18n.js'
import { getProductText } from './card.js'
import * as notFound from './not-found.js'

export function render(route) {
  const p = products.find((x) => x.id === route.id)
  if (!p) return notFound.render()
  const pt = getProductText(p)
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${pt.badge}</span>
      <h1 class="display">${pt.name}</h1>
    </div>
  </section>
  <section class="wrap section pd-grid">
    <div class="frame" style="aspect-ratio:4/3"><img src="/assets/images/products/${p.image}" alt="${pt.name}"></div>
    <div>
      <p class="lede">${pt.desc}</p>
      <ul class="pd-specs">${pt.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div class="pd-actions">
        <a class="btn solid" href="/contact" aria-label="${t('products.card.buyAria', { name: pt.name })}"><span>${t('products.card.buy')}</span></a>
        <a class="btn" href="/contact" aria-label="${t('products.card.askAria', { name: pt.name })}"><span>${t('products.card.ask')}</span></a>
      </div>
    </div>
  </section>`
}
