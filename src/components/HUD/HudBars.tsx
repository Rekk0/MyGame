import type { Player } from '../../types/player'

interface Props { player: Player }

export default function HudBars({ player }: Props) {
  const xpPct = Math.min(100, Math.round((player.xp / player.xpToNextLevel) * 100))
  const epPct = Math.min(100, Math.round((player.ep / 100) * 100))

  return (
    <div className="flex flex-col gap-1 px-1">
      <div className="flex items-center gap-1 text-xs text-gray-300">
        <span className="w-5">⭐</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${xpPct}%` }} />
        </div>
        <span className="w-12 text-right">{player.xp}/{player.xpToNextLevel}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-300">
        <span className="w-5">⚡</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${epPct}%` }} />
        </div>
        <span className="w-12 text-right">{player.ep}/100</span>
      </div>
    </div>
  )
}
