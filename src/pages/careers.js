import careers from '../../content/careers.json'
import { getLang, t } from '../i18n.js'
import { esc } from '../escape.js'
import { resolvePostings, filterPostings } from '../careers.js'

const TABS = [
  ['all', 'careers.filters.all'],
  ['yangon', 'careers.filters.yangon'],
  ['mandalay', 'careers.filters.mandalay'],
]

// Language-aware view of a resolved posting.
export function getPostingText(p) {
  const isMy = getLang() === 'my'
  return {
    title: isMy ? p.titleMy || p.title : p.title,
    location: isMy ? p.locationLabelMy || p.locationLabel : p.locationLabel,
    type: isMy ? p.typeMy || p.type : p.type,
    summary: isMy ? p.summaryMy || p.summary : p.summary,
  }
}

function postingCard(p, i) {
  const pt = getPostingText(p)
  return `
  <article class="card job-card" data-card>
    <a href="/careers/${esc(p.id)}">
      <span class="idx">${String(i + 1).padStart(2, '0')} / ${esc(pt.location)}</span>
      <h2 class="card-title">${esc(pt.title)}</h2>
      <p class="spec muted">${esc(pt.summary)}</p>
      <dl class="job-meta">
        <div><dt>${t('careers.card.locationLabel')}</dt><dd>${esc(pt.location)}</dd></div>
        <div><dt>${t('careers.card.openingsLabel')}</dt><dd>${t('careers.card.openings', { n: p.openings })}</dd></div>
        <div><dt>${t('careers.card.typeLabel')}</dt><dd>${esc(pt.type)}</dd></div>
      </dl>
    </a>
    <div class="card-actions">
      <a class="btn solid" href="/careers/${esc(p.id)}" aria-label="${esc(t('careers.card.viewAria', { role: pt.title, location: pt.location }))}"><span>${t('careers.card.view')}</span></a>
    </div>
  </article>`
}

export function render() {
  const list = resolvePostings(careers)
  return `
  <section class="page-head">
    <div class="wrap">
      <span class="label" data-reveal>${t('careers.hero.kicker')}</span>
      <h1 class="display split">${t('careers.hero.title')}</h1>
      <p class="lede muted" data-reveal>${t('careers.hero.lede')}</p>
    </div>
  </section>
  <section class="wrap" style="padding-bottom:var(--s16)">
    <div class="toolbar" data-reveal>
      <div class="tabs" role="group" aria-label="${esc(t('careers.filters.groupAria'))}">
        ${TABS.map(([key, label], i) => `<button class="tab" type="button" data-loc="${key}" aria-pressed="${i === 0}">${t(label)}</button>`).join('')}
      </div>
      <div class="toolbar-controls">
        <label class="search">
          <span class="label">${t('careers.filters.searchLabel')}</span>
          <input id="jq" type="search" aria-label="${esc(t('careers.filters.searchLabel'))}" placeholder="${esc(t('careers.filters.searchPlaceholder'))}">
        </label>
      </div>
    </div>
    <div class="grid-jobs" id="jobGrid">${list.map((p, i) => postingCard(p, i)).join('')}</div>
    <div class="empty" id="jobEmpty" hidden>
      <h2 class="title">${t('careers.empty.title')}</h2>
      <p class="muted">${t('careers.empty.body')}</p>
      <button class="btn" type="button" id="jobReset" style="margin-top:var(--s3)"><span>${t('careers.empty.reset')}</span></button>
    </div>
  </section>`
}

export function mount() {
  const all = resolvePostings(careers)
  const grid = document.getElementById('jobGrid')
  const empty = document.getElementById('jobEmpty')
  const q = document.getElementById('jq')
  const tabs = [...document.querySelectorAll('.tab')]
  let location = 'all'

  const apply = () => {
    const list = filterPostings(all, { location, term: q.value })
    grid.innerHTML = list.map((p, i) => postingCard(p, i)).join('')
    const none = list.length === 0
    grid.hidden = none
    empty.hidden = !none
  }

  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-pressed', 'false'))
      tab.setAttribute('aria-pressed', 'true')
      location = tab.dataset.loc
      apply()
    }),
  )
  q.addEventListener('input', apply)
  document.getElementById('jobReset').addEventListener('click', () => {
    q.value = ''
    location = 'all'
    tabs.forEach((x, i) => x.setAttribute('aria-pressed', String(i === 0)))
    apply()
  })
}
