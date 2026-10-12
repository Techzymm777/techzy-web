import { describe, expect, it } from 'vitest'
import { resolvePostings, findPosting, filterPostings } from '../src/careers.js'
import careers from '../content/careers.json'

describe('resolvePostings', () => {
  it('merges each posting with its shared role', () => {
    const list = resolvePostings(careers)
    expect(list).toHaveLength(careers.postings.length)
    const ygn = list.find((p) => p.id === 'sales-advisor-yangon')
    expect(ygn.title).toBe('Sales Advisor') // from the role
    expect(ygn.openings).toBe(3) // from the posting
    expect(Array.isArray(ygn.responsibilities)).toBe(true)
    expect(ygn.responsibilitiesMy.length).toBeGreaterThan(0) // bilingual content present
  })
})

describe('findPosting', () => {
  it('resolves a known id and returns null otherwise', () => {
    expect(findPosting(careers, 'sales-advisor-mandalay').location).toBe('mandalay')
    expect(findPosting(careers, 'nope')).toBeNull()
  })
})

describe('filterPostings', () => {
  const all = resolvePostings(careers)

  it('returns everything for all/no-term', () => {
    expect(filterPostings(all)).toHaveLength(all.length)
  })

  it('filters by location', () => {
    const ygn = filterPostings(all, { location: 'yangon' })
    expect(ygn.length).toBeGreaterThan(0)
    expect(ygn.every((p) => p.location === 'yangon')).toBe(true)
  })

  it('matches search terms case-insensitively across both languages', () => {
    expect(filterPostings(all, { term: 'MANDALAY' }).every((p) => p.location === 'mandalay')).toBe(true)
    expect(filterPostings(all, { term: 'မန္တလေး' }).some((p) => p.location === 'mandalay')).toBe(true)
    expect(filterPostings(all, { term: 'sales' }).length).toBe(all.length)
  })

  it('returns nothing for an unmatched term', () => {
    expect(filterPostings(all, { term: 'zzz-no-match' })).toHaveLength(0)
  })
})
