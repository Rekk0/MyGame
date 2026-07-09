import type { Skill } from '../../types/skill'

interface Props {
  skill: Skill
  x: number
  y: number
}

export function SkillTooltip({ skill, x, y }: Props) {
  const pct = skill.maxXp > 0 ? Math.round((skill.xp / skill.maxXp) * 100) : 0

  return (
    <foreignObject x={x + 36} y={y - 20} width={220} height={180} style={{ pointerEvents: 'none' }}>
      <div className="rpg-frame rounded-lg p-3 text-xs text-ink">
        <div className="font-display text-sm font-bold text-gold">{skill.name}</div>
        <div className="mt-0.5 text-ink-dim">
          Lv.{skill.level} · {skill.category}
        </div>
        <div className="mt-1 text-ink">{skill.description}</div>
        {skill.traits.length > 0 && (
          <div className="mt-1.5">
            <div className="font-medium text-spirit">特质：</div>
            {skill.traits.map((t, i) => (
              <div key={i} className="text-spirit/80">
                · {t}
              </div>
            ))}
          </div>
        )}
        <div className="mt-2">
          <div className="mb-0.5 flex justify-between text-ink-dim">
            <span>XP</span>
            <span className="tabular-nums">
              {skill.xp}/{skill.maxXp}
            </span>
          </div>
          <div className="rpg-bar-track h-1.5 overflow-hidden rounded-sm">
            <div
              className="rpg-bar-fill rpg-fill-xp h-full rounded-sm"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </foreignObject>
  )
}
