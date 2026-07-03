import products from '../../content/products.json'
import { t } from '../i18n.js'
import { esc } from '../escape.js'
import { cardHTML } from './card.js'
import { filterProducts, sortProducts } from '../catalog.js'

const TABS = [
  ['all', 'products.filters.all'],
  ['laptop', 'products.filters.laptops'],
  ['desktop', 'products.filters.desktops'],
  ['accessory', 'products.filters.accessories'],
]

export function render() {
  const list = sortProducts(products, 'featured')
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label" data-reveal>${t('products.hero.kicker')}</span>
      <h1 class="display split">${t('products.hero.title')}</h1>
      <p class="lede muted" data-reveal>${t('products.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap" style="padding-bottom:var(--s16)">
    <div class="toolbar" data-reveal>
      <div class="tabs" role="group" aria-label="${t('products.filters.all')} / ${t('products.filters.laptops')} / ${t('products.filters.desktops')} / ${t('products.filters.accessories')}">
        ${TABS.map(([key, label], i) => `<button class="tab" type="button" data-cat="${key}" aria-pressed="${i === 0}">${t(label)}</button>`).join('')}
      </div>
      <div class="toolbar-controls">
        <label class="search">
          <span class="label">${t('products.filters.searchLabel')}</span>
          <input id="q" type="search" aria-label="${esc(t('products.filters.searchLabel'))}" placeholder="${esc(t('products.filters.searchPlaceholder'))}">
        </label>
        <label class="sort">
          <span class="label">${t('products.filters.sortLabel')}</span>
          <select id="sortSel" aria-label="${esc(t('products.filters.sortLabel'))}">
            <option value="featured">${t('products.sort.featured')}</option>
            <option value="nameAsc">${t('products.sort.nameAsc')}</option>
          </select>
        </label>
      </div>
    </div>
    <div class="grid-products" id="productGrid">${list.map((p, i) => cardHTML(p, i, 'h2')).join('')}</div>
    <div class="empty" id="emptyState" hidden>
      <h2 class="title">${t('products.empty.title')}</h2>
      <p class="muted">${t('products.empty.body')}</p>
      <button class="btn" type="button" id="resetFilters" style="margin-top:var(--s3)"><span>${t('products.empty.reset')}</span></button>
    </div>
  </section>`
}

export function mount() {
  const grid = document.getElementById('productGrid')
  const empty = document.getElementById('emptyState')
  const q = document.getElementById('q')
  const sortSel = document.getElementById('sortSel')
  const tabs = [...document.querySelectorAll('.tab')]
  let category = 'all'

  const apply = () => {
    const list = sortProducts(filterProducts(products, { category, term: q.value }), sortSel.value)
    grid.innerHTML = list.map((p, i) => cardHTML(p, i, 'h2')).join('')
    // Filtered results appear mid-page after the entry reveals already ran —
    // show them immediately instead of leaving them in the hidden pre-reveal state.
    grid.querySelectorAll('[data-clip]').forEach((el) => {
      el.removeAttribute('data-clip')
      el.style.clipPath = 'none'
    })
    const none = list.length === 0
    grid.hidden = none
    empty.hidden = !none
  }

  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-pressed', 'false'))
      tab.setAttribute('aria-pressed', 'true')
      category = tab.dataset.cat
      apply()
    }),
  )
  q.addEventListener('input', apply)
  sortSel.addEventListener('change', apply)
  document.getElementById('resetFilters').addEventListener('click', () => {
    q.value = ''
    sortSel.value = 'featured'
    category = 'all'
    tabs.forEach((x, i) => x.setAttribute('aria-pressed', String(i === 0)))
    apply()
  })
}
