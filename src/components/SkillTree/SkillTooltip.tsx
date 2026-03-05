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
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs text-white shadow-xl">
        <div className="font-bold text-sm text-yellow-400">{skill.name}</div>
        <div className="text-gray-400 mt-0.5">Lv.{skill.level} · {skill.category}</div>
        <div className="mt-1 text-gray-300">{skill.description}</div>
        {skill.traits.length > 0 && (
          <div className="mt-1.5">
            <div className="text-purple-400 font-medium">特质：</div>
            {skill.traits.map((t, i) => (
              <div key={i} className="text-purple-300">· {t}</div>
            ))}
          </div>
        )}
        <div className="mt-2">
          <div className="flex justify-between text-gray-400 mb-0.5">
            <span>XP</span><span>{skill.xp}/{skill.maxXp}</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full">
            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </foreignObject>
  )
}
