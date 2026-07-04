import { applyI18n, getLang, setLang, t } from './i18n.js'
import { reducedMotion } from './motion/reduced.js'

export function initShell({ onLangChange }) {
  const nav = document.getElementById('nav')
  const progress = document.getElementById('progress')

  // Hide nav on scroll down, show on scroll up; drive the progress bar.
  let lastY = 0
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY
      nav.classList.toggle('is-hidden', y > lastY && y > 160)
      lastY = y
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%'
    },
    { passive: true },
  )

  // Sound toggle is owned by src/motion/sound.js (initSound in main.js).

  // Language toggle — persists and re-renders the current route. Two
  // instances share the wiring: nav (mobile/small tablet) and dock (desktop).
  const langBtns = Array.from(document.querySelectorAll('[data-lang-toggle]'))
  const syncLangBtn = () => {
    const next = getLang() === 'my' ? 'EN' : 'MY'
    for (const btn of langBtns) {
      btn.textContent = next
      // Label in Name (SC 2.5.3): accessible name must contain the visible text.
      btn.setAttribute('aria-label', `${next} — ${t('common.langToggleAria')}`)
    }
  }
  for (const btn of langBtns) {
    btn.addEventListener('click', () => {
      setLang(getLang() === 'my' ? 'en' : 'my')
      syncLangBtn()
      onLangChange()
    })
  }
  syncLangBtn()

  // Off-canvas menu (mobile + tablet). Scroll locks while open; Escape and
  // any menu-link click close it; focus moves into the menu on open and back
  // to the toggle on close (a later route change re-lands focus on <main>).
  const menu = document.getElementById('menu')
  const menuBtn = document.getElementById('menuToggle')
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open)
    menuBtn.setAttribute('aria-expanded', String(open))
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) menu.querySelector('a')?.focus({ preventScroll: true })
    else menuBtn.focus({ preventScroll: true })
  }
  menuBtn.addEventListener('click', () => {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true')
  })
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false)
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false)
  })
  // Resizing to desktop hides the overlay via CSS — release the scroll lock too.
  window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
    if (e.matches && menu.classList.contains('is-open')) setMenu(false)
  })

  // Footer bits. Back-to-top has two instances: footer text link
  // (mobile/small tablet) and dock icon (desktop).
  document.getElementById('year').textContent = String(new Date().getFullYear())
  for (const el of document.querySelectorAll('[data-back-to-top]')) {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
      document.getElementById('app').focus({ preventScroll: true })
    })
  }

  applyI18n()
}
