import type { Skill } from '../../types/skill'

interface Props {
  skill: Skill
  x: number
  y: number
  onSelect: (skill: Skill) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  core: '#ef4444',
  universal: '#3b82f6',
  hidden: '#a855f7',
}

export function SkillNode({ skill, x, y, onSelect }: Props) {
  const color = skill.isUnlocked ? CATEGORY_COLORS[skill.category] ?? '#6b7280' : '#374151'
  const textColor = skill.isUnlocked ? '#f9fafb' : '#6b7280'

  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={() => onSelect(skill)}>
      <circle r={28} fill={color} stroke={skill.isUnlocked ? '#fff' : '#4b5563'} strokeWidth={2} opacity={skill.isUnlocked ? 1 : 0.5} />
      {!skill.isUnlocked && (
        <text textAnchor="middle" dominantBaseline="central" fill="#6b7280" fontSize={18}>🔒</text>
      )}
      <text y={42} textAnchor="middle" fill={textColor} fontSize={11} fontWeight="500">
        {skill.name}
      </text>
      <text y={55} textAnchor="middle" fill={skill.isUnlocked ? '#fbbf24' : '#6b7280'} fontSize={10}>
        Lv.{skill.level}
      </text>
    </g>
  )
}
