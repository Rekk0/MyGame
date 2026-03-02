interface ProgressBarProps {
  current: number
  max: number
  color?: 'blue' | 'green' | 'yellow'
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
}

export function ProgressBar({ current, max, color = 'blue' }: ProgressBarProps): JSX.Element {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0

  return (
    <div className="w-full">
      <div className="mb-0.5 flex justify-between text-xs text-gray-400">
        <span>{current}/{max}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all ${colorClasses[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
