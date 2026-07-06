import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { db } from '../index'
import { quests } from '../schema'
import { getActivePlayerId } from './playerRepo'
import { CAL, meanRatings, normalizeText } from '../../resources/calibration'
import type { Ratings } from '../../../../src/types/resource'

export function historyForQuest(type: string, originalText: string): {
  byText: { mean: Ratings; n: number }
  byType: { mean: Ratings; n: number }
} {
  const rows = db.select({
    userEnergyPct: quests.userEnergyPct, userDrive: quests.userDrive,
    userLike: quests.userLike, type: quests.type, originalText: quests.originalText,
  }).from(quests)
    .where(and(eq(quests.playerId, getActivePlayerId()), isNotNull(quests.userDrive)))
    .orderBy(desc(quests.createdAt)).limit(CAL.historyWindow).all()

  const key = normalizeText(originalText)
  const textSamples: Ratings[] = []
  const typeSamples: Ratings[] = []
  for (const r of rows) {
    const rating: Ratings = { E: r.userEnergyPct ?? 0, D: r.userDrive ?? 0, L: r.userLike ?? 0 }
    if (r.type === type) typeSamples.push(rating)
    if (normalizeText(r.originalText) === key) textSamples.push(rating)
  }
  return {
    byText: { mean: meanRatings(textSamples), n: textSamples.length },
    byType: { mean: meanRatings(typeSamples), n: typeSamples.length },
  }
}

export function biasSamples(): { aiD: number; userD: number; aiL: number; userL: number }[] {
  const rows = db.select({
    aiDrive: quests.aiDrive, userDrive: quests.userDrive,
    aiLike: quests.aiLike, userLike: quests.userLike,
  }).from(quests)
    .where(and(eq(quests.playerId, getActivePlayerId()),
      isNotNull(quests.userDrive), isNotNull(quests.aiDrive)))
    .orderBy(desc(quests.createdAt)).limit(CAL.historyWindow).all()
  return rows.map((r) => ({
    aiD: r.aiDrive ?? 5, userD: r.userDrive ?? 5,
    aiL: r.aiLike ?? 5, userL: r.userLike ?? 5,
  }))
}
