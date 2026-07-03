import { t } from '../i18n.js'

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label">${t('about.hero.kicker')}</span>
      <h1 class="display">${t('about.hero.title')}</h1>
      <p class="lede muted">${t('about.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap"><div class="frame" style="aspect-ratio:21/9"><img src="/assets/images/hero/hero-about.jpg" alt="${t('about.hero.title')}"></div></section>

  <section class="section wrap">
    <div class="belief">
      <div>
        <span class="label">${t('about.beliefs.title')}</span>
        <p class="lede">${t('about.beliefs.body')}</p>
      </div>
      <div>
        <p class="pull">${t('about.beliefs.quote')}</p>
        <p class="label pull-by">${t('about.beliefs.byline')}</p>
      </div>
    </div>
    <div class="why-items">
      <div class="why-item"><h3>${t('about.cards.qTitle')}</h3><p class="muted">${t('about.cards.qBody')}</p></div>
      <div class="why-item"><h3>${t('about.cards.pTitle')}</h3><p class="muted">${t('about.cards.pBody')}</p></div>
      <div class="why-item"><h3>${t('about.cards.rTitle')}</h3><p class="muted">${t('about.cards.rBody')}</p></div>
    </div>
  </section>

  <section class="section wrap">
    <span class="label">${t('about.how.title')}</span>
    <h2 class="headline">${t('about.how.subtitle')}</h2>
    <div class="steps">
      <div class="step"><span class="step-num">01</span><div><h3>${t('about.steps.s1Title')}</h3><p>${t('about.steps.s1Body')}</p></div></div>
      <div class="step"><span class="step-num">02</span><div><h3>${t('about.steps.s2Title')}</h3><p>${t('about.steps.s2Body')}</p></div></div>
      <div class="step"><span class="step-num">03</span><div><h3>${t('about.steps.s3Title')}</h3><p>${t('about.steps.s3Body')}</p></div></div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="wrap">
      <h2 class="headline">${t('about.cta.title')}</h2>
      <p class="muted">${t('about.cta.body')}</p>
      <a class="btn" href="/products"><span>${t('about.cta.button')}</span></a>
    </div>
  </section>`
}
