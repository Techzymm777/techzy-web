import { applyI18n, getLang, setLang } from './i18n.js'

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

  // Language toggle — persists and re-renders the current route.
  const langBtn = document.getElementById('langToggle')
  const syncLangBtn = () => {
    langBtn.textContent = getLang() === 'my' ? 'EN' : 'MY'
  }
  langBtn.addEventListener('click', () => {
    setLang(getLang() === 'my' ? 'en' : 'my')
    syncLangBtn()
    onLangChange()
  })
  syncLangBtn()

  // Footer bits.
  document.getElementById('year').textContent = String(new Date().getFullYear())
  document.getElementById('backToTop').addEventListener('click', (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  applyI18n()
}
