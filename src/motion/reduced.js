// Single source of truth for the reduced-motion gate. Evaluated once at
// boot, matching the prototype: a mid-session OS toggle applies on the
// next full page load.
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
