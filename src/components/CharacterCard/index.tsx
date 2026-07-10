import { useEffect, useState } from 'react'
import {
  Coins,
  Flame,
  HandFist,
  Lightning,
  MaskHappy,
  Sparkle,
  Star,
  UserSwitch
} from '@phosphor-icons/react'
import type { Player } from '../../types/player'
import { useStreakStore } from '../../stores/streakStore'
import { ProgressBar } from '../shared/ProgressBar'
import { ResourceOrb } from '../shared/ResourceOrb'
import { WorldEmblem } from './WorldEmblem'
import { useT } from '../../utils/i18n'
import { MoodCheck } from '../MoodCheck'
import { DdaStatus } from './DdaStatus'

interface CharacterCardProps {
  player: Player
  onManage: () => void
}

const actionBtn =
  'flex items-center justify-center gap-1 rounded border border-edge bg-panel-raised px-2 py-1.5 text-xs text-ink transition-colors hover:border-edge-strong hover:text-ink-hi'

const divider = 'h-px bg-gradient-to-r from-transparent via-edge-strong to-transparent'

export function CharacterCard({ player, onManage }: CharacterCardProps): JSX.Element {
  const t = useT()
  const { streak, fetchStreak } = useStreakStore()
  const [showMood, setShowMood] = useState(false)

  useEffect(() => {
    fetchStreak()
  }, [])

  const streakCount = streak?.currentCount ?? 0
  const streakBonus = streakCount >= 30 ? 25 : streakCount >= 7 ? 10 : 0

  return (
    <div className="rpg-frame-ornate flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-panel p-4">
      {/* ---- 纹章 + 名号 ---- */}
      <div className="relative flex flex-col items-center">
        <button
          onClick={onManage}
          className="absolute right-0 top-0 text-ink-dim transition-colors hover:text-ink-hi"
          title={t('switchCharacter')}
        >
          <UserSwitch size={16} />
        </button>
        <WorldEmblem style={player.worldStyle} size={56} />
        <p className="mt-2 font-display text-lg font-bold tracking-wide text-ink-hi">
          {player.name}
        </p>
        {player.title && <p className="text-xs text-gold">{player.title}</p>}
        <p className="text-sm text-ink-dim">Lv.{player.level}</p>
      </div>

      <div className={divider} />

      {/* ---- XP 宽幅主条 ---- */}
      <ProgressBar
        current={player.xp}
        max={player.xpToNextLevel}
        color="xp"
        size="lg"
        label={
          <span className="flex items-center gap-1">
            <Star size={12} weight="fill" className="text-gold" />
            {t('xp')}
          </span>
        }
      />

      <div className={divider} />

      {/* ---- 三资源蓄量球 ---- */}
      <div className="flex justify-between px-2">
        <ResourceOrb
          value={player.ep}
          max={player.maxEp}
          color="ep"
          icon={<Lightning size={16} weight="fill" className="text-ep" />}
          label={t('ep')}
        />
        <ResourceOrb
          value={player.willpower}
          max={player.maxWillpower}
          color="will"
          icon={<HandFist size={16} weight="fill" className="text-will" />}
          label={t('willpower')}
        />
        <ResourceOrb
          value={player.spirit}
          max={player.maxSpirit}
          color="spirit"
          icon={<Sparkle size={16} weight="fill" className="text-spirit" />}
          label={t('spirit')}
        />
      </div>

      <div className={divider} />

      {/* ---- 金币 ---- */}
      <div className="flex items-center justify-center gap-1.5 text-sm text-gold">
        <Coins size={16} weight="duotone" />
        <span className="tabular-nums">
          {player.gold} {t('gold')}
        </span>
      </div>

      {/* ---- 连胜 + DDA ---- */}
      <div className="flex flex-col items-center gap-0.5">
        <p className="flex items-center gap-1 text-2xl font-bold tabular-nums text-will">
          <Flame size={22} weight="fill" />
          {streakCount}
        </p>
        <p className="text-xs text-ink-dim">{t('streakDays')}</p>
        {streak && streak.bestCount > 0 && (
          <p className="text-xs text-ink-faint">
            {t('streakBest')} {streak.bestCount}
            {t('streakBestSuffix')}
          </p>
        )}
        {streakBonus > 0 && <p className="text-xs text-ep">+{streakBonus}% XP</p>}
      </div>
      <DdaStatus />

      <div className={divider} />

      <button onClick={() => setShowMood(true)} className={`${actionBtn} w-full`}>
        <MaskHappy size={14} />
        {t('moodTitle')}
      </button>

      {showMood && <MoodCheck onClose={() => setShowMood(false)} />}
    </div>
  )
}
