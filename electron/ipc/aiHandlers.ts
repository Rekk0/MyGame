import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { callAI } from '../services/ai/client'
import { getCached, setCache, makeCacheKey } from '../services/ai/cache'
import { buildQuestTransformPrompt, buildQuestTransformSystemPrompt } from '../services/ai/prompts/questTransform'
import { getAllSkills } from '../services/db/repositories/skillRepo'
import type { WorldStyle } from '../../src/types/player'

interface TransformArgs {
  originalText: string
  worldStyle: WorldStyle
}

const FALLBACK = { gamifiedName: null, narrative: null, type: 'daily', xp: 10, epCost: 10, aiEnergyPct: 30, aiDrive: 5, aiLike: 5, skillHint: null }

export function registerAiHandlers(): void {
  ipcMain.handle(IPC.AI_TRANSFORM_QUEST, async (_, { originalText, worldStyle }: TransformArgs) => {
    // 注入现有已解锁技能名，供 AI 选 skillHint。技能会随占卜变化，故进 cacheKey。
    const skillNames = getAllSkills().filter((s) => s.isUnlocked).map((s) => s.name)
    const cacheKey = makeCacheKey(`${worldStyle}:${skillNames.join(',')}:${originalText}`)
    const cached = getCached(cacheKey)
    if (cached) return JSON.parse(cached)

    try {
      const raw = await callAI(
        buildQuestTransformPrompt(originalText),
        buildQuestTransformSystemPrompt(worldStyle, skillNames),
      )
      const result = JSON.parse(raw)
      setCache(cacheKey, JSON.stringify(result))
      return result
    } catch {
      return FALLBACK
    }
  })
}
