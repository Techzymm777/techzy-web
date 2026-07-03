import { t } from '../i18n.js'

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label" data-reveal>${t('notFound.kicker')}</span>
      <h1 class="display split">${t('notFound.title')}</h1>
      <div class="hero-cta" data-reveal>
        <a class="btn solid" href="/"><span>${t('notFound.goHome')}</span></a>
        <a class="btn" href="/products"><span>${t('notFound.browse')}</span></a>
      </div>
    </div>
  </section>`
}
