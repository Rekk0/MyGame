import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { getPlayer } from '../services/db/repositories/playerRepo'
import { getAllQuests } from '../services/db/repositories/questRepo'
import {
  getPlotLog,
  createPlotLog,
  countPlotLogs,
  getDailyKey,
  getWeeklyKey,
} from '../services/db/repositories/plotRepo'
import { callAI } from '../services/ai/client'
import {
  buildPlotSystemPrompt,
  buildDailyPlotPrompt,
  buildWeeklyPlotPrompt,
} from '../services/ai/prompts/plotSummary'
import { checkPlotAchievements } from '../services/achievementChecker'
import { showAchievementPopup } from '../windows/achievementWindow'
import { generateMedal } from './medalHandlers'
import { notifyHudUpdate } from '../windows/hudWindow'
import type { WorldStyle } from '../../src/types/player'
import type { Achievement } from '../../src/types/achievement'

const PLOT_MEDAL_TRIGGERS: Record<string, { name: string; category: 'mastery' | 'adventure'; description: string }> = {
  daily_plot_7:  { name: '故事编织勋章', category: 'mastery',   description: '七天如织，故事成锦' },
  daily_plot_21: { name: '传说叙事勋章', category: 'mastery',   description: '以笔为剑，铸就传说' },
  weekly_plot_4: { name: '月华编年勋章', category: 'adventure', description: '四周光阴，化作史诗' },
  weekly_plot_12:{ name: '史诗宗师勋章', category: 'adventure', description: '年岁积淀，笔墨不朽' },
}

function getMondayISO(): string {
  const d = new Date()
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  return monday.toISOString().slice(0, 10)
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

async function handleAchievementsAndMedals(type: 'daily' | 'weekly'): Promise<void> {
  const count = countPlotLogs(type)
  const newAchievements = await checkPlotAchievements(type, count)
  for (const ach of newAchievements) {
    const achievement: Achievement = { ...ach, tier: ach.tier as Achievement['tier'], isUnlocked: true }
    showAchievementPopup(achievement)
    const medalDef = PLOT_MEDAL_TRIGGERS[ach.triggerCondition]
    if (medalDef) {
      generateMedal(medalDef.name, medalDef.category, medalDef.description)
        .then(() => notifyHudUpdate())
        .catch(() => {/* ignore */})
    }
  }
}

export function registerPlotHandlers(): void {
  ipcMain.handle(IPC.PLOT_GET_DAILY_STATUS, () => {
    const today = getTodayISO()
    const completed = getAllQuests().filter(
      (q) => q.status === 'completed' && q.completedAt?.startsWith(today)
    )
    if (completed.length < 3) return { eligible: false }
    const periodKey = getDailyKey()
    const cached = getPlotLog('daily', periodKey)
    return { eligible: true, cached: cached?.summary }
  })

  ipcMain.handle(IPC.PLOT_GET_WEEKLY_STATUS, () => {
    const weekStart = getMondayISO()
    const completed = getAllQuests().filter(
      (q) => q.status === 'completed' && q.completedAt && q.completedAt >= weekStart
    )
    if (completed.length < 15) return { eligible: false }
    const periodKey = getWeeklyKey()
    const cached = getPlotLog('weekly', periodKey)
    return { eligible: true, cached: cached?.summary }
  })

  ipcMain.handle(IPC.PLOT_GENERATE_DAILY, async () => {
    const today = getTodayISO()
    const periodKey = getDailyKey()
    const cached = getPlotLog('daily', periodKey)
    if (cached) return cached.summary

    const quests = getAllQuests().filter(
      (q) => q.status === 'completed' && q.completedAt?.startsWith(today)
    )
    if (quests.length < 3) throw new Error('今日完成任务数不足')

    const player = getPlayer()
    if (!player) throw new Error('未找到角色')
    const names = quests.map((q) => q.gamifiedName ?? q.originalText)
    const summary = await callAI(
      buildDailyPlotPrompt(names, player.name),
      buildPlotSystemPrompt(player.worldStyle as WorldStyle)
    )
    createPlotLog('daily', periodKey, summary.trim())
    await handleAchievementsAndMedals('daily')
    return summary.trim()
  })

  ipcMain.handle(IPC.PLOT_GENERATE_WEEKLY, async () => {
    const weekStart = getMondayISO()
    const periodKey = getWeeklyKey()
    const cached = getPlotLog('weekly', periodKey)
    if (cached) return cached.summary

    const quests = getAllQuests().filter(
      (q) => q.status === 'completed' && q.completedAt && q.completedAt >= weekStart
    )
    if (quests.length < 15) throw new Error('本周完成任务数不足')

    const player = getPlayer()
    if (!player) throw new Error('未找到角色')
    const names = quests.map((q) => q.gamifiedName ?? q.originalText)
    const summary = await callAI(
      buildWeeklyPlotPrompt(names, player.name),
      buildPlotSystemPrompt(player.worldStyle as WorldStyle)
    )
    createPlotLog('weekly', periodKey, summary.trim())
    await handleAchievementsAndMedals('weekly')
    return summary.trim()
  })
}
