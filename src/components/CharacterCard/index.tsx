import type { Player } from '../../types/player'
import { usePlayerStore } from '../../stores/playerStore'
import { ProgressBar } from '../shared/ProgressBar'
import { useT } from '../../utils/i18n'

interface CharacterCardProps {
  player: Player
  onManage: () => void
}

export function CharacterCard({ player, onManage }: CharacterCardProps): JSX.Element {
  const t = useT()
  const sleep = usePlayerStore((s) => s.sleep)
  const rest = usePlayerStore((s) => s.rest)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4 w-56 shrink-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-white">{player.name}</p>
          {player.title && (
            <p className="text-xs text-yellow-400">{player.title}</p>
          )}
          <p className="text-sm text-gray-400">Lv.{player.level}</p>
        </div>
        <button
          onClick={onManage}
          className="text-gray-500 hover:text-gray-300 text-base leading-none mt-1"
          title={t('switchCharacter')}
        >
          ⇄
        </button>
      </div>

      <div>
        <p className="mb-1 text-xs text-gray-400">{t('xp')}</p>
        <ProgressBar current={player.xp} max={player.xpToNextLevel} color="blue" />
      </div>

      <div>
        <p className="mb-1 text-xs text-gray-400">⚡ {t('ep')}</p>
        <ProgressBar current={player.ep} max={player.maxEp} color="green" />
      </div>

      <div>
        <p className="mb-1 text-xs text-gray-400">🔥 意志力</p>
        <ProgressBar current={player.willpower} max={player.maxWillpower} color="yellow" />
      </div>

      <div>
        <p className="mb-1 text-xs text-gray-400">✨ 精神</p>
        <ProgressBar current={player.spirit} max={player.maxSpirit} color="blue" />
      </div>

      <div className="flex items-center gap-1 text-sm text-yellow-400">
        <span>💰</span>
        <span>{player.gold} {t('gold')}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => sleep()}
          className="flex-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600 transition-colors"
          title="恢复精力与意志力"
        >
          😴 我睡了
        </button>
        <button
          onClick={() => rest()}
          className="flex-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600 transition-colors"
          title="小憩恢复"
        >
          ☕ 休息
        </button>
      </div>
    </div>
  )
}
