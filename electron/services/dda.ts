import { and, eq, gte } from 'drizzle-orm'
import { db } from './db/index'
import { quests } from './db/schema'
import { getActivePlayerId } from './db/repositories/playerRepo'
import { getStreak } from './db/repositories/streakRepo'

export type DdaState = 'anxious' | 'flow' | 'bored'

export function analyzePlayerState(): DdaState {
  const pid = getActivePlayerId()
  if (!pid) return 'flow'

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff = sevenDaysAgo.toISOString()

  const recent = db.select().from(quests)
    .where(and(eq(quests.playerId, pid), gte(quests.createdAt, cutoff)))
    .all()

  if (recent.length === 0) return 'flow'

  const completed = recent.filter(q => q.status === 'completed').length
  const rate = completed / recent.length

  if (rate < 0.4) return 'anxious'
  if (rate > 0.8) return 'bored'
  return 'flow'
}

export function getDdaAdjustment(state: DdaState): { xpMultiplier: number; suggestion: string } {
  if (state === 'anxious') return { xpMultiplier: 1.5, suggestion: '建议拆解复杂任务' }
  if (state === 'bored')   return { xpMultiplier: 0.8, suggestion: '尝试更有挑战性的任务' }
  return { xpMultiplier: 1.0, suggestion: '保持节奏！' }
}

export function getStreakMultiplier(): number {
  const streak = getStreak()
  const count = streak?.currentCount ?? 0
  if (count >= 30) return 1.25
  if (count >= 7)  return 1.1
  return 1.0
}
