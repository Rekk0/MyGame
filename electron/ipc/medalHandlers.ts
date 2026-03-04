import { ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import { IPC } from '../../src/types/ipc'
import { createMedal, getAllMedals, hasMedal } from '../services/db/repositories/medalRepo'
import { getPlayer } from '../services/db/repositories/playerRepo'
import { callAI } from '../services/ai/client'
import { buildMedalSvgPrompt, buildMedalSvgSystemPrompt } from '../services/ai/prompts/medalSvg'
import type { MedalCategory } from '../../src/types/medal'
import type { WorldStyle } from '../../src/types/player'

export async function generateMedal(
  name: string,
  category: MedalCategory,
  description: string
) {
  if (hasMedal(name)) return null
  const seed = randomUUID().slice(0, 8)
  const player = getPlayer()
  const worldStyle = (player?.worldStyle ?? 'realistic') as WorldStyle
  const svgCode = await callAI(
    buildMedalSvgPrompt({ name, category, seed }),
    buildMedalSvgSystemPrompt(worldStyle)
  )
  return createMedal({ name, category, svgCode: svgCode.trim(), seed, description })
}

export function registerMedalHandlers(): void {
  ipcMain.handle(IPC.MEDAL_GET_ALL, () => getAllMedals())

  ipcMain.handle(
    IPC.MEDAL_GENERATE,
    async (_e, { name, category, description }: { name: string; category: MedalCategory; description: string }) => {
      return generateMedal(name, category, description)
    }
  )
}
