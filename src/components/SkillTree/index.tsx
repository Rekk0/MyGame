import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import type { Skill } from '../../types/skill'
import { SkillGraph } from './SkillGraph'
import { useT } from '../../utils/i18n'

interface Props {
  skills: Skill[]
}

export function SkillTree({ skills }: Props) {
  const [selected, setSelected] = useState<Skill | null>(null)
  const t = useT()

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-edge bg-abyss-deep">
      <SkillGraph skills={skills} onSelect={setSelected} />
      {selected && (
        <div className="absolute right-4 top-4 w-56">
          <div className="rpg-frame rounded-lg p-3 text-xs text-ink">
            <div className="flex items-start justify-between">
              <div className="font-display text-sm font-bold text-gold">{selected.name}</div>
              <button
                onClick={() => setSelected(null)}
                className="ml-2 text-ink-dim hover:text-ink-hi"
              >
                <X size={12} weight="bold" />
              </button>
            </div>
            <div className="mt-0.5 text-ink-dim">
              Lv.{selected.level} · {selected.category}
            </div>
            <div className="mt-1 text-ink">{selected.description}</div>
            {selected.traits.length > 0 && (
              <div className="mt-1.5">
                <div className="font-medium text-spirit">{t('traits')}</div>
                {selected.traits.map((trait, i) => (
                  <div key={i} className="text-spirit/80">
                    · {trait}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2">
              <div className="mb-0.5 flex justify-between text-ink-dim">
                <span>XP</span>
                <span className="tabular-nums">
                  {selected.xp}/{selected.maxXp}
                </span>
              </div>
              <div className="rpg-bar-track h-1.5 overflow-hidden rounded-sm">
                <div
                  className="rpg-bar-fill rpg-fill-xp h-full rounded-sm"
                  style={{
                    width: `${Math.round((selected.xp / selected.maxXp) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
