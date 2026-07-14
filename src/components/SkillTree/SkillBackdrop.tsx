import { VW, VH, RING_RADII } from './layout'

const CX = VW / 2
const CY = VH / 2

// 确定性星点（重开不变）
const STARS = (() => {
  let seed = 7
  const rnd = (): number => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const out: { x: number; y: number; r: number; o: number }[] = []
  for (let i = 0; i < 70; i++) {
    const x = rnd() * VW
    const y = rnd() * VH
    if (Math.hypot(x - CX, y - CY) < 40) continue
    out.push({ x, y, r: rnd() * 1.1 + 0.3, o: rnd() * 0.28 + 0.05 })
  }
  return out
})()

/** 星盘底纹：分环虚线导轨 + 星点 + 径向暗角。纯装饰，不拦截指针。 */
export function SkillBackdrop() {
  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id="sk-vignette" cx="50%" cy="50%" r="62%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="var(--rpg-bg-deep)" stopOpacity={0.85} />
        </radialGradient>
      </defs>
      {[RING_RADII.universal, RING_RADII.hidden].map((r, i) => (
        <circle
          key={i}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke="var(--rpg-edge-strong)"
          strokeOpacity={0.14}
          strokeDasharray="2 7"
        />
      ))}
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x.toFixed(1)}
          cy={s.y.toFixed(1)}
          r={s.r.toFixed(2)}
          fill="var(--rpg-world-accent)"
          fillOpacity={s.o.toFixed(2)}
        />
      ))}
      <rect x={0} y={0} width={VW} height={VH} fill="url(#sk-vignette)" />
    </g>
  )
}
