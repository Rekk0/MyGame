import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../index'
import { players } from '../schema'

type PlayerRow = typeof players.$inferSelect

export interface PlayerWithXp extends PlayerRow {
  xpToNextLevel: number
}

function xpToNextLevel(level: number): number {
  return Math.ceil(100 * level * 1.5)
}

function withXpToNextLevel(row: PlayerRow): PlayerWithXp {
  return { ...row, xpToNextLevel: xpToNextLevel(row.level) }
}

export function getPlayer(): PlayerWithXp | undefined {
  const row = db.select().from(players).get()
  return row ? withXpToNextLevel(row) : undefined
}

export function createPlayer(name: string): PlayerWithXp {
  const id = randomUUID()
  db.insert(players).values({ id, name }).run()
  return getPlayer()!
}

export function updatePlayer(data: Partial<PlayerRow>): PlayerWithXp {
  const player = getPlayer()!
  db.update(players).set(data).where(eq(players.id, player.id)).run()
  return getPlayer()!
}

export function addXp(amount: number): { leveledUp: boolean; newLevel: number } {
  const player = getPlayer()!
  let { level, xp } = player
  let leveledUp = false
  xp += amount

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level)
    level += 1
    leveledUp = true
  }

  db.update(players).set({ level, xp }).where(eq(players.id, player.id)).run()
  return { leveledUp, newLevel: level }
}

export function addGold(amount: number): PlayerWithXp {
  const player = getPlayer()!
  db.update(players).set({ gold: player.gold + amount }).where(eq(players.id, player.id)).run()
  return getPlayer()!
}

export function consumeEp(amount: number): PlayerWithXp {
  const player = getPlayer()!
  const newEp = Math.max(0, player.ep - amount)
  db.update(players).set({ ep: newEp }).where(eq(players.id, player.id)).run()
  return getPlayer()!
}

export function resetDailyEp(): PlayerWithXp {
  const player = getPlayer()!
  db.update(players).set({ ep: player.maxEp }).where(eq(players.id, player.id)).run()
  return getPlayer()!
}
