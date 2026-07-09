interface ProgressBarProps {
  current: number
  max: number
  color?: 'xp' | 'ep' | 'will' | 'spirit' | 'hp'
  label?: React.ReactNode
}

export function ProgressBar({ current, max, color = 'xp', label }: ProgressBarProps): JSX.Element {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0

  return (
    <div className="w-full">
      <div className="mb-0.5 flex items-baseline justify-between text-xs text-ink-dim">
        <span>{label}</span>
        <span className="tabular-nums text-[10px]">
          {current}/{max}
        </span>
      </div>
      <div className="rpg-bar-track h-2.5 w-full overflow-hidden rounded-sm">
        <div
          className={`rpg-bar-fill rpg-fill-${color} h-full rounded-sm`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
