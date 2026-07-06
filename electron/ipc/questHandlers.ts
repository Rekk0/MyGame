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
import { getPlayer, addXp, addGold, applyResourceDeltas } from '../services/db/repositories/playerRepo'
import { logEvent } from '../services/db/repositories/resourceRepo'
import { notifyHudUpdate } from '../windows/hudWindow'
import { showAchievementPopup } from '../windows/achievementWindow'
import { checkAchievements } from '../services/achievementChecker'
import { callAI } from '../services/ai/client'
import { unlockAchievement } from '../services/db/repositories/achievementRepo'
import { buildAchievementSystemPrompt, buildAchievementPrompt } from '../services/ai/prompts/achievement'
import { generateMedal } from './medalHandlers'
import { analyzePlayerState, getDdaAdjustment, getStreakMultiplier } from '../services/dda'
import { clamp, computeDeltas, finalXp } from '../services/resources/settlement'
import { correctRatings, scaledCoeffs, selectHistory } from '../services/resources/calibration'
import { historyForQuest } from '../services/db/repositories/calibrationRepo'
import { getScales, recomputeProfile } from '../services/resources/profile'
import { evaluate } from '../services/companion/scheduler'
import type { Ratings } from '../../src/types/resource'
import type { Achievement } from '../../src/types/achievement'

const MEDAL_TRIGGERS: Record<string, { name: string; category: 'streak' | 'mastery' | 'adventure' | 'oath'; description: string }> = {
  streak_7:  { name: '七日勋章',     category: 'streak',  description: '连续坚持七天的荣耀' },
  streak_30: { name: '燃烧之魂勋章', category: 'streak',  description: '三十天不间断的火焰意志' },
  level_10:      { name: '英雄勋章',     category: 'mastery',   description: '达到10级的卓越成就' },
  daily_plot_7:  { name: '故事编织勋章', category: 'mastery',   description: '七天如织，故事成锦' },
  daily_plot_21: { name: '传说叙事勋章', category: 'mastery',   description: '以笔为剑，铸就传说' },
  weekly_plot_4: { name: '月华编年勋章', category: 'adventure', description: '四周光阴，化作史诗' },
  weekly_plot_12:{ name: '史诗宗师勋章', category: 'adventure', description: '年岁积淀，笔墨不朽' },
}

export function registerQuestHandlers(): void {
  ipcMain.handle(IPC.QUEST_CREATE, (_e, data: {
    originalText: string; dueDate?: string | null
    userEnergyPct?: number; userDrive?: number; userLike?: number
  }) => {
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
    const player = getPlayer()!

    // —— v1：用户拖过滑杆 → 直接用用户值；跳过评分 → 历史修正 AI 隐藏预估 ——
    const userRated = quest.userDrive != null
    let ratings: Ratings
    if (userRated) {
      ratings = {
        E: quest.userEnergyPct ?? clamp(quest.epCost, 0, 100),
        D: quest.userDrive!,
        L: quest.userLike ?? 5,
      }
    } else {
      const rawAi: Ratings = {
        E: quest.aiEnergyPct ?? clamp(quest.epCost, 0, 100),
        D: quest.aiDrive ?? 5,
        L: quest.aiLike ?? 5,
      }
      const { byText, byType } = historyForQuest(quest.type, quest.originalText)
      const hist = selectHistory(byText, byType)
      ratings = correctRatings(rawAi, hist.mean, hist.n)
    }

    // —— v2：个人系数缩放（仅意志力/精神；XP 不缩放）——
    const deltas = computeDeltas(ratings, scaledCoeffs(getScales()))

    const baseXp = quest.xp ?? 10
    const state = analyzePlayerState()
    const { xpMultiplier: ddaMult } = getDdaAdjustment(state)
    const streakMult = getStreakMultiplier()
    const xp = finalXp(baseXp, ratings, player.ep, player.maxEp, ddaMult, streakMult)

    addXp(xp)
    addGold(5)
    applyResourceDeltas(deltas)
    logEvent({
      source: 'quest', questId: id,
      energyDelta: deltas.energy, willpowerDelta: deltas.willpower, spiritDelta: deltas.spirit,
      e: ratings.E, d: ratings.D, l: ratings.L,
    })

    // —— v2 反馈：本次是用户实填 → 重算个人系数 profile ——
    if (userRated) recomputeProfile()

    notifyHudUpdate()
    void evaluate('quest_completed', quest.gamifiedName ?? undefined)

    const newAchievements = await checkAchievements()
    if (newAchievements.length > 0) {
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

    return { quest, newAchievements, finalXp: xp }
  })
}
