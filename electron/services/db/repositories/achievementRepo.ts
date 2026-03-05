import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../index'
import { achievements } from '../schema'
import { getActivePlayerId } from './playerRepo'
import type { AchievementTier } from '../../../../src/types/achievement'

type AchievementRow = typeof achievements.$inferSelect

interface PresetAchievement {
  title: string
  description: string
  tier: AchievementTier
  triggerCondition: string
}

const PRESET_ACHIEVEMENTS: PresetAchievement[] = [
  { title: '冒险启程', description: '完成第一个任务', tier: 'common', triggerCondition: 'first_quest' },
  { title: '百战老兵', description: '累计完成10个任务', tier: 'rare', triggerCondition: 'quest_10' },
  { title: '传奇骑士', description: '累计完成100个任务', tier: 'epic', triggerCondition: 'quest_100' },
  { title: '七日不灭', description: '连续7天完成任务', tier: 'rare', triggerCondition: 'streak_7' },
  { title: '燃烧之魂', description: '连续30天完成任务', tier: 'legendary', triggerCondition: 'streak_30' },
  { title: '登神长阶', description: '连续365天完成任务', tier: 'Ultra', triggerCondition: 'streak_365' },
  { title: '勇者崛起', description: '达到5级', tier: 'rare', triggerCondition: 'level_5' },
  { title: '史诗英雄', description: '达到10级', tier: 'epic', triggerCondition: 'level_10' },
  { title: '传说之境', description: '达到20级', tier: 'legendary', triggerCondition: 'level_20' },
  { title: '日常骑士', description: '完成第一个日常任务', tier: 'common', triggerCondition: 'first_daily' },
  { title: '主线启动', description: '完成第一个主线任务', tier: 'epic', triggerCondition: 'first_main' },
]

function pid(): string {
  return getActivePlayerId()
}

export function initAchievements(playerId: string): void {
  const existing = db.select().from(achievements).where(eq(achievements.playerId, playerId)).all()
  if (existing.length > 0) return
  for (const preset of PRESET_ACHIEVEMENTS) {
    db.insert(achievements).values({ id: randomUUID(), playerId, ...preset }).run()
  }
}

export function getAllAchievements(): AchievementRow[] {
  return db.select().from(achievements).where(eq(achievements.playerId, pid())).all()
}

export function getUnlockedAchievements(): AchievementRow[] {
  return db.select().from(achievements)
    .where(and(eq(achievements.playerId, pid()), eq(achievements.isUnlocked, 1)))
    .all()
}

export function isUnlocked(triggerCondition: string): boolean {
  const row = db.select().from(achievements)
    .where(and(eq(achievements.playerId, pid()), eq(achievements.triggerCondition, triggerCondition)))
    .get()
  return row?.isUnlocked === 1
}

export function unlockAchievement(id: string, unlockText: string | null): AchievementRow {
  db.update(achievements)
    .set({ isUnlocked: 1, unlockedAt: new Date().toISOString(), unlockText })
    .where(eq(achievements.id, id))
    .run()
  return db.select().from(achievements).where(eq(achievements.id, id)).get()!
}

export function getByCondition(triggerCondition: string): AchievementRow | undefined {
  return db.select().from(achievements)
    .where(and(eq(achievements.playerId, pid()), eq(achievements.triggerCondition, triggerCondition)))
    .get()
}
