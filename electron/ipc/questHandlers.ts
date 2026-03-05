import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import {
  createQuest,
  getAllQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
  completeQuest,
} from '../services/db/repositories/questRepo'
import { getPlayer } from '../services/db/repositories/playerRepo'
import { notifyHudUpdate } from '../windows/hudWindow'
import { showAchievementPopup } from '../windows/achievementWindow'
import { checkAchievements } from '../services/achievementChecker'
import { callAI } from '../services/ai/client'
import { unlockAchievement } from '../services/db/repositories/achievementRepo'
import { buildAchievementSystemPrompt, buildAchievementPrompt } from '../services/ai/prompts/achievement'
import { generateMedal } from './medalHandlers'
import { analyzePlayerState, getDdaAdjustment, getStreakMultiplier } from '../services/dda'
import type { Achievement } from '../../src/types/achievement'

const MEDAL_TRIGGERS: Record<string, { name: string; category: 'streak' | 'mastery' | 'adventure' | 'oath'; description: string }> = {
  streak_7:  { name: '七日勋章',     category: 'streak',  description: '连续坚持七天的荣耀' },
  streak_30: { name: '燃烧之魂勋章', category: 'streak',  description: '三十天不间断的火焰意志' },
  level_10:  { name: '英雄勋章',     category: 'mastery', description: '达到10级的卓越成就' },
}

export function registerQuestHandlers(): void {
  ipcMain.handle(IPC.QUEST_CREATE, (_e, data: { originalText: string; dueDate?: string | null }) => {
    const result = createQuest(data)
    notifyHudUpdate()
    return result
  })

  ipcMain.handle(IPC.QUEST_GET_ALL, () => getAllQuests())

  ipcMain.handle(IPC.QUEST_GET_BY_ID, (_e, id: string) => getQuestById(id))

  ipcMain.handle(IPC.QUEST_UPDATE, (_e, id: string, data: object) => {
    const result = updateQuest(id, data as never)
    notifyHudUpdate()
    return result
  })

  ipcMain.handle(IPC.QUEST_DELETE, (_e, id: string) => {
    const result = deleteQuest(id)
    notifyHudUpdate()
    return result
  })

  ipcMain.handle(IPC.QUEST_COMPLETE, async (_e, id: string) => {
    const quest = completeQuest(id)
    const state = analyzePlayerState()
    const { xpMultiplier: ddaMultiplier } = getDdaAdjustment(state)
    const streakMult = getStreakMultiplier()
    const finalXp = Math.round((quest.xp ?? 10) * ddaMultiplier * streakMult)
    notifyHudUpdate()

    const newAchievements = await checkAchievements()
    if (newAchievements.length > 0) {
      const player = getPlayer()
      for (const ach of newAchievements) {
        const achievement: Achievement = {
          ...ach,
          tier: ach.tier as Achievement['tier'],
          isUnlocked: true,
        }
        showAchievementPopup(achievement)
        if (player) {
          callAI(
            buildAchievementPrompt(ach, player),
            buildAchievementSystemPrompt(player.worldStyle as never)
          ).then((text) => {
            unlockAchievement(ach.id, text.trim())
          }).catch(() => {/* ignore AI errors */})
        }
        const medalDef = MEDAL_TRIGGERS[ach.triggerCondition]
        if (medalDef) {
          generateMedal(medalDef.name, medalDef.category, medalDef.description)
            .then(() => notifyHudUpdate())
            .catch(() => {/* ignore */})
        }
      }
    }

    return { quest, newAchievements, finalXp }
  })
}
