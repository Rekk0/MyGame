import type { Skill } from '../../types/skill'

interface Props {
  skills: Skill[]
  pos: Map<string, { x: number; y: number }>
}

/** 父子放射连线：解锁路径金色流动虚线，未解锁暗虚线。 */
export function SkillLinks({ skills, pos }: Props) {
  return (
    <g>
      {skills.map((s) => {
        const from = pos.get(s.parentSkillId!)
        const to = pos.get(s.id)
        if (!from || !to) return null
        return (
          <line
            key={`l-${s.id}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={s.isUnlocked ? 'var(--rpg-gold)' : 'var(--rpg-edge)'}
            strokeWidth={s.isUnlocked ? 2 : 1.4}
            strokeLinecap="round"
            strokeDasharray={s.isUnlocked ? '6 6' : '3 5'}
            strokeOpacity={s.isUnlocked ? 0.75 : 0.5}
            className={s.isUnlocked ? 'skill-flow' : undefined}
          />
        )
      })}
    </g>
  )
}
