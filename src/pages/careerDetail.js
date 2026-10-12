import careers from '../../content/careers.json'
import { getLang, t } from '../i18n.js'
import { esc } from '../escape.js'
import { findPosting } from '../careers.js'
import { getPostingText } from './careers.js'
import * as notFound from './not-found.js'

// Resume attachments accepted by the apply form. Client-side guard only —
// UX, not security; Netlify enforces its own storage limits server-side.
const ACCEPT_EXT = ['.pdf', '.doc', '.docx']
const ACCEPT_ATTR = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

// Language-aware view of a resolved role's list sections.
function getRoleText(p) {
  const isMy = getLang() === 'my'
  const pick = (en, my) => (isMy ? p[my] || p[en] : p[en]) || []
  return {
    requirements: pick('requirements', 'requirementsMy'),
    responsibilities: pick('responsibilities', 'responsibilitiesMy'),
    whoShouldApply: pick('whoShouldApply', 'whoShouldApplyMy'),
    whatYoullLearn: pick('whatYoullLearn', 'whatYoullLearnMy'),
  }
}

function section(titleKey, items) {
  if (!items.length) return ''
  return `
  <div class="jd-section" data-reveal>
    <h2 class="jd-heading">${t(titleKey)}</h2>
    <ul class="jd-list">
      ${items.map((it) => `<li>${esc(it)}</li>`).join('')}
    </ul>
  </div>`
}

export function render(route) {
  const p = findPosting(careers, route.id)
  if (!p) return notFound.render()
  const pt = getPostingText(p)
  const rt = getRoleText(p)
  return `
  <section class="page-head">
    <div class="wrap">
      <a class="label back-link" href="/careers" data-reveal>${t('careers.detail.back')}</a>
      <h1 class="display split">${esc(pt.title)}</h1>
      <p class="lede muted" data-reveal>${esc(pt.summary)}</p>
    </div>
  </section>
  <section class="wrap section jd-grid" style="padding-top:0">
    <div class="jd-body">
      ${section('careers.section.requirements', rt.requirements)}
      ${section('careers.section.responsibilities', rt.responsibilities)}
      ${section('careers.section.whoShouldApply', rt.whoShouldApply)}
      ${section('careers.section.whatYoullLearn', rt.whatYoullLearn)}
    </div>
    <aside class="jd-aside" data-reveal>
      <dl class="jd-facts">
        <div><dt>${t('careers.detail.locationLabel')}</dt><dd>${esc(pt.location)}</dd></div>
        <div><dt>${t('careers.detail.openingsLabel')}</dt><dd>${t('careers.card.openings', { n: p.openings })}</dd></div>
        <div><dt>${t('careers.detail.typeLabel')}</dt><dd>${esc(pt.type)}</dd></div>
      </dl>
      <button class="btn solid apply-open" type="button" data-apply><span>${t('careers.detail.applyCta')}</span></button>
    </aside>
  </section>

  <div class="modal" id="applyModal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="applyTitle">
    <div class="modal-backdrop" data-close></div>
    <div class="modal-panel" role="document">
      <button class="modal-close" type="button" data-close aria-label="${esc(t('careers.apply.close'))}">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5 19 19 M19 5 5 19"/></svg>
      </button>
      <h2 class="modal-title title" id="applyTitle">${esc(t('careers.apply.title', { role: pt.title, location: pt.location }))}</h2>
      <p class="muted">${t('careers.apply.subtitle')}</p>
      <form id="applyForm" name="career-application" method="POST" action="/" enctype="multipart/form-data" data-netlify="true" data-netlify-honeypot="bot-field" novalidate>
        <input type="hidden" name="form-name" value="career-application" />
        <input type="hidden" name="job" value="${esc(pt.title)} — ${esc(pt.location)}" />
        <p hidden aria-hidden="true"><label>Don't fill this out if you're human: <input name="bot-field" tabindex="-1" autocomplete="off" /></label></p>
        <div class="field">
          <label for="aName">${t('careers.apply.nameLabel')}</label>
          <input id="aName" name="name" type="text" autocomplete="name" aria-describedby="err-aName" required />
          <span class="field-help" id="err-aName" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="aEmail">${t('careers.apply.emailLabel')}</label>
          <input id="aEmail" name="email" type="email" autocomplete="email" inputmode="email" aria-describedby="err-aEmail" />
          <span class="field-help" id="err-aEmail" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="aPhone">${t('careers.apply.phoneLabel')}</label>
          <input id="aPhone" name="phone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="err-aPhone" required />
          <span class="field-help" id="err-aPhone" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="aResume">${t('careers.apply.resumeLabel')}</label>
          <input id="aResume" name="resume" type="file" accept="${ACCEPT_ATTR}" aria-describedby="hint-aResume err-aResume" required />
          <span class="field-hint" id="hint-aResume">${t('careers.apply.resumeHint')}</span>
          <span class="field-help" id="err-aResume" role="alert" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="aWhy">${t('careers.apply.whyLabel')}</label>
          <textarea id="aWhy" name="why" rows="4" aria-describedby="err-aWhy" placeholder="${esc(t('careers.apply.whyPlaceholder'))}" required></textarea>
          <span class="field-help" id="err-aWhy" role="alert" aria-live="polite"></span>
        </div>
        <div class="form-actions">
          <button class="btn solid" type="submit"><span>${t('careers.apply.submit')}</span></button>
          <button class="btn" type="button" data-close><span>${t('careers.apply.cancel')}</span></button>
        </div>
        <p class="field-help" id="applyStatus" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>`
}

export function mount(route) {
  const p = findPosting(careers, route.id)
  if (!p) return

  const modal = document.getElementById('applyModal')
  const form = document.getElementById('applyForm')
  if (!modal || !form) return

  const status = document.getElementById('applyStatus')
  const submitBtn = form.querySelector('button[type="submit"]')
  let lastFocused = null

  const setErr = (id, message) => {
    const help = document.getElementById(`err-${id}`)
    if (help) help.textContent = message || ''
  }
  const setStatus = (message) => {
    if (status) status.textContent = message || ''
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

  const focusables = () =>
    [...modal.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.disabled && el.offsetParent !== null,
    )

  const open = () => {
    lastFocused = document.activeElement
    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')
    document.getElementById('aName')?.focus()
  }
  const close = () => {
    if (!modal.classList.contains('is-open')) return
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    if (lastFocused && lastFocused.focus) lastFocused.focus()
  }

  document.querySelectorAll('[data-apply]').forEach((btn) => btn.addEventListener('click', open))
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close))

  // Escape closes; Tab is trapped inside the dialog while open.
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); return }
    if (e.key !== 'Tab') return
    const items = focusables()
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  })

  const validate = () => {
    const n = form.elements.name.value.trim()
    const em = form.elements.email.value.trim()
    const ph = form.elements.phone.value.trim()
    const why = form.elements.why.value.trim()
    const file = form.elements.resume.files[0]

    setErr('aName', n ? '' : t('careers.apply.err.name'))
    setErr('aEmail', !em || isValidEmail(em) ? '' : t('careers.apply.err.email'))
    setErr('aPhone', ph ? '' : t('careers.apply.err.phone'))

    let resumeErr = ''
    if (!file) resumeErr = t('careers.apply.err.resume')
    else if (!ACCEPT_EXT.some((ext) => file.name.toLowerCase().endsWith(ext))) resumeErr = t('careers.apply.err.resumeType')
    else if (file.size > MAX_BYTES) resumeErr = t('careers.apply.err.resumeSize')
    setErr('aResume', resumeErr)

    setErr('aWhy', why ? '' : t('careers.apply.err.why'))
    return !!n && (!em || isValidEmail(em)) && !!ph && !resumeErr && !!why
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!validate()) return

    setStatus(t('careers.apply.sending'))
    if (submitBtn) submitBtn.disabled = true
    try {
      // Multipart body (not URL-encoded) so the resume file is carried.
      // FormData sets its own Content-Type boundary — don't override it.
      const res = await fetch('/', { method: 'POST', body: new FormData(form) })
      if (res.ok) {
        form.reset()
        setStatus(t('careers.apply.success'))
      } else {
        setStatus(t('careers.apply.error'))
      }
    } catch {
      setStatus(t('careers.apply.error'))
    } finally {
      if (submitBtn) submitBtn.disabled = false
    }
  })

  form.addEventListener('reset', () => {
    ['aName', 'aEmail', 'aPhone', 'aResume', 'aWhy'].forEach((id) => setErr(id, ''))
  })
}
