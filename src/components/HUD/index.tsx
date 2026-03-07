import { useState, useEffect } from 'react'
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
  const [pinned, setPinned] = useState(false)
  const [bgOpacity, setBgOpacity] = useState(0.75)
  const [textOpacity, setTextOpacity] = useState(1.0)
  const t = useT()

  useEffect(() => {
    window.windowAPI.getHudConfig().then((cfg) => {
      if (cfg.hudLocked) setLocked(true)
      if (cfg.hudBgOpacity !== undefined) setBgOpacity(cfg.hudBgOpacity)
      if (cfg.hudTextOpacity !== undefined) setTextOpacity(cfg.hudTextOpacity)
      if (cfg.hudPinned) {
        setPinned(true)
        void window.windowAPI.setHudPinned(true)
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
    return () => { unsubLang(); unsubConfig() }
  }, [])

  const pendingCount = quests.filter((q) => q.status === 'pending').length

  const { onMouseDown, toggleLock } = useDraggableHud(
    (x, y) => { void window.windowAPI.setHudPosition(x, y) },
    () => window.windowAPI.getHudPosition(),
    locked,
    setLocked,
    'hud',
    'hudLocked',
  )

  function togglePinned() {
    const next = !pinned
    setPinned(next)
    void window.windowAPI.setHudPinned(next)
  }

  if (!player) return null

  return (
    <div style={{ width: WIN_W, height: WIN_H }} className="relative rounded-xl select-none overflow-hidden">
      <div style={{ opacity: bgOpacity }} className="absolute inset-0 bg-black rounded-xl pointer-events-none" />
      <div style={{ opacity: textOpacity }} className="relative text-white flex flex-col h-full">
        <div
          onMouseDown={onMouseDown}
          className={`flex items-center justify-between px-2 py-1.5 ${locked ? 'cursor-default' : 'cursor-grab'}`}
        >
          <span className="text-xs font-semibold text-gray-400 truncate">{player.name}</span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={togglePinned}
              className={`text-xs px-1 leading-none ${pinned ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-200'}`}
              title={pinned ? t('unpinFromTop') : t('pinToTop')}
            >
              📌
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => void toggleLock()}
              className="text-gray-500 hover:text-gray-200 text-xs px-1 leading-none"
              title={locked ? t('unlockPosition') : t('lockPosition')}
            >
              {locked ? '🔒' : '🔓'}
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => void window.windowAPI.hideHud()}
              className="text-gray-500 hover:text-red-400 text-xs px-1 leading-none"
              title={t('hideHud')}
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1 pb-2">
          <HudBars player={player} />
          <div className="border-t border-gray-700 mx-1" />
          <HudStats player={player} streak={streak} pendingCount={pendingCount} />
        </div>
      </div>
    </div>
  )
}
