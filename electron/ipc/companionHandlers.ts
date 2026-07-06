import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { callAI } from '../services/ai/client'
import { getCached, setCache } from '../services/ai/cache'
import { buildCompanionSystemPrompt, buildCompanionUserPrompt } from '../services/ai/prompts/companion'
import { topSignal, actionsForSignal, avatarMood, buildCacheKey } from '../services/companion/policy'
import { selectOfflineReply } from '../services/companion/templates'
import type { Snapshot, Signal, CompanionReply } from '../services/companion/types'
import type { WorldStyle } from '../../src/types/player'

let variant = 0

export async function makeReply(
  snap: Snapshot, signals: Signal[], worldStyle: WorldStyle,
): Promise<CompanionReply> {
  const top = topSignal(signals)
  const kind = top?.kind ?? 'greeting'
  const actions = actionsForSignal(kind)
  const mood = avatarMood(top)
  const key = buildCacheKey(snap, worldStyle, kind)

  const cached = getCached(key)
  if (cached) return { line: cached, actions, mood, fromAI: true }

  try {
    const raw = await callAI(buildCompanionUserPrompt(snap), buildCompanionSystemPrompt(worldStyle))
    const line = String(JSON.parse(raw).line ?? '').slice(0, 40)
    if (!line) throw new Error('empty line')
    setCache(key, line)
    return { line, actions, mood, fromAI: true }
  } catch {
    const off = selectOfflineReply(top, worldStyle, variant++)
    return { line: off.line, actions: off.actions, mood, fromAI: false }
  }
}

export function registerCompanionHandlers(): void {
  ipcMain.handle(IPC.COMPANION_GET_REPLY, async () => null)
  // COMPANION_RUN_ACTION registered in T6 (windowHandlers)
}
