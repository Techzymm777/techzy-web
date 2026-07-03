import products from '../../content/products.json'
import { t } from '../i18n.js'
import { esc } from '../escape.js'
import { getProductText } from './card.js'
import * as notFound from './not-found.js'

// One template serves the whole catalog, driven by product data.
export function render(route) {
  const p = products.find((x) => x.id === route.id)
  if (!p) return notFound.render()
  const pt = getProductText(p)
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label" data-reveal>${esc(pt.badge)}</span>
      <h1 class="display split">${esc(pt.name)}</h1>
    </div>
  </section>
  <section class="wrap section pd-grid" style="padding-top:0">
    <div class="frame" data-clip style="aspect-ratio:4/3"><img src="/assets/images/products/${esc(p.image)}" alt="${esc(pt.name)}"></div>
    <div>
      <p class="lede" data-reveal>${esc(pt.desc)}</p>
      <table class="pd-specs" data-reveal>
        <tbody>
          ${pt.specs.map((s, i) => `<tr><td>${String(i + 1).padStart(2, '0')}</td><td>${esc(s)}</td></tr>`).join('')}
          <tr><td>${t('home.metrics.warrantyLabel')}</td><td>${t('home.metrics.warrantyValue')}</td></tr>
          <tr><td>${t('home.metrics.shippingLabel')}</td><td>${t('home.metrics.shippingValue')}</td></tr>
          <tr><td>${t('home.metrics.supportLabel')}</td><td>${t('home.metrics.supportValue')}</td></tr>
        </tbody>
      </table>
      <div class="pd-actions" data-reveal>
        <a class="btn solid" href="/contact" aria-label="${esc(t('products.card.buyAria', { name: pt.name }))}"><span>${t('products.card.buy')}</span></a>
        <a class="btn" href="/contact" aria-label="${esc(t('products.card.askAria', { name: pt.name }))}"><span>${t('products.card.ask')}</span></a>
      </div>
    </div>
  </section>`
}
