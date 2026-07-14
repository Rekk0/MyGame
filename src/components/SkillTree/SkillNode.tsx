import type { Skill } from '../../types/skill'

const CAT_COLOR: Record<string, string> = {
  core: 'var(--rpg-crimson)',
  universal: 'var(--rpg-arcane)',
  hidden: 'var(--rpg-spirit)',
}

function hexPath(R: number): string {
  let d = ''
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90)
    d += (i ? 'L' : 'M') + (R * Math.cos(a)).toFixed(2) + ' ' + (R * Math.sin(a)).toFixed(2)
  }
  return d + 'Z'
}

function hexVerts(R: number): [number, number][] {
  const v: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90)
    v.push([R * Math.cos(a), R * Math.sin(a)])
  }
  return v
}

interface Props {
  skill: Skill
  x: number
  y: number
  selected: boolean
  onSelect: () => void
}

export function SkillNode({ skill, x, y, selected, onSelect }: Props) {
  const cat = CAT_COLOR[skill.category] ?? 'var(--rpg-edge-strong)'
  const R = skill.category === 'core' ? 34 : skill.category === 'universal' ? 27 : 24
  const unlocked = skill.isUnlocked
  const pct = skill.maxXp > 0 ? Math.min(1, skill.xp / skill.maxXp) : 0
  const arcR = R + 3.5
  const circ = 2 * Math.PI * arcR
  const iconBox = (R - 6) * 2 * 0.72
  // 等级越高，节点越华丽：填充加深、边框转亮金、外圈刻纹 / 顶点符钉
  const fillPct = Math.min(30 + skill.level * 5, 60)
  const borderColor = unlocked
    ? skill.level >= 5
      ? 'var(--rpg-gold-bright)'
      : 'var(--rpg-gold)'
    : 'var(--rpg-edge)'

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {selected && (
        <path
          d={hexPath(R + 6)}
          fill="none"
          stroke="var(--rpg-gold-bright)"
          strokeWidth={3}
          opacity={0.6}
          className="skill-glow"
        />
      )}

      {unlocked && skill.level >= 3 && (
        <path d={hexPath(R + 3)} fill="none" stroke="var(--rpg-gold)" strokeWidth={1} strokeOpacity={0.45} />
      )}

      <path
        d={hexPath(R)}
        fill={unlocked ? `color-mix(in oklab, ${cat} ${fillPct}%, var(--rpg-panel))` : 'var(--rpg-panel-raised)'}
        stroke={borderColor}
        strokeWidth={unlocked ? 2 : 1.4}
        strokeDasharray={unlocked ? undefined : '4 3'}
        opacity={unlocked ? 1 : 0.7}
      />
      <circle
        r={R - 7}
        fill="none"
        stroke={unlocked ? cat : 'var(--rpg-edge)'}
        strokeOpacity={unlocked ? 0.5 : 0.4}
        strokeWidth={1}
      />

      {unlocked &&
        skill.level >= 5 &&
        hexVerts(R + 3).map(([vx, vy], i) => (
          <circle key={i} cx={vx} cy={vy} r={1.7} fill="var(--rpg-gold-bright)" />
        ))}

      {unlocked && pct > 0 && (
        <>
          <circle r={arcR} fill="none" stroke="var(--rpg-edge)" strokeOpacity={0.4} strokeWidth={2.5} />
          <circle
            r={arcR}
            fill="none"
            stroke="var(--rpg-gold-bright)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={`${(circ * pct).toFixed(1)} ${circ.toFixed(1)}`}
            transform="rotate(-90)"
          />
        </>
      )}

      {unlocked && skill.iconSvg ? (
        <foreignObject
          x={-iconBox / 2}
          y={-iconBox / 2}
          width={iconBox}
          height={iconBox}
          style={{ color: 'var(--rpg-gold-bright)', pointerEvents: 'none' }}
        >
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: skill.iconSvg }} />
        </foreignObject>
      ) : !unlocked ? (
        <text textAnchor="middle" dominantBaseline="central" fill="var(--rpg-ink-dim)" fontSize={15} fontWeight={700}>
          ?
        </text>
      ) : null}

      {unlocked && (
        <>
          <circle cx={R * 0.6} cy={R * 0.6} r={8.5} fill="var(--rpg-panel)" stroke="var(--rpg-gold)" strokeWidth={1.3} />
          <text
            x={R * 0.6}
            y={R * 0.6}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--rpg-gold-bright)"
            fontSize={10}
            fontWeight={700}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {skill.level}
          </text>
        </>
      )}

      <text
        y={R + 16}
        textAnchor="middle"
        fill={unlocked ? 'var(--rpg-ink-hi)' : 'var(--rpg-ink-dim)'}
        fontSize={11.5}
        fontWeight={500}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {skill.name}
      </text>
    </g>
  )
}
