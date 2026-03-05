import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { getAllSkills, getSkillById, addSkillXp, unlockSkill, updateSkillDescription } from '../services/db/repositories/skillRepo'
import { getPlayer } from '../services/db/repositories/playerRepo'
import { callAI } from '../services/ai/client'
import { buildSkillUpgradePrompt, buildSkillUpgradeSystemPrompt } from '../services/ai/prompts/skillUpgrade'
import type { WorldStyle } from '../../src/types/player'

export function registerSkillHandlers(): void {
  ipcMain.handle(IPC.SKILL_GET_ALL, () => getAllSkills())

  ipcMain.handle(IPC.SKILL_ADD_XP, async (_e, id: string, amount: number) => {
    const result = addSkillXp(id, amount)
    if (result.leveledUp) {
      const skill = getSkillById(id)
      const player = getPlayer()
      if (skill && player) {
        const worldStyle = (player.worldStyle ?? 'realistic') as WorldStyle
        try {
          const raw = await callAI(buildSkillUpgradePrompt(skill, player.name), buildSkillUpgradeSystemPrompt(worldStyle))
          const parsed = JSON.parse(raw.trim()) as { description: string; newTrait: string }
          const currentTraits = skill.traits
          updateSkillDescription(id, parsed.description, [...currentTraits, parsed.newTrait])
        } catch {
          // AI 失败时保留原描述
        }
      }
    }
    const skill = getSkillById(id)
    return { skill, leveledUp: result.leveledUp, newTrait: undefined }
  })

  ipcMain.handle(IPC.SKILL_UNLOCK, (_e, id: string) => {
    unlockSkill(id)
    return getSkillById(id)
  })
}
