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
      <span class="label" data-reveal>${pt.badge}</span>
      <h1 class="display split">${pt.name}</h1>
    </div>
  </section>
  <section class="wrap section pd-grid">
    <div class="frame" data-clip style="aspect-ratio:4/3"><img src="/assets/images/products/${p.image}" alt="${pt.name}"></div>
    <div>
      <p class="lede" data-reveal>${pt.desc}</p>
      <ul class="pd-specs" data-reveal>${pt.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div class="pd-actions" data-reveal>
        <a class="btn solid" href="/contact" aria-label="${t('products.card.buyAria', { name: pt.name })}"><span>${t('products.card.buy')}</span></a>
        <a class="btn" href="/contact" aria-label="${t('products.card.askAria', { name: pt.name })}"><span>${t('products.card.ask')}</span></a>
      </div>
    </div>
  </section>`
}
