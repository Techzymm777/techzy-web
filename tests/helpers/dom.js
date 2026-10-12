import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { vi } from 'vitest'

const INDEX = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')

// The real site shell (nav, menu, dock, loader, veil, footer, Netlify forms)
// from index.html, minus the module script — tests drive the modules directly.
export function loadShell() {
  const body = INDEX.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1].replace(/<script[\s\S]*?<\/script>/gi, '')
  document.body.innerHTML = body
}

export function indexHTML() {
  return INDEX
}

// matchMedia stub: `matches` is decided per query by the predicate.
export function stubMatchMedia(predicate = () => false) {
  const listeners = new Map()
  window.matchMedia = vi.fn((query) => {
    const mql = {
      media: query,
      get matches() {
        return predicate(query)
      },
      addEventListener: (_type, fn) => listeners.set(query, fn),
      removeEventListener: () => listeners.delete(query),
    }
    return mql
  })
  return {
    fire(query, matches) {
      listeners.get(query)?.({ matches, media: query })
    },
  }
}

export const isReducedQuery = (q) => q.includes('prefers-reduced-motion: reduce')

// Let pending promise callbacks (fetch mocks, dynamic imports) settle.
export const flush = () => new Promise((r) => setTimeout(r, 0))
