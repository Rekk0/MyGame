import type { Skill } from '../../types/skill'

interface Props {
  skill: Skill
  x: number
  y: number
  onSelect: (skill: Skill) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  core: 'var(--rpg-crimson)',
  universal: 'var(--rpg-arcane)',
  hidden: 'var(--rpg-spirit)'
}

export function SkillNode({ skill, x, y, onSelect }: Props) {
  const color = skill.isUnlocked
    ? (CATEGORY_COLORS[skill.category] ?? 'var(--rpg-edge-strong)')
    : 'var(--rpg-panel-raised)'
  const textColor = skill.isUnlocked ? 'var(--rpg-ink-hi)' : 'var(--rpg-ink-dim)'

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect(skill)}
    >
      <circle
        r={28}
        fill={color}
        stroke={skill.isUnlocked ? 'var(--rpg-gold)' : 'var(--rpg-edge)'}
        strokeWidth={2}
        strokeDasharray={skill.isUnlocked ? undefined : '4 3'}
        opacity={skill.isUnlocked ? 1 : 0.6}
      />
      {!skill.isUnlocked && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--rpg-ink-dim)"
          fontSize={16}
          fontWeight={700}
        >
          ?
        </text>
      )}
      <text y={42} textAnchor="middle" fill={textColor} fontSize={11} fontWeight="500">
        {skill.name}
      </text>
      <text
        y={55}
        textAnchor="middle"
        fill={skill.isUnlocked ? 'var(--rpg-gold)' : 'var(--rpg-ink-dim)'}
        fontSize={10}
      >
        Lv.{skill.level}
      </text>
    </g>
  )
}
