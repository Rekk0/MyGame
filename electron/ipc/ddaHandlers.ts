import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { analyzePlayerState, getDdaAdjustment } from '../services/dda'
import { getPlayer } from '../services/db/repositories/playerRepo'
import { callAI } from '../services/ai/client'
import { buildDailySuggestionSystemPrompt, buildDailySuggestionPrompt } from '../services/ai/prompts/dailySuggestion'
import { getAllQuests } from '../services/db/repositories/questRepo'
import type { WorldStyle } from '../../src/types/player'

const cacheMap = new Map<string, unknown>() // key: `${playerId}:${date}`

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function registerDdaHandlers(): void {
  ipcMain.handle(IPC.DDA_GET_STATE, () => {
    const state = analyzePlayerState()
    const adjustment = getDdaAdjustment(state)
    return { state, ...adjustment }
  })

  ipcMain.handle(IPC.DDA_GET_SUGGESTION, async () => {
    const player = getPlayer()
    if (!player) return null

    const cacheKey = `${player.id}:${todayStr()}`
    if (cacheMap.has(cacheKey)) return cacheMap.get(cacheKey)

    const state = analyzePlayerState()
    const recentQuests = getAllQuests()
    try {
      const text = await callAI(
        buildDailySuggestionPrompt(player, state, recentQuests),
        buildDailySuggestionSystemPrompt(player.worldStyle as WorldStyle)
      )
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null
      if (data) cacheMap.set(cacheKey, data)
      return data
    } catch {
      return null
    }
  })
}
