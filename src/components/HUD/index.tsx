import { useState, useEffect } from 'react'
import { LockSimple, LockSimpleOpen, PushPin, X } from '@phosphor-icons/react'
import { usePlayerStore } from '../../stores/playerStore'
import { useStreakStore } from '../../stores/streakStore'
import { useQuestStore } from '../../stores/questStore'
import { useDraggableHud } from '../../hooks/useDraggableHud'
import { useT } from '../../utils/i18n'
import { useLanguageStore } from '../../stores/languageStore'
import HudBars from './HudBars'
import HudStats from './HudStats'

const WIN_W = 220
const WIN_H = 128

export default function HUD() {
  const player = usePlayerStore((s) => s.player)
  const streak = useStreakStore((s) => s.streak)
  const quests = useQuestStore((s) => s.quests)
  const [locked, setLocked] = useState(false)
  const [pinned, setPinned] = useState(true)
  const [bgOpacity, setBgOpacity] = useState(0.75)
  const [textOpacity, setTextOpacity] = useState(1.0)
  const t = useT()

  useEffect(() => {
    window.windowAPI.getHudConfig().then((cfg) => {
      if (cfg.hudLocked) setLocked(true)
      if (cfg.hudBgOpacity !== undefined) setBgOpacity(cfg.hudBgOpacity)
      if (cfg.hudTextOpacity !== undefined) setTextOpacity(cfg.hudTextOpacity)
      if (cfg.hudPinned === false) {
        setPinned(false)
        void window.windowAPI.setHudPinned(false)
      }
    })
    window.settingsAPI.getAiConfig().then((cfg) => {
      if (cfg?.language) useLanguageStore.getState().setLanguage(cfg.language)
    })
    const unsubLang = window.settingsAPI.onLanguageChanged((lang) => {
      useLanguageStore.getState().setLanguage(lang as 'zh' | 'en')
    })
    const unsubConfig = window.windowAPI.onHudConfigChanged((cfg) => {
      if (cfg.hudBgOpacity !== undefined) setBgOpacity(cfg.hudBgOpacity)
      if (cfg.hudTextOpacity !== undefined) setTextOpacity(cfg.hudTextOpacity)
    })
    return () => {
      unsubLang()
      unsubConfig()
    }
  }, [])

  const pendingCount = quests.filter((q) => q.status === 'pending').length

  const { onMouseDown, toggleLock } = useDraggableHud(
    (x, y) => {
      void window.windowAPI.setHudPosition(x, y)
    },
    () => window.windowAPI.getHudPosition(),
    locked,
    setLocked,
    'hud',
    'hudLocked'
  )

  function togglePinned() {
    const next = !pinned
    setPinned(next)
    void window.windowAPI.setHudPinned(next)
  }

  if (!player) return null

  return (
    <div
      style={{ width: WIN_W, height: WIN_H }}
      className="relative select-none overflow-hidden rounded-lg"
    >
      <div
        style={{ opacity: bgOpacity }}
        className="pointer-events-none absolute inset-0 rounded-lg border border-edge-strong/50 bg-abyss-deep"
      />
      <div style={{ opacity: textOpacity }} className="relative flex h-full flex-col text-ink-hi">
        <div
          onMouseDown={onMouseDown}
          className={`flex items-center justify-between px-2 py-1.5 ${locked ? 'cursor-default' : 'cursor-grab'}`}
        >
          <span className="truncate font-display text-xs font-semibold text-gold">
            {player.name}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={togglePinned}
              className={`leading-none ${pinned ? 'text-gold' : 'text-ink-dim hover:text-ink'}`}
              title={pinned ? t('unpinFromTop') : t('pinToTop')}
            >
              <PushPin size={12} weight={pinned ? 'fill' : 'regular'} />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => void toggleLock()}
              className="leading-none text-ink-dim hover:text-ink"
              title={locked ? t('unlockPosition') : t('lockPosition')}
            >
              {locked ? <LockSimple size={12} weight="fill" /> : <LockSimpleOpen size={12} />}
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => void window.windowAPI.hideHud()}
              className="leading-none text-ink-dim hover:text-crimson"
              title={t('hideHud')}
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1 pb-2">
          <HudBars player={player} />
          <div className="mx-1 h-px bg-gradient-to-r from-transparent via-edge-strong to-transparent" />
          <HudStats player={player} streak={streak} pendingCount={pendingCount} />
        </div>
      </div>
    </div>
  )
}
