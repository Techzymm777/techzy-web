import { t } from '../i18n.js'

export function render() {
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label" data-reveal>${t('about.hero.kicker')}</span>
      <h1 class="display split">${t('about.hero.title')}</h1>
      <p class="lede muted" data-reveal>${t('about.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap"><div class="frame" data-clip style="aspect-ratio:21/9"><img src="/assets/images/hero/hero-about.webp" alt="${t('about.hero.title')}" width="1600" height="1600" fetchpriority="high"></div></section>

  <section class="section wrap">
    <div class="belief">
      <div>
        <h2 class="label" data-reveal>${t('about.beliefs.title')}</h2>
        <p class="lede" data-reveal>${t('about.beliefs.body')}</p>
      </div>
      <div>
        <p class="pull split">${t('about.beliefs.quote')}</p>
        <p class="label pull-by" data-reveal>${t('about.beliefs.byline')}</p>
      </div>
    </div>
    <div class="why-items">
      <div class="why-item" data-reveal><h3>${t('about.cards.qTitle')}</h3><p class="muted">${t('about.cards.qBody')}</p></div>
      <div class="why-item" data-reveal><h3>${t('about.cards.pTitle')}</h3><p class="muted">${t('about.cards.pBody')}</p></div>
      <div class="why-item" data-reveal><h3>${t('about.cards.rTitle')}</h3><p class="muted">${t('about.cards.rBody')}</p></div>
    </div>
  </section>

  <section class="section wrap">
    <span class="label" data-reveal>${t('about.how.title')}</span>
    <h2 class="headline split">${t('about.how.subtitle')}</h2>
    <div class="steps">
      <div class="step" data-reveal><span class="step-num">01</span><div><h3>${t('about.steps.s1Title')}</h3><p>${t('about.steps.s1Body')}</p></div></div>
      <div class="step" data-reveal><span class="step-num">02</span><div><h3>${t('about.steps.s2Title')}</h3><p>${t('about.steps.s2Body')}</p></div></div>
      <div class="step" data-reveal><span class="step-num">03</span><div><h3>${t('about.steps.s3Title')}</h3><p>${t('about.steps.s3Body')}</p></div></div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="wrap">
      <h2 class="headline split">${t('about.cta.title')}</h2>
      <p class="muted" data-reveal>${t('about.cta.body')}</p>
      <a class="btn" href="/products" data-reveal><span>${t('about.cta.button')}</span></a>
    </div>
  </section>`
}
