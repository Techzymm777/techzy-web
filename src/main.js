import './styles/tokens.css'
import './styles/base.css'
import { initI18n, t } from './i18n.js'
import { initRouter } from './router.js'
import { PAGES } from './pages/index.js'
import products from '../content/products.json'
import { getProductText } from './pages/card.js'
import { initShell } from './shell.js'

if (import.meta.env.PROD) {
  import('./amplitude-init.js')
}

const app = document.getElementById('app')
let currentRoute = { name: 'home' }

function pageTitle(route) {
  if (route.name === 'home') return 'Techzy'
  if (route.name === 'product') {
    const p = products.find((x) => x.id === route.id)
    return p ? `${getProductText(p).name} | Techzy` : `${t('notFound.title')} | Techzy`
  }
  const key = { about: 'nav.about', products: 'nav.products', contact: 'nav.contact', notFound: 'notFound.title' }[route.name]
  return `${t(key)} | Techzy`
}

export function renderRoute(route) {
  currentRoute = route
  const page = PAGES[route.name] || PAGES.notFound
  app.innerHTML = page.render(route)
  page.mount?.(route)
  window.scrollTo(0, 0)
  document.title = pageTitle(route)
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const active = a.dataset.nav === (route.name === 'product' ? 'products' : route.name)
    if (active) a.setAttribute('aria-current', 'page')
    else a.removeAttribute('aria-current')
  })
}

export function getCurrentRoute() {
  return currentRoute
}

initI18n()
initShell({ onLangChange: () => renderRoute(getCurrentRoute()) })
initRouter(renderRoute)
