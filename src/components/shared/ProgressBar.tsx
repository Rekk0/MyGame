interface ProgressBarProps {
  current: number
  max: number
  color?: 'xp' | 'ep' | 'will' | 'spirit' | 'hp'
  label?: React.ReactNode
  size?: 'md' | 'lg'
}

export function ProgressBar({
  current,
  max,
  color = 'xp',
  label,
  size = 'md'
}: ProgressBarProps): JSX.Element {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0
  const isLg = size === 'lg'

  return (
    <div className="w-full">
      <div
        className={`mb-0.5 flex items-baseline justify-between text-ink-dim ${isLg ? 'text-sm' : 'text-xs'}`}
      >
        <span>{label}</span>
        <span className={`tabular-nums ${isLg ? 'text-xs' : 'text-[10px]'}`}>
          {current}/{max}
        </span>
      </div>
      <div
        className={`rpg-bar-track w-full overflow-hidden rounded-sm ${isLg ? 'h-3.5' : 'h-2.5'}`}
      >
        <div
          className={`rpg-bar-fill rpg-fill-${color} h-full rounded-sm`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
