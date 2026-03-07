import type { Achievement, AchievementTier } from '../../types/achievement'
import { useT } from '../../utils/i18n'

const TIER_BORDER: Record<AchievementTier, string> = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
  Ultra: 'border-red-500',
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
    Ultra: 'Ultra',
  }

  function renderCard(a: Achievement): JSX.Element {
    if (!a.isUnlocked) {
      return (
        <div key={a.id} className="border border-gray-700 rounded-lg p-3 flex items-center gap-3 opacity-40">
          <span className="text-2xl">❓</span>
          <div>
            <p className="text-sm text-gray-500">{t('lockedAchievement')}</p>
          </div>
        </div>
      )
    }
    const border = TIER_BORDER[a.tier]
    return (
      <div key={a.id} className={`border-2 ${border} rounded-lg p-3 flex flex-col gap-1`}>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-white">{a.title}</p>
          <span className="text-xs text-gray-400">{TIER_LABEL[a.tier]}</span>
        </div>
        <p className="text-xs text-gray-400">{a.description}</p>
        {a.unlockText && <p className="text-xs italic text-gray-500">"{a.unlockText}"</p>}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">{t('achievementsTitle')} ({unlocked.length}/{achievements.length})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="flex flex-col gap-2">
          {unlocked.map(renderCard)}
          {locked.map(renderCard)}
        </div>
      </div>
    </div>
  )
}
