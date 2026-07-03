let handler = null

export function parseRoute(pathname) {
  const path = String(pathname || '/').replace(/\/+$/, '') || '/'
  if (path === '/') return { name: 'home' }
  if (path === '/about') return { name: 'about' }
  if (path === '/products') return { name: 'products' }
  if (path === '/contact') return { name: 'contact' }
  const m = path.match(/^\/product\/([A-Za-z0-9-]+)$/)
  if (m) return { name: 'product', id: m[1] }
  return { name: 'notFound' }
}

export function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path)
  }
  handler?.(parseRoute(path))
}

export function initRouter(onRoute) {
  handler = onRoute

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]')
    if (!a) return
    const href = a.getAttribute('href')
    // Only intercept same-origin path links; leave #anchors, external
    // URLs, downloads, and modified clicks to the browser.
    if (!href || !href.startsWith('/')) return
    if (a.target === '_blank' || a.hasAttribute('download')) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    navigate(href)
  })

  window.addEventListener('popstate', () => {
    handler?.(parseRoute(window.location.pathname))
  })

  handler(parseRoute(window.location.pathname))
}
