import en from '../content/copy.en.json'
import my from '../content/copy.my.json'

const DICTS = { en, my }
let activeLang = 'en'

export function normalizeLang(l) {
  const s = String(l || '').toLowerCase()
  if (s.startsWith('my') || s.startsWith('mm')) return 'my'
  return 'en'
}

export function getLang() {
  return activeLang
}

export function t(key, vars) {
  const dict = DICTS[activeLang] || DICTS.en
  let out = dict[key] ?? DICTS.en[key] ?? ''
  if (!out) return ''
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v))
    }
  }
  return out
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    const value = t(node.getAttribute('data-i18n'))
    if (value) node.textContent = value
  })
  root.querySelectorAll('[data-i18n-attr]').forEach((node) => {
    const parts = (node.getAttribute('data-i18n-attr') || '').split(/\s+/).filter(Boolean)
    for (const p of parts) {
      const idx = p.indexOf(':')
      if (idx === -1) continue
      const attr = p.slice(0, idx).trim()
      const key = p.slice(idx + 1).trim()
      const value = t(key)
      if (attr && value) node.setAttribute(attr, value)
    }
  })
}

export function setLang(lang) {
  activeLang = normalizeLang(lang)
  window.localStorage.setItem('lang', activeLang)
  document.documentElement.lang = activeLang
  applyI18n()
}

export function initI18n() {
  // Live-site behavior: default 'en' unless the user saved a choice.
  activeLang = normalizeLang(window.localStorage.getItem('lang'))
  document.documentElement.lang = activeLang
  applyI18n()
}
