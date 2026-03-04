import { getPlayer } from './db/repositories/playerRepo'
import { getStreak } from './db/repositories/streakRepo'
import { getAllQuests } from './db/repositories/questRepo'
import {
  isUnlocked,
  unlockAchievement,
  getByCondition,
} from './db/repositories/achievementRepo'

type AchievementRow = {
  id: string
  title: string
  description: string
  tier: string
  triggerCondition: string
  unlockText: string | null
  unlockedAt: string | null
  isUnlocked: boolean
}

async function tryUnlock(condition: string): Promise<AchievementRow | null> {
  if (isUnlocked(condition)) return null
  const row = getByCondition(condition)
  if (!row) return null
  const updated = unlockAchievement(row.id, null)
  return { ...updated, isUnlocked: updated.isUnlocked === 1 }
}

export async function checkAchievements(): Promise<AchievementRow[]> {
  const player = getPlayer()
  if (!player) return []

  const streak = getStreak()
  const quests = getAllQuests()
  const completed = quests.filter((q) => q.status === 'completed')
  const newlyUnlocked: AchievementRow[] = []

  const checks: string[] = []

  // Quest count milestones
  if (completed.length >= 1) checks.push('first_quest')
  if (completed.length >= 10) checks.push('quest_10')
  if (completed.length >= 100) checks.push('quest_100')

  // Streak milestones
  const currentStreak = streak?.currentCount ?? 0
  if (currentStreak >= 7) checks.push('streak_7')
  if (currentStreak >= 30) checks.push('streak_30')
  if (currentStreak >= 365) checks.push('streak_365')

  // Level milestones
  if (player.level >= 5) checks.push('level_5')
  if (player.level >= 10) checks.push('level_10')
  if (player.level >= 20) checks.push('level_20')

  // Quest type firsts
  if (completed.some((q) => q.type === 'daily')) checks.push('first_daily')
  if (completed.some((q) => q.type === 'main')) checks.push('first_main')

  for (const condition of checks) {
    const result = await tryUnlock(condition)
    if (result) newlyUnlocked.push(result)
  }

  return newlyUnlocked
}
