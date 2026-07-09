interface ScreenShellProps {
  title: React.ReactNode
  actions?: React.ReactNode
  fullBleed?: boolean
  children: React.ReactNode
}

/** Full-canvas screen container — no overlay, no close button. Return via dock nav or Esc. */
export function ScreenShell({
  title,
  actions,
  fullBleed = false,
  children
}: ScreenShellProps): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between px-1 pb-3">
        <h2 className="font-display text-lg font-bold tracking-wide text-gold">{title}</h2>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="mx-1 h-px shrink-0 bg-gradient-to-r from-transparent via-edge-strong to-transparent" />
      <div
        className={`flex-1 min-h-0 overflow-y-auto pt-4 pr-3 ${
          fullBleed ? '' : 'max-w-[960px] mx-auto w-full'
        }`}
        style={{ scrollbarGutter: 'stable' }}
      >
        {children}
      </div>
    </div>
  )
}
