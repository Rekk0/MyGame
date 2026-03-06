import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useQuestStore } from '../../stores/questStore'
import { useDraggableHud } from '../../hooks/useDraggableHud'
import type { Quest } from '../../types/quest'

const WIN_W = 220
const WIN_H = 200

function questTitle(q: Quest): string {
  const parts: string[] = [q.gamifiedName ?? q.originalText]
  if (q.narrative) parts.push(q.narrative)
  if (q.gamifiedName && q.originalText !== q.gamifiedName) parts.push(`原文：${q.originalText}`)
  if (q.dueDate) parts.push(`截止：${new Date(q.dueDate).toLocaleDateString('zh-CN')}`)
  parts.push(`类型：${q.type}  |  ${q.xp} XP`)
  return parts.join('\n')
}

export default function QuestHudPanel() {
  const player = usePlayerStore((s) => s.player)
  const quests = useQuestStore((s) => s.quests)
  const [locked, setLocked] = useState(false)

  const pending = quests.filter((q) => q.status === 'pending')

  const { onMouseDown } = useDraggableHud(
    (x, y) => { void window.windowAPI.setQuestHudPosition(x, y) },
    () => window.windowAPI.getQuestHudPosition(),
    locked
  )

  if (!player) return null

  return (
    <div style={{ width: WIN_W, height: WIN_H }} className="bg-black/75 rounded-xl text-white flex flex-col select-none overflow-hidden">
      {/* Drag handle / title bar */}
      <div
        onMouseDown={onMouseDown}
        className={`flex items-center justify-between px-2 py-1 shrink-0 ${locked ? 'cursor-default' : 'cursor-grab'}`}
      >
        <span className="text-xs font-semibold text-gray-400">📋 待办</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">{pending.length}</span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setLocked((v) => !v)}
            className="text-gray-500 hover:text-gray-200 text-xs px-1 leading-none"
            title={locked ? '解锁位置' : '锁定位置'}
          >
            {locked ? '🔒' : '🔓'}
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => void window.windowAPI.hideQuestHud()}
            className="text-gray-500 hover:text-red-400 text-xs px-1 leading-none"
            title="隐藏"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 px-1.5 pb-1.5">
        {pending.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-3">暂无待办任务</div>
        )}
        {pending.map((q) => (
          <div
            key={q.id}
            title={questTitle(q)}
            className="py-1 px-1.5 rounded text-xs text-gray-200 truncate hover:bg-gray-700/60 hover:text-white transition-colors"
          >
            {q.gamifiedName ?? q.originalText}
          </div>
        ))}
      </div>
    </div>
  )
}
