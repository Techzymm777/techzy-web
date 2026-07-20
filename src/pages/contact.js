import { t } from '../i18n.js'

// Shared contact details — both shops use the same line and inbox.
const PHONE_DISPLAY = '+95 9 783 388913'
const PHONE_TEL = '+959783388913'
const EMAIL = 'techzymm@gmail.com'

// Keyless Google Maps embeds (no API key, nothing secret to commit).
// `coords` drops a pin at exact lat,lng; `query` geocodes a text search
// to a pin (block-level accuracy) as a fallback until coords are known.
const SHOPS = [
  {
    name: 'contact.shops.ygnName',
    address: 'contact.shops.ygnAddress',
    coords: '16.797709,96.154140',
  },
  {
    name: 'contact.shops.mdyName',
    address: 'contact.shops.mdyAddress',
    query: 'Techzy, 101 Street, Maha Aungmye Township, Mandalay, Myanmar',
  },
]

function shopCard(shop) {
  const q = encodeURIComponent(shop.coords || shop.query)
  const z = shop.coords ? 17 : 16
  const embed = `https://maps.google.com/maps?q=${q}&z=${z}&hl=en&output=embed`
  const link = `https://www.google.com/maps/search/?api=1&query=${q}`
  const name = t(shop.name)
  return `
    <article class="shop" data-reveal>
      <div class="shop-map frame">
        <iframe
          src="${embed}"
          title="${name} — map"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen></iframe>
      </div>
      <div class="shop-body">
        <h3 class="title">${name}</h3>
        <p class="muted">${t(shop.address)}</p>
        <dl class="shop-contact">
          <dt>${t('contact.shops.phoneLabel')}</dt>
          <dd><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></dd>
          <dt>${t('contact.shops.emailLabel')}</dt>
          <dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd>
        </dl>
        <a class="btn" href="${link}" target="_blank" rel="noopener noreferrer"><span>${t('contact.shops.directions')}</span></a>
      </div>
    </article>`
}

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label" data-reveal>${t('contact.hero.kicker')}</span>
      <h1 class="display split">${t('contact.hero.title')}</h1>
      <p class="lede muted" data-reveal>${t('contact.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap section contact-layout">
    <div class="contact-form-col" data-reveal>
      <h2 class="title">${t('contact.form.title')}</h2>
      <p class="muted">${t('contact.form.subtitle')}</p>
      <form id="contactForm" name="contact" method="POST" action="/" data-netlify="true" data-netlify-honeypot="bot-field" novalidate>
        <input type="hidden" name="form-name" value="contact" />
        <p hidden aria-hidden="true"><label>Don't fill this out if you're human: <input name="bot-field" tabindex="-1" autocomplete="off" /></label></p>
        <div class="field">
          <label for="cName">${t('contact.form.nameLabel')}</label>
          <input id="cName" name="name" type="text" autocomplete="name" aria-describedby="err-cName" required />
          <span class="field-help" id="err-cName" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="cEmail">${t('contact.form.emailLabel')}</label>
          <input id="cEmail" name="email" type="email" autocomplete="email" inputmode="email" aria-describedby="err-cEmail" required />
          <span class="field-help" id="err-cEmail" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="cMsg">${t('contact.form.messageLabel')}</label>
          <textarea id="cMsg" name="message" rows="5" required aria-describedby="err-cMsg" placeholder="${t('contact.form.messagePlaceholder')}"></textarea>
          <span class="field-help" id="err-cMsg" role="alert" aria-live="polite"></span>
        </div>
        <div class="form-actions">
          <button class="btn solid" type="submit"><span>${t('contact.form.submit')}</span></button>
          <button class="btn" type="reset"><span>${t('contact.form.reset')}</span></button>
        </div>
        <p class="field-help" id="formStatus" role="status" aria-live="polite"></p>
      </form>
    </div>
    <div class="shops-col">
      <div class="shops-head" data-reveal>
        <span class="label">${t('contact.shops.kicker')}</span>
        <h2 class="title">${t('contact.shops.title')}</h2>
      </div>
      <div class="shops-rows">
        ${SHOPS.map(shopCard).join('')}
      </div>
    </div>
  </section>`
}

export function mount() {
  const form = document.getElementById('contactForm')
  if (!form) return
  const status = document.getElementById('formStatus')
  const submitBtn = form.querySelector('button[type="submit"]')

  const setErr = (id, message) => {
    const help = document.getElementById(`err-${id}`)
    if (help) help.textContent = message || ''
  }
  const setStatus = (message) => {
    if (status) status.textContent = message || ''
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const n = form.elements.name.value.trim()
    const em = form.elements.email.value.trim()
    const m = form.elements.message.value.trim()

    setErr('cName', n ? '' : t('contact.err.name'))
    setErr('cEmail', isValidEmail(em) ? '' : t('contact.err.email'))
    setErr('cMsg', m ? '' : t('contact.err.message'))
    if (!n || !isValidEmail(em) || !m) return

    setStatus(t('contact.form.sending'))
    if (submitBtn) submitBtn.disabled = true
    try {
      const body = new URLSearchParams(new FormData(form)).toString()
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (res.ok) {
        form.reset()
        setStatus(t('contact.form.success'))
      } else {
        setStatus(t('contact.form.error'))
      }
    } catch {
      setStatus(t('contact.form.error'))
    } finally {
      if (submitBtn) submitBtn.disabled = false
    }
  })

  form.addEventListener('reset', () => {
    setErr('cName', '')
    setErr('cEmail', '')
    setErr('cMsg', '')
    setStatus('')
  })
}
