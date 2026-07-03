// Pure catalog filtering/sorting — the logic behind the products toolbar.
// Kept DOM-free so it can be unit-tested directly.

// category: 'all' or a product.category value ('laptop' | 'desktop' | 'accessory').
// term matches against both languages' name/badge/desc/specs so a search
// works regardless of the active language.
export function filterProducts(products, { category = 'all', term = '' } = {}) {
  const q = String(term || '').trim().toLowerCase()
  return products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (!q) return true
    const hay = [
      p.name, p.nameMy, p.badge, p.badgeMy, p.desc, p.descMy,
      ...(p.specs || []), ...(p.specsMy || []),
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
}

// mode: 'featured' (featuredRank ascending) | 'nameAsc' (A→Z).
export function sortProducts(products, mode = 'featured') {
  const list = [...products]
  if (mode === 'nameAsc') return list.sort((a, b) => a.name.localeCompare(b.name))
  return list.sort((a, b) => a.featuredRank - b.featuredRank)
}
