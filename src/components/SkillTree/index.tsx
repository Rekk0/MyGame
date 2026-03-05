import { useState } from 'react'
import type { Skill } from '../../types/skill'
import { SkillGraph } from './SkillGraph'
import { SkillTooltip } from './SkillTooltip'

interface Props {
  skills: Skill[]
}

export function SkillTree({ skills }: Props) {
  const [selected, setSelected] = useState<Skill | null>(null)

  return (
    <div className="relative w-full h-full bg-gray-950 rounded-lg overflow-hidden">
      <SkillGraph skills={skills} onSelect={setSelected} />
      {selected && (
        <div className="absolute top-4 right-4 w-56">
          <svg width={0} height={0}>
            <SkillTooltip skill={selected} x={0} y={0} />
          </svg>
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div className="font-bold text-sm text-yellow-400">{selected.name}</div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white ml-2">✕</button>
            </div>
            <div className="text-gray-400 mt-0.5">Lv.{selected.level} · {selected.category}</div>
            <div className="mt-1 text-gray-300">{selected.description}</div>
            {selected.traits.length > 0 && (
              <div className="mt-1.5">
                <div className="text-purple-400 font-medium">特质：</div>
                {selected.traits.map((t, i) => <div key={i} className="text-purple-300">· {t}</div>)}
              </div>
            )}
            <div className="mt-2">
              <div className="flex justify-between text-gray-400 mb-0.5"><span>XP</span><span>{selected.xp}/{selected.maxXp}</span></div>
              <div className="h-1.5 bg-gray-700 rounded-full">
                <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${Math.round(selected.xp / selected.maxXp * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
