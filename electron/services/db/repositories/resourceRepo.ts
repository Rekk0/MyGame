import { randomUUID } from 'crypto'
import { desc, eq } from 'drizzle-orm'
import { db } from '../index'
import { resourceEvents } from '../schema'
import { getActivePlayerId } from './playerRepo'
import type { ResourceSource } from '../../../../src/types/resource'

export function logEvent(e: {
  source: ResourceSource
  questId?: string | null
  energyDelta: number
  willpowerDelta: number
  spiritDelta: number
  e?: number
  d?: number
  l?: number
}): void {
  db.insert(resourceEvents).values({
    id: randomUUID(),
    playerId: getActivePlayerId(),
    source: e.source,
    questId: e.questId ?? null,
    energyDelta: e.energyDelta,
    willpowerDelta: e.willpowerDelta,
    spiritDelta: e.spiritDelta,
    e: e.e ?? null,
    d: e.d ?? null,
    l: e.l ?? null,
  }).run()
}

export function recentEvents(limit = 50) {
  return db.select().from(resourceEvents)
    .where(eq(resourceEvents.playerId, getActivePlayerId()))
    .orderBy(desc(resourceEvents.createdAt))
    .limit(limit)
    .all()
}
