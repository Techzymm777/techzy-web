// Pure careers data helpers — the logic behind the postings list and the
// detail page. Kept DOM-free so it can be unit-tested directly (like catalog.js).

// A posting only stores what varies (location, openings); the shared job
// description lives once under roles[role]. resolvePostings flattens the two
// so pages and the filter work with self-contained objects.
export function resolvePostings(data) {
  const roles = data.roles || {}
  return (data.postings || []).map((p) => ({ ...(roles[p.role] || {}), ...p }))
}

export function findPosting(data, id) {
  return resolvePostings(data).find((p) => p.id === id) || null
}

// location: 'all' or a posting.location value ('yangon' | 'mandalay').
// term matches both languages' title/location/department/type so search works
// regardless of the active language. Operates on resolved postings.
export function filterPostings(postings, { location = 'all', term = '' } = {}) {
  const q = String(term || '').trim().toLowerCase()
  return postings.filter((p) => {
    if (location !== 'all' && p.location !== location) return false
    if (!q) return true
    const hay = [
      p.title, p.titleMy, p.locationLabel, p.locationLabelMy,
      p.department, p.departmentMy, p.type, p.typeMy,
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
}
