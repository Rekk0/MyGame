import { Coins, Flame, ListChecks, Trophy } from '@phosphor-icons/react'
import type { Player } from '../../types/player'
import type { Streak } from '../../types/streak'
import { useT } from '../../utils/i18n'

interface Props {
  player: Player
  streak: Streak | null
  pendingCount: number
}

export default function HudStats({ player, streak, pendingCount }: Props) {
  const t = useT()
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1 text-xs text-ink">
      <div className="flex items-center gap-1">
        <Trophy size={12} weight="fill" className="text-gold" />
        <span className="tabular-nums">Lv.{player.level}</span>
      </div>
      <div className="flex items-center gap-1">
        <Coins size={12} weight="fill" className="text-gold" />
        <span className="tabular-nums">
          {player.gold} {t('goldShort')}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Flame size={12} weight="fill" className="text-will" />
        <span className="tabular-nums">
          {streak?.currentCount ?? 0} {t('streakShort')}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <ListChecks size={12} weight="fill" className="text-arcane" />
        <span className="tabular-nums">
          {pendingCount} {t('pendingShort')}
        </span>
      </div>
    </div>
  )
}
