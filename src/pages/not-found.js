import { t } from '../i18n.js'

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${t('notFound.kicker')}</span>
      <h1 class="display">${t('notFound.title')}</h1>
      <div class="hero-cta">
        <a class="btn solid" href="/"><span>${t('notFound.goHome')}</span></a>
        <a class="btn" href="/products"><span>${t('notFound.browse')}</span></a>
      </div>
    </div>
  </section>`
}
