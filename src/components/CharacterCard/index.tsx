import { useState } from 'react'
import {
  Coffee,
  Coins,
  HandFist,
  Lightning,
  MaskHappy,
  MoonStars,
  Sparkle,
  Star,
  UserSwitch
} from '@phosphor-icons/react'
import type { Player } from '../../types/player'
import { usePlayerStore } from '../../stores/playerStore'
import { ProgressBar } from '../shared/ProgressBar'
import { useT } from '../../utils/i18n'
import { MoodCheck } from '../MoodCheck'

interface CharacterCardProps {
  player: Player
  onManage: () => void
}

const actionBtn =
  'flex items-center justify-center gap-1 rounded border border-edge bg-panel-raised px-2 py-1.5 text-xs text-ink transition-colors hover:border-edge-strong hover:text-ink-hi'

export function CharacterCard({ player, onManage }: CharacterCardProps): JSX.Element {
  const t = useT()
  const sleep = usePlayerStore((s) => s.sleep)
  const rest = usePlayerStore((s) => s.rest)
  const [showMood, setShowMood] = useState(false)

  return (
    <div className="rpg-frame-ornate flex w-60 shrink-0 flex-col gap-3 rounded-lg bg-panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-bold tracking-wide text-ink-hi">{player.name}</p>
          {player.title && <p className="text-xs text-gold">{player.title}</p>}
          <p className="mt-0.5 text-sm text-ink-dim">Lv.{player.level}</p>
        </div>
        <button
          onClick={onManage}
          className="mt-1 text-ink-dim transition-colors hover:text-ink-hi"
          title={t('switchCharacter')}
        >
          <UserSwitch size={16} />
        </button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-edge-strong to-transparent" />

      <ProgressBar
        current={player.xp}
        max={player.xpToNextLevel}
        color="xp"
        label={
          <span className="flex items-center gap-1">
            <Star size={12} weight="fill" className="text-gold" />
            {t('xp')}
          </span>
        }
      />
      <ProgressBar
        current={player.ep}
        max={player.maxEp}
        color="ep"
        label={
          <span className="flex items-center gap-1">
            <Lightning size={12} weight="fill" className="text-ep" />
            {t('ep')}
          </span>
        }
      />
      <ProgressBar
        current={player.willpower}
        max={player.maxWillpower}
        color="will"
        label={
          <span className="flex items-center gap-1">
            <HandFist size={12} weight="fill" className="text-will" />
            意志力
          </span>
        }
      />
      <ProgressBar
        current={player.spirit}
        max={player.maxSpirit}
        color="spirit"
        label={
          <span className="flex items-center gap-1">
            <Sparkle size={12} weight="fill" className="text-spirit" />
            精神
          </span>
        }
      />

      <div className="flex items-center gap-1.5 text-sm text-gold">
        <Coins size={16} weight="duotone" />
        <span className="tabular-nums">
          {player.gold} {t('gold')}
        </span>
      </div>

      <div className="flex gap-2">
        <button onClick={() => sleep()} className={`${actionBtn} flex-1`} title="恢复精力与意志力">
          <MoonStars size={14} />
          我睡了
        </button>
        <button onClick={() => rest()} className={`${actionBtn} flex-1`} title="小憩恢复">
          <Coffee size={14} />
          休息
        </button>
      </div>

      <button onClick={() => setShowMood(true)} className={`${actionBtn} w-full`}>
        <MaskHappy size={14} />
        记一笔心情
      </button>

      {showMood && <MoodCheck onClose={() => setShowMood(false)} />}
    </div>
  )
}
