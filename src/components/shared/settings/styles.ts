export const fieldClass =
  'rounded border border-edge bg-abyss-deep px-3 py-2 text-sm text-ink-hi outline-none focus:border-edge-strong'

export const pillClass = (active: boolean): string =>
  `text-xs px-3 py-1 rounded-full border transition-colors ${
    active ? 'border-gold text-gold' : 'border-edge text-ink-dim hover:text-ink-hi'
  }`
