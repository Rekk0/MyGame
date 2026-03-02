import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../index'
import { quests } from '../schema'

type Quest = typeof quests.$inferSelect
type QuestStatus = Quest['status']

export function createQuest(data: { originalText: string; dueDate?: string | null }): Quest {
  const id = randomUUID()
  db.insert(quests).values({ id, originalText: data.originalText, dueDate: data.dueDate ?? null }).run()
  return db.select().from(quests).where(eq(quests.id, id)).get()!
}

export function getAllQuests(): Quest[] {
  return db.select().from(quests).all()
}

export function getQuestById(id: string): Quest | undefined {
  return db.select().from(quests).where(eq(quests.id, id)).get()
}

export function getQuestsByStatus(status: QuestStatus): Quest[] {
  return db.select().from(quests).where(eq(quests.status, status)).all()
}

export function updateQuest(id: string, data: Partial<Quest>): Quest {
  db.update(quests).set(data).where(eq(quests.id, id)).run()
  return db.select().from(quests).where(eq(quests.id, id)).get()!
}

export function deleteQuest(id: string): void {
  db.delete(quests).where(eq(quests.id, id)).run()
}

export function completeQuest(id: string): Quest {
  db.update(quests)
    .set({ status: 'completed', completedAt: new Date().toISOString() })
    .where(eq(quests.id, id))
    .run()
  return db.select().from(quests).where(eq(quests.id, id)).get()!
}
