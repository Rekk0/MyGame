import type { ReactNode } from 'react'

interface ResourceOrbProps {
  value: number
  max: number
  color: 'ep' | 'will' | 'spirit'
  icon: ReactNode
  label: string
}

const RING_R = 22
const RING_CX = 28
const RING_CY = 28
const CIRCUMFERENCE = 2 * Math.PI * RING_R

const STROKE_COLORS = {
  ep: 'var(--rpg-ep)',
  will: 'var(--rpg-will)',
  spirit: 'var(--rpg-spirit)'
} as const

/**
 * ResourceOrb — SVG 圆环蓄量球。
 * 圆环 gauge + 居中图标 + 下方标签，低量 (<20%) 自动脉动警示。
 */
export function ResourceOrb({ value, max, color, icon, label }: ResourceOrbProps): JSX.Element {
  const ratio = max > 0 ? Math.min(1, value / max) : 0
  const offset = CIRCUMFERENCE * (1 - ratio)
  const isLow = ratio < 0.2

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" title={`${label} ${value}/${max}`}>
        <svg width={56} height={56} viewBox="0 0 56 56" className="block">
          {/* track ring */}
          <circle
            cx={RING_CX}
            cy={RING_CY}
            r={RING_R}
            fill="none"
            stroke="var(--rpg-bg-deep)"
            strokeWidth={4}
          />
          {/* fill ring — starts from top */}
          <circle
            cx={RING_CX}
            cy={RING_CY}
            r={RING_R}
            fill="none"
            stroke={STROKE_COLORS[color]}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${RING_CX} ${RING_CY})`}
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className={isLow ? 'orb-pulse' : undefined}
          />
        </svg>
        {/* centered icon */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-ink-dim">
          {icon}
        </div>
      </div>
      <span className="text-[10px] tabular-nums text-ink-faint">{label}</span>
    </div>
  )
}
