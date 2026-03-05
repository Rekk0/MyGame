import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../index'
import { medals } from '../schema'
import { getActivePlayerId } from './playerRepo'

function pid(): string {
  return getActivePlayerId()
}

export function createMedal(data: {
  name: string
  category: string
  svgCode: string
  seed: string
  description: string
}) {
  const id = randomUUID()
  const unlockedAt = new Date().toISOString()
  db.insert(medals).values({ id, playerId: pid(), unlockedAt, ...data }).run()
  return db.select().from(medals).where(eq(medals.id, id)).get()!
}

export function getAllMedals() {
  return db.select().from(medals).where(eq(medals.playerId, pid())).all()
}

export function getMedalByCategory(category: string) {
  return db.select().from(medals).where(and(eq(medals.category, category), eq(medals.playerId, pid()))).all()
}

export function hasMedal(name: string): boolean {
  const row = db.select().from(medals)
    .where(and(eq(medals.name, name), eq(medals.playerId, pid())))
    .get()
  return !!row
}
