import './styles/tokens.css'
import './styles/base.css'
import './styles/motion.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initI18n, t } from './i18n.js'
import { initRouter } from './router.js'
import { PAGES } from './pages/index.js'
import products from '../content/products.json'
import { getProductText } from './pages/card.js'
import { initShell } from './shell.js'
import { reducedMotion } from './motion/reduced.js'
import { applyReveals } from './motion/reveals.js'
import { transitionTo, runPreloader } from './motion/transitions.js'
import { initCursor } from './motion/cursor.js'
import { initSound } from './motion/sound.js'

if (import.meta.env.PROD) {
  import('./amplitude-init.js')
}

gsap.registerPlugin(ScrollTrigger)

const app = document.getElementById('app')
let currentRoute = { name: 'home' }
let pageCtx = null // gsap.context for the current page — revert() is the cleanup contract

function pageTitle(route) {
  if (route.name === 'home') return 'Techzy'
  if (route.name === 'product') {
    const p = products.find((x) => x.id === route.id)
    return p ? `${getProductText(p).name} | Techzy` : `${t('notFound.title')} | Techzy`
  }
  const key = { about: 'nav.about', products: 'nav.products', contact: 'nav.contact', notFound: 'notFound.title' }[route.name]
  return `${t(key)} | Techzy`
}

let currentPage = null

export function renderRoute(route, initial = false) {
  currentRoute = route
  currentPage?.unmount?.() // page-owned resources: three.js scene, marquee tween
  if (pageCtx) {
    pageCtx.revert() // kill every tween + ScrollTrigger the old page created
    pageCtx = null
  }
  const page = PAGES[route.name] || PAGES.notFound
  currentPage = page
  app.innerHTML = page.render(route)
  page.mount?.(route)
  window.scrollTo(0, 0)
  document.title = pageTitle(route)
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const active = a.dataset.nav === (route.name === 'product' ? 'products' : route.name)
    if (active) a.setAttribute('aria-current', 'page')
    else a.removeAttribute('aria-current')
  })
  pageCtx = applyReveals(app, initial)
}

export function getCurrentRoute() {
  return currentRoute
}

// Route changes run through the seal-cut veil; the first render happens
// instantly (the preloader covers it), and reduced motion swaps instantly.
let firstRender = true
let transitioning = false
function onRoute(route) {
  if (firstRender) {
    firstRender = false
    renderRoute(route, true)
    return
  }
  // The old page (with the link that had focus) is replaced wholesale, which
  // would drop keyboard focus back to <body>. Land it on <main> instead so
  // the tab order continues from the top of the new page.
  if (reducedMotion || transitioning) {
    renderRoute(route)
    app.focus({ preventScroll: true })
    return
  }
  transitioning = true
  transitionTo(
    () => {
      renderRoute(route)
      app.focus({ preventScroll: true })
    },
    () => {
      transitioning = false
    },
  )
}

initI18n()
initShell({ onLangChange: () => renderRoute(getCurrentRoute()) })
initSound()
initCursor()
initRouter(onRoute)
runPreloader()
