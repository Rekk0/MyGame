import { Notification } from 'electron'
import { getStreak } from './db/repositories/streakRepo'
import { getAllQuests } from './db/repositories/questRepo'
import { getActivePlayerId } from './db/repositories/playerRepo'

export function sendNotification(title: string, body: string): void {
  if (!Notification.isSupported()) return
  new Notification({ title, body }).show()
}

export function sendStreakWarning(): void {
  if (!getActivePlayerId()) return
  const streak = getStreak()
  if (!streak || streak.currentCount === 0) return

  const today = new Date().toISOString().slice(0, 10)
  const completedToday = getAllQuests().some(
    q => q.status === 'completed' && q.completedAt?.startsWith(today)
  )
  if (!completedToday) {
    sendNotification(
      '⚠️ 连胜即将中断！',
      `你的 ${streak.currentCount} 天连胜今日尚未完成任何任务，赶快行动！`
    )
  }
}

export function startStreakWarningScheduler(): void {
  const CHECK_INTERVAL = 60 * 60 * 1000 // 每小时检查一次
  setInterval(() => {
    const hour = new Date().getHours()
    if (hour === 20) sendStreakWarning()
  }, CHECK_INTERVAL)
}
