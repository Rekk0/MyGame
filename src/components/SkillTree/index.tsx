import { useEffect, useState } from 'react'
import { X, Sparkle } from '@phosphor-icons/react'
import type { Skill } from '../../types/skill'
import { SkillGraph } from './SkillGraph'
import { useSkillStore } from '../../stores/skillStore'
import { useT } from '../../utils/i18n'

interface Props {
  skills: Skill[]
}

export function SkillTree({ skills }: Props) {
  const [selected, setSelected] = useState<Skill | null>(null)
  const t = useT()
  const divination = useSkillStore((s) => s.divination)
  const generating = useSkillStore((s) => s.generating)
  const genError = useSkillStore((s) => s.genError)
  const fetchDivination = useSkillStore((s) => s.fetchDivination)
  const divine = useSkillStore((s) => s.divine)

  useEffect(() => {
    void fetchDivination()
  }, [fetchDivination])

  const locked = !divination.hasProfile || divination.claimed || divination.divinationsLeft <= 0
  const disabled = locked || generating
  const lockReason = !divination.hasProfile
    ? t('divineLockedNoProfile')
    : divination.claimed
      ? t('divineLockedClaimed')
      : divination.divinationsLeft <= 0
        ? t('divineLockedRate')
        : ''

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-edge bg-abyss-deep">
      <SkillGraph skills={skills} onSelect={setSelected} />

      <div className="absolute left-4 top-4 flex flex-col gap-1">
        <button
          disabled={disabled}
          onClick={() => void divine()}
          title={lockReason || undefined}
          className="flex items-center gap-1.5 rounded-md bg-gold/20 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkle size={14} weight="fill" />
          {generating ? t('divineGenerating') : t('divineBtn')}
        </button>
        {divination.hasProfile && (
          <div className="text-[10px] text-ink-dim">
            {t('divinationsLeftLabel')}: {divination.divinationsLeft}
          </div>
        )}
        {genError && genError !== 'no-profile' && genError !== 'claimed' && (
          <div className="text-[10px] text-crimson">
            {genError === 'rate-limited' ? t('divineLockedRate') : t('divineFailed')}
          </div>
        )}
      </div>

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
