import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../index'
import { players } from '../schema'
import type { WorldStyle } from '../../../../src/types/player'

type PlayerRow = typeof players.$inferSelect

export interface PlayerWithXp extends PlayerRow {
  xpToNextLevel: number
}

let _activePlayerId: string | null = null

function xpToNextLevel(level: number): number {
  return Math.ceil(100 * level * 1.5)
}

function withXpToNextLevel(row: PlayerRow): PlayerWithXp {
  return { ...row, xpToNextLevel: xpToNextLevel(row.level) }
}

function ensureActive(): string {
  if (_activePlayerId) return _activePlayerId
  const first = db.select().from(players).get()
  if (first) _activePlayerId = first.id
  return _activePlayerId ?? ''
}

export function getActivePlayerId(): string {
  return ensureActive()
}

export function getPlayer(): PlayerWithXp | undefined {
  const id = ensureActive()
  if (!id) return undefined
  const row = db.select().from(players).where(eq(players.id, id)).get()
  return row ? withXpToNextLevel(row) : undefined
}

export function getAllPlayers(): PlayerWithXp[] {
  return db.select().from(players).all().map(withXpToNextLevel)
}

export function createPlayer(name: string, worldStyle: WorldStyle = 'realistic'): PlayerWithXp {
  const id = randomUUID()
  db.insert(players).values({ id, name, worldStyle }).run()
  _activePlayerId = id
  return getPlayer()!
}

export function switchPlayer(id: string): PlayerWithXp {
  _activePlayerId = id
  return getPlayer()!
}

export function deletePlayer(id: string): void {
  db.delete(players).where(eq(players.id, id)).run()
  if (_activePlayerId === id) {
    _activePlayerId = null
    ensureActive()
  }
}

export function updatePlayer(data: Partial<PlayerRow>): PlayerWithXp {
  const id = ensureActive()
  db.update(players).set(data).where(eq(players.id, id)).run()
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

export function resetDailyEp(): void {
  db.update(players).set({ ep: 100 }).run()
}
