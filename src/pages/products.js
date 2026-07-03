import products from '../../content/products.json'
import { t } from '../i18n.js'
import { cardHTML } from './card.js'

export function render() {
  const list = [...products].sort((a, b) => a.featuredRank - b.featuredRank)
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${t('products.hero.kicker')}</span>
      <h1 class="display">${t('products.hero.title')}</h1>
      <p class="lede muted">${t('products.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap section">
    <div class="grid-products">${list.map(cardHTML).join('')}</div>
  </section>`
}
