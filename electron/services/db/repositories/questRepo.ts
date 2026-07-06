import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../index'
import { quests } from '../schema'
import { getActivePlayerId } from './playerRepo'

type Quest = typeof quests.$inferSelect
type QuestStatus = Quest['status']

function pid(): string {
  return getActivePlayerId()
}

export function createQuest(data: {
  originalText: string
  dueDate?: string | null
  userEnergyPct?: number
  userDrive?: number
  userLike?: number
}): Quest {
  const id = randomUUID()
  db.insert(quests).values({
    id,
    playerId: pid(),
    originalText: data.originalText,
    dueDate: data.dueDate ?? null,
    userEnergyPct: data.userEnergyPct ?? null,
    userDrive: data.userDrive ?? null,
    userLike: data.userLike ?? null,
  }).run()
  return db.select().from(quests).where(eq(quests.id, id)).get()!
}

export function getAllQuests(): Quest[] {
  return db.select().from(quests).where(eq(quests.playerId, pid())).all()
}

export function getQuestById(id: string): Quest | undefined {
  return db.select().from(quests).where(and(eq(quests.id, id), eq(quests.playerId, pid()))).get()
}

export function getQuestsByStatus(status: QuestStatus): Quest[] {
  return db.select().from(quests).where(and(eq(quests.status, status), eq(quests.playerId, pid()))).all()
}

export function updateQuest(id: string, data: Partial<Quest>): Quest {
  db.update(quests).set(data).where(and(eq(quests.id, id), eq(quests.playerId, pid()))).run()
  return db.select().from(quests).where(eq(quests.id, id)).get()!
}

export function deleteQuest(id: string): void {
  db.delete(quests).where(and(eq(quests.id, id), eq(quests.playerId, pid()))).run()
}

export function completeQuest(id: string): Quest {
  db.update(quests)
    .set({ status: 'completed', completedAt: new Date().toISOString() })
    .where(and(eq(quests.id, id), eq(quests.playerId, pid())))
    .run()
  return db.select().from(quests).where(eq(quests.id, id)).get()!
}
