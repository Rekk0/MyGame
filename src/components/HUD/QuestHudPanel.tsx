import { useState, useEffect } from 'react'
import { ListChecks, LockSimple, LockSimpleOpen, PushPin, X } from '@phosphor-icons/react'
import { usePlayerStore } from '../../stores/playerStore'
import { useQuestStore } from '../../stores/questStore'
import { useDraggableHud } from '../../hooks/useDraggableHud'
import { useT } from '../../utils/i18n'
import { useLanguageStore } from '../../stores/languageStore'
import type { Quest } from '../../types/quest'

const WIN_W = 220
const WIN_H = 200

function buildQuestTitle(q: Quest, orig: string, due: string, type: string): string {
  const parts: string[] = [q.gamifiedName ?? q.originalText]
  if (q.narrative) parts.push(q.narrative)
  if (q.gamifiedName && q.originalText !== q.gamifiedName) parts.push(`${orig}${q.originalText}`)
  if (q.dueDate) parts.push(`${due}${new Date(q.dueDate).toLocaleDateString()}`)
  parts.push(`${type}${q.type}  |  ${q.xp} XP`)
  return parts.join('\n')
}

export default function QuestHudPanel() {
  const player = usePlayerStore((s) => s.player)
  const quests = useQuestStore((s) => s.quests)
  const [locked, setLocked] = useState(false)
  const [pinned, setPinned] = useState(true)
  const [bgOpacity, setBgOpacity] = useState(0.75)
  const [textOpacity, setTextOpacity] = useState(1.0)
  const t = useT()

  useEffect(() => {
    window.windowAPI.getHudConfig().then((cfg) => {
      if (cfg.questHudLocked) setLocked(true)
      if (cfg.hudBgOpacity !== undefined) setBgOpacity(cfg.hudBgOpacity)
      if (cfg.hudTextOpacity !== undefined) setTextOpacity(cfg.hudTextOpacity)
      if (cfg.questHudPinned === false) {
        setPinned(false)
        void window.windowAPI.setQuestHudPinned(false)
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

  const pending = quests.filter((q) => q.status === 'pending')

  const { onMouseDown, toggleLock } = useDraggableHud(
    (x, y) => {
      void window.windowAPI.setQuestHudPosition(x, y)
    },
    () => window.windowAPI.getQuestHudPosition(),
    locked,
    setLocked,
    'questHud',
    'questHudLocked'
  )

  function togglePinned() {
    const next = !pinned
    setPinned(next)
    void window.windowAPI.setQuestHudPinned(next)
  }

  if (!player) return null

  return (
    <div
      style={{ width: WIN_W, height: WIN_H }}
      className="relative select-none overflow-hidden rounded-lg"
    >
      {/* Background layer — opacity controlled independently */}
      <div
        style={{ opacity: bgOpacity }}
        className="pointer-events-none absolute inset-0 rounded-lg border border-edge-strong/50 bg-abyss-deep"
      />
      {/* Content layer — text/UI opacity controlled independently */}
      <div style={{ opacity: textOpacity }} className="relative flex h-full flex-col text-ink-hi">
        {/* Drag handle / title bar */}
        <div
          onMouseDown={onMouseDown}
          className={`flex shrink-0 items-center justify-between px-2 py-1 ${locked ? 'cursor-default' : 'cursor-grab'}`}
        >
          <span className="flex items-center gap-1 font-display text-xs font-semibold text-gold">
            <ListChecks size={12} weight="fill" />
            {t('pendingShort')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs tabular-nums text-ink-dim">{pending.length}</span>
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
              onClick={() => void window.windowAPI.hideQuestHud()}
              className="leading-none text-ink-dim hover:text-crimson"
              title={t('hideHud')}
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-1.5">
          {pending.length === 0 && (
            <div className="py-3 text-center text-xs text-ink-dim">{t('noPendingQuests')}</div>
          )}
          {pending.map((q) => (
            <div
              key={q.id}
              title={buildQuestTitle(q, t('originalPrefix'), t('duePrefix'), t('typePrefix'))}
              className="truncate rounded px-1.5 py-1 text-xs text-ink transition-colors hover:bg-panel-raised hover:text-ink-hi"
            >
              {q.gamifiedName ?? q.originalText}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
