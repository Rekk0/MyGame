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
import type { Achievement } from '../../src/types/achievement'

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
      }
    }

    return { quest, newAchievements }
  })
}
