import type { Player } from '../../types/player'
import type { Streak } from '../../types/streak'

interface Props { player: Player; streak: Streak | null; pendingCount: number }

export default function HudStats({ player, streak, pendingCount }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-200 px-1">
      <div className="flex items-center gap-1">
        <span>🏆</span>
        <span>Lv.{player.level}</span>
      </div>
      <div className="flex items-center gap-1">
        <span>💰</span>
        <span>{player.gold} 金</span>
      </div>
      <div className="flex items-center gap-1">
        <span>🔥</span>
        <span>{streak?.currentCount ?? 0} 连胜</span>
      </div>
      <div className="flex items-center gap-1">
        <span>📋</span>
        <span>{pendingCount} 待办</span>
      </div>
    </div>
  )
}
