import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as page from '../src/pages/contact.js'
import { initI18n, t } from '../src/i18n.js'
import { flush } from './helpers/dom.js'

const $ = (s) => document.querySelector(s)
const form = () => $('#contactForm')
const err = (id) => $(`#err-${id}`).textContent

function fill({ name = 'Su Su', email = 'su@example.com', message = 'Do you stock the G16?' } = {}) {
  form().elements.name.value = name
  form().elements.email.value = email
  form().elements.message.value = message
}
const submit = async () => {
  form().dispatchEvent(new Event('submit', { cancelable: true }))
  await flush()
}

beforeEach(() => {
  window.localStorage.clear()
  initI18n()
  document.body.innerHTML = `<main id="app">${page.render()}</main>`
  page.mount()
})
afterEach(() => vi.unstubAllGlobals())

describe('contact form', () => {
  it('mount tolerates a page without the form', () => {
    document.body.innerHTML = ''
    expect(() => page.mount()).not.toThrow()
  })

  it('is a Netlify form with a honeypot', () => {
    expect(form().getAttribute('data-netlify')).toBe('true')
    expect(form().getAttribute('data-netlify-honeypot')).toBe('bot-field')
    expect(form().querySelector('input[name="form-name"]').value).toBe('contact')
    expect(form().querySelector('input[name="bot-field"]')).not.toBeNull()
  })

  it('shows all errors on an empty submit and does not post', async () => {
    vi.stubGlobal('fetch', vi.fn())
    fill({ name: ' ', email: '', message: '' })
    await submit()
    expect(err('cName')).toBe(t('contact.err.name'))
    expect(err('cEmail')).toBe(t('contact.err.email'))
    expect(err('cMsg')).toBe(t('contact.err.message'))
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each(['plain', 'a@b', 'a b@c.d', '@c.d'])('rejects invalid email %j', async (email) => {
    vi.stubGlobal('fetch', vi.fn())
    fill({ email })
    await submit()
    expect(err('cEmail')).toBe(t('contact.err.email'))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('posts URL-encoded form data and shows success, then clears the form', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    fill()
    await submit()
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/')
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    const body = new URLSearchParams(opts.body)
    expect(body.get('form-name')).toBe('contact')
    expect(body.get('name')).toBe('Su Su')
    expect(body.get('email')).toBe('su@example.com')
    expect(body.get('message')).toBe('Do you stock the G16?')
    expect($('#formStatus').textContent).toBe(t('contact.form.success'))
    expect(form().elements.name.value).toBe('')
    expect(form().querySelector('button[type="submit"]').disabled).toBe(false)
  })

  it.each([
    ['a non-OK response', () => vi.fn().mockResolvedValue({ ok: false })],
    ['a network failure', () => vi.fn().mockRejectedValue(new Error('offline'))],
  ])('shows the error status on %s and keeps the input', async (_name, makeFetch) => {
    vi.stubGlobal('fetch', makeFetch())
    fill()
    await submit()
    expect($('#formStatus').textContent).toBe(t('contact.form.error'))
    expect(form().elements.name.value).toBe('Su Su')
    expect(form().querySelector('button[type="submit"]').disabled).toBe(false)
  })

  it('reset clears errors and status', async () => {
    vi.stubGlobal('fetch', vi.fn())
    fill({ name: '' })
    await submit()
    form().dispatchEvent(new Event('reset'))
    expect(err('cName')).toBe('')
    expect($('#formStatus').textContent).toBe('')
  })
})
