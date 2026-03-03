import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../index'
import { streaks } from '../schema'
import { getActivePlayerId } from './playerRepo'

type Streak = typeof streaks.$inferSelect

function pid(): string {
  return getActivePlayerId()
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayOf(date: string): string {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function getStreak(): Streak | undefined {
  return db.select().from(streaks).where(eq(streaks.playerId, pid())).get()
}

export function initStreak(): Streak {
  const id = randomUUID()
  db.insert(streaks).values({ id, playerId: pid(), lastActiveDate: todayStr() }).run()
  return db.select().from(streaks).where(and(eq(streaks.id, id), eq(streaks.playerId, pid()))).get()!
}

function getOrInit(): Streak {
  return getStreak() ?? initStreak()
}

export function recordActivity(date?: string): Streak {
  const streak = getOrInit()
  const today = date ?? todayStr()
  const yesterday = yesterdayOf(today)

  if (streak.lastActiveDate === today) return streak

  const newCount = streak.lastActiveDate === yesterday ? streak.currentCount + 1 : 1
  const newBest = Math.max(newCount, streak.bestCount)

  db.update(streaks)
    .set({ currentCount: newCount, bestCount: newBest, lastActiveDate: today })
    .where(eq(streaks.id, streak.id))
    .run()

  return db.select().from(streaks).where(eq(streaks.id, streak.id)).get()!
}

export function checkAndUpdateStreak(): Streak {
  return recordActivity()
}
