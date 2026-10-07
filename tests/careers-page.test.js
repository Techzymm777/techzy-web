import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as list from '../src/pages/careers.js'
import * as detail from '../src/pages/careerDetail.js'
import { initI18n, t } from '../src/i18n.js'
import { resolvePostings } from '../src/careers.js'
import careers from '../content/careers.json'
import { flush } from './helpers/dom.js'

const $ = (s) => document.querySelector(s)
const all = resolvePostings(careers)

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
})
afterEach(() => {
  vi.unstubAllGlobals()
  document.body.className = ''
})

describe('careers list page', () => {
  const ids = () => [...document.querySelectorAll('#jobGrid [data-card] > a')].map((a) => a.getAttribute('href').split('/').pop())
  const type = (v) => {
    $('#jq').value = v
    $('#jq').dispatchEvent(new Event('input'))
  }

  beforeEach(() => {
    document.body.innerHTML = `<main id="app">${list.render()}</main>`
    list.mount()
  })

  it('lists every posting', () => {
    expect(ids()).toEqual(all.map((p) => p.id))
  })

  it('location tabs filter and move aria-pressed', () => {
    $('.tab[data-loc="mandalay"]').click()
    expect(ids().length).toBeGreaterThan(0)
    expect(ids().every((id) => all.find((p) => p.id === id).location === 'mandalay')).toBe(true)
    expect(document.querySelectorAll('.tab[aria-pressed="true"]')).toHaveLength(1)
    expect($('.tab[data-loc="mandalay"]').getAttribute('aria-pressed')).toBe('true')
  })

  it('empty state + reset', () => {
    type('zzz-no-match')
    expect($('#jobGrid').hidden).toBe(true)
    expect($('#jobEmpty').hidden).toBe(false)
    $('#jobReset').click()
    expect($('#jq').value).toBe('')
    expect(ids()).toHaveLength(all.length)
    expect($('.tab[data-loc="all"]').getAttribute('aria-pressed')).toBe('true')
  })

  it('cards show openings count and a descriptive view link', () => {
    const p = all[0]
    const card = document.querySelector('#jobGrid [data-card]')
    expect(card.textContent).toContain(t('careers.card.openings', { n: p.openings }))
    const view = card.querySelector('.card-actions a')
    expect(view.getAttribute('href')).toBe(`/careers/${p.id}`)
    expect(view.getAttribute('aria-label')).toContain(p.title)
  })
})

describe('career detail apply dialog', () => {
  const p = all[0]
  const modal = () => $('#applyModal')
  const form = () => $('#applyForm')
  const err = (id) => $(`#err-${id}`).textContent

  function fill({ name = 'Aung Aung', email = '', phone = '09 123 456', why = 'I love tech', file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' }) } = {}) {
    const f = form()
    f.elements.name.value = name
    f.elements.email.value = email
    f.elements.phone.value = phone
    f.elements.why.value = why
    Object.defineProperty(f.elements.resume, 'files', { configurable: true, value: file ? [file] : [] })
  }
  const submit = async () => {
    form().dispatchEvent(new Event('submit', { cancelable: true }))
    await flush()
  }

  beforeEach(() => {
    document.body.innerHTML = `<main id="app">${detail.render({ id: p.id })}</main>`
    detail.mount({ id: p.id })
  })

  it('mount is a no-op for an unknown posting', () => {
    document.body.innerHTML = '<main id="app"></main>'
    expect(() => detail.mount({ id: 'nope' })).not.toThrow()
  })

  it('opens on the apply button, focuses the first field, and locks the page', () => {
    const btn = $('[data-apply]')
    btn.focus()
    btn.click()
    expect(modal().classList.contains('is-open')).toBe(true)
    expect(modal().getAttribute('aria-hidden')).toBe('false')
    expect(document.body.classList.contains('modal-open')).toBe(true)
    expect(document.activeElement.id).toBe('aName')
  })

  it.each([
    ['close button', () => $('.modal-close').click()],
    ['backdrop', () => $('.modal-backdrop').click()],
    ['cancel', () => $('.form-actions [data-close]').click()],
    ['Escape', () => modal().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))],
  ])('closes via %s and restores focus to the trigger', (_name, closeIt) => {
    const btn = $('[data-apply]')
    btn.focus()
    btn.click()
    closeIt()
    expect(modal().classList.contains('is-open')).toBe(false)
    expect(modal().getAttribute('aria-hidden')).toBe('true')
    expect(document.body.classList.contains('modal-open')).toBe(false)
    expect(document.activeElement).toBe(btn)
  })

  it('traps Tab inside the dialog', () => {
    $('[data-apply]').click()
    const focusables = [...modal().querySelectorAll('button, [href], input, textarea')].filter((el) => !el.disabled)
    // happy-dom has no layout, so give every control an offsetParent.
    focusables.forEach((el) => Object.defineProperty(el, 'offsetParent', { configurable: true, get: () => document.body }))
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    last.focus()
    const fwd = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    modal().dispatchEvent(fwd)
    expect(fwd.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(first)

    const back = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    modal().dispatchEvent(back)
    expect(back.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)
  })

  it('shows every required-field error on an empty submit and does not post', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    fill({ name: '', phone: '', why: '', file: null })
    await submit()
    expect(err('aName')).toBe(t('careers.apply.err.name'))
    expect(err('aPhone')).toBe(t('careers.apply.err.phone'))
    expect(err('aResume')).toBe(t('careers.apply.err.resume'))
    expect(err('aWhy')).toBe(t('careers.apply.err.why'))
    expect(err('aEmail')).toBe('') // email is optional
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('validates email format only when one is given', async () => {
    vi.stubGlobal('fetch', vi.fn())
    fill({ email: 'not-an-email' })
    await submit()
    expect(err('aEmail')).toBe(t('careers.apply.err.email'))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects unsupported resume types', async () => {
    vi.stubGlobal('fetch', vi.fn())
    fill({ file: new File(['x'], 'cv.png', { type: 'image/png' }) })
    await submit()
    expect(err('aResume')).toBe(t('careers.apply.err.resumeType'))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects resumes over 10MB', async () => {
    vi.stubGlobal('fetch', vi.fn())
    const big = new File(['x'], 'CV.DOCX')
    Object.defineProperty(big, 'size', { value: 10 * 1024 * 1024 + 1 })
    fill({ file: big })
    await submit()
    expect(err('aResume')).toBe(t('careers.apply.err.resumeSize'))
  })

  it('posts multipart FormData to Netlify and shows success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    fill({ email: 'a@b.co' })
    await submit()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/')
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
    expect(opts.headers).toBeUndefined() // browser must set the multipart boundary
    expect(opts.body.get('form-name')).toBe('career-application')
    expect(opts.body.get('job')).toContain(p.title)
    expect($('#applyStatus').textContent).toBe(t('careers.apply.success'))
    expect(form().querySelector('button[type="submit"]').disabled).toBe(false)
  })

  it.each([
    ['a non-OK response', () => vi.fn().mockResolvedValue({ ok: false })],
    ['a network failure', () => vi.fn().mockRejectedValue(new Error('offline'))],
  ])('shows the error status on %s and re-enables submit', async (_name, makeFetch) => {
    vi.stubGlobal('fetch', makeFetch())
    fill()
    await submit()
    expect($('#applyStatus').textContent).toBe(t('careers.apply.error'))
    expect(form().querySelector('button[type="submit"]').disabled).toBe(false)
  })

  it('disables submit while sending', async () => {
    let resolve
    vi.stubGlobal('fetch', vi.fn(() => new Promise((r) => (resolve = r))))
    fill()
    form().dispatchEvent(new Event('submit', { cancelable: true }))
    expect($('#applyStatus').textContent).toBe(t('careers.apply.sending'))
    expect(form().querySelector('button[type="submit"]').disabled).toBe(true)
    resolve({ ok: true })
    await flush()
    expect(form().querySelector('button[type="submit"]').disabled).toBe(false)
  })

  it('reset clears field errors', async () => {
    vi.stubGlobal('fetch', vi.fn())
    fill({ name: '', file: null })
    await submit()
    expect(err('aName')).not.toBe('')
    form().dispatchEvent(new Event('reset'))
    ;['aName', 'aEmail', 'aPhone', 'aResume', 'aWhy'].forEach((id) => expect(err(id)).toBe(''))
  })
})
