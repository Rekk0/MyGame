import { useEffect } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useStreakStore } from '../../stores/streakStore'
import { useQuestStore } from '../../stores/questStore'

export default function HUD() {
  const player = usePlayerStore((s) => s.player)
  const streak = useStreakStore((s) => s.streak)
  const quests = useQuestStore((s) => s.quests)
  const fetchQuests = useQuestStore((s) => s.fetchQuests)

  useEffect(() => {
    fetchQuests()
  }, [])

  const pendingCount = quests.filter((q) => q.status === 'pending').length

  if (!player) return null

  return (
    <div className="w-full h-full bg-black/70 rounded-xl p-3 text-white text-sm flex flex-col gap-2 select-none">
      <div className="flex items-center gap-2">
        <span>🔥</span>
        <span>{streak?.currentCount ?? 0} 连胜</span>
      </div>
      <div className="flex items-center gap-2">
        <span>⚡</span>
        <span>EP {player.ep}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>⭐</span>
        <span>Lv.{player.level}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>📋</span>
        <span>{pendingCount} 任务</span>
      </div>
    </div>
  )
}
