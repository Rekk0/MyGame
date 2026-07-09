import { LockSimple } from '@phosphor-icons/react'
import type { Achievement, AchievementTier } from '../../types/achievement'
import { ModalShell } from '../shared/Panel'
import { useT } from '../../utils/i18n'

const TIER_BORDER: Record<AchievementTier, string> = {
  common: 'border-ink-faint',
  rare: 'border-arcane',
  epic: 'border-spirit',
  legendary: 'border-gold',
  Ultra: 'border-crimson'
}

interface Props {
  achievements: Achievement[]
  onClose: () => void
}

export function AchievementList({ achievements, onClose }: Props): JSX.Element {
  const t = useT()
  const unlocked = achievements.filter((a) => a.isUnlocked)
  const locked = achievements.filter((a) => !a.isUnlocked)

  const TIER_LABEL: Record<AchievementTier, string> = {
    common: t('tierCommon'),
    rare: t('tierRare'),
    epic: t('tierEpic'),
    legendary: t('tierLegendary'),
    Ultra: 'Ultra'
  }

  function renderCard(a: Achievement): JSX.Element {
    if (!a.isUnlocked) {
      return (
        <div
          key={a.id}
          className="flex items-center gap-3 rounded-lg border border-edge bg-panel-raised p-3 opacity-40"
        >
          <LockSimple size={20} className="text-ink-dim" />
          <p className="text-sm text-ink-dim">{t('lockedAchievement')}</p>
        </div>
      )
    }
    const border = TIER_BORDER[a.tier]
    return (
      <div key={a.id} className={`rpg-frame flex flex-col gap-1 rounded-lg border-2 p-3 ${border}`}>
        <div className="flex items-center justify-between">
          <p className="font-display font-semibold text-ink-hi">{a.title}</p>
          <span className="text-xs text-ink-dim">{TIER_LABEL[a.tier]}</span>
        </div>
        <p className="text-xs text-ink-dim">{a.description}</p>
        {a.unlockText && <p className="text-xs italic text-ink-faint">"{a.unlockText}"</p>}
      </div>
    )
  }

  return (
    <ModalShell
      title={`${t('achievementsTitle')} (${unlocked.length}/${achievements.length})`}
      onClose={onClose}
      className="max-h-[80vh] w-96"
    >
      <div className="flex flex-col gap-2 overflow-y-auto px-5 py-4">
        {unlocked.map(renderCard)}
        {locked.map(renderCard)}
      </div>
    </ModalShell>
  )
}
