import { HandFist, Lightning, Sparkle, Star } from '@phosphor-icons/react'
import type { Player } from '../../types/player'

interface Props {
  player: Player
}

function barPct(value: number, max: number): number {
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)))
}

const BARS = [
  {
    icon: <Star size={12} weight="fill" className="text-gold" />,
    fill: 'rpg-fill-xp'
  },
  {
    icon: <Lightning size={12} weight="fill" className="text-ep" />,
    fill: 'rpg-fill-ep'
  },
  {
    icon: <HandFist size={12} weight="fill" className="text-will" />,
    fill: 'rpg-fill-will'
  },
  {
    icon: <Sparkle size={12} weight="fill" className="text-spirit" />,
    fill: 'rpg-fill-spirit'
  }
]

export default function HudBars({ player }: Props) {
  const rows = [
    {
      ...BARS[0],
      pct: barPct(player.xp, player.xpToNextLevel),
      text: `${player.xp}/${player.xpToNextLevel}`
    },
    {
      ...BARS[1],
      pct: barPct(player.ep, player.maxEp),
      text: `${player.ep}/${player.maxEp}`
    },
    {
      ...BARS[2],
      pct: barPct(player.willpower, player.maxWillpower),
      text: `${player.willpower}/${player.maxWillpower}`
    },
    {
      ...BARS[3],
      pct: barPct(player.spirit, player.maxSpirit),
      text: `${player.spirit}/${player.maxSpirit}`
    }
  ]

  return (
    <div className="flex flex-col gap-1 px-1">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-1 text-xs text-ink">
          <span className="flex w-5 justify-center">{row.icon}</span>
          <div className="rpg-bar-track h-2 flex-1 overflow-hidden rounded-sm">
            <div
              className={`rpg-bar-fill ${row.fill} h-full rounded-sm`}
              style={{ width: `${row.pct}%` }}
            />
          </div>
          <span className="w-12 text-right tabular-nums">{row.text}</span>
        </div>
      ))}
    </div>
  )
}
