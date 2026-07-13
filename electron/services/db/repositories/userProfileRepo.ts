import { eq } from 'drizzle-orm'
import { db } from '../index'
import { userProfiles } from '../schema'
import { getActivePlayerId } from './playerRepo'

const DAILY_DIVINATION_LIMIT = 3
const pid = (): string => getActivePlayerId()

type ProfileRow = typeof userProfiles.$inferSelect

export function getProfile(playerId = pid()): ProfileRow | undefined {
  return db.select().from(userProfiles).where(eq(userProfiles.playerId, playerId)).get()
}

/** 重建画像：写入新 summary，重置 skillClaimed（新版本画像重开配额）。 */
export function upsertProfile(playerId: string, summary: string, questCount: number): void {
  const existing = getProfile(playerId)
  const now = new Date().toISOString()
  if (existing) {
    db.update(userProfiles)
      .set({ summary, questCountAtBuild: questCount, skillClaimed: 0, updatedAt: now })
      .where(eq(userProfiles.playerId, playerId))
      .run()
  } else {
    db.insert(userProfiles)
      .values({ id: `${playerId}-profile`, playerId, summary, questCountAtBuild: questCount, updatedAt: now })
      .run()
  }
}

export function getRejectedNames(playerId = pid()): string[] {
  const row = getProfile(playerId)
  if (!row) return []
  try {
    return JSON.parse(row.rejectedNames) as string[]
  } catch {
    return []
  }
}

export function addRejectedName(name: string, playerId = pid()): void {
  const names = getRejectedNames(playerId)
  if (names.includes(name)) return
  db.update(userProfiles)
    .set({ rejectedNames: JSON.stringify([...names, name]) })
    .where(eq(userProfiles.playerId, playerId))
    .run()
}

export function markSkillClaimed(playerId = pid()): void {
  db.update(userProfiles).set({ skillClaimed: 1 }).where(eq(userProfiles.playerId, playerId)).run()
}

/** 占卜频控：按本地日期重置计数，未超限则 +1 并返回剩余次数；超限返回 -1（不消耗）。 */
export function consumeDivination(localDate: string, playerId = pid()): number {
  const row = getProfile(playerId)
  if (!row) return -1
  const used = row.divinationDate === localDate ? row.divinationCount : 0
  if (used >= DAILY_DIVINATION_LIMIT) return -1
  db.update(userProfiles)
    .set({ divinationDate: localDate, divinationCount: used + 1 })
    .where(eq(userProfiles.playerId, playerId))
    .run()
  return DAILY_DIVINATION_LIMIT - (used + 1)
}

export function divinationsLeft(localDate: string, playerId = pid()): number {
  const row = getProfile(playerId)
  if (!row) return 0
  const used = row.divinationDate === localDate ? row.divinationCount : 0
  return Math.max(0, DAILY_DIVINATION_LIMIT - used)
}
