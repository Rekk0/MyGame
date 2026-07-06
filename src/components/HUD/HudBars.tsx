import type { Player } from '../../types/player'

interface Props { player: Player }

function barPct(value: number, max: number): number {
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)))
}

export default function HudBars({ player }: Props) {
  const xpPct = barPct(player.xp, player.xpToNextLevel)
  const energyPct = barPct(player.ep, player.maxEp)
  const willPct = barPct(player.willpower, player.maxWillpower)
  const spiritPct = barPct(player.spirit, player.maxSpirit)

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
          <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${energyPct}%` }} />
        </div>
        <span className="w-12 text-right">{player.ep}/{player.maxEp}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-300">
        <span className="w-5">🔥</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div className="bg-orange-400 h-2 rounded-full transition-all" style={{ width: `${willPct}%` }} />
        </div>
        <span className="w-12 text-right">{player.willpower}/{player.maxWillpower}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-300">
        <span className="w-5">✨</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div className="bg-violet-400 h-2 rounded-full transition-all" style={{ width: `${spiritPct}%` }} />
        </div>
        <span className="w-12 text-right">{player.spirit}/{player.maxSpirit}</span>
      </div>
    </div>
  )
}
