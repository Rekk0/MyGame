import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../index'
import { medals } from '../schema'

export function createMedal(data: {
  name: string
  category: string
  svgCode: string
  seed: string
  description: string
}) {
  const id = randomUUID()
  const unlockedAt = new Date().toISOString()
  db.insert(medals).values({ id, unlockedAt, ...data }).run()
  return db.select().from(medals).where(eq(medals.id, id)).get()!
}

export function getAllMedals() {
  return db.select().from(medals).all()
}

export function getMedalByCategory(category: string) {
  return db.select().from(medals).where(eq(medals.category, category)).all()
}

export function hasMedal(name: string): boolean {
  const row = db.select().from(medals).where(eq(medals.name, name)).get()
  return !!row
}
