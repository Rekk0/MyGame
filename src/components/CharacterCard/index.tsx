import type { Player } from '../../types/player'
import { ProgressBar } from '../shared/ProgressBar'

interface CharacterCardProps {
  player: Player
  onManage: () => void
}

export function CharacterCard({ player, onManage }: CharacterCardProps): JSX.Element {
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
          title="角色管理"
        >
          ⚙
        </button>
      </div>

      <div>
        <p className="mb-1 text-xs text-gray-400">经验值</p>
        <ProgressBar current={player.xp} max={player.xpToNextLevel} color="blue" />
      </div>

      <div>
        <p className="mb-1 text-xs text-gray-400">精力</p>
        <ProgressBar current={player.ep} max={player.maxEp} color="green" />
      </div>

      <div className="flex items-center gap-1 text-sm text-yellow-400">
        <span>💰</span>
        <span>{player.gold} 金币</span>
      </div>
    </div>
  )
}
