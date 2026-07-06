import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { callAI } from '../services/ai/client'
import { getCached, setCache, makeCacheKey } from '../services/ai/cache'
import { buildQuestTransformPrompt, buildQuestTransformSystemPrompt } from '../services/ai/prompts/questTransform'
import type { WorldStyle } from '../../src/types/player'

interface TransformArgs {
  originalText: string
  worldStyle: WorldStyle
}

const FALLBACK = { gamifiedName: null, narrative: null, type: 'daily', xp: 10, epCost: 10, aiEnergyPct: 30, aiDrive: 5, aiLike: 5 }

export function registerAiHandlers(): void {
  ipcMain.handle(IPC.AI_TRANSFORM_QUEST, async (_, { originalText, worldStyle }: TransformArgs) => {
    const cacheKey = makeCacheKey(`${worldStyle}:${originalText}`)
    const cached = getCached(cacheKey)
    if (cached) return JSON.parse(cached)

    try {
      const raw = await callAI(
        buildQuestTransformPrompt(originalText),
        buildQuestTransformSystemPrompt(worldStyle),
      )
      const result = JSON.parse(raw)
      setCache(cacheKey, JSON.stringify(result))
      return result
    } catch {
      return FALLBACK
    }
  })
}
