import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useStreakStore } from '../../stores/streakStore'
import { useQuestStore } from '../../stores/questStore'
import { useDraggableHud } from '../../hooks/useDraggableHud'
import HudBars from './HudBars'
import HudStats from './HudStats'

const WIN_W = 220
const WIN_H = 128

export default function HUD() {
  const player = usePlayerStore((s) => s.player)
  const streak = useStreakStore((s) => s.streak)
  const quests = useQuestStore((s) => s.quests)
  const [locked, setLocked] = useState(false)

  const pendingCount = quests.filter((q) => q.status === 'pending').length

  const { onMouseDown } = useDraggableHud(
    (x, y) => { void window.windowAPI.setHudPosition(x, y) },
    locked
  )

  if (!player) return null

  return (
    <div style={{ width: WIN_W, height: WIN_H }} className="bg-black/75 rounded-xl text-white flex flex-col select-none overflow-hidden">
      {/* Drag handle / title bar */}
      <div
        onMouseDown={onMouseDown}
        className={`flex items-center justify-between px-2 py-1.5 ${locked ? 'cursor-default' : 'cursor-grab'}`}
      >
        <span className="text-xs font-semibold text-gray-400 truncate">{player.name}</span>
        <div className="flex items-center gap-1 shrink-0">
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
            onClick={() => void window.windowAPI.hideHud()}
            className="text-gray-500 hover:text-red-400 text-xs px-1 leading-none"
            title="隐藏"
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
  )
}
