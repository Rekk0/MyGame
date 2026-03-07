import { useState, useEffect } from 'react'
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
  const [bgOpacity, setBgOpacity] = useState(0.75)
  const [textOpacity, setTextOpacity] = useState(1.0)
  const t = useT()

  useEffect(() => {
    window.windowAPI.getHudConfig().then((cfg) => {
      if (cfg.questHudLocked) setLocked(true)
      if (cfg.hudBgOpacity !== undefined) setBgOpacity(cfg.hudBgOpacity)
      if (cfg.hudTextOpacity !== undefined) setTextOpacity(cfg.hudTextOpacity)
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

  const pending = quests.filter((q) => q.status === 'pending')

  const { onMouseDown, toggleLock } = useDraggableHud(
    (x, y) => { void window.windowAPI.setQuestHudPosition(x, y) },
    () => window.windowAPI.getQuestHudPosition(),
    locked,
    setLocked,
    'questHud',
    'questHudLocked',
  )

  if (!player) return null

  return (
    <div style={{ width: WIN_W, height: WIN_H }} className="relative rounded-xl select-none overflow-hidden">
      {/* Background layer — opacity controlled independently */}
      <div style={{ opacity: bgOpacity }} className="absolute inset-0 bg-black rounded-xl pointer-events-none" />
      {/* Content layer — text/UI opacity controlled independently */}
      <div style={{ opacity: textOpacity }} className="relative text-white flex flex-col h-full">
        {/* Drag handle / title bar */}
        <div
          onMouseDown={onMouseDown}
          className={`flex items-center justify-between px-2 py-1 shrink-0 ${locked ? 'cursor-default' : 'cursor-grab'}`}
        >
          <span className="text-xs font-semibold text-gray-400">📋 {t('pendingShort')}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{pending.length}</span>
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
              onClick={() => void window.windowAPI.hideQuestHud()}
              className="text-gray-500 hover:text-red-400 text-xs px-1 leading-none"
              title={t('hideHud')}
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 px-1.5 pb-1.5">
          {pending.length === 0 && (
            <div className="text-xs text-gray-500 text-center py-3">{t('noPendingQuests')}</div>
          )}
          {pending.map((q) => (
            <div
              key={q.id}
              title={buildQuestTitle(q, t('originalPrefix'), t('duePrefix'), t('typePrefix'))}
              className="py-1 px-1.5 rounded text-xs text-gray-200 truncate hover:bg-gray-700/60 hover:text-white transition-colors"
            >
              {q.gamifiedName ?? q.originalText}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
